import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckIcon, KeyIcon, PlaneIcon, SpinnerIcon, StopIcon } from "./icons";
import {
  ROUTER_LABEL,
  TOKEN_URL,
  clearToken,
  getToken,
  maskToken,
  saveToken,
  streamChat,
  type ChatMsg,
} from "../lib/router";

type Step = { label: string; tool?: string; ms: number };
type Template = { chip: string; task: string; steps: Step[]; result: string };

const TEMPLATES: Template[] = [
  {
    chip: "Résumer 40 pages de notes",
    task: "Résumer 40 pages de notes de comité en 10 décisions actionnables",
    steps: [
      { label: "Lecture du contexte", ms: 700 },
      { label: "Décomposition en 3 sous-tâches", ms: 900 },
      { label: "Extraction des décisions", tool: "lecture locale · notes_q3.pdf", ms: 1200 },
      { label: "Synthèse & priorisation", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1400 },
      { label: "Relecture & formatage", ms: 800 },
    ],
    result:
      "10 décisions extraites, classées par impact. Top 3 : (1) migrer l'ETL vers un cron nocturne — gain 6 h/sem, (2) geler les recrutements outils jusqu'au T3, (3) basculer 4 clients pilotes sur la v2 avant le 15. Résumé complet : decisions_t3.md (2 pages).",
  },
  {
    chip: "Veille concurrentielle hebdo",
    task: "Compiler la veille concurrentielle hebdo à partir du dossier ./veille",
    steps: [
      { label: "Scan du dossier ./veille", tool: "14 fichiers détectés", ms: 800 },
      { label: "Déduplication & clustering", ms: 1000 },
      { label: "Analyse des signaux faibles", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1500 },
      { label: "Rédaction du brief", ms: 1100 },
    ],
    result:
      "Brief hebdo prêt : veille_s42.md. 3 mouvements notables — un concurrent a discrètement doublé ses tarifs API (signal fort), deux recrutements ML senior chez le n°2, un dépôt open-source abandonné à surveiller. 0 requête web : analyse 100 % sur vos documents.",
  },
  {
    chip: "Nettoyer un CSV clients",
    task: "Nettoyer clients_export.csv : doublons, e-mails invalides, SIRET manquants",
    steps: [
      { label: "Parsing de clients_export.csv", tool: "12 480 lignes", ms: 700 },
      { label: "Détection de doublons", ms: 900 },
      { label: "Validation des e-mails & SIRET", tool: "règles locales", ms: 1100 },
      { label: "Enrichissement des libellés", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1300 },
      { label: "Écriture du fichier propre", ms: 600 },
    ],
    result:
      "clients_export_propre.csv : 11 962 lignes conservées. 312 doublons fusionnés, 148 e-mails corrigés, 58 SIRET reconstitués par recoupement interne. Rapport d'anomalies : rapport_nettoyage.md.",
  },
];

const GENERIC: Omit<Template, "chip" | "task"> = {
  steps: [
    { label: "Lecture de la demande", ms: 700 },
    { label: "Plan d'exécution (4 étapes)", ms: 900 },
    { label: "Exécution des outils locaux", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1500 },
    { label: "Assemblage du livrable", ms: 1000 },
  ],
  result:
    "Tâche traitée localement : plan exécuté en 4 étapes, livrable écrit dans ./sorties/. Aucun paquet réseau émis, aucun token API consommé — le moteur a raisonné sur votre machine du début à la fin.",
};

const SUGGESTIONS = [
  "Quelle est la capitale de la France ?",
  "Explique la déduplication xet en 3 phrases simples",
  "Écris un script bash qui sauvegarde ./donnees chaque nuit à 3 h",
  "Liste 5 avantages d'une IA 100 % locale pour une PME",
];

const SYSTEM_PROMPT =
  "Tu es l'agent d'Autonome, un assistant IA autonome motorisé par Qwen3.8-27B (édition AEON). " +
  "Tu réponds toujours en français, de manière concise, structurée et actionnable. " +
  "Quand on te demande un livrable (texte, code, plan, liste), tu le produis directement, sans demander la permission.";

type Entry =
  | {
      id: number;
      kind: "local";
      task: string;
      steps: Step[];
      done: number;
      status: "running" | "done";
      result: string;
      elapsed: number;
      offline: boolean;
    }
  | { id: number; kind: "user"; text: string }
  | {
      id: number;
      kind: "assistant";
      text: string;
      streaming: boolean;
      ms: number;
      words: number;
      error?: string;
      stopped?: boolean;
    };

type Mode = "local" | "live";

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const sec = (ms: number) => (ms / 1000).toFixed(1).replace(".", ",");

type Stored = { runs: number; live: number; last: { task: string; result: string } | null };

