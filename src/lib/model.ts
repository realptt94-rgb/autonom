export type RepoKind = "model" | "dataset" | "space";
export type Method = "xet" | "pointers" | "hf";

export interface BuilderState {
  org: string;
  model: string;
  kind: RepoKind;
  method: Method;
  revision: string;
  localDir: string;
  includes: string[];
  excludes: string[];
  gated: boolean;
  withInstall: boolean;
  withLfsPull: boolean;
}

export interface CmdLine {
  text: string;
  kind: "cmd" | "comment";
}

export interface CmdBlock {
  title: string;
  lines: CmdLine[];
}

export const DEFAULT_STATE: BuilderState = {
  org: "OBLITERATUS",
  model: "Qwen3.8-27B-OBLITERATED",
  kind: "model",
  method: "xet",
  revision: "",
  localDir: "",
  includes: [],
  excludes: [],
  gated: false,
  withInstall: true,
  withLfsPull: true,
};

export const PRESETS: { org: string; model: string; kind: RepoKind }[] = [
  { org: "OBLITERATUS", model: "Qwen3.8-27B-OBLITERATED", kind: "model" },
  { org: "meta-llama", model: "Llama-3.3-70B-Instruct", kind: "model" },
  { org: "HuggingFaceTB", model: "SmolLM2-1.7B-Instruct", kind: "model" },
  { org: "HuggingFaceFW", model: "fineweb", kind: "dataset" },
];

export const INCLUDE_SUGGESTIONS = ["*.safetensors", "*.json", "*.gguf", "tokenizer.*", "README.md"];
export const EXCLUDE_SUGGESTIONS = ["original/*", "*.bin", "*.msgpack"];

const kindPath = (k: RepoKind) => (k === "dataset" ? "datasets/" : k === "space" ? "spaces/" : "");

export const repoUrl = (s: BuilderState) =>
  `https://huggingface.co/${kindPath(s.kind)}${s.org.trim()}/${s.model.trim()}`;

export const isValid = (s: BuilderState) => s.org.trim().length > 0 && s.model.trim().length > 0;

/* ------------------------------------------------------------------ */
/* Génération des commandes                                            */
/* ------------------------------------------------------------------ */

export function buildBlocks(s: BuilderState): CmdBlock[] {
  const url = repoUrl(s);
  const rev = s.revision.trim();
  const revFlag = rev && rev !== "main" ? ` -b ${rev}` : "";
  const c = (text: string): CmdLine => ({ text, kind: "comment" });
  const x = (text: string): CmdLine => ({ text, kind: "cmd" });
  const blocks: CmdBlock[] = [];

  if (s.method === "xet") {
    if (s.withInstall) {
      blocks.push({
        title: "Installer git-xet",
        lines: [
          c("# Une seule fois — macOS / Linux via Homebrew"),
          x("brew install git-xet"),
          x("git xet install"),
        ],
      });
    }
    blocks.push({
      title: "Cloner le dépôt",
      lines: [
        c(`# ${s.org.trim()}/${s.model.trim()} — téléchargement par blocs dédupliqués, reprise auto`),
        x(`git clone${revFlag} ${url}`),
      ],
    });
  } else if (s.method === "pointers") {
    blocks.push({
      title: "Cloner sans les poids",
      lines: [
        c("# GIT_LFS_SKIP_SMUDGE=1 : seuls les pointeurs LFS sont téléchargés (≈ 2 Mo)"),
        x(`GIT_LFS_SKIP_SMUDGE=1 git clone${revFlag} ${url}`),
      ],
    });
    if (s.withLfsPull) {
      blocks.push({
        title: "Récupérer les poids plus tard",
        lines: [x(`cd ${s.model.trim()}`), x("git lfs pull")],
      });
    }
  } else {
    if (s.withInstall) {
      blocks.push({
        title: "Installer la CLI hf",
        lines: [c("# Une seule fois — installe le binaire hf (Rust)"), x("curl -LsSf https://hf.co/cli/install.sh | bash")],
      });
    }
    if (s.gated) {
      blocks.push({
        title: "S'authentifier",
        lines: [c("# Repo gated : se connecter au Hub avant de télécharger"), x("hf auth login")],
      });
    }
    const flags: string[] = [];
    if (s.kind !== "model") flags.push(`--repo-type ${s.kind}`);
    if (rev) flags.push(`--revision ${rev}`);
    if (s.localDir.trim()) flags.push(`--local-dir ${s.localDir.trim()}`);
    s.includes.forEach((p) => flags.push(`--include "${p}"`));
    s.excludes.forEach((p) => flags.push(`--exclude "${p}"`));

    const dl: CmdLine[] =
      flags.length > 0
        ? [
            x(`hf download ${s.org.trim()}/${s.model.trim()} \\`),
            ...flags.map((f, i) => x(`  ${f}${i < flags.length - 1 ? " \\" : ""}`)),
          ]
        : [x(`hf download ${s.org.trim()}/${s.model.trim()}`)];

    const target = s.localDir.trim() ? ` → ${s.localDir.trim()}` : " (cache hf par défaut)";
    blocks.push({
      title: "Télécharger",
      lines: [c(`# Révision ${rev || "main"}${target}${s.includes.length ? ` · ${s.includes.length} filtre(s) inclus` : ""}`), ...dl],
    });
  }
  return blocks;
}

