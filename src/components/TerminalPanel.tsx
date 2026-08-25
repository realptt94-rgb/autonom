import { useEffect, useMemo, useRef, useState } from "react";
import {
  BuilderState,
  CmdBlock,
  Method,
  fmtBytes,
  fmtDur,
  fakeHash,
  isValid,
  pointersTotal,
  repoUrl,
  simFiles,
} from "../lib/model";
import { CheckIcon, CopyIcon, PlayIcon, RefreshIcon, StopIcon } from "./ui";

/* ------------------------------------------------------------------ */
/* Copie presse-papiers                                                */
/* ------------------------------------------------------------------ */

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

function CopyBtn({
  text,
  label,
  notify,
  compact,
}: {
  text: string;
  label: string;
  notify: (m: string) => void;
  compact?: boolean;
}) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        const done = await copyText(text);
        if (done) {
          setOk(true);
          notify(label);
          setTimeout(() => setOk(false), 1400);
        }
      }}
      className={`flex items-center gap-1.5 rounded-md border font-mono text-[11px] transition active:scale-95 ${
        ok
          ? "border-teal/50 bg-teal/10 text-teal"
          : "border-line bg-panel2 text-mut hover:border-line2 hover:text-ink"
      } ${compact ? "px-2 py-1" : "px-2.5 py-1.5"}`}
    >
      {ok ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {ok ? "Copié" : "Copier"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Rendu d'une ligne de commande (URLs surlignées)                     */
/* ------------------------------------------------------------------ */

function CmdText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <span key={i} className="text-gold underline decoration-gold/30 underline-offset-4">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

type SimStatus = "idle" | "running" | "done" | "cancelled";
interface LogLine {
  id: number;
  kind: "info" | "file" | "ok" | "note" | "err";
  text: string;
}
interface Sim {
  status: SimStatus;
  logs: LogLine[];
  done: number;
  fileIdx: number;
  fileDone: number;
  speed: number;
  started: number;
}

const IDLE: Sim = { status: "idle", logs: [], done: 0, fileIdx: 0, fileDone: 0, speed: 0, started: 0 };

const METHOD_LABEL: Record<Method, string> = {
  xet: "git clone + xet",
  pointers: "GIT_LFS_SKIP_SMUDGE=1",
  hf: "hf download",
};

export default function TerminalPanel({
  s,
  blocks,
  notify,
}: {
  s: BuilderState;
  blocks: CmdBlock[];
  notify: (m: string) => void;
}) {
  const valid = isValid(s);
  const [tab, setTab] = useState<"cmd" | "sim">("cmd");
  const [sim, setSim] = useState<Sim>(IDLE);
  const logRef = useRef<HTMLDivElement>(null);

  const files = useMemo(() => simFiles(s), [s]);
  const totalBytes = useMemo(
    () => (s.method === "pointers" ? pointersTotal(files.length) : files.reduce((a, f) => a + f.size, 0)),
    [files, s.method]
  );

  const stateKey = JSON.stringify(s);
  useEffect(() => {
    setSim((p) => (p.status === "idle" ? p : IDLE));
  }, [stateKey]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sim.logs.length, sim.fileDone]);

  /* ---- moteur ---- */
  useEffect(() => {
    if (sim.status !== "running") return;
    const id = window.setInterval(() => {
      setSim((prev) => {
        if (prev.status !== "running") return prev;
        const next: Sim = { ...prev, logs: [...prev.logs] };
        let seq = next.logs.length;
        const push = (kind: LogLine["kind"], text: string) => next.logs.push({ id: seq++, kind, text });
        const url = repoUrl(s);

        if (s.method === "pointers") {
          let k = 0;
          while (next.fileIdx < files.length && k < 3) {
            const f = files[next.fileIdx];
            push("file", `→ ${f.name} · pointeur 131 o`);
            push("ok", `✓ pointeur écrit — blob ${fakeHash(f.name).slice(0, 10)} non téléchargé`);
            next.fileIdx += 1;
            next.done += 131;
            k++;
          }
          if (next.fileIdx >= files.length) {
            push("ok", `✓ clone terminé — squelette + ${files.length} pointeurs · poids via git lfs pull`);
            next.status = "done";
            next.done = totalBytes;
          }
          return next;
        }

        const base = s.method === "xet" ? 2.35e9 : 1.5e9;
        next.speed = base * (0.72 + Math.random() * 0.56);
        let remaining = next.speed * 0.1;
        while (remaining > 0 && next.fileIdx < files.length) {
          const f = files[next.fileIdx];
          if (next.fileDone === 0) push("file", `→ ${f.name} · ${fmtBytes(f.size)}`);
          const need = f.size - next.fileDone;
          if (remaining >= need) {
            remaining -= need;
            next.done += need;
            next.fileDone = 0;
            next.fileIdx += 1;
            push("ok", `✓ sha256 ${fakeHash(f.name)} vérifié · ${f.size > 1e8 ? fmtDur(f.size / next.speed) : "instantané"}`);
            if (s.method === "xet" && f.size > 1e8 && Math.random() < 0.45) {
              push("note", `◆ xet : ${20 + Math.floor(Math.random() * 46)} % des blocs dédupliqués depuis le cache`);
            }
          } else {
            next.fileDone += remaining;
            next.done += remaining;
            remaining = 0;
          }
        }
        if (next.fileIdx >= files.length) {
          const dur = (Date.now() - next.started) / 1000;
          if (s.method === "xet") {
            push("ok", `✓ checkout terminé — ${files.length} fichiers, ${fmtBytes(totalBytes)} en ${fmtDur(dur)} · cache blocs actif`);
          } else {
            push("ok", `✓ révision ${s.revision.trim() || "main"} complète — ${fmtBytes(totalBytes)} dans ${s.localDir.trim() || "le cache hf"}`);
          }
          push("info", `· ${url}`);
          next.status = "done";
          next.speed = 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.status, stateKey]);

  const start = () => {
    if (!valid || files.length === 0) return;
    const logs: LogLine[] = [];
    logs.push({ id: 0, kind: "info", text: `$ ${METHOD_LABEL[s.method]} · ${s.org.trim()}/${s.model.trim()}` });
    logs.push({ id: 1, kind: "info", text: `· résolution de refs/heads/${s.revision.trim() || "main"} → ${fakeHash(s.model).slice(0, 7)} … ok` });
    if (s.method === "pointers") {
      logs.push({ id: 2, kind: "note", text: "◆ GIT_LFS_SKIP_SMUDGE=1 — les blobs LFS restent des pointeurs (131 o)" });
    } else if (s.method === "xet") {
      logs.push({ id: 2, kind: "note", text: "◆ négociation xet : téléchargement au niveau bloc, déduplication activée" });
    } else {
      logs.push({
        id: 2,
        kind: "note",
        text: `◆ ${files.length} fichiers retenus${s.includes.length ? ` · include ${s.includes.join(" ")}` : ""}${s.excludes.length ? ` · exclude ${s.excludes.join(" ")}` : ""}`,
      });
    }
    setSim({ status: "running", logs, done: 0, fileIdx: 0, fileDone: 0, speed: 0, started: Date.now() });
    setTab("sim");
  };

  const cancel = () => {
    setSim((p) => ({
      ...p,
      status: "cancelled",
      speed: 0,
      logs: [...p.logs, { id: p.logs.length, kind: "err", text: "× interrompu — les fichiers partiels sont conservés, relancez pour reprendre" }],
    }));
  };

  const pct = totalBytes > 0 ? Math.min(100, (sim.done / totalBytes) * 100) : 0;
  const currentFile = sim.fileIdx < files.length ? files[sim.fileIdx] : null;
  const allText = blocks.map((b) => b.lines.map((l) => l.text).join("\n")).join("\n\n");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-inset shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      {/* chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-teal/80" />
        </div>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-[11.5px] text-mut">
          hubclone — {valid ? `${s.org.trim()}/${s.model.trim()}` : "aucun dépôt"}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
          <span className={`h-1.5 w-1.5 rounded-full ${sim.status === "running" ? "bg-teal anim-pulsedot" : "bg-line2"}`} />
          {sim.status === "running" ? "transfert" : "zsh"}
        </span>
      </div>

      {/* tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-line bg-panel/60 px-3 py-2">
        <div className="flex gap-1">
          {(
            [
              ["cmd", "Commandes"],
              ["sim", "Simulation"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-md px-3 py-1.5 font-mono text-[11.5px] transition ${
                tab === id ? "bg-gold/12 text-gold" : "text-mut hover:bg-panel2 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "cmd" ? (
          <CopyBtn text={allText} label="Script complet copié" notify={notify} />
        ) : (
          sim.status === "running" ? (
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 rounded-md border border-rose/40 bg-rose/10 px-2.5 py-1.5 font-mono text-[11px] text-rose transition hover:bg-rose/20 active:scale-95"
            >
              <StopIcon className="h-3.5 w-3.5" /> Annuler
            </button>
          ) : (
            <button
              onClick={start}
              disabled={!valid || files.length === 0}
              className="flex items-center gap-1.5 rounded-md border border-gold/45 bg-gold/12 px-2.5 py-1.5 font-mono text-[11px] text-gold transition hover:bg-gold/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sim.status === "idle" ? <PlayIcon className="h-3.5 w-3.5" /> : <RefreshIcon className="h-3.5 w-3.5" />}
              {sim.status === "idle" ? "Lancer" : "Relancer"}
            </button>
          )
        )}
      </div>

      {/* ------------------------------------------------ commandes */}
      {tab === "cmd" && (
        <div className="scroll-slim max-h-[604px] overflow-y-auto p-4">
          {!valid ? (
            <p className="py-10 text-center font-mono text-[12.5px] text-dim">
              // renseignez un dépôt pour générer le script
            </p>
          ) : (
            <div className="space-y-4">
              {blocks.map((b, bi) => (
                <div key={bi} className="overflow-hidden rounded-lg border border-line bg-panel/70">
                  <div className="flex items-center justify-between gap-2 border-b border-line/70 bg-panel2/60 px-3 py-2">
                    <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-mut">
                      <span className="mr-2 text-gold">{String(bi + 1).padStart(2, "0")}</span>
                      {b.title}
                    </span>
                    <CopyBtn
                      compact
                      text={b.lines.map((l) => l.text).join("\n")}
                      label={`Bloc « ${b.title} » copié`}
                      notify={notify}
                    />
                  </div>
                  <pre className="scroll-slim overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-[1.75]">
                    {b.lines.map((l, li) => (
                      <div key={li} className="whitespace-pre">
                        {l.kind === "comment" ? (
                          <span className="italic text-dim">{l.text}</span>
                        ) : (
                          <>
                            <span className="mr-2 select-none text-gold">❯</span>
                            <span className="text-ink">
                              <CmdText text={l.text} />
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </pre>
                </div>
              ))}
              <p className="px-1 font-mono text-[11px] leading-relaxed text-dim">
                # astuce — collez le script dans un terminal ; chaque bloc est copiable indépendamment.
                <span className="anim-blink ml-1 inline-block h-[13px] w-[7px] translate-y-[2px] bg-teal" />
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------ simulation */}
      {tab === "sim" && (
        <div className="flex max-h-[604px] flex-col">
          {/* stats */}
          <div className="grid grid-cols-3 gap-px border-b border-line bg-line">
            {[
              ["méthode", METHOD_LABEL[s.method]],
              ["fichiers", `${files.length}`],
              ["volume", valid ? fmtBytes(totalBytes) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-panel px-3 py-2">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim">{k}</div>
                <div className="truncate font-mono text-[12px] text-ink">{v}</div>
              </div>
            ))}
          </div>

          {/* barre globale */}
          <div className="border-b border-line bg-panel px-4 py-3">
            <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
              <span className="text-mut">
                {fmtBytes(sim.done)} <span className="text-dim">/ {fmtBytes(totalBytes)}</span>
              </span>
              <span className="text-dim">
                {sim.status === "running" && sim.speed > 0 ? (
                  <>
                    <span className="text-teal">{fmtBytes(sim.speed)}/s</span>
                    {" · reste "}
                    {fmtDur((totalBytes - sim.done) / sim.speed)}
                  </>
                ) : sim.status === "done" ? (
                  <span className="text-teal">terminé</span>
                ) : sim.status === "cancelled" ? (
                  <span className="text-rose">interrompu</span>
                ) : (
                  "en attente"
                )}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-inset">
              <div
                className={`h-full rounded-full transition-[width] duration-150 ease-linear ${
                  sim.status === "done"
                    ? "bg-teal"
                    : sim.status === "cancelled"
                      ? "bg-rose"
                      : "bar-stripes bg-gradient-to-r from-gold to-ember"
                }`}
                style={{ width: `${sim.status === "done" ? 100 : pct}%` }}
              />
            </div>
            {sim.status === "running" && currentFile && (
              <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-mut">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold anim-pulsedot" />
                <span className="truncate">{currentFile.name}</span>
                <span className="ml-auto shrink-0 text-dim">
                  {Math.min(100, Math.round((sim.fileDone / currentFile.size) * 100))} %
                </span>
              </div>
            )}
          </div>

          {/* console */}
          <div ref={logRef} className="scroll-slim min-h-[280px] flex-1 overflow-y-auto bg-inset px-4 py-3 font-mono text-[12px] leading-[1.8]">
            {sim.status === "idle" ? (
              <div className="grid h-full place-items-center py-8">
                <div className="max-w-[36ch] rounded-lg border border-dashed border-line px-5 py-6 text-center">
                  <p className="text-[13px] text-mut">
                    Simulation locale du téléchargement — aucune requête réseau réelle.
                  </p>
                  <p className="mt-2 text-[11.5px] text-dim">
                    {valid && files.length > 0
                      ? `Appuyez sur « Lancer » pour voir ${files.length} fichiers défiler (${fmtBytes(totalBytes)}).`
                      : valid
                        ? "Aucun fichier ne correspond aux filtres actuels — élargissez les includes."
                        : "Renseignez d'abord un dépôt valide."}
                  </p>
                </div>
              </div>
            ) : (
              sim.logs.map((l) => (
                <div
                  key={l.id}
                  className={`whitespace-pre-wrap break-all ${
                    l.kind === "info"
                      ? "text-dim"
                      : l.kind === "file"
                        ? "text-ink"
                        : l.kind === "ok"
                          ? "text-teal"
                          : l.kind === "note"
                            ? "text-gold/90"
                            : "text-rose"
                  }`}
                >
                  {l.text}
                </div>
              ))
            )}
            {sim.status === "running" && <span className="anim-blink inline-block h-[13px] w-[7px] translate-y-[2px] bg-gold" />}
          </div>
        </div>
      )}
    </div>
  );
}
