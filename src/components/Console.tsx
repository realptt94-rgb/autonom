import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckIcon, PlaneIcon, SpinnerIcon } from "./icons";

type Step = { label: string; tool?: string; ms: number };

type Template = {
  chip: string;
  task: string;
  steps: Step[];
  result: string;
};

const TEMPLATES: Template[] = [
  {
    chip: "Résumer 40 pages de notes",
    task: "Résumer 40 pages de notes de comité en 10 décisions actionnables",
    steps: [
      { label: "Lecture du contexte", ms: 700 },
      { label: "Décomposition en 3 sous-tâches", ms: 900 },
      { label: "Extraction des décisions", tool: "lecture locale · notes_q3.pdf", ms: 1200 },
      { label: "Synthèse & priorisation", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1400 },
      { label: "Relecture & formatage", ms: 800 },
    ],
    result:
      "10 décisions extraites, classées par impact. Top 3 : (1) migrer l'ETL vers un cron nocturne — gain 6 h/sem, (2) geler les recrutements outils jusqu'au T3, (3) basculer 4 clients pilotes sur la v2 avant le 15. Résumé complet : decisions_t3.md (2 pages).",
  },
  {
    chip: "Veille concurrentielle hebdo",
    task: "Compiler la veille concurrentielle hebdo à partir du dossier ./veille",
    steps: [
      { label: "Scan du dossier ./veille", tool: "14 fichiers détectés", ms: 800 },
      { label: "Déduplication & clustering", ms: 1000 },
      { label: "Analyse des signaux faibles", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1500 },
      { label: "Rédaction du brief", ms: 1100 },
    ],
    result:
      "Brief hebdo prêt : veille_s42.md. 3 mouvements notables — un concurrent a discrètement doublé ses tarifs API (signal fort), deux recrutements ML senior chez le n°2, un dépôt open-source abandonné à surveiller. 0 requête web : analyse 100 % sur vos documents.",
  },
  {
    chip: "Nettoyer un CSV clients",
    task: "Nettoyer clients_export.csv : doublons, e-mails invalides, SIRET manquants",
    steps: [
      { label: "Parsing de clients_export.csv", tool: "12 480 lignes", ms: 700 },
      { label: "Détection de doublons", ms: 900 },
      { label: "Validation des e-mails & SIRET", tool: "règles locales", ms: 1100 },
      { label: "Enrichissement des libellés", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1300 },
      { label: "Écriture du fichier propre", ms: 600 },
    ],
    result:
      "clients_export_propre.csv : 11 962 lignes conservées. 312 doublons fusionnés, 148 e-mails corrigés, 58 SIRET reconstitués par recoupement interne. Rapport d'anomalies : rapport_nettoyage.md.",
  },
];

type Status = "idle" | "running" | "done";

