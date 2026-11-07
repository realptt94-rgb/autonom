import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowIcon,
  CheckIcon,
  ChipIcon,
  CodeIcon,
  CoinSlashIcon,
  CopyIcon,
  EuroIcon,
  GaugeIcon,
  HouseIcon,
  InfinityIcon,
  LockIcon,
  PlaneIcon,
  PlugIcon,
  PlusIcon,
  QuillIcon,
  RadarIcon,
  TableIcon,
  AppleIcon,
  WindowsIcon,
  LinuxIcon,
  DownloadIcon,
} from "./icons";
import type { OS } from "../lib/install";

/* ---------------- helpers ---------------- */

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, on };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, on } = useInView<HTMLDivElement>(0.12);
  return (
    <div ref={ref} className={`reveal ${on ? "on" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const nf = new Intl.NumberFormat("fr-FR");
const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function SectionHead({
  kicker,
  title,
  sub,
  dark = false,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <Reveal className="max-w-3xl">
      <p className={`flex items-center gap-2.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] ${dark ? "text-lime" : "text-pine"}`}>
        <span className={`h-2 w-2 ${dark ? "bg-lime" : "bg-pine"}`} />
        {kicker}
      </p>
      <h2 className={`mt-4 font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl ${dark ? "text-paper" : "text-ink"}`}>
        {title}
      </h2>
      {sub && <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${dark ? "text-mutdark" : "text-mut"}`}>{sub}</p>}
    </Reveal>
  );
}

/* ---------------- marquee ---------------- */

const TICKER = [
  "0 token facturé",
  "100 % local",
  "qwen3.8-27b",
  "hors-ligne ok",
  "données privées",
  "24 t/s sur m3",
  "install en 90 s",
  "api key : jamais",
  "contexte 128k",
  "quantifié q4_k_m",
];

