import { useRef, useState, type ReactNode } from "react";
import {
  BoltIcon,
  BoxIcon,
  BranchIcon,
  CheckIcon,
  CopyIcon,
  DiskIcon,
  ShieldIcon,
  SpinnerIcon,
  TildeIcon,
} from "./ui";

export function SectionHead({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
        <span className="inline-block h-[7px] w-[7px] rotate-45 bg-gold" />
        {kicker}
      </p>
      <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-extrabold leading-tight tracking-tight text-ink">
        {title}
      </h2>
      {sub && <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-mut">{sub}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prérequis                                                           */
/* ------------------------------------------------------------------ */

const TOOLS = [
  {
    name: "git",
    ver: "2.47.1",
    role: "Le socle — clone, branches, historique.",
    cmd: "brew install git",
  },
  {
    name: "git-lfs",
    ver: "3.6.1",
    role: "Requis pour git lfs pull après un clone en pointeurs.",
    cmd: "brew install git-lfs && git lfs install",
  },
  {
    name: "git-xet",
    ver: "1.1.11",
    role: "Le moteur de transfert par blocs dédupliqués.",
    cmd: "brew install git-xet && git xet install",
  },
  {
    name: "hf CLI",
    ver: "0.36.2",
    role: "hf download : filtres, révisions, cache centralisé.",
    cmd: "curl -LsSf https://hf.co/cli/install.sh | bash",
  },
];

type ToolStatus = { s: "idle" | "checking" | "ok"; v: string | null };

export function Prereqs({ notify }: { notify: (m: string) => void }) {
  const [st, setSt] = useState<ToolStatus[]>(TOOLS.map(() => ({ s: "idle", v: null })));
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const verify = () => {
    if (running) return;
    setRunning(true);
    setSt(TOOLS.map(() => ({ s: "idle", v: null })));
    TOOLS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setSt((p) => p.map((t, j) => (j === i ? { s: "checking", v: null } : t)));
        }, i * 640)
      );
      timers.current.push(
        window.setTimeout(() => {
          setSt((p) => p.map((t, j) => (j === i ? { s: "ok", v: TOOLS[i].ver } : t)));
          if (i === TOOLS.length - 1) {
            setRunning(false);
            notify("Environnement prêt — 4/4 outils détectés");
          }
        }, i * 640 + 520)
      );
    });
  };

  return (
    <section id="prereqs" className="scroll-mt-24">
      <SectionHead
        kicker="Avant de cloner"
        title={<>La chaîne d'outils, vérifiée</>}
        sub="Quatre binaires suffisent pour couvrir les trois méthodes. Lancez la vérification simulée pour voir ce que le script détecterait sur votre machine."
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        {TOOLS.map((t, i) => {
          const cur = st[i];
          return (
            <div
              key={t.name}
              className="group flex items-start gap-4 rounded-xl border border-line bg-panel p-4 transition hover:border-line2 hover:bg-panel2/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-[16px] font-bold text-ink">{t.name}</span>
                  {cur.s === "ok" ? (
                    <span className="flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2 py-[1px] font-mono text-[10px] text-teal">
                      <CheckIcon className="h-3 w-3" /> v{cur.v}
                    </span>
                  ) : cur.s === "checking" ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2 py-[1px] font-mono text-[10px] text-gold">
                      <SpinnerIcon className="h-3 w-3 animate-spin" /> détection…
                    </span>
                  ) : (
                    <span className="rounded-full border border-line px-2 py-[1px] font-mono text-[10px] text-dim">
                      à vérifier
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-mut">{t.role}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-inset px-2.5 py-1.5 font-mono text-[11.5px] text-ink/85">
                    {t.cmd}
                  </code>
                  <CopyCmd cmd={t.cmd} label={`Installation de ${t.name} copiée`} notify={notify} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={verify}
        disabled={running}
        className="mt-4 flex items-center gap-2 rounded-lg border border-gold/45 bg-gold/12 px-4 py-2.5 font-mono text-[12px] font-medium text-gold transition hover:bg-gold/20 active:scale-[0.98] disabled:opacity-50"
      >
        {running ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <BoltIcon className="h-4 w-4" />}
        {running ? "Vérification en cours…" : "Vérifier mon environnement"}
      </button>
    </section>
  );
}

function CopyCmd({ cmd, label, notify }: { cmd: string; label: string; notify: (m: string) => void }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(cmd);
        } catch {
          /* silencieux */
        }
        setOk(true);
        notify(label);
        setTimeout(() => setOk(false), 1300);
      }}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition active:scale-90 ${
        ok ? "border-teal/50 bg-teal/10 text-teal" : "border-line bg-panel2 text-mut hover:border-line2 hover:text-ink"
      }`}
      aria-label={label}
    >
      {ok ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Comparatif                                                          */
/* ------------------------------------------------------------------ */

type Mark = "yes" | "no" | "part";
interface Cell {
  m: Mark;
  t?: string;
}
const ROWS: { label: string; v: [Cell, Cell, Cell] }[] = [
  { label: "Poids du modèle sur le disque", v: [{ m: "yes" }, { m: "no", t: "pointeurs" }, { m: "part", t: "selon filtres" }] },
  { label: "Delta & déduplication bloc à bloc", v: [{ m: "yes" }, { m: "no" }, { m: "no" }] },
  { label: "Filtres --include / --exclude", v: [{ m: "no" }, { m: "no" }, { m: "yes" }] },
  { label: "Révision ou branche spécifique", v: [{ m: "yes", t: "-b" }, { m: "yes", t: "-b" }, { m: "yes", t: "--revision" }] },
  { label: "Reprise après coupure réseau", v: [{ m: "yes" }, { m: "no" }, { m: "yes" }] },
  { label: "Dossier cible personnalisable", v: [{ m: "yes" }, { m: "yes" }, { m: "yes", t: "--local-dir" }] },
  { label: "Trafic pour un repo de 52,7 Go", v: [{ m: "part", t: "≈ 52,7 Go *" }, { m: "yes", t: "≈ 2 Mo" }, { m: "part", t: "selon filtres" }] },
];

function MarkGlyph({ c }: { c: Cell }) {
  if (c.m === "yes")
    return (
      <span className="inline-flex items-center justify-center gap-1.5 text-teal">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-teal/12">
          <CheckIcon className="h-3 w-3" />
        </span>
        {c.t && <span className="font-mono text-[10.5px] text-mut">{c.t}</span>}
      </span>
    );
  if (c.m === "no")
    return (
      <span className="inline-flex items-center justify-center gap-1.5 text-dim">
        <span className="inline-block h-[2px] w-4 rounded bg-line2" />
        {c.t && <span className="font-mono text-[10.5px]">{c.t}</span>}
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center gap-1.5 text-gold">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-gold/12">
        <TildeIcon className="h-3.5 w-3.5" />
      </span>
      {c.t && <span className="font-mono text-[10.5px] text-mut">{c.t}</span>}
    </span>
  );
}

export function Compare() {
  const heads = [
    { n: "Git + xet", rec: true },
    { n: "Pointeurs LFS", rec: false },
    { n: "CLI hf", rec: false },
  ];
  return (
    <section id="methodes" className="scroll-mt-24">
      <SectionHead
        kicker="Quelle méthode ?"
        title={<>Trois chemins vers les mêmes poids</>}
        sub="Même dépôt, trois comportements. Le clone xet est le plus économe en bande passante sur la durée ; les pointeurs pour inspecter un repo sans payer 50 Go ; la CLI hf quand il ne faut que quelques fichiers."
      />
      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-panel2/70">
                <th className="px-4 py-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-dim">
                  Critère
                </th>
                {heads.map((h) => (
                  <th
                    key={h.n}
                    className={`px-4 py-3.5 font-display text-[14px] font-bold ${
                      h.rec ? "bg-gold/[0.07] text-gold" : "text-ink"
                    }`}
                  >
                    {h.n}
                    {h.rec && (
                      <span className="ml-2 rounded-full border border-gold/40 px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.1em]">
                        reco
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label} className={`transition hover:bg-panel2/50 ${i > 0 ? "border-t border-line/60" : ""}`}>
                  <td className="px-4 py-3 text-[13px] font-medium text-ink/90">{r.label}</td>
                  {r.v.map((c, j) => (
                    <td key={j} className={`px-4 py-3 ${j === 0 ? "bg-gold/[0.045]" : ""}`}>
                      <MarkGlyph c={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line/70 bg-inset/60 px-4 py-2.5 font-mono text-[11px] text-dim">
          * hors blocs déjà présents dans le cache xet local — un re-clone du même repo est presque gratuit.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Checklist                                                           */
/* ------------------------------------------------------------------ */

const CHECKS = [
  {
    Icon: DiskIcon,
    title: "Espace disque : visez 2×",
    text: "Comptez environ deux fois la taille du repo pendant le transfert — fichiers temporaires puis checkout final. Pour 52,7 Go, gardez ~110 Go libres.",
  },
  {
    Icon: ShieldIcon,
    title: "Repos gated : auth d'abord",
    text: "Certains dépôts exigent une validation. Connectez-vous avec hf auth login ou exportez HF_TOKEN avant le clone, sinon le transfert s'arrête à 401.",
  },
  {
    Icon: BoxIcon,
    title: "Le cache xet est votre ami",
    text: "git-xet stocke les blocs dans ~/.cache/huggingface. Re-cloner un repo, même géant, ne retélécharge que ce qui a changé.",
  },
  {
    Icon: BranchIcon,
    title: "Pointeurs ≠ poids",
    text: "Après un clone GIT_LFS_SKIP_SMUDGE=1, les .safetensors sont des stubs de 131 o. Un git lfs pull dans le dossier les remplace par les vrais fichiers.",
  },
];

export function Checklist() {
  return (
    <section id="checklist" className="scroll-mt-24">
      <SectionHead kicker="Checklist" title={<>Avant de lancer 50 Go à travers le réseau</>} />
      <div className="grid gap-3.5 sm:grid-cols-2">
        {CHECKS.map(({ Icon, title, text }, i) => (
          <div
            key={title}
            className={`rounded-xl border border-line bg-panel p-4.5 transition hover:-translate-y-0.5 hover:border-line2 ${
              i % 2 === 1 ? "sm:translate-y-3" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md border border-gold/30 bg-gold/10 text-gold">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-mut">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-inset/50">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="font-display text-[15px] font-bold text-ink">
            hubclone <span className="ml-1 font-mono text-[10.5px] font-normal text-dim">v1.4.2</span>
          </p>
          <p className="mt-1 max-w-[52ch] text-[12px] leading-relaxed text-dim">
            Générateur de commandes non officiel. Hugging Face, le Hub et les logos associés appartiennent à
            Hugging Face, Inc. Les simulations sont purement locales.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11.5px]">
          <a
            href="https://huggingface.co/docs/hub/git-xet"
            target="_blank"
            rel="noreferrer"
            className="text-mut transition hover:text-gold"
          >
            docs git-xet ↗
          </a>
          <a
            href="https://huggingface.co/docs/huggingface_hub/guides/cli"
            target="_blank"
            rel="noreferrer"
            className="text-mut transition hover:text-gold"
          >
            docs CLI hf ↗
          </a>
          <a href="https://huggingface.co/models" target="_blank" rel="noreferrer" className="text-mut transition hover:text-gold">
            explorer le Hub ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
