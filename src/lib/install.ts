import { useCallback, useEffect, useState } from "react";

export type OS = "mac" | "windows" | "linux";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function detectOS(): OS {
  if (typeof navigator === "undefined") return "linux";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "mac";
  if (/Macintosh|Mac OS X/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "windows";
  return "linux";
}

export function osLabel(os: OS): string {
  if (os === "mac") return "macOS";
  if (os === "windows") return "Windows";
  return "Linux";
}

export function useInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    const nav = navigator as Navigator & { standalone?: boolean };
    return nav.standalone === true;
  });

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // On capture l'invite : l'app choisit quand la déclencher (bouton, pas popup sauvage).
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    const mq = window.matchMedia("(display-mode: standalone)");
    const onMq = (e: MediaQueryListEvent) => setInstalled(e.matches);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    mq.addEventListener?.("change", onMq);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener?.("change", onMq);
    };
  }, []);

  /** Déclenche l'invite native du navigateur. Renvoie true si l'utilisateur accepte. */
  const requestInstall = useCallback(async (): Promise<boolean> => {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome === "accepted";
  }, [deferred]);

  return {
    canPrompt: deferred !== null,
    installed,
    requestInstall,
    os: detectOS(),
  };
}
