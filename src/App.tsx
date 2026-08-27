import { useEffect, useRef, useState } from "react";
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
import { AppleIcon, ArrowIcon, CheckIcon, ChipIcon, DownloadIcon, LinuxIcon, PlugIcon, WindowsIcon } from "./components/icons";
import InstallModal from "./components/InstallModal";
import { useInstall, type OS } from "./lib/install";

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

function TopBar({ installed, onInstall }: { installed: boolean; onInstall: () => void }) {
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
          <button
            onClick={onInstall}
            className={`flex items-center gap-2 rounded-md px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
              installed ? "cursor-default bg-pine text-paper" : "bg-ink text-lime hover:bg-pinedeep hover:text-paper"
            }`}
          >
            {installed ? <CheckIcon className="h-3.5 w-3.5" /> : <DownloadIcon className="h-3.5 w-3.5" />}
            {installed ? "Installée" : "Installer l'app"}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ installed, onInstall }: { installed: boolean; onInstall: () => void }) {
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
            <button
              onClick={onInstall}
              className="group inline-flex items-center gap-3 rounded-lg bg-ink px-7 py-4 font-mono text-[13px] font-bold uppercase tracking-wider text-lime shadow-[6px_6px_0_0_var(--color-lime)] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--color-lime)] active:translate-y-0 active:shadow-[3px_3px_0_0_var(--color-lime)]"
            >
              {installed ? <CheckIcon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />}
              {installed ? "App installée — ouvrez-la" : "Installer l'application"}
            </button>
            <a
              href="#moteur"
              className="inline-flex items-center gap-2.5 rounded-lg border-2 border-ink px-6 py-[14px] font-mono text-[13px] font-bold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Voir le moteur
            </a>
          </div>
          <p className="mt-8 font-mono text-[11.5px] uppercase tracking-wider text-mut">
            qwen3.8-27b · q4_k_m · 16,9 Go
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] text-mut">
            <span className="flex items-center gap-2"><AppleIcon className="h-4 w-4 text-ink" /> macOS</span>
            <span className="flex items-center gap-2"><WindowsIcon className="h-4 w-4 text-ink" /> Windows</span>
            <span className="flex items-center gap-2"><LinuxIcon className="h-4 w-4 text-ink" /> Linux</span>
            <span className="rounded-full bg-pine/15 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-pinedeep">installable en 1 clic</span>
          </div>
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
  const { canPrompt, installed, requestInstall, os } = useInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideOs, setGuideOs] = useState<OS>(os);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }

  const openGuide = (o?: OS) => {
    setGuideOs(o ?? os);
    setGuideOpen(true);
  };

  const handleInstall = async () => {
    if (installed) {
      showToast("Autonome tourne déjà en application sur cette machine.");
      return;
    }
    if (canPrompt) {
      const ok = await requestInstall();
      showToast(
        ok
          ? "Autonome est installée — ouvrez-la depuis votre Dock ou menu Démarrer."
          : "Aucun souci : le guide d'installation reste disponible à tout moment."
      );
      return;
    }
    openGuide();
  };

  const handleNativeFromModal = async () => {
    const ok = await requestInstall();
    if (ok) {
      setGuideOpen(false);
      showToast("Autonome est installée — recherchez-la dans vos applications.");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* ambient layers */}
      <div className="bg-gridlight pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-[-180px] h-[560px] w-[560px] rounded-full bg-pine/12 blur-[150px]" aria-hidden />
      <div className="pointer-events-none absolute left-[-220px] top-[42%] h-[480px] w-[480px] rounded-full bg-lime/20 blur-[150px]" aria-hidden />

      <div className="relative">
        <TopBar installed={installed} onInstall={handleInstall} />
        <main>
          <Hero installed={installed} onInstall={handleInstall} />
          <Marquee />
          <LiveStats />
          <CostCalc />
          <Proof />
          <Engine />
          <Agents />
          <Pricing />
          <Faq />
          <FinalCta onOpenInstall={openGuide} detectedOs={os} />
        </main>
        <Footer />
      </div>

      <InstallModal
        open={guideOpen}
        initialOs={guideOs}
        detectedOs={os}
        canPrompt={canPrompt}
        onRequestNative={handleNativeFromModal}
        onClose={() => setGuideOpen(false)}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] w-max max-w-[92vw] -translate-x-1/2 px-4">
          <div key={toast} className="anim-fadeup flex items-center gap-3 rounded-lg border border-linedark bg-ink px-5 py-3.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime text-ink">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[13.5px] text-paper">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
