import type { ReactNode } from "react";
import {
  BuilderState,
  EXCLUDE_SUGGESTIONS,
  INCLUDE_SUGGESTIONS,
  PRESETS,
  RepoKind,
  isValid,
} from "../lib/model";
import { BoltIcon, BranchIcon, CrossIcon, FilterIcon, TermIcon } from "./ui";

const inputCls =
  "w-full rounded-md border border-line bg-inset px-3 py-2 font-mono text-[13px] text-ink placeholder:text-dim outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/15";

const labelCls = "mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-dim";

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-gold">{n}</span>
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-mut">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

const KINDS: { id: RepoKind; label: string }[] = [
  { id: "model", label: "Modèle" },
  { id: "dataset", label: "Dataset" },
  { id: "space", label: "Space" },
];

const METHODS = [
  {
    id: "xet" as const,
    name: "Git + xet",
    tag: "recommandé",
    tagCls: "bg-gold/12 text-gold border-gold/30",
    desc: "Clonage complet, téléchargement par blocs dédupliqués et reprise automatique après coupure.",
    Icon: BoltIcon,
  },
  {
    id: "pointers" as const,
    name: "Pointeurs LFS",
    tag: "≈ 2 Mo",
    tagCls: "bg-teal/10 text-teal border-teal/30",
    desc: "GIT_LFS_SKIP_SMUDGE=1 — le squelette du repo sans les poids. Un git lfs pull plus tard pour le reste.",
    Icon: BranchIcon,
  },
  {
    id: "hf" as const,
    name: "CLI hf",
    tag: "filtres",
    tagCls: "bg-ember/10 text-ember border-ember/30",
    desc: "hf download : choisir les fichiers, la révision, le dossier de destination. Idéal pour les gros repos.",
    Icon: TermIcon,
  },
];

