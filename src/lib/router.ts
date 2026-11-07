/* Client du routeur d'inférence Hugging Face — API compatible OpenAI, streaming SSE.
   La clé n'est stockée que dans le navigateur et n'est envoyée qu'à router.huggingface.co. */

export const ROUTER_BASE = "https://router.huggingface.co/v1";
export const ROUTER_MODEL = "AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16:featherless-ai";
export const ROUTER_LABEL = "qwen3.8-27b-aeon · bf16";
export const TOKEN_URL = "https://huggingface.co/settings/tokens";
export const DOCS_URL = "https://huggingface.co/docs/api-inference";

const TOKEN_KEY = "autonome.hf_token";

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveToken(raw: string) {
  const t = raw.trim();
  if (t) localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* stockage indisponible */
  }
}

export function maskToken(t: string): string {
  if (t.length <= 8) return "hf_••••••";
  return `${t.slice(0, 3)}_••••${t.slice(-4)}`;
}

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function streamChat(opts: {
  messages: ChatMsg[];
  onDelta: (delta: string) => void;
  signal?: AbortSignal;
}): Promise<{ text: string }> {
  const res = await fetch(`${ROUTER_BASE}/chat/completions`, {
    method: "POST",
    signal: opts.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ model: ROUTER_MODEL, messages: opts.messages, stream: true }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      detail = body.error?.message ?? "";
    } catch {
      /* corps non-JSON */
    }
    const msg =
      res.status === 401
        ? "token refusé (401) — vérifiez votre clé sur huggingface.co/settings/tokens"
        : res.status === 402
          ? "quota épuisé (402) — votre compte HF n'a plus de crédits routeur"
          : res.status === 429
            ? "cadence limitée (429) — respirez un instant et relancez"
            : `erreur routeur (${res.status})${detail ? " — " + detail : ""}`;
    throw new Error(msg);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("flux illisible — le routeur n'a pas ouvert de canal SSE");

  const decoder = new TextDecoder();
  let buf = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = json.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          text += delta;
          opts.onDelta(delta);
        }
      } catch {
        /* fragment incomplet — ignoré */
      }
    }
  }

  return { text };
}
