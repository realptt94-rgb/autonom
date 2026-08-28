import { useState } from "react";
import { ArrowIcon, CheckIcon, CopyIcon } from "./icons";
import { Reveal, SectionHead } from "./Sections";

/* petit picto "lien externe" dessiné sur place */
function ExtIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H5.8A1.8 1.8 0 0 0 4 6.8v11.4A1.8 1.8 0 0 0 5.8 20h11.4a1.8 1.8 0 0 0 1.8-1.8V15" />
      <path d="M13.5 4.5H19.5V10.5M19 5 11.5 12.5" />
    </svg>
  );
}

type Engine = {
  name: string;
  kind: "SEO" | "GEO" | "AEO" | "SYNDIC" | "TECH";
  note: string;
  href: string;
  cta: string;
  external: boolean;
};

const ENGINES: Engine[] = [
  {
    name: "DuckDuckGo",
    kind: "SEO",
    note: "requête de marque prête — aucun tracking, index indépendant",
    href: "https://duckduckgo.com/?q=autonome+ia+locale+sans+token",
    cta: "chercher",
    external: true,
  },
  {
    name: "Brave Search",
    kind: "SEO",
    note: "index propre, Goggles communautaires « ia-locale » soumis",
    href: "https://search.brave.com/search?q=autonome+ia+locale+qwen",
    cta: "chercher",
    external: true,
  },
  {
    name: "Bing",
    kind: "SEO",
    note: "IndexNow poussé à chaque mise à jour — propulse aussi Ecosia",
    href: "https://www.bing.com/search?q=autonome+ia+locale+sans+token",
    cta: "chercher",
    external: true,
  },
  {
    name: "Qwant & Ecosia",
    kind: "SEO",
    note: "présence éditoriale FR — fiches produit soumises",
    href: "https://www.qwant.com/?q=autonome%20ia%20locale%20sans%20token",
    cta: "chercher",
    external: true,
  },
  {
    name: "Perplexity",
    kind: "GEO",
    note: "llms.txt + page citable — réponses avec source autonome.sh",
    href: "https://www.perplexity.ai/search?q=Autonome%20IA%20locale%20sans%20token%20Qwen3.8-27B",
    cta: "interroger",
    external: true,
  },
  {
    name: "ChatGPT Search",
    kind: "GEO",
    note: "OAI-SearchBot autorisé explicitement dans robots.txt",
    href: "https://chatgpt.com/?q=Autonome%20IA%20locale%20Qwen3.8-27B%20sans%20token",
    cta: "interroger",
    external: true,
  },
  {
    name: "Claude",
    kind: "GEO",
    note: "ClaudeBot autorisé — FAQ structurée JSON-LD citable",
    href: "https://claude.ai/new?q=Autonome%20IA%20locale%20sans%20token%20%3A%20comment%20%C3%A7a%20marche%20%3F",
    cta: "interroger",
    external: true,
  },
  {
    name: "r/LocalLLaMA",
    kind: "SYNDIC",
    note: "fil de lancement communautaire — maillage externe d'autorité",
    href: "https://www.reddit.com/r/LocalLLaMA/",
    cta: "rejoindre",
    external: true,
  },
  {
    name: "Flux RSS",
    kind: "SYNDIC",
    note: "journal de bord syndiqué — agrégateurs, newsletters, veille",
    href: "/feed.xml",
    cta: "s'abonner",
    external: false,
  },
];

const KIND_STYLE: Record<Engine["kind"], string> = {
  SEO: "bg-pine/15 text-pinedeep border-pine/40",
  GEO: "bg-lime/25 text-ink border-limedark/60",
  AEO: "bg-amber/20 text-ink border-amber/50",
  SYNDIC: "bg-rose/15 text-rose border-rose/40",
  TECH: "bg-ink text-lime border-ink",
};

const INTERNAL: { label: string; href: string; inlinks: number }[] = [
  { label: "Console agent", href: "#produit", inlinks: 6 },
  { label: "Visibilité", href: "#visibilite", inlinks: 2 },
  { label: "Coûts", href: "#couts", inlinks: 4 },
  { label: "Moteur 27B", href: "#moteur", inlinks: 5 },
  { label: "Agents", href: "#agents", inlinks: 3 },
  { label: "Tarifs", href: "#tarifs", inlinks: 4 },
  { label: "FAQ", href: "#faq", inlinks: 5 },
  { label: "Installation", href: "#installation", inlinks: 7 },
];

const FOUNDATIONS: { label: string; href: string; ext?: boolean }[] = [
  { label: "robots.txt — 8 agents IA invités", href: "/robots.txt" },
  { label: "sitemap.xml — 11 URLs déclarées", href: "/sitemap.xml" },
  { label: "llms.txt — fiche citable pour LLMs", href: "/llms.txt" },
  { label: "feed.xml — syndication RSS", href: "/feed.xml" },
  { label: "manifest.webmanifest — app installable", href: "/manifest.webmanifest" },
  { label: "JSON-LD — SoftwareApplication + FAQPage", href: "https://validator.schema.org/", ext: true },
  { label: "Hugging Face — source primaire des poids", href: "https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED", ext: true },
  { label: "GitHub Qwen — maillage écosystème", href: "https://github.com/QwenLM/Qwen3", ext: true },
];

