import { useCallback, useMemo, useState } from "react";
import Builder from "./components/Builder";
import TerminalPanel from "./components/TerminalPanel";
import { Checklist, Compare, Footer, Prereqs } from "./components/Extras";
import { ArrowIcon, LogoIcon, Reveal, Toast } from "./components/ui";
import { BuilderState, DEFAULT_STATE, buildBlocks, fmtBytes, isValid, simFiles } from "./lib/model";

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-bg" />
      <div className="bg-grid absolute inset-0" />
      <div
        className="glow-a absolute -top-32 left-[-10%] h-[560px] w-[720px] rounded-full opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(255,178,36,0.09), transparent 70%)" }}
      />
      <div
        className="glow-b absolute right-[-12%] top-[36%] h-[620px] w-[760px] rounded-full opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(63,217,182,0.075), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-18%] left-[22%] h-[480px] w-[640px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(255,122,28,0.06), transparent 70%)" }}
      />
    </div>
  );
}

function TopBar() {
  const links = [
    ["#generateur", "Générateur"],
    ["#prereqs", "Prérequis"],
    ["#methodes", "Méthodes"],
    ["#checklist", "Checklist"],
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 lg:px-8">
        <a href="#generateur" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-gold/35 bg-gold/10 text-gold transition group-hover:bg-gold/20">
            <LogoIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-[17px] font-extrabold tracking-tight text-ink">
            hub<span className="text-gold">clone</span>
          </span>
          <span className="hidden rounded-full border border-line px-2 py-[1px] font-mono text-[9.5px] text-dim sm:inline">
            v1.4.2
          </span>
        </a>
        <nav className="flex items-center gap-1">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="hidden rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-mut transition hover:bg-panel2 hover:text-gold md:inline"
            >
              {label}
            </a>
          ))}
          <a
            href="https://huggingface.co/docs/hub/git-xet"
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-1.5 font-mono text-[11px] text-mut transition hover:border-gold/40 hover:text-gold"
          >
            docs Hub <ArrowIcon className="h-3 w-3 -rotate-45" />
          </a>
        </nav>
      </div>
    </header>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 132 36" className="h-9 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb224" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffb224" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 30 L12 27 L24 29 L36 22 L48 24 L60 17 L72 19 L84 12 L96 15 L108 8 L120 10 L132 3 L132 36 L0 36 Z"
        fill="url(#sparkfill)"
      />
      <path
        className="spark-line"
        d="M0 30 L12 27 L24 29 L36 22 L48 24 L60 17 L72 19 L84 12 L96 15 L108 8 L120 10 L132 3"
        fill="none"
        stroke="#ffb224"
        strokeWidth="1.6"
      />
      <circle cx="132" cy="3" r="2.4" fill="#3fd9b6" />
    </svg>
  );
}

function RepoCard({ s }: { s: BuilderState }) {
  const files = useMemo(() => simFiles({ ...s, method: s.method === "hf" ? "hf" : "xet" }), [s]);
  const total = files.reduce((a, f) => a + f.size, 0);
  const valid = isValid(s);
  return (
    <div className="rounded-xl border border-line bg-panel/80 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">fiche dépôt</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-teal anim-pulsedot" /> synchronisé
        </span>
      </div>
      <p className="mt-2 truncate font-mono text-[12.5px] text-ink">
        <span className="text-dim">hf.co/</span>
        {valid ? (
          <>
            <span className="text-gold">{s.org.trim()}</span>
            <span className="text-dim">/</span>
            {s.model.trim()}
          </>
        ) : (
          <span className="text-dim">—</span>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Safetensors", "13 shards", "Transformers", "apache-2.0"].map((c) => (
          <span key={c} className="rounded-md border border-line bg-inset px-2 py-[3px] font-mono text-[10px] text-mut">
            {c}
          </span>
        ))}
        <span className="rounded-md border border-gold/35 bg-gold/10 px-2 py-[3px] font-mono text-[10px] font-medium text-gold">
          ≈ {valid ? fmtBytes(total) : "—"}
        </span>
      </div>
      <div className="mt-4 border-t border-line/70 pt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">téléchargements / mois</span>
          <span className="font-display text-[18px] font-extrabold text-ink">182 k</span>
        </div>
        <div className="mt-1.5">
          <Sparkline />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [s, setS] = useState<BuilderState>(DEFAULT_STATE);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);

  const patch = useCallback((p: Partial<BuilderState>) => setS((prev) => ({ ...prev, ...p })), []);
  const notify = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);

  const blocks = useMemo(() => (isValid(s) ? buildBlocks(s) : []), [s]);

  return (
    <div className="relative min-h-screen font-body text-ink">
      <Background />
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-gold via-ember to-teal" />
      <TopBar />

      <main className="mx-auto max-w-[1200px] px-5 lg:px-8">
        {/* ---------------- ouverture ---------------- */}
        <div className="grid items-end gap-8 pb-10 pt-12 lg:grid-cols-[1.55fr_1fr] lg:pt-16">
          <Reveal>
            <p className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
              <span className="inline-block h-[7px] w-[7px] rotate-45 bg-gold" />
              hub → machine · git-xet / lfs / hf cli
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.3rem,4.8vw,3.9rem)] font-extrabold leading-[1.04] tracking-tight">
              Clonez <span className="text-gold">ce dépôt</span>
              <br />
              de modèles.
            </h1>
            <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-mut">
              Trois façons d'obtenir <span className="font-mono text-[13.5px] text-ink">OBLITERATUS/Qwen3.8-27B-OBLITERATED</span>{" "}
              sur votre disque : le clone dédupliqué <strong className="font-semibold text-ink">git-xet</strong>, le squelette en{" "}
              <strong className="font-semibold text-ink">pointeurs LFS</strong>, ou la{" "}
              <strong className="font-semibold text-ink">CLI hf</strong> avec filtres. Choisissez, copiez, téléchargez.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <RepoCard s={s} />
          </Reveal>
        </div>

        {/* ---------------- générateur + terminal ---------------- */}
        <section id="generateur" className="scroll-mt-24">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.06fr]">
            <Reveal>
              <Builder s={s} patch={patch} />
            </Reveal>
            <Reveal delay={100} className="lg:sticky lg:top-[72px]">
              <TerminalPanel s={s} blocks={blocks} notify={notify} />
            </Reveal>
          </div>
        </section>

        {/* ---------------- sections basses ---------------- */}
        <div className="mt-24 space-y-24">
          <Reveal>
            <Prereqs notify={notify} />
          </Reveal>
          <Reveal>
            <Compare />
          </Reveal>
          <Reveal>
            <Checklist />
          </Reveal>
        </div>
      </main>

      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