export default function Builder({
  s,
  patch,
}: {
  s: BuilderState;
  patch: (p: Partial<BuilderState>) => void;
}) {
  const valid = isValid(s);
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="rounded-xl border border-line bg-panel p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
      {/* ------------------------------------------------ dépôt */}
      <SectionLabel n="01">Dépôt du Hub</SectionLabel>
      <div className="grid grid-cols-[1fr_1.4fr] gap-3">
        <div>
          <label className={labelCls} htmlFor="org">Organisation</label>
          <input
            id="org"
            className={inputCls}
            value={s.org}
            onChange={(e) => patch({ org: e.target.value })}
            placeholder="OBLITERATUS"
            spellCheck={false}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="repo">Nom du dépôt</label>
          <input
            id="repo"
            className={inputCls}
            value={s.model}
            onChange={(e) => patch({ model: e.target.value })}
            placeholder="Qwen3.8-27B-OBLITERATED"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-line bg-inset p-0.5">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => patch({ kind: k.id })}
              className={`rounded px-3 py-1.5 text-[12.5px] font-medium transition ${
                s.kind === k.id ? "bg-gold/15 text-gold" : "text-mut hover:text-ink"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <span className="hidden font-mono text-[11px] text-dim sm:inline">
          {s.kind === "model" ? "huggingface.co/{org}/{repo}" : `huggingface.co/${s.kind === "dataset" ? "datasets" : "spaces"}/{org}/{repo}`}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const active = p.org === s.org && p.model === s.model && p.kind === s.kind;
          return (
            <button
              key={p.model}
              onClick={() => patch({ org: p.org, model: p.model, kind: p.kind })}
              className={`group rounded-full border px-3 py-1 font-mono text-[11px] transition active:scale-95 ${
                active
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-line bg-inset text-mut hover:border-line2 hover:text-ink"
              }`}
            >
              {p.org}/{p.model.length > 22 ? p.model.slice(0, 21) + "…" : p.model}
              {p.kind !== "model" && <span className="ml-1 text-dim">· {p.kind}</span>}
            </button>
          );
        })}
      </div>

      {!valid && (
        <p className="mt-3 rounded-md border border-rose/30 bg-rose/8 px-3 py-2 text-[12.5px] text-rose">
          Renseignez l'organisation et le nom du dépôt pour générer les commandes.
        </p>
      )}

      {/* ------------------------------------------------ méthode */}
      <div className="mt-7">
        <SectionLabel n="02">Méthode de téléchargement</SectionLabel>
        <div className="space-y-2.5">
          {METHODS.map(({ id, name, tag, tagCls, desc, Icon }) => {
            const active = s.method === id;
            return (
              <button
                key={id}
                onClick={() => patch({ method: id })}
                className={`group flex w-full items-start gap-3.5 rounded-lg border p-3.5 text-left transition active:scale-[0.995] ${
                  active
                    ? "border-gold/50 bg-gold/[0.06] shadow-[inset_0_0_0_1px_rgba(255,178,36,0.25)]"
                    : "border-line bg-inset hover:border-line2 hover:bg-panel2"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border transition ${
                    active ? "border-gold/40 bg-gold/12 text-gold" : "border-line bg-panel2 text-mut group-hover:text-ink"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`font-display text-[15px] font-bold ${active ? "text-ink" : "text-ink/90"}`}>{name}</span>
                    <span className={`rounded-full border px-2 py-[1px] font-mono text-[9.5px] uppercase tracking-[0.12em] ${tagCls}`}>
                      {tag}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-mut">{desc}</span>
                </span>
                <span
                  className={`mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition ${
                    active ? "border-gold bg-gold" : "border-line2"
                  }`}
                >
                  {active && <span className="h-[7px] w-[7px] rounded-full bg-bg" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------ options */}
      <div className="mt-7">
        <SectionLabel n="03">Options</SectionLabel>

        {s.method === "xet" && (
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-mut transition hover:text-ink">
              <input
                type="checkbox"
                checked={s.withInstall}
                onChange={(e) => patch({ withInstall: e.target.checked })}
                className="h-4 w-4 accent-[#ffb224]"
              />
              Inclure l'installation <code className="rounded bg-inset px-1.5 py-0.5 font-mono text-[11.5px] text-gold">git-xet</code>
            </label>
            <div>
              <label className={labelCls} htmlFor="rev-xet">Branche (optionnel)</label>
              <input
                id="rev-xet"
                className={inputCls}
                value={s.revision}
                onChange={(e) => patch({ revision: e.target.value })}
                placeholder="main"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {s.method === "pointers" && (
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-mut transition hover:text-ink">
            <input
              type="checkbox"
              checked={s.withLfsPull}
              onChange={(e) => patch({ withLfsPull: e.target.checked })}
              className="h-4 w-4 accent-[#ffb224]"
            />
            Ajouter <code className="rounded bg-inset px-1.5 py-0.5 font-mono text-[11.5px] text-gold">git lfs pull</code> pour
            récupérer les poids plus tard
          </label>
        )}

        {s.method === "hf" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="rev-hf">Révision / branche</label>
                <input
                  id="rev-hf"
                  className={inputCls}
                  value={s.revision}
                  onChange={(e) => patch({ revision: e.target.value })}
                  placeholder="main"
                  spellCheck={false}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="dir-hf">Dossier cible</label>
                <input
                  id="dir-hf"
                  className={inputCls}
                  value={s.localDir}
                  onChange={(e) => patch({ localDir: e.target.value })}
                  placeholder={`./${s.model.trim() || "repo"}`}
                  spellCheck={false}
                />
              </div>
            </div>

            <div>
              <span className={labelCls}>
                <span className="mr-1.5 inline-block align-[-2px] text-gold"><FilterIcon className="h-3.5 w-3.5" /></span>
                Inclure (glob)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INCLUDE_SUGGESTIONS.map((p) => {
                  const on = s.includes.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => patch({ includes: toggle(s.includes, p) })}
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] transition active:scale-95 ${
                        on
                          ? "border-gold/50 bg-gold/12 text-gold"
                          : "border-line bg-inset text-mut hover:border-line2 hover:text-ink"
                      }`}
                    >
                      {p}
                      {on && <CrossIcon className="h-3 w-3 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={labelCls}>Exclure (glob)</span>
              <div className="flex flex-wrap gap-1.5">
                {EXCLUDE_SUGGESTIONS.map((p) => {
                  const on = s.excludes.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => patch({ excludes: toggle(s.excludes, p) })}
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] transition active:scale-95 ${
                        on
                          ? "border-rose/50 bg-rose/10 text-rose"
                          : "border-line bg-inset text-mut hover:border-line2 hover:text-ink"
                      }`}
                    >
                      {p}
                      {on && <CrossIcon className="h-3 w-3 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-line/70 pt-3.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-mut transition hover:text-ink">
                <input
                  type="checkbox"
                  checked={s.withInstall}
                  onChange={(e) => patch({ withInstall: e.target.checked })}
                  className="h-4 w-4 accent-[#ffb224]"
                />
                Inclure l'installation de la <code className="rounded bg-inset px-1.5 py-0.5 font-mono text-[11.5px] text-gold">hf CLI</code>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-mut transition hover:text-ink">
                <input
                  type="checkbox"
                  checked={s.gated}
                  onChange={(e) => patch({ gated: e.target.checked })}
                  className="h-4 w-4 accent-[#ffb224]"
                />
                Dépôt privé / gated <span className="text-dim">(ajoute hf auth login)</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