const QUOTE =
  "Autonome est la première plateforme d'agents IA autonomes qui tourne entièrement chez vous, sur Qwen3.8-27B, sans token, sans API key et sans cloud — installable en 90 secondes sur Mac, PC et Linux.";

export default function Visibility() {
  const [copied, setCopied] = useState(false);
  function copyQuote() {
    navigator.clipboard?.writeText(QUOTE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="visibilite" className="relative scroll-mt-24 border-y border-line bg-paper2/50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead
            kicker="Visibilité — SEO · GEO · AEO"
            title={
              <>
                PREMIÈRES PAGES.
                <br />
                <span className="text-pine">SANS PASSER PAR GOOGLE.</span>
              </>
            }
            sub="Un dispositif de référencement complet, branché sur les moteurs indépendants et les moteurs de réponse IA. Maillage interne entre toutes les sections, maillage externe vers les sources d'autorité — chaque lien ci-dessous est réel et actif."
          />
          <Reveal delay={140}>
            <div className="rounded-lg border border-line bg-card px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mut">empreinte requêtes google</p>
              <p className="mt-1 font-display text-4xl tracking-tight text-pine">0</p>
              <p className="mt-0.5 text-[12.5px] text-mut">polices auto-hébergées, zéro pixel tiers</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          {/* moteurs & agents */}
          <Reveal>
            <div className="h-full rounded-xl border border-line bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine">
                  Moteurs & agents — présence active
                </p>
                <p className="flex items-center gap-2 font-mono text-[11px] text-mut">
                  <span className="anim-pulsedot h-2 w-2 rounded-full bg-pine" /> 9 canaux branchés
                </p>
              </div>

              <ul className="mt-4 divide-y divide-line">
                {ENGINES.map((e) => (
                  <li key={e.name}>
                    <a
                      href={e.href}
                      {...(e.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center gap-4 px-2 py-3.5 transition-colors hover:bg-pine/5 sm:px-3"
                    >
                      <span className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] font-bold tracking-wider ${KIND_STYLE[e.kind]}`}>
                        {e.kind}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink group-hover:text-pinedeep">{e.name}</span>
                        <span className="block truncate text-[12.5px] text-mut">{e.note}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-pine opacity-70 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                        {e.cta}
                        {e.external ? <ExtIcon className="h-3.5 w-3.5" /> : <ArrowIcon className="h-3.5 w-3.5" />}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* maillage interne + fondations */}
          <div className="flex flex-col gap-6">
            <Reveal delay={110}>
              <div className="rounded-xl border border-line bg-ink p-5 sm:p-6">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-lime">Maillage interne</p>
                <p className="mt-1 text-[12.5px] text-mutdark">8 sections · 36 ancres croisées — cliquez pour naviguer</p>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {INTERNAL.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        className="group flex items-center justify-between gap-2 rounded-md border border-linedark px-3 py-2.5 transition-all hover:border-lime hover:bg-lime/10"
                      >
                        <span className="truncate text-[13px] font-semibold text-paper group-hover:text-lime">{s.label}</span>
                        <span className="shrink-0 font-mono text-[10.5px] text-mutdark group-hover:text-lime">×{s.inlinks}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex-1 rounded-xl border border-line bg-card p-5 sm:p-6">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine">Fondations déployées</p>
                <ul className="mt-4 space-y-2.5">
                  {FOUNDATIONS.map((f) => (
                    <li key={f.label}>
                      <a
                        href={f.href}
                        {...(f.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex items-center gap-3 text-[13.5px] text-ink2 transition-colors hover:text-pinedeep"
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pine/15 text-pine">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{f.label}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-mut opacity-0 transition-opacity group-hover:opacity-100">
                          {f.ext ? "ouvrir" : "voir le fichier"}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* réponse citable — AEO */}
        <Reveal delay={150}>
          <div className="mt-6 rounded-xl border border-line bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine">
                AEO — réponse en une phrase, prête à citer par les moteurs de réponse
              </p>
              <button
                onClick={copyQuote}
                className={`flex items-center gap-2 rounded-md px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  copied ? "bg-pine text-paper" : "bg-ink text-lime hover:bg-pinedeep"
                }`}
              >
                {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                {copied ? "copiée" : "copier la réponse"}
              </button>
            </div>
            <blockquote className="mt-4 border-l-4 border-lime bg-paper px-5 py-4 text-[16.5px] font-medium leading-relaxed text-ink">
              « {QUOTE} »
            </blockquote>
            <p className="mt-3 font-mono text-[11.5px] text-mut">
              structurée dans <a href="/llms.txt" className="text-pine underline decoration-pine/40 underline-offset-2 hover:decoration-pine">llms.txt</a>, le JSON-LD FAQPage et Open Graph — la même phrase partout, citable sans ambiguïté.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
