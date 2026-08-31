import { useEffect, useState } from "react";
import { osLabel, type OS, type PromptState } from "../lib/install";
import { AppleIcon, CheckIcon, CloseIcon, CopyIcon, DownloadIcon, LinuxIcon, PlaneIcon, WindowsIcon } from "./icons";

const STATE_LINE: Record<PromptState, { cls: string; text: string }> = {
  available: {
    cls: "border-pine/40 bg-pine/10 text-pine",
    text: "Invite native détectée — l'installation en 1 clic est prête ci-dessous.",
  },
  installed: {
    cls: "border-lime/40 bg-lime/10 text-lime",
    text: "Autonome tourne déjà en application sur cette machine.",
  },
  unavailable: {
    cls: "border-linedark bg-ink2/60 text-mutdark",
    text: "Invite native non disponible ici — suivez le guide de votre système ci-dessous, c'est 30 secondes.",
  },
};

const INSTALL_CMD = "curl -sSL https://get.autonome.sh | bash";

type Guide = {
  os: OS;
  icon: typeof AppleIcon;
  channels: { browser: string; steps: string[] }[];
  note: string;
};

const GUIDES: Guide[] = [
  {
    os: "mac",
    icon: AppleIcon,
    channels: [
      {
        browser: "Chrome · Edge · Brave",
        steps: [
          "Ouvrez autonome.sh, puis cliquez sur l'icône d'installation à droite de la barre d'adresse.",
          "Ou menu ⋮ → « Installer Autonome… ».",
          "Confirmez : l'app apparaît dans le Dock et le Launchpad, avec sa propre fenêtre.",
        ],
      },
      {
        browser: "Safari (macOS Sonoma et +)",
        steps: [
          "Menu Fichier → « Ajouter au Dock… ».",
          "Nommez-la « Autonome », validez.",
          "Fenêtre autonome, plein écran natif, et hors-ligne après la première ouverture.",
        ],
      },
    ],
    note: "Mise à jour automatique au prochain lancement — aucun token d'App Store requis.",
  },
  {
    os: "windows",
    icon: WindowsIcon,
    channels: [
      {
        browser: "Microsoft Edge · Chrome · Brave",
        steps: [
          "Ouvrez autonome.sh, puis cliquez sur « Installer cette application » dans la barre d'adresse.",
          "Ou menu ⋮ → Applications → « Installer Autonome ».",
          "Raccourci dans le menu Démarrer, épinglage possible dans la barre des tâches.",
        ],
      },
    ],
    note: "L'app s'exécute dans sa propre fenêtre, démarre avec Windows si vous le souhaitez, et fonctionne hors-ligne.",
  },
  {
    os: "linux",
    icon: LinuxIcon,
    channels: [
      {
        browser: "Chrome · Chromium · Brave",
        steps: [
          "Menu ⋮ → « Enregistrer et partager » → « Installer la page en tant qu'application ».",
          "Confirmez : entrée créée dans le menu des applications de votre environnement.",
        ],
      },
      {
        browser: "Firefox (127 et +)",
        steps: [
          "Cliquez sur l'icône d'installation dans la barre d'URL.",
          "Validez « Installer » — l'app apparaît dans votre lanceur.",
        ],
      },
      {
        browser: "Terminal (moteur complet + démon)",
        steps: [
          INSTALL_CMD,
          "systemctl --user enable --now autonome",
          "Le démon démarre avec votre session. Air-gap total, zéro token.",
        ],
      },
    ],
    note: "Paquets .desktop générés automatiquement ; fonctionne sur GNOME, KDE et environnements minimalistes.",
  },
];

