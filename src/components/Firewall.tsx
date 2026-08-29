import { useEffect, useRef, useState } from "react";
import { Reveal, SectionHead } from "./Sections";
import { CheckIcon, LockIcon, PlaneIcon, RadarIcon, StopIcon } from "./icons";

/* ------------------------------------------------------------------ */
/* Pare-feu cognitif : masque les clés API et les IP sortantes,         */
/* journalise le DNS et les ports. Le masquage est appliqué au rendu :  */
/* une bascule retouche instantanément tout le journal.                 */
/* ------------------------------------------------------------------ */

type NetType = "dns" | "api" | "ip" | "port" | "local";

interface NetEntry {
  id: number;
  time: string;
  type: NetType;
  host: string;
  ip: string;
  token?: string;
  port?: number;
  blocked?: boolean;
}

interface Toggles {
  maskApi: boolean;
  maskIp: boolean;
  logDns: boolean;
  logPorts: boolean;
}

const HOSTS = [
  "router.huggingface.co",
  "huggingface.co",
  "cdn-lfs.hf.co",
  "telemetry.autonome.sh",
  "api.anthropic.com",
  "openrouter.ai",
];

const IPS = ["151.101.1.195", "13.225.78.44", "104.18.32.137", "34.117.59.81", "172.67.14.92"];
const DNS_HOSTS = ["autonome.sh", "huggingface.co", "github.com", "registry.npmjs.org", "fonts.gstatic.com"];
const SCAN_PORTS = [7860, 8080, 22, 3389, 5900, 9001];

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const now = () => new Date().toLocaleTimeString("fr-FR", { hour12: false });
const nf = new Intl.NumberFormat("fr-FR");

let uid = 1;
function makeEntry(type?: NetType): NetEntry {
  const t = type ?? rand<NetType>(["dns", "dns", "api", "ip", "ip", "port", "local", "local"]);
  const base = { id: uid++, time: now() };
  switch (t) {
    case "dns":
      return { ...base, type: t, host: rand(DNS_HOSTS), ip: rand(IPS) };
    case "api":
      return { ...base, type: t, host: rand(HOSTS), ip: rand(IPS), port: 443, token: "hf_Kq29x81mZp4Rw5Tb7f3a" };
    case "ip":
      return { ...base, type: t, host: rand(HOSTS), ip: rand(IPS), port: 443 };
    case "port":
      return { ...base, type: t, host: "entrant", ip: rand(IPS), port: rand(SCAN_PORTS), blocked: true };
    case "local":
      return { ...base, type: t, host: "moteur qwen3.8-27b", ip: "127.0.0.1" };
  }
}

const maskIp = (ip: string, on: boolean) =>
  on ? ip.split(".").map((_, i) => (i < 2 ? "•" : ip.split(".")[i])).join(".") : ip;

const maskToken = (token: string, on: boolean) => (on ? "hf_••••" + token.slice(-4) : token);

const TYPE_META: Record<NetType, { label: string; cls: string }> = {
  dns: { label: "DNS", cls: "text-lime border-lime/40 bg-lime/10" },
  api: { label: "API", cls: "text-amber border-amber/40 bg-amber/10" },
  ip: { label: "TCP", cls: "text-paper/70 border-linedark bg-linedark/40" },
  port: { label: "PORT", cls: "text-rose border-rose/40 bg-rose/10" },
  local: { label: "LOCAL", cls: "text-pine border-pine/40 bg-pine/10" },
};

