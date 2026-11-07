import { useCallback, useEffect, useState } from "react";

export type OS = "mac" | "windows" | "linux";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/* ------------------------------------------------------------------ */
/* Capture au niveau module : on ne rate jamais l'invite, même si le   */
/* composant monte après le tir de l'événement.                        */
/* ------------------------------------------------------------------ */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let wasInstalled = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    wasInstalled = true;
    deferredPrompt = null;
    notify();
  });
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function detectOS(): OS {
  if (typeof navigator === "undefined") return "linux";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Macintosh|Mac OS X/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "windows";
  return "linux";
}

export function osLabel(os: OS): string {
  if (os === "mac") return "macOS";
  if (os === "windows") return "Windows";
  return "Linux";
}

export type PromptState = "available" | "installed" | "unavailable";

export function useInstall() {
  const [, force] = useState(0);
  const [installed, setInstalled] = useState<boolean>(() => detectStandalone() || wasInstalled);

  useEffect(() => {
    const sync = () => {
      force((n) => n + 1);
      setInstalled(detectStandalone() || wasInstalled);
    };
    listeners.add(sync);
    sync();
    const mq = window.matchMedia("(display-mode: standalone)");
    const onMq = () => setInstalled(detectStandalone() || wasInstalled);
    mq.addEventListener?.("change", onMq);
    return () => {
      listeners.delete(sync);
      mq.removeEventListener?.("change", onMq);
    };
  }, []);

  const canPrompt = deferredPrompt !== null;

  /** Déclenche l'invite native du navigateur. Renvoie true si l'utilisateur accepte. */
  const requestInstall = useCallback(async (): Promise<boolean> => {
    const evt = deferredPrompt;
    if (!evt) return false;
    await evt.prompt();
    const choice = await evt.userChoice;
    deferredPrompt = null;
    notify();
    return choice.outcome === "accepted";
  }, []);

  const state: PromptState = installed ? "installed" : canPrompt ? "available" : "unavailable";

  return {
    canPrompt,
    installed,
    state,
    requestInstall,
    os: detectOS(),
  };
}