function CopyCmd({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
        copied ? "bg-pine text-paper" : "bg-linedark text-lime hover:bg-pine/40"
      }`}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? "copié" : "copier"}
    </button>
  );
}

export default function InstallModal({
  open,
  initialOs,
  detectedOs,
  canPrompt,
  state,
  onRequestNative,
  onClose,
}: {
  open: boolean;
  initialOs: OS;
  detectedOs: OS;
  canPrompt: boolean;
  state: PromptState;
  onRequestNative: () => void;
  onClose: () => void;
}) {
  const [os, setOs] = useState<OS>(initialOs);

  useEffect(() => {
    if (open) setOs(initialOs);
  }, [open, initialOs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const guide = GUIDES.find((g) => g.os === os) ?? GUIDES[2];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Installer Autonome"
    >
      <div
        className="anim-fadeup relative max-h-[92vh] w-full max-w-2xl overflow-y-auto scroll-slim rounded-t-2xl border border-linedark bg-ink shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7)] sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-linedark bg-ink px-6 py-5 sm:px-7">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-lime text-ink">
            <DownloadIcon className="h-5.5 w-5.5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl tracking-tight text-paper">INSTALLER AUTONOME</h3>
            <p className="font-mono text-[11px] uppercase tracking-wider text-mutdark">
              système détecté : <span className="text-lime">{osLabel(detectedOs)}</span> · 100 % local · hors-ligne ok
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-linedark text-mutdark transition-colors hover:border-rose hover:text-rose"
            aria-label="Fermer"
          >
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="px-6 py-6 sm:px-7">
          {/* état de l'installation */}
          <p className={`mb-5 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[13px] leading-relaxed ${STATE_LINE[state].cls}`}>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${state === "available" ? "bg-pine anim-pulsedot" : state === "installed" ? "bg-lime" : "bg-mutdark"}`} />
            {STATE_LINE[state].text}
          </p>

          {/* native prompt shortcut */}
          {canPrompt && (
            <button
              onClick={onRequestNative}
              className="group mb-6 flex w-full items-center justify-between gap-4 rounded-lg bg-lime px-5 py-4 text-left transition-all hover:bg-limedark active:scale-[0.99]"
            >
              <span>
                <span className="block font-display text-xl tracking-tight text-ink">INSTALLATION EN 1 CLIC</span>
                <span className="font-mono text-[11.5px] text-ink/70">votre navigateur peut l'installer maintenant, sans quitter cette page</span>
              </span>
              <DownloadIcon className="h-6 w-6 shrink-0 text-ink transition-transform group-hover:translate-y-0.5" />
            </button>
          )}

          {/* OS tabs */}
          <div className="grid grid-cols-3 gap-2">
            {GUIDES.map((g) => {
              const active = g.os === os;
              const Icon = g.icon;
              return (
                <button
                  key={g.os}
                  onClick={() => setOs(g.os)}
                  className={`flex items-center justify-center gap-2.5 rounded-lg border px-3 py-3 font-mono text-[12.5px] font-bold uppercase tracking-wider transition-all ${
                    active
                      ? "border-lime bg-lime text-ink shadow-[4px_4px_0_0_rgba(198,242,78,0.25)]"
                      : "border-linedark text-mutdark hover:border-mutdark hover:text-paper"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {osLabel(g.os)}
                  {g.os === detectedOs && (
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-ink" : "bg-pine anim-pulsedot"}`} title="votre système" />
                  )}
                </button>
              );
            })}
          </div>

          {/* steps per channel */}
          <div className="mt-6 space-y-5">
            {guide.channels.map((ch) => (
              <div key={ch.browser} className="rounded-lg border border-linedark bg-ink2/60 p-5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lime">{ch.browser}</p>
                <ol className="mt-3.5 space-y-3">
                  {ch.steps.map((s, i) => {
                    const isCmd = s.includes("curl") || s.includes("systemctl");
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-linedark font-mono text-[11px] font-bold text-lime">
                          {i + 1}
                        </span>
                        {isCmd ? (
                          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5 rounded-md border border-linedark bg-ink px-3.5 py-2.5 font-mono text-[12.5px] text-paper">
                            <span className="text-lime">$</span>
                            <code className="min-w-0 flex-1 break-all">{s}</code>
                            <CopyCmd cmd={s} />
                          </span>
                        ) : (
                          <span className="text-[14.5px] leading-relaxed text-paper/85">{s}</span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-lg border border-pine/35 bg-pine/10 px-4 py-3 text-[13.5px] leading-relaxed text-paper/80">
            {guide.note}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-linedark pt-5 font-mono text-[11px] uppercase tracking-wider text-mutdark">
            <span className="flex items-center gap-2">
              <PlaneIcon className="h-4 w-4 text-lime" /> fonctionne en mode avion
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-lime" /> aucune API key requise
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-lime" /> désinstallable sans trace
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