function Switch({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-linedark bg-ink2/50 px-4 py-3 text-left transition-colors hover:border-mutdark"
    >
      <span>
        <span className="block text-[14px] font-semibold text-paper">{label}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-mutdark">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
          on ? "bg-lime" : "bg-linedark"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink shadow transition-all duration-300 ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function Firewall() {
  const [toggles, setToggles] = useState<Toggles>({ maskApi: true, maskIp: true, logDns: true, logPorts: true });
  const [entries, setEntries] = useState<NetEntry[]>(() => [makeEntry("local"), makeEntry("dns"), makeEntry("api")]);
  const [stats, setStats] = useState({ dns: 128, api: 46, blocked: 3, scanned: 12 });
  const [flash, setFlash] = useState(false);
  const burstTimers = useRef<number[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const e = makeEntry();
      setEntries((prev) => [...prev.slice(-34), e]);
      setStats((s) => ({
        dns: s.dns + (e.type === "dns" ? 1 : 0),
        api: s.api + (e.type === "api" ? 1 : 0),
        blocked: s.blocked + (e.type === "port" ? 1 : 0),
        scanned: s.scanned + (e.type === "port" ? 1 : 0),
      }));
    }, 1600);
    return () => {
      window.clearInterval(id);
      burstTimers.current.forEach(window.clearTimeout);
    };
  }, []);

  const simulateIntrusion = () => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 900);
    for (let i = 0; i < 7; i++) {
      burstTimers.current.push(
        window.setTimeout(() => {
          setEntries((prev) => [...prev.slice(-34), makeEntry("port")]);
          setStats((s) => ({ ...s, blocked: s.blocked + 1, scanned: s.scanned + 1 }));
        }, i * 130)
      );
    }
  };

  const visible = entries.filter((e) => {
    if (e.type === "dns" && !toggles.logDns) return false;
    if (e.type === "port" && !toggles.logPorts) return false;
    return true;
  });

  return (
    <section id="pare-feu" className="relative scroll-mt-24 overflow-hidden bg-ink py-24">
      <div className="bg-griddark pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-40 top-10 h-[460px] w-[460px] rounded-full bg-pine/14 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          dark
          kicker="Pare-feu cognitif"
          title={
            <>
              IL VOIT TOUT.
              <span className="text-lime"> RIEN NE SORT.</span>
            </>
          }
          sub="Une sonde en espace utilisateur intercepte chaque requête de vos agents : les clés API et les adresses IP sont masquées à la volée, le DNS et les ports sont journalisés. Aucune donnée brute ne quitte la machine — retournez les bascules pour le vérifier en direct."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ------- journal d'interception ------- */}
          <Reveal>
            <div
              className={`flex h-full flex-col overflow-hidden rounded-xl border bg-ink2/60 transition-colors duration-500 ${
                flash ? "border-rose shadow-[0_0_0_3px_rgba(255,93,58,0.25)]" : "border-linedark"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-linedark px-5 py-3.5">
                <RadarIcon className={`h-5 w-5 ${flash ? "text-rose" : "text-lime"}`} />
                <span className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-paper">
                  Journal d'interception
                </span>
                <span className="ml-auto flex items-center gap-2 font-mono text-[11px] text-mutdark">
                  <span className="anim-pulsedot h-2 w-2 rounded-full bg-pine" />
                  sonde active · user-space
                </span>
              </div>

              <div className="scroll-slim h-[340px] flex-1 overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed">
                {visible.map((e) => {
                  const meta = TYPE_META[e.type];
                  return (
                    <div key={e.id} className="anim-fadeup flex flex-wrap items-baseline gap-x-2.5 gap-y-1 py-1">
                      <span className="text-mutdark/70">{e.time}</span>
                      <span className={`rounded border px-1.5 py-px text-[10px] font-bold ${meta.cls}`}>{meta.label}</span>

                      {e.type === "dns" && (
                        <>
                          <span className="text-paper/85">{e.host}</span>
                          <span className="text-mutdark">→ résolveur local</span>
                          <span className="ml-auto text-lime">DoT chiffré</span>
                        </>
                      )}
                      {e.type === "api" && (
                        <>
                          <span className="text-paper/85">{e.host}</span>
                          <span className="text-mutdark">·</span>
                          <span className={toggles.maskApi ? "text-amber" : "text-rose"}>
                            Bearer {maskToken(e.token ?? "", toggles.maskApi)}
                          </span>
                          <span className={`ml-auto ${toggles.maskApi ? "text-lime" : "text-rose"}`}>
                            {toggles.maskApi ? "clé masquée" : "clé visible"}
                          </span>
                        </>
                      )}
                      {e.type === "ip" && (
                        <>
                          <span className="text-paper/85">{e.host}</span>
                          <span className={toggles.maskIp ? "text-amber" : "text-rose"}>
                            {maskIp(e.ip, toggles.maskIp)}:{e.port}
                          </span>
                          <span className={`ml-auto ${toggles.maskIp ? "text-lime" : "text-rose"}`}>
                            {toggles.maskIp ? "IP masquée" : "IP en clair"}
                          </span>
                        </>
                      )}
                      {e.type === "port" && (
                        <>
                          <span className="text-paper/85">scan entrant</span>
                          <span className="text-rose">:{e.port}</span>
                          <span className="flex items-center gap-1.5 ml-auto text-rose">
                            <StopIcon className="h-3 w-3" /> bloqué
                          </span>
                        </>
                      )}
                      {e.type === "local" && (
                        <>
                          <span className="text-paper/85">{e.host}</span>
                          <span className="text-mutdark">· socket unix {e.ip}</span>
                          <span className="ml-auto flex items-center gap-1.5 text-pine">
                            <CheckIcon className="h-3 w-3" /> autorisé
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 py-1 text-mutdark">
                  <span className="anim-blink inline-block h-3.5 w-2 bg-lime" />
                  écoute…
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-linedark px-5 py-3.5">
                <button
                  onClick={simulateIntrusion}
                  className="flex items-center gap-2 rounded-md border-2 border-rose px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-rose transition-all hover:bg-rose hover:text-ink active:scale-95"
                >
                  <StopIcon className="h-3.5 w-3.5" /> simuler une intrusion
                </button>
                <button
                  onClick={() => setEntries([])}
                  className="rounded-md border border-linedark px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-mutdark transition-colors hover:border-mutdark hover:text-paper"
                >
                  purger le journal
                </button>
                <span className="ml-auto font-mono text-[11px] text-mutdark">
                  {nf.format(visible.length)} entrées affichées
                </span>
              </div>
            </div>
          </Reveal>

          {/* ------- colonne droite ------- */}
          <div className="flex flex-col gap-5">
            <Reveal delay={100}>
              <div className="rounded-xl border border-linedark bg-ink2/60 p-5">
                <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
                  <LockIcon className="h-4 w-4" /> Règles de masquage & journal
                </p>
                <div className="mt-4 space-y-2.5">
                  <Switch
                    on={toggles.maskApi}
                    onClick={() => setToggles((t) => ({ ...t, maskApi: !t.maskApi }))}
                    label="Masquer les clés API"
                    hint="Bearer tronqué à la volée — hf_••••"
                  />
                  <Switch
                    on={toggles.maskIp}
                    onClick={() => setToggles((t) => ({ ...t, maskIp: !t.maskIp }))}
                    label="Masquer les adresses IP"
                    hint="octets remplacés — •.•.32.137"
                  />
                  <Switch
                    on={toggles.logDns}
                    onClick={() => setToggles((t) => ({ ...t, logDns: !t.logDns }))}
                    label="Journal DNS"
                    hint="chaque résolution chiffrée DoT, archivée"
                  />
                  <Switch
                    on={toggles.logPorts}
                    onClick={() => setToggles((t) => ({ ...t, logPorts: !t.logPorts }))}
                    label="Journal des ports"
                    hint="scans entrants détectés & refusés"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-linedark bg-linedark">
                {[
                  { v: stats.dns, l: "requêtes DNS interceptées", live: true },
                  { v: stats.api, l: "clés API masquées", live: true },
                  { v: stats.blocked, l: "intrusions bloquées" },
                  { v: stats.scanned, l: "ports sous surveillance" },
                ].map((s) => (
                  <div key={s.l} className="bg-ink2/80 px-5 py-4">
                    <p className="flex items-center gap-2 font-display text-3xl tracking-tight text-paper">
                      {nf.format(s.v)}
                      {s.live && <span className="anim-pulsedot h-1.5 w-1.5 rounded-full bg-lime" />}
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-mutdark">{s.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="rounded-xl border border-pine/35 bg-pine/8 p-5">
                <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
                  <PlaneIcon className="h-4 w-4" /> Étanchéité
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-paper/80">
                  Le pare-feu tourne en <strong className="text-paper">espace utilisateur</strong>, sans pilote noyau.
                  Coupez le réseau — la console locale et le journal continuent. Chaque règle est réversible d'un geste,
                  et rien n'est transmis sans votre accord explicite.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