export default function Console() {
  const [mode, setMode] = useState<Mode>("local");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [input, setInput] = useState("");
  const [tokenSet, setTokenSet] = useState(() => !!getToken());
  const [tokenDraft, setTokenDraft] = useState("");
  const [stored, setStored] = useState<Stored>(() => {
    try {
      return JSON.parse(localStorage.getItem("autonome.store") ?? "") as Stored;
    } catch {
      return { runs: 0, live: 0, last: null };
    }
  });

  const idRef = useRef(1);
  const timers = useRef<number[]>([]);
  const conv = useRef<ChatMsg[]>([]);
  const abort = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("autonome.store", JSON.stringify(stored));
    } catch {
      /* stockage indisponible */
    }
  }, [stored]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      abort.current?.abort();
    },
    []
  );

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [entries]);

  const nextId = () => idRef.current++;

  /* ---------- mode local : pipeline d'outils ---------- */
  function runLocal(t: Template) {
    if (busy) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBusy(true);
    const id = nextId();
    setEntries((e) => [
      ...e,
      { id, kind: "local", task: t.task, steps: t.steps, done: 0, status: "running", result: t.result, elapsed: 0, offline },
    ]);
    let acc = 0;
    t.steps.forEach((s, i) => {
      acc += s.ms;
      const mark = acc;
      timers.current.push(
        window.setTimeout(() => {
          const finished = i === t.steps.length - 1;
          setEntries((e) =>
            e.map((en) =>
              en.id === id && en.kind === "local"
                ? { ...en, done: i + 1, elapsed: mark / 1000, status: finished ? "done" : "running" }
                : en
            )
          );
          if (finished) {
            setBusy(false);
            setStored((s) => ({ ...s, runs: s.runs + 1, last: { task: t.task, result: t.result } }));
          }
        }, mark)
      );
    });
  }

  /* ---------- mode live : streaming réel via le routeur HF ---------- */
  async function sendLive(raw: string) {
    const text = raw.trim();
    if (!text || busy || !tokenSet) return;
    setBusy(true);
    const uid = nextId();
    const aid = nextId();
    conv.current.push({ role: "user", content: text });
    const messages: ChatMsg[] = [{ role: "system", content: SYSTEM_PROMPT }, ...conv.current.slice(-6)];
    setEntries((e) => [
      ...e,
      { id: uid, kind: "user", text },
      { id: aid, kind: "assistant", text: "", streaming: true, ms: 0, words: 0 },
    ]);
    const start = performance.now();
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const { text: full } = await streamChat({
        messages,
        signal: ctrl.signal,
        onDelta: (d) =>
          setEntries((e) =>
            e.map((en) =>
              en.id === aid && en.kind === "assistant"
                ? { ...en, text: en.text + d, ms: performance.now() - start, words: countWords(en.text + d) }
                : en
            )
          ),
      });
      conv.current.push({ role: "assistant", content: full });
      setEntries((e) =>
        e.map((en) =>
          en.id === aid && en.kind === "assistant"
            ? { ...en, streaming: false, ms: performance.now() - start, words: countWords(full) }
            : en
        )
      );
      setStored((s) => ({ ...s, live: s.live + 1 }));
    } catch (err) {
      const aborted = (err as Error)?.name === "AbortError";
      conv.current.pop();
      setEntries((e) =>
        e.map((en) =>
          en.id === aid && en.kind === "assistant"
            ? {
                ...en,
                streaming: false,
                ms: performance.now() - start,
                stopped: aborted || undefined,
                error: aborted ? undefined : (err as Error).message || "erreur inconnue du routeur",
              }
            : en
        )
      );
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setInput("");
    if (mode === "live") {
      sendLive(v);
    } else {
      runLocal({ ...GENERIC, chip: v, task: v });
    }
  }

  function applyToken() {
    const t = tokenDraft.trim();
    if (!t) return;
    saveToken(t);
    setTokenSet(true);
    setTokenDraft("");
  }

  function removeToken() {
    clearToken();
    conv.current = [];
    setTokenSet(false);
  }

  const showTokenPanel = mode === "live" && !tokenSet;

  return (
    <div
      id="produit"
      className="scanline relative overflow-hidden rounded-xl border border-linedark bg-ink text-[13.5px] shadow-[0_30px_80px_-30px_rgba(11,19,14,0.55)]"
    >
      {/* barre de titre */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-linedark px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-pine/80" />
        </div>
        <span className="min-w-0 truncate font-mono text-[11px] tracking-wide text-mutdark">
          autonome — agent v1.0
          {stored.runs > 0 && (
            <span className="ml-2 rounded-full border border-pine/50 bg-pine/15 px-2 py-0.5 text-[10px] text-pine">
              {stored.runs} tâche{stored.runs > 1 ? "s" : ""} locale{stored.runs > 1 ? "s" : ""}
            </span>
          )}
          {stored.live > 0 && (
            <span className="ml-1.5 rounded-full border border-lime/40 bg-lime/10 px-2 py-0.5 text-[10px] text-lime">
              {stored.live} réponse{stored.live > 1 ? "s" : ""} live
            </span>
          )}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* bascule de mode */}
          <div className="flex rounded-md border border-linedark p-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setMode("local")}
              disabled={busy}
              className={`rounded px-2.5 py-1 transition-colors disabled:opacity-50 ${
                mode === "local" ? "bg-lime text-ink" : "text-mutdark hover:text-paper"
              }`}
              title="Moteur embarqué, aucun réseau"
            >
              local
            </button>
            <button
              onClick={() => setMode("live")}
              disabled={busy}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors disabled:opacity-50 ${
                mode === "live" ? "bg-lime text-ink" : "text-mutdark hover:text-paper"
              }`}
              title="Streaming réel via router.huggingface.co"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tokenSet ? (mode === "live" ? "bg-ink" : "bg-lime anim-pulsedot") : mode === "live" ? "bg-ink/60" : "bg-mutdark"}`} />
              live
            </button>
          </div>

          <button
            onClick={() => setOffline((o) => !o)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider transition-colors ${
              offline ? "border-lime/50 bg-lime/10 text-lime" : "border-linedark text-mutdark hover:border-mutdark hover:text-ink"
            }`}
            title="Couper le réseau : l'agent local continue"
          >
            <PlaneIcon className="h-3.5 w-3.5" />
            {offline ? "hors-ligne" : "en ligne"}
          </button>
        </div>
      </div>

      {/* zone journal */}
      <div ref={logRef} className="scroll-slim h-72 overflow-y-auto px-4 py-3 font-mono leading-relaxed">
        <p className="text-mutdark">
          <span className="text-lime">➜</span> <span className="text-paper/80">autonome</span>{" "}
          <span className="text-pine">{mode === "local" ? "run" : "chat --live"}</span>
        </p>

        {entries.length === 0 && (
          <>
            <p className="mt-2 text-mutdark">
              moteur chargé en mémoire · 16,9 Go · prêt.
              <span className="anim-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-lime" />
            </p>
            {stored.last && (
              <p className="anim-fadeup mt-2 text-mutdark">
                <span className="text-pine">↳ dernière tâche</span> — {stored.last.task}{" "}
                <span className="text-paper/40">[livrable archivé dans ./sorties/ · journal conservé]</span>
              </p>
            )}
          </>
        )}

        {entries.map((en) => {
          if (en.kind === "local") {
            return (
              <div key={en.id} className="anim-fadeup mt-3">
                <p className="text-paper/85">
                  <span className="text-amber">▸ tâche locale</span> — {en.task}
                </p>
                {en.offline && <p className="mt-1 text-lime">réseau coupé — aucun impact, le moteur tourne chez vous.</p>}
                <ul className="mt-2 space-y-1.5">
                  {en.steps.map((s, i) => {
                    const done = i < en.done;
                    const active = en.status === "running" && i === en.done;
                    if (!done && !active) return null;
                    return (
                      <li key={i} className="anim-fadeup flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center">
                          {done ? <CheckIcon className="h-3.5 w-3.5 text-pine" /> : <SpinnerIcon className="h-3.5 w-3.5 text-lime" />}
                        </span>
                        <span className={done ? "text-paper/80" : "text-lime"}>
                          {s.label}
                          {s.tool && (
                            <span className="text-mutdark">
                              {" "}
                              <span className="text-paper/40">[</span>
                              {s.tool}
                              <span className="text-paper/40">]</span>
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {en.status === "done" && (
                  <div className="anim-fadeup mt-3 rounded-lg border border-pine/30 bg-pine/10 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-pine">
                      ✓ terminé en {sec(en.elapsed * 1000)} s
                    </p>
                    <p className="mt-1.5 font-body text-[13px] leading-relaxed text-paper/85">{en.result}</p>
                    <div className="mt-2.5 flex flex-wrap gap-2 text-[10.5px]">
                      <span className="rounded-full border border-lime/40 bg-lime/10 px-2 py-0.5 text-lime">tokens api facturés : 0</span>
                      <span className="rounded-full border border-linedark px-2 py-0.5 text-mutdark">octets sortis du poste : 0</span>
                      <span className="rounded-full border border-linedark px-2 py-0.5 text-mutdark">reproductible hors-ligne</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (en.kind === "user") {
            return (
              <p key={en.id} className="anim-fadeup mt-3 text-paper/85">
                <span className="text-lime">➜</span> <span className="text-amber">vous</span> — {en.text}
              </p>
            );
          }

          /* assistant live */
          return (
            <div key={en.id} className="anim-fadeup mt-3">
              <p className="flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-wider text-mutdark">
                <span className={`h-1.5 w-1.5 rounded-full ${en.streaming ? "bg-lime anim-pulsedot" : "bg-pine"}`} />
                agent live · {ROUTER_LABEL} · router.huggingface.co
              </p>
              <div className="mt-1.5 whitespace-pre-wrap font-body text-[14px] leading-relaxed text-paper/90">
                {en.text}
                {en.streaming && <span className="anim-blink ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-lime" />}
                {!en.streaming && !en.error && !en.stopped && en.text === "" && (
                  <span className="text-mutdark">— réponse vide du routeur —</span>
                )}
              </div>
              {en.streaming && (
                <p className="mt-1.5 text-[11px] text-lime">
                  flux en cours · {en.words} mots · {sec(en.ms)} s
                </p>
              )}
              {!en.streaming && !en.error && !en.stopped && (
                <p className="mt-1.5 text-[11px] text-mutdark">
                  réponse complète en <span className="text-pine">{sec(en.ms)} s</span> · ≈ {en.words} mots · 0 token facturé par Autonome
                </p>
              )}
              {en.stopped && <p className="mt-1.5 text-[11px] text-amber">— flux interrompu par l'utilisateur —</p>}
              {en.error && (
                <div className="mt-2 rounded-lg border border-rose/40 bg-rose/10 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-rose">✗ échec du flux</p>
                  <p className="mt-1 text-[13px] text-paper/85">{en.error}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* pied : jeton + suggestions + saisie */}
      <div className="border-t border-linedark p-3">
        {showTokenPanel ? (
          <div className="anim-fadeup rounded-lg border border-lime/30 bg-lime/5 p-3">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-lime">
              <KeyIcon className="h-4 w-4" /> armez le mode live — votre token Hugging Face
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <input
                type="password"
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyToken()}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                className="min-w-0 flex-1 rounded-md border border-linedark bg-ink px-3 py-2 font-mono text-[13px] text-paper placeholder:text-mutdark/50 focus:border-lime/60 focus:outline-none"
              />
              <button
                onClick={applyToken}
                disabled={!tokenDraft.trim()}
                className="rounded-md bg-lime px-4 py-2 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-limedark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                armer
              </button>
              <a
                href={TOKEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11.5px] text-mutdark underline decoration-dotted underline-offset-4 transition-colors hover:text-lime"
              >
                créer un token ↗
              </a>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-mutdark">
              La clé est stockée <span className="text-paper/80">dans ce navigateur uniquement</span> (localStorage) et n'est envoyée
              qu'à router.huggingface.co. Autonome ne la voit jamais, ne la facture jamais.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              {mode === "local"
                ? TEMPLATES.map((t) => (
                    <button
                      key={t.chip}
                      onClick={() => runLocal(t)}
                      disabled={busy}
                      className="rounded-full border border-linedark px-2.5 py-1 font-mono text-[10.5px] text-mutdark transition-colors hover:border-lime/60 hover:text-lime disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t.chip}
                    </button>
                  ))
                : SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendLive(s)}
                      disabled={busy}
                      className="rounded-full border border-linedark px-2.5 py-1 font-mono text-[10.5px] text-mutdark transition-colors hover:border-lime/60 hover:text-lime disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {s.length > 46 ? s.slice(0, 46) + "…" : s}
                    </button>
                  ))}
              {mode === "live" && tokenSet && (
                <button
                  onClick={removeToken}
                  className="ml-auto rounded-full border border-linedark px-2.5 py-1 font-mono text-[10.5px] text-mutdark transition-colors hover:border-rose/60 hover:text-rose"
                  title="Effacer la clé de ce navigateur"
                >
                  clé : {maskToken(getToken())} · retirer
                </button>
              )}
            </div>
            <form onSubmit={submit} className="flex items-center gap-2">
              <span className="font-mono text-lime">➜</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "live"
                    ? "Interrogez l'agent — réponse en streaming réel via le routeur HF…"
                    : "Décrivez une tâche… ex. « rédiger le compte-rendu de la réu d'hier »"
                }
                className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-paper placeholder:text-mutdark/60 focus:outline-none"
              />
              {mode === "live" && busy ? (
                <button
                  type="button"
                  onClick={() => abort.current?.abort()}
                  className="flex items-center gap-1.5 rounded-md bg-rose px-3.5 py-1.5 font-mono text-[11.5px] font-bold uppercase tracking-wider text-paper transition-all hover:brightness-110 active:scale-95"
                >
                  <StopIcon className="h-3.5 w-3.5" /> stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={busy || !input.trim() || (mode === "live" && !tokenSet)}
                  className="rounded-md bg-lime px-3.5 py-1.5 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-limedark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {mode === "live" ? "lancer le flux" : "lancer"}
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