export function Marquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="marquee overflow-hidden border-y border-line bg-lime py-3">
      <div className="marquee-track gap-0">
        {items.map((t, i) => (
          <span key={i} className="flex items-center font-mono text-[12.5px] font-bold uppercase tracking-[0.18em] text-ink">
            <span className="px-6">{t}</span>
            <svg viewBox="0 0 10 10" className="h-2 w-2 text-ink/70">
              <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- live stats ---------------- */

export function LiveStats() {
  const [tokens, setTokens] = useState(12_480_512);
  const { ref, on } = useInView<HTMLDivElement>(0.3);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setTokens((t) => t + 900 + Math.floor(Math.random() * 3400)), 900);
    return () => clearInterval(id);
  }, [on]);

  const stats = [
    { big: nf.format(tokens), label: "tokens économisés ce mois", live: true },
    { big: "0 €", label: "facturé par les fournisseurs d'API" },
    { big: "3,1 s", label: "latence médiane par tâche" },
    { big: "100 %", label: "des requêtes traitées sur votre machine" },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`bg-card px-6 py-7 ${on ? "anim-fadeup" : "opacity-0"}`} style={{ animationDelay: `${i * 110}ms` }}>
            <p className="flex items-center gap-2 font-display text-3xl tracking-tight text-ink sm:text-[2rem]">
              {s.big}
              {s.live && (
                <span className="anim-pulsedot h-2 w-2 rounded-full bg-pine" title="compteur en direct" />
              )}
            </p>
            <p className="mt-1.5 text-[13.5px] leading-snug text-mut">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- cost calculator ---------------- */

const CLASSES = [
  { id: "eco", label: "Éco", p: 0.006 },
  { id: "std", label: "Standard", p: 0.018 },
  { id: "max", label: "Raisonnement", p: 0.045 },
];

export function CostCalc() {
  const [tasks, setTasks] = useState(220);
  const [cls, setCls] = useState(CLASSES[1]);
  const api = tasks * 30 * cls.p;
  const local = 29;
  const maxV = Math.max(api, local);
  const breakeven = Math.ceil(local / (30 * cls.p));

  return (
    <section id="couts" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8">
      <SectionHead
        kicker="Le calcul qui fâche"
        title={
          <>
            VOS TOKENS VOUS <span className="text-pine">COÛTENT</span>.
            <br />
            LES NÔTRES : <span className="relative inline-block">0 €.<span className="absolute -bottom-1 left-0 h-1.5 w-full bg-lime" /></span>
          </>
        }
        sub="Chaque tâche exécutée chez nous ne déclenche aucun compteur. Faites glisser : c'est votre volume réel que vous simulez."
      />

      <Reveal delay={120}>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* controls */}
          <div className="rounded-xl border border-line bg-card p-6 sm:p-8">
            <label className="flex items-baseline justify-between gap-4">
              <span className="text-[15px] font-semibold text-ink">Tâches IA par jour</span>
              <span className="font-display text-4xl tracking-tight text-pine">{nf.format(tasks)}</span>
            </label>
            <input
              type="range"
              min={10}
              max={1500}
              step={10}
              value={tasks}
              onChange={(e) => setTasks(Number(e.target.value))}
              className="mt-5 w-full"
              style={{ ["--fill" as string]: `${((tasks - 10) / 1490) * 100}%` }}
              aria-label="Tâches IA par jour"
            />
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-mut">
              <span>10</span>
              <span>750</span>
              <span>1 500</span>
            </div>

            <p className="mt-7 text-[15px] font-semibold text-ink">Classe de modèle API équivalente</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCls(c)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                    cls.id === c.id
                      ? "border-ink bg-ink text-paper shadow-[4px_4px_0_0_var(--color-lime)]"
                      : "border-line bg-paper text-ink hover:border-ink/40"
                  }`}
                >
                  <span className="block text-[13.5px] font-bold">{c.label}</span>
                  <span className={`font-mono text-[11px] ${cls.id === c.id ? "text-lime" : "text-mut"}`}>
                    {c.p.toFixed(3).replace(".", ",")} €/tâche
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-7 rounded-lg border border-line bg-paper px-4 py-3 text-[13.5px] leading-relaxed text-mut">
              Rentable dès <strong className="text-ink">≈ {nf.format(breakeven)} tâches/jour</strong> avec l'offre Solo —
              au-delà, chaque tâche supplémentaire est gratuite.
            </p>
          </div>

          {/* result */}
          <div className="flex flex-col justify-center rounded-xl border border-line bg-ink p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mutdark">Facture mensuelle estimée</p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="flex items-center gap-2 text-[14px] text-paper/80">
                    <span className="h-2.5 w-2.5 rounded-sm bg-rose" /> API à la consommation
                  </span>
                  <span className="font-display text-3xl tracking-tight text-rose sm:text-4xl">{eur.format(api)}</span>
                </div>
                <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-linedark">
                  <div className="bar-fill h-full rounded-full bg-rose" style={{ width: `${Math.max(2, (api / maxV) * 100)}%` }} />
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-mutdark">
                  {nf.format(tasks * 30)} tâches/mois × {cls.p.toFixed(3).replace(".", ",")} €
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="flex items-center gap-2 text-[14px] text-paper/80">
                    <span className="h-2.5 w-2.5 rounded-sm bg-lime" /> Autonome (forfait fixe)
                  </span>
                  <span className="font-display text-3xl tracking-tight text-lime sm:text-4xl">{eur.format(local)}</span>
                </div>
                <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-linedark">
                  <div className="bar-fill h-full rounded-full bg-lime" style={{ width: `${Math.max(2, (local / maxV) * 100)}%` }} />
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-mutdark">illimité · quel que soit le volume</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-pine/40 bg-pine/10 px-5 py-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-pine">Économie annuelle</p>
                <p className="font-display text-4xl tracking-tight text-paper sm:text-5xl">
                  {eur.format(Math.max(0, (api - local) * 12))}
                </p>
              </div>
              <CoinSlashIcon className="h-12 w-12 text-lime" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- proof (scattered quotes) ---------------- */

const QUOTES = [
  {
    txt: "On a divisé notre facture IA par… zéro. Littéralement. Le forfait couvre tout, on a arrêté de compter.",
    name: "Claire Besson",
    role: "Head of Ops · scale-up 40 pers., Lyon",
    cls: "md:col-span-2 md:-rotate-1",
  },
  {
    txt: "Le mode avion m'a convaincu : j'ai tout coupé, l'agent a continué à bosser comme si de rien n'était.",
    name: "Marc Diallo",
    role: "CTO · fintech, Paris",
    cls: "md:rotate-2 md:translate-y-6",
  },
  {
    txt: "Nos contrats clients ne quittent plus le bâtiment. Pour le juridique, l'argument a été décisif en une réunion.",
    name: "Sofia Ribeiro",
    role: "Directrice juridique · cabinet, Nantes",
    cls: "md:-rotate-1 md:translate-y-3",
  },
  {
    txt: "24 tokens/seconde sur mon M3, en silence, pendant que je fais autre chose. On revient pas en arrière.",
    name: "Théo Lambert",
    role: "Lead dev · studio indépendant, Bordeaux",
    cls: "md:col-span-2 md:rotate-1",
  },
];

export function Proof() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHead
        kicker="Ils ont coupé le cordon"
        title={
          <>
            PLUS PERSONNE NE <span className="text-pine">COMPTE SES TOKENS.</span>
          </>
        }
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 90} className={q.cls}>
            <figure className="card-hover h-full rounded-xl border border-line bg-card p-6 sm:p-7">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-limedark" fill="currentColor">
                <path d="M9.8 6.2C6.6 7.8 4.6 10.3 4.6 13.6c0 2.5 1.6 4.2 3.7 4.2 1.9 0 3.3-1.4 3.3-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.7.05-.9.1.3-1.6 1.7-3.2 3.5-4.1Zm9 0c-3.2 1.6-5.2 4.1-5.2 7.4 0 2.5 1.6 4.2 3.7 4.2 1.9 0 3.3-1.4 3.3-3.3 0-1.8-1.3-3.1-3-3.1-.3 0-.7.05-.9.1.3-1.6 1.7-3.2 3.5-4.1Z" />
              </svg>
              <blockquote className="mt-4 text-[15.5px] leading-relaxed text-ink2">{q.txt}</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <p className="font-semibold text-ink">{q.name}</p>
                <p className="mt-0.5 font-mono text-[11.5px] text-mut">{q.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- engine (dark, sticky 2-col) ---------------- */

function BarRow({ label, v, on, delay }: { label: string; v: number; on: boolean; delay: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[12px]">
        <span className="text-paper/85">{label}</span>
        <span className="text-lime">{v}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-linedark">
        <div className="bar-fill h-full rounded-full bg-gradient-to-r from-pine to-lime" style={{ width: on ? `${v}%` : "0%", transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

const BENCH = [
  { label: "Français natif", v: 96 },
  { label: "Appel d'outils / JSON", v: 92 },
  { label: "Code", v: 81 },
  { label: "Raisonnement multi-étapes", v: 78 },
  { label: "Mathématiques", v: 74 },
];

export function Engine() {
  const { ref, on } = useInView<HTMLDivElement>(0.15);
  return (
    <section id="moteur" className="relative scroll-mt-24 overflow-hidden bg-ink py-24">
      <div className="bg-griddark pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-pine/15 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          {/* sticky left */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              dark
              kicker="Sous le capot"
              title={
                <>
                  UN MOTEUR DE 27 MILLIARDS DE PARAMÈTRES.
                  <span className="text-lime"> DANS VOTRE SALON.</span>
                </>
              }
              sub="Qwen3.8-27B « Obliterated » : un modèle de frontalière, sans garde-fou artificiel de débit, quantifié pour tourner sur une machine normale. Autonome l'installe, le vérifie et le pilote — vous n'avez jamais à toucher un fichier de config."
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {["27B paramètres", "128k de contexte", "Q4_K_M · 16,9 Go", "24 t/s sur M3", "GGUF signé"].map((c) => (
                <span key={c} className="rounded-full border border-linedark px-3.5 py-1.5 font-mono text-[12px] text-paper/80">
                  {c}
                </span>
              ))}
            </div>
            <a
              href="#installation"
              className="group mt-9 inline-flex items-center gap-3 rounded-lg bg-lime px-6 py-3.5 font-mono text-[13px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-limedark active:scale-95"
            >
              L'installer en 90 s
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* scrolling right */}
          <div ref={ref} className="space-y-5">
            <div className="rounded-xl border border-linedark bg-ink2/60 p-6 sm:p-7">
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-lime">
                <GaugeIcon className="h-4 w-4" /> Benchmarks internes
              </p>
              <div className="mt-5 space-y-4">
                {BENCH.map((b, i) => (
                  <BarRow key={b.label} label={b.label} v={b.v} on={on} delay={i * 120} />
                ))}
              </div>
              <p className="mt-5 font-mono text-[11px] leading-relaxed text-mutdark">
                Scores normalisés 0–100 sur nos suites internes (FR-Eval, ToolCall-Bench). Modèle de référence : API propriétaire équivalente.
              </p>
            </div>

            <div className="rounded-xl border border-linedark bg-ink2/60 p-6 sm:p-7">
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-lime">
                <ChipIcon className="h-4 w-4" /> Ce qu'il vous faut
              </p>
              <dl className="mt-5 divide-y divide-linedark">
                {[
                  ["Mémoire unifiée (Mac)", "32 Go — tourne à 24 t/s"],
                  ["GPU dédié (PC)", "18 Go VRAM — RTX 4090 / 5080"],
                  ["CPU seul", "64 Go RAM — 6 t/s, suffisant en asynchrone"],
                  ["Stockage", "17 Go — dédupliqués xet si déjà présents"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 py-3.5">
                    <dt className="text-[14px] text-paper/85">{k}</dt>
                    <dd className="text-right font-mono text-[12px] text-mutdark">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-xl border border-lime/35 bg-lime/6 p-6 sm:p-7">
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-lime">
                <PlugIcon className="h-4 w-4" /> Mode live — routeur Hugging Face
              </p>
              <p className="mt-4 text-[14.5px] leading-relaxed text-paper/85">
                Le local est la règle ; le live est l'option. Depuis la console, basculez en « live » pour interroger{" "}
                <span className="font-mono text-[13px] text-lime">qwen3.8-27b-aeon · bf16</span> en streaming réel, via{" "}
                <span className="font-mono text-[13px] text-lime">router.huggingface.co</span>, avec une conversation qui garde son contexte.
              </p>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Votre token HF est stocké dans votre navigateur — jamais chez nous",
                  "Flux SSE mot à mot, interruption possible à tout moment",
                  "Autonome ne facture rien : le débit passe par votre propre quota HF",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-paper/75">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-lime px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:bg-limedark"
                >
                  créer un token ↗
                </a>
                <a
                  href="https://huggingface.co/docs/api-inference"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-linedark px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-mutdark transition-colors hover:border-lime hover:text-lime"
                >
                  doc routeur ↗
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-pine/35 bg-pine/8 p-6 sm:p-7">
              <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-lime">
                <LockIcon className="h-4 w-4" /> Chaîne de confiance
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  "Poids téléchargés sur Hugging Face, empreinte sha256 vérifiée bloc par bloc",
                  "Aucun appel réseau pendant l'inférence — vérifiable en mode avion",
                  "Vos documents ne quittent jamais le disque : le contexte est monté en mémoire locale",
                  "Mises à jour du moteur signées, jamais appliquées sans votre accord",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14px] leading-relaxed text-paper/85">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- agents bento ---------------- */

const AGENTS = [
  {
    icon: QuillIcon,
    name: "Le Rédacteur",
    wide: true,
    desc: "Comptes-rendus, briefs, réponses clients : il écrit dans votre ton, relit, reformate, et dépose le livrable au bon endroit. Vous validez, il apprend.",
    stat: "1 240 documents/mois en moyenne",
  },
  {
    icon: RadarIcon,
    name: "Le Veilleur",
    desc: "Il digère vos dossiers, flux internes et exports, puis produit un brief hebdo des signaux faibles. Sans jamais crawler le web sans ordre.",
    stat: "3 alertes actionnables / semaine",
  },
  {
    icon: TableIcon,
    name: "Le Nettoyeur",
    desc: "CSV, CRM, exports comptables : doublons, e-mails invalides, libellés en pagaille. Il rend des tables propres avec rapport d'anomalies.",
    stat: "98,4 % de lignes conservées",
  },
  {
    icon: CodeIcon,
    name: "Le Binôme",
    wide: true,
    desc: "Revue de code, scripts jetables, migrations SQL : il propose, explique chaque changement, et n'applique rien sans diff validé. Tourne entièrement hors-ligne — vos sources ne fuient nulle part.",
    stat: "41 min gagnées / jour / dev",
  },
];

export function Agents() {
  return (
    <section id="agents" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          kicker="Agents autonomes"
          title={
            <>
              ILS BOSSENT <span className="text-pine">SEULS</span>.
              <br />
              VOUS GARDEZ <span className="relative inline-block">LA MAIN.<span className="absolute -bottom-1 left-0 h-1.5 w-full bg-lime" /></span>
            </>
          }
          sub="Quatre agents prêts à l'emploi, chacun cantonné à des outils que vous autorisez. Chaque action est journalisée, réversible, et ne coûte rien de plus que vos électrons."
        />
        <Reveal delay={150}>
          <p className="flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 font-mono text-[12px] text-mut">
            <span className="anim-pulsedot h-2 w-2 rounded-full bg-pine" />
            4 agents · 0 token · journal complet
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {AGENTS.map((a, i) => (
          <Reveal key={a.name} delay={(i % 3) * 100} className={a.wide ? "md:col-span-2" : ""}>
            <article className={`card-hover group flex h-full flex-col rounded-xl border border-line bg-card p-6 sm:p-7 ${a.wide ? "md:flex-row md:items-center md:gap-8" : ""}`}>
              <div className={a.wide ? "md:max-w-[46%]" : ""}>
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-lime transition-transform group-hover:-rotate-6 group-hover:scale-105">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-2xl tracking-tight text-ink sm:text-[1.7rem]">{a.name}</h3>
              </div>
              <div className={a.wide ? "mt-4 md:mt-0" : "mt-3"}>
                <p className="text-[14.5px] leading-relaxed text-mut">{a.desc}</p>
                <p className="mt-4 flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-wider text-pine">
                  <span className="h-1.5 w-1.5 bg-pine" /> {a.stat}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

const PLANS = {
  featured: {
    name: "Studio",
    price: "79 €",
    per: "/mois · par poste",
    tag: "Le plus choisi",
    feats: [
      "Agents illimités, tâches illimitées",
      "Moteur 27B complet + modèles spécialisés",
      "Orchestration multi-agents & plannings",
      "Connecteurs : Drive local, Notion, CRM",
      "Support prioritaire sous 4 h",
    ],
  },
  side: [
    {
      name: "Solo",
      price: "29 €",
      per: "/mois",
      feats: ["1 agent au choix", "Tâches illimitées", "Moteur 27B quantifié", "Journal & annulations"],
    },
    {
      name: "Souverain",
      price: "Sur devis",
      per: "déploiement on-premise",
      feats: ["Parc complet + air-gap", "Audit de la chaîne de confiance", "Durcissement & SSO", "SLA contractualisé"],
    },
  ],
};

export function Pricing() {
  return (
    <section id="tarifs" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8">
      <SectionHead
        kicker="Tarifs"
        title={
          <>
            UN FORFAIT. <span className="text-pine">JAMAIS DE COMPTEUR.</span>
          </>
        }
        sub="Le mot « token » n'apparaît sur aucune de nos factures — c'est contractuel. Testez 14 jours, moteur installé chez vous, sans carte bancaire."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        {/* featured */}
        <Reveal>
          <article className="card-hover relative flex h-full flex-col overflow-hidden rounded-xl border border-ink bg-ink p-7 sm:p-9">
            <div className="absolute right-0 top-0 bg-lime px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
              {PLANS.featured.tag}
            </div>
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-lime">{PLANS.featured.name}</p>
            <p className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-6xl tracking-tight text-paper sm:text-7xl">{PLANS.featured.price}</span>
              <span className="font-mono text-[12.5px] text-mutdark">{PLANS.featured.per}</span>
            </p>
            <ul className="mt-7 flex-1 space-y-3.5">
              {PLANS.featured.feats.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-paper/85">
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-lime" /> {f}
                </li>
              ))}
            </ul>
            <a
              href="#installation"
              className="group mt-8 inline-flex items-center justify-center gap-3 rounded-lg bg-lime px-6 py-4 font-mono text-[13px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-limedark active:scale-[0.98]"
            >
              Essayer 14 jours — 0 token requis
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <p className="mt-3.5 text-center font-mono text-[11px] text-mutdark">
              <InfinityIcon className="mr-1 inline h-3.5 w-3.5" /> tâches illimitées · annulable en un clic
            </p>
          </article>
        </Reveal>

        {/* side plans */}
        <div className="flex flex-col gap-5">
          {PLANS.side.map((p, i) => (
            <Reveal key={p.name} delay={120 + i * 110} className="flex-1">
              <article className="card-hover flex h-full flex-col rounded-xl border border-line bg-card p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-pine">{p.name}</p>
                  <p className="text-right">
                    <span className="font-display text-4xl tracking-tight text-ink">{p.price}</span>
                    <span className="ml-2 font-mono text-[11px] text-mut">{p.per}</span>
                  </p>
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-mut">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-pine" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#installation"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink px-5 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-ink hover:text-lime active:scale-[0.98]"
                >
                  Commencer
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const FAQ = [
  {
    q: "« Sans token », c'est une figure de style ?",
    a: "Non, c'est l'architecture. Le moteur tourne en inférence locale sur votre machine : il n'existe aucun compteur d'usage à facturer. Votre forfait débloque des agents et des connecteurs, jamais des unités de calcul. C'est écrit dans le contrat : « aucune facturation à la consommation, quel que soit le volume ».",
  },
  {
    q: "Quelle machine faut-il vraiment ?",
    a: "Un Mac M1/M2/M3 avec 32 Go de mémoire unifiée est la configuration reine : 24 tokens/seconde, silence total. Sur PC, 18 Go de VRAM (RTX 4090/5080) donnent des résultats équivalents. Sans GPU, 64 Go de RAM suffisent en mode asynchrone — les agents travaillent en tâche de fond pendant que vous faites autre chose.",
  },
  {
    q: "Mes données restent-elles vraiment chez moi ?",
    a: "Oui, et c'est vérifiable. Mettez la machine en mode avion : tout continue de fonctionner. L'installateur coupe la télémétrie par défaut, le contexte est monté en mémoire locale, et le journal d'audit liste chaque octet lu et écrit — rien ne sort sans un connecteur que vous avez explicitement activé.",
  },
  {
    q: "Comment ça s'installe ?",
    a: "Une ligne de commande, environ 90 secondes. L'installateur télécharge les poids sur Hugging Face (dédupliqués si vous les avez déjà via xet), vérifie les empreintes sha256, charge le modèle en mémoire et ouvre l'interface. Mises à jour signées, jamais forcées.",
  },
  {
    q: "Et si je résilie ?",
    a: "Vous gardez tout. Vos journaux, vos livrables, vos réglages restent sur votre disque au format ouvert. Le moteur peut même continuer à servir en CLI libre — seul l'orchestrateur d'agents s'arrête. Aucun verrou, aucune donnée otage.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHead
          kicker="Questions honnêtes"
          title={
            <>
              CE QU'ON NOUS
              <br />
              <span className="text-pine">DEMANDE VRAIMENT.</span>
            </>
          }
          sub="Pas de jargon, pas de « ça dépend ». Si votre question n'y est pas, écrivez-nous : bonjour@autonome.sh — réponse humaine sous 24 h."
        />
        <div>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className={`border-b border-line ${i === 0 ? "border-t" : ""}`}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-[17px] font-semibold transition-colors sm:text-lg ${isOpen ? "text-pine" : "text-ink group-hover:text-pinedeep"}`}>
                      {f.q}
                    </span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isOpen ? "rotate-45 border-pine bg-pine text-paper" : "border-line text-mut group-hover:border-ink group-hover:text-ink"
                      }`}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </span>
                  </button>
                  <div className={`acc-panel ${isOpen ? "open" : ""}`}>
                    <div>
                      <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-mut">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- final CTA ---------------- */

const INSTALL_CMD = "curl -sSL https://get.autonome.sh | bash";

export function FinalCta({
  onOpenInstall,
  detectedOs,
}: {
  onOpenInstall: (os?: OS) => void;
  detectedOs: OS;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(INSTALL_CMD).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const systems: { os: OS; icon: typeof AppleIcon; name: string; how: string; detail: string }[] = [
    {
      os: "mac",
      icon: AppleIcon,
      name: "macOS",
      how: "Dock & Launchpad",
      detail: "Chrome, Edge, Brave ou Safari (Sonoma+) — fenêtre native, Spotlight compatible.",
    },
    {
      os: "windows",
      icon: WindowsIcon,
      name: "Windows",
      how: "Menu Démarrer",
      detail: "Edge, Chrome ou Brave — raccourci automatique, épinglable en barre des tâches.",
    },
    {
      os: "linux",
      icon: LinuxIcon,
      name: "Linux",
      how: "Lanceur ou démon",
      detail: "GNOME, KDE, i3… entrée .desktop générée, ou service systemd user via le terminal.",
    },
  ];

  return (
    <section id="installation" className="relative scroll-mt-24 overflow-hidden bg-ink py-24">
      <div className="bg-griddark pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-lime/10 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="flex items-center justify-center gap-2.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.22em] text-lime">
            <DownloadIcon className="h-4 w-4" /> Installation · macOS · Windows · Linux
          </p>
          <h2 className="mx-auto mt-6 max-w-5xl font-display text-5xl leading-[0.92] tracking-tight text-paper sm:text-7xl lg:text-8xl">
            UNE APP. <span className="text-lime">TROIS SYSTÈMES.</span> ZÉRO TOKEN.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-mutdark">
            Autonome s'installe comme une application native — pas un onglet de plus. Après la première ouverture, le
            service worker garde tout disponible <strong className="text-paper">hors-ligne</strong>, pour toujours.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {systems.map((s, i) => {
            const Icon = s.icon;
            const detected = s.os === detectedOs;
            return (
              <Reveal key={s.os} delay={i * 110} className={i === 1 ? "lg:-translate-y-3" : ""}>
                <article className="card-hover group flex h-full flex-col rounded-xl border border-linedark bg-ink2/60 p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-lime text-ink transition-transform group-hover:-rotate-6 group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </span>
                    {detected && (
                      <span className="flex items-center gap-2 rounded-full border border-pine/50 bg-pine/15 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-lime">
                        <span className="anim-pulsedot h-1.5 w-1.5 rounded-full bg-lime" /> détecté
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-3xl tracking-tight text-paper">{s.name}</h3>
                  <p className="mt-1 font-mono text-[11.5px] uppercase tracking-wider text-lime">{s.how}</p>
                  <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-mutdark">{s.detail}</p>
                  <button
                    onClick={() => onOpenInstall(s.os)}
                    className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border-2 border-lime px-5 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-lime transition-all hover:bg-lime hover:text-ink active:scale-[0.98]"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Installer sur {s.name}
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mx-auto mt-14 max-w-3xl">
            <p className="flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-mutdark">
              <span className="h-px w-12 bg-linedark" /> ou par le terminal, moteur complet <span className="h-px w-12 bg-linedark" />
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-linedark bg-ink2/80 px-4 py-3.5 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] sm:px-5">
              <span className="font-mono text-lime">$</span>
              <code className="min-w-0 flex-1 truncate font-mono text-[13.5px] text-paper sm:text-[15px]">{INSTALL_CMD}</code>
              <button
                onClick={copy}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  copied ? "bg-pine text-paper" : "bg-lime text-ink hover:bg-limedark"
                }`}
              >
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                {copied ? "copié" : "copier"}
              </button>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 font-mono text-[12px] text-mutdark">
              <span className="flex items-center gap-2"><HouseIcon className="h-4 w-4 text-lime" /> 100 % local</span>
              <span className="flex items-center gap-2"><PlaneIcon className="h-4 w-4 text-lime" /> mode avion ok</span>
              <span className="flex items-center gap-2"><EuroIcon className="h-4 w-4 text-lime" /> 0 € de token</span>
              <span className="flex items-center gap-2"><PlugIcon className="h-4 w-4 text-lime" /> mise à jour auto</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper2/60">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <p className="flex items-center gap-2.5 font-display text-2xl tracking-tight text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-lime">
                <PlugIcon className="h-5 w-5" />
              </span>
              AUTONOME
            </p>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-mut">
              L'orchestrateur d'agents IA qui tourne chez vous, sur Qwen3.8-27B « Obliterated ». Aucun token, aucun cloud, aucune surprise.
            </p>
            <p className="mt-5 flex items-center gap-2 font-mono text-[11.5px] text-mut">
              <span className="anim-pulsedot h-2 w-2 rounded-full bg-pine" /> tous les systèmes locaux · v0.9.4
            </p>
          </div>
          {[
            {
              t: "Produit",
              l: [
                ["La console", "#produit"],
                ["Le moteur", "#moteur"],
                ["Les agents", "#agents"],
                ["Tarifs", "#tarifs"],
              ],
            },
            {
              t: "Ressources",
              l: [
                ["Guide d'installation", "#installation"],
                ["Simulateur de coûts", "#couts"],
                ["Benchmark FR-Eval", "#moteur"],
                ["FAQ", "#faq"],
              ],
            },
            {
              t: "Légal",
              l: [
                ["Contrat « zéro token »", "#tarifs"],
                ["Confidentialité", "#faq"],
                ["Résiliation", "#faq"],
                ["Mentions", "#faq"],
              ],
            },
          ].map((col) => (
            <nav key={col.t}>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-mut">{col.t}</p>
              <ul className="mt-4 space-y-2.5">
                {col.l.map(([item, href]) => (
                  <li key={item}>
                    <a href={href} className="text-[14px] text-ink2 transition-colors hover:text-pine">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-mut">Écosystème & présence</p>
            <ul className="mt-4 space-y-2.5">
              {[
                ["Modèle sur Hugging Face", "https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED"],
                ["Qwen (GitHub)", "https://github.com/QwenLM/Qwen3"],
                ["llama.cpp", "https://github.com/ggml-org/llama.cpp"],
                ["PWA — doc MDN", "https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps"],
                ["r/LocalLLaMA", "https://www.reddit.com/r/LocalLLaMA/"],
                ["Flux RSS", "/feed.xml"],
              ].map(([item, href]) => (
                <li key={item}>
                  <a
                    href={href}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-[14px] text-ink2 transition-colors hover:text-pine"
                  >
                    {item} ↗
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* maillage externe : nous trouver hors Google */}
        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          <span className="mr-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-mut">
            Nous trouver — sans Google :
          </span>
          {[
            ["DuckDuckGo", "https://duckduckgo.com/?q=autonome+ia+locale+sans+token"],
            ["Brave", "https://search.brave.com/search?q=autonome+ia+locale+qwen"],
            ["Bing", "https://www.bing.com/search?q=autonome+ia+locale+sans+token"],
            ["Qwant", "https://www.qwant.com/?q=autonome%20ia%20locale"],
            ["Ecosia", "https://www.ecosia.org/search?q=autonome+ia+locale"],
            ["Perplexity", "https://www.perplexity.ai/search?q=Autonome%20IA%20locale%20sans%20token"],
            ["RSS", "/feed.xml"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink2 transition-all hover:border-pine hover:bg-pine hover:text-paper"
            >
              {label} ↗
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-mono text-[11.5px] text-mut">
          <span>© 2026 Autonome SAS — fait en France, inféré chez vous.</span>
          <span className="flex items-center gap-2">
            <LockIcon className="h-3.5 w-3.5" /> 0 requête Google sur cette page — polices auto-hébergées
          </span>
        </div>
      </div>
    </footer>
  );
}
