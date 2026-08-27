import { useEffect, useState } from "react";
import Console from "./components/Console";
import {
  Agents,
  CostCalc,
  Engine,
  Faq,
  FinalCta,
  Footer,
  LiveStats,
  Marquee,
  Pricing,
  Proof,
} from "./components/Sections";
import { ArrowIcon, ChipIcon, PlugIcon } from "./components/icons";

const WORDS = ["SANS TOKEN.", "SANS API KEY.", "SANS CLOUD.", "SANS FACTURE."];

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2300);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block bg-lime px-2 leading-[1.05] text-ink sm:px-3">
      <span key={i} className="anim-wordin inline-block">
        {WORDS[i]}
      </span>
    </span>
  );
}

function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? "border-line bg-paper/90 shadow-[0_8px_30px_-18px_rgba(11,19,14,0.3)] backdrop-blur-md" : "border-transparent bg-paper/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3.5 sm:px-8">
        <a href="#produit" className="flex items-center gap-2.5 font-display text-xl tracking-tight text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-lime transition-transform hover:-rotate-6">
            <PlugIcon className="h-4.5 w-4.5" />
          </span>
          AUTONOME
        </a>
        <nav className="ml-auto hidden items-center gap-6 font-mono text-[12px] font-bold uppercase tracking-wider text-ink2 lg:flex">
          {[
            ["Console", "#produit"],
            ["Coûts", "#couts"],
            ["Moteur", "#moteur"],
            ["Agents", "#agents"],
            ["Tarifs", "#tarifs"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="relative py-1 transition-colors hover:text-pine after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-pine after:transition-all hover:after:w-full">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <span className="hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] text-mut md:flex">
            <span className="anim-pulsedot h-2 w-2 rounded-full bg-pine" />
            0 token utilisé
          </span>
          <a
            href="#installation"
            className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-wider text-lime transition-all hover:bg-pinedeep hover:text-paper active:scale-95"
          >
            Installer
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-24 lg:pt-20">
        {/* left — the pitch */}
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 font-mono text-[11.5px] font-bold uppercase tracking-wider text-pinedeep">
            <ChipIcon className="h-4 w-4" />
            Moteur Qwen3.8-27B chargé en mémoire · prêt
          </p>
          <h1 className="mt-7 font-display text-[2.9rem] leading-[0.94] tracking-tight text-ink sm:text-7xl lg:text-[5.2rem]">
            L'IA QUI
            <br />
            BOSSE SEULE,
            <br />
            CHEZ VOUS.
            <br />
            <span className="mt-2 inline-block">
              <RotatingWord />
            </span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-mut">
            Autonome orchestre des agents IA qui <strong className="text-ink">raisonnent, exécutent et livrent</strong> sur
            votre propre machine. Pas de clé API à coller, pas de compteur qui tourne, pas de données qui partent —
            le forfait est fixe, l'usage est illimité.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#installation"
              className="group inline-flex items-center gap-3 rounded-lg bg-ink px-7 py-4 font-mono text-[13px] font-bold uppercase tracking-wider text-lime shadow-[6px_6px_0_0_var(--color-lime)] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--color-lime)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-lime)]"
            >
              Installer la démo
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#moteur"
              className="inline-flex items-center gap-2.5 rounded-lg border-2 border-ink px-6 py-[14px] font-mono text-[13px] font-bold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Voir le moteur
            </a>
          </div>
          <p className="mt-8 font-mono text-[11.5px] uppercase tracking-wider text-mut">
            qwen3.8-27b · q4_k_m · 16,9 Go · macos — linux — wsl
          </p>
        </div>

        {/* right — the product, live */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-2xl bg-ink/5" aria-hidden />
          <Console />
          <p className="mt-4 text-center font-mono text-[11.5px] text-mut">
            ↑ c'est le vrai produit : lancez une tâche, tout s'exécute « localement » — compteur de tokens : 0, pour toujours.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen">
      {/* ambient layers */}
      <div className="bg-gridlight pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-[-180px] h-[560px] w-[560px] rounded-full bg-pine/12 blur-[150px]" aria-hidden />
      <div className="pointer-events-none absolute left-[-220px] top-[42%] h-[480px] w-[480px] rounded-full bg-lime/20 blur-[150px]" aria-hidden />

      <div className="relative">
        <TopBar />
        <main>
          <Hero />
          <Marquee />
          <LiveStats />
          <CostCalc />
          <Proof />
          <Engine />
          <Agents />
          <Pricing />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </div>
  );
}