export default function Console() {
  const [status, setStatus] = useState<Status>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [tpl, setTpl] = useState<Template>(TEMPLATES[0]);
  const [input, setInput] = useState("");
  const [offline, setOffline] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [stepIdx, status]);

  function run(t: Template) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTpl(t);
    setStatus("running");
    setStepIdx(0);
    setElapsed(0);
    let acc = 0;
    t.steps.forEach((s, i) => {
      acc += s.ms;
      const done = acc;
      timers.current.push(
        window.setTimeout(() => {
          setStepIdx(i + 1);
          setElapsed(done / 1000);
          if (i === t.steps.length - 1) setStatus("done");
        }, done)
      );
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v || status === "running") return;
    run({
      ...TEMPLATES[0],
      task: v,
      steps: [
        { label: "Lecture de la demande", ms: 700 },
        { label: "Plan d'exécution (4 étapes)", ms: 900 },
        { label: "Exécution des outils locaux", tool: "moteur qwen3.8-27b · q4_k_m", ms: 1500 },
        { label: "Assemblage du livrable", ms: 1000 },
      ],
      result:
        "Tâche traitée localement : plan exécuté en 4 étapes, livrable écrit dans ./sorties/. Aucun paquet réseau émis, aucun token API consommé — le moteur a raisonné sur votre machine du début à la fin.",
    });
  }

  return (
    <div id="produit" className="relative overflow-hidden rounded-xl border border-linedark bg-ink text-[13.5px] shadow-[0_30px_80px_-30px_rgba(11,19,14,0.55)] scanline">
      {/* title bar */}
      <div className="flex items-center gap-3 border-b border-linedark px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-pine/80" />
        </div>
        <span className="font-mono text-[11px] tracking-wide text-mutdark">
          autonome — agent local v0.9.4
        </span>
        <button
          onClick={() => setOffline((o) => !o)}
          className={`ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider transition-colors ${
            offline
              ? "border-lime/50 bg-lime/10 text-lime"
              : "border-linedark text-mutdark hover:border-mutdark hover:text-ink"
          }`}
          title="Couper le réseau : l'agent continue, il est local"
        >
          <PlaneIcon className="h-3.5 w-3.5" />
          {offline ? "hors-ligne" : "en ligne"}
        </button>
      </div>

      {/* log zone */}
      <div ref={logRef} className="scroll-slim h-64 overflow-y-auto px-4 py-3 font-mono leading-relaxed">
        <p className="text-mutdark">
          <span className="text-lime">➜</span> <span className="text-paper/80">autonome</span>{" "}
          <span className="text-pine">run</span>
        </p>

        {status === "idle" && (
          <p className="mt-2 text-mutdark">
            moteur chargé en mémoire · 16,9 Go · prêt.
            <span className="anim-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-lime" />
          </p>
        )}

        {status !== "idle" && (
          <>
            <p className="mt-2 text-paper/85">
              <span className="text-amber">▸ tâche</span> — {tpl.task}
            </p>
            {offline && (
              <p className="anim-fadeup mt-1 text-lime">
                réseau coupé — aucun impact, le moteur tourne chez vous.
              </p>
            )}
            <ul className="mt-2 space-y-1.5">
              {tpl.steps.map((s, i) => {
                const done = i < stepIdx;
                const active = status === "running" && i === stepIdx;
                if (!done && !active) return null;
                return (
                  <li key={i} className="anim-fadeup flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center">
                      {done ? (
                        <CheckIcon className="h-3.5 w-3.5 text-pine" />
                      ) : (
                        <SpinnerIcon className="h-3.5 w-3.5 text-lime" />
                      )}
                    </span>
                    <span className={done ? "text-paper/80" : "text-lime"}>
                      {s.label}
                      {s.tool && (
                        <span className="text-mutdark">
                          {" "}
                          <span className="text-paper/40">[</span>
                          {s.tool}
                          <span className="text-paper/40">]</span>
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>

            {status === "done" && (
              <div className="anim-fadeup mt-3 rounded-lg border border-pine/30 bg-pine/10 p-3">
                <p className="font-mono text-[11px] uppercase tracking-wider text-pine">
                  ✓ terminé en {elapsed.toFixed(1).replace(".", ",")} s
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-paper/85">{tpl.result}</p>
                <div className="mt-2.5 flex flex-wrap gap-2 font-mono text-[10.5px]">
                  <span className="rounded-full border border-lime/40 bg-lime/10 px-2 py-0.5 text-lime">
                    tokens api facturés : 0
                  </span>
                  <span className="rounded-full border border-linedark px-2 py-0.5 text-mutdark">
                    octets sortis du poste : 0
                  </span>
                  <span className="rounded-full border border-linedark px-2 py-0.5 text-mutdark">
                    reproductible hors-ligne
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* chips + input */}
      <div className="border-t border-linedark p-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.chip}
              onClick={() => run(t)}
              disabled={status === "running"}
              className="rounded-full border border-linedark px-2.5 py-1 font-mono text-[10.5px] text-mutdark transition-colors hover:border-lime/60 hover:text-lime disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.chip}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2">
          <span className="font-mono text-lime">➜</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez une tâche… ex. « rédiger le compte-rendu de la réu d'hier »"
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-paper placeholder:text-mutdark/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "running" || !input.trim()}
            className="rounded-md bg-lime px-3.5 py-1.5 font-mono text-[11.5px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-limedark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            lancer
          </button>
        </form>
      </div>
    </div>
  );
}