export const blocksToText = (blocks: CmdBlock[]) =>
  blocks.map((b) => b.lines.map((l) => l.text).join("\n")).join("\n\n");

/* ------------------------------------------------------------------ */
/* Simulation : liste de fichiers du dépôt                             */
/* ------------------------------------------------------------------ */

export interface SimFile {
  name: string;
  size: number;
}

export function simFiles(s: BuilderState): SimFile[] {
  const small: SimFile[] = [
    { name: "README.md", size: 8_412 },
    { name: "config.json", size: 1_180 },
    { name: "generation_config.json", size: 214 },
    { name: "model.safetensors.index.json", size: 1_262_304 },
    { name: "tokenizer_config.json", size: 7_342 },
    { name: "tokenizer.json", size: 11_421_886 },
  ];
  const shards: SimFile[] = [];
  for (let i = 1; i <= 13; i++) {
    shards.push({
      name: `model-${String(i).padStart(5, "0")}-of-00013.safetensors`,
      size: i === 13 ? 2_914_751_424 : 4_152_918_016,
    });
  }
  let all = [...small, ...shards];
  if (s.method === "hf") {
    if (s.includes.length > 0) all = all.filter((f) => s.includes.some((p) => matchGlob(p, f.name)));
    if (s.excludes.length > 0) all = all.filter((f) => !s.excludes.some((p) => matchGlob(p, f.name)));
  }
  return all;
}

export function matchGlob(pattern: string, name: string): boolean {
  const rx = pattern
    .split("/")
    .map((seg) => seg.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*"))
    .join("/");
  try {
    return new RegExp(`^${rx}$`).test(name);
  } catch {
    return false;
  }
}

export const pointersTotal = (n: number) => n * 131 + 2_048;

/* ------------------------------------------------------------------ */
/* Formatage (fr-FR)                                                   */
/* ------------------------------------------------------------------ */

export function fmtBytes(n: number): string {
  const units = ["o", "Ko", "Mo", "Go", "To"];
  let v = n;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  const digits = v >= 100 || i === 0 ? 0 : 1;
  return `${v.toLocaleString("fr-FR", { maximumFractionDigits: digits })} ${units[i]}`;
}

export function fmtDur(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "—";
  if (sec < 60) return `${Math.max(1, Math.round(sec))} s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m} min ${String(s).padStart(2, "0")}`;
}

export function fakeHash(name: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < name.length; i++) {
    const ch = name.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + ch, 0x85ebca6b) >>> 0;
  }
  return (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).slice(0, 12);
}
