"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Meta = { syncedAt: string; total: number; conPrecio: number; conFoto: number };
type Run = {
  id: number;
  number: number;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
  event: string;
};
type Status = {
  configured: boolean;
  canTrigger: boolean;
  deployed: Meta;
  repo: Meta | null;
  run: Run | null;
  actionsUrl: string;
  now: string;
};

const fmt = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Caracas",
});
const fmtDate = (iso?: string | null) => (iso ? fmt.format(new Date(iso)) : "—");

type Phase = "idle" | "launching" | "reading" | "publishing" | "done" | "nochange" | "error";

/** Botón "Actualizar desde Odoo": dispara el workflow de sincronización y sigue su progreso. */
export default function SyncCatalogButton() {
  const [st, setSt] = useState<Status | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const clickedAt = useRef<number | null>(null);
  const startDeployed = useRef<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/sync-catalog", { cache: "no-store" });
    if (!r.ok) throw new Error(`Estado no disponible (${r.status})`);
    const data = (await r.json()) as Status;
    setSt(data);
    return data;
  }, []);

  // Deriva la fase a partir del estado (solo cuando hay una sincronización lanzada desde aquí).
  const derive = useCallback((data: Status) => {
    if (clickedAt.current == null) return;
    const run = data.run;
    const runIsOurs = run && new Date(run.createdAt).getTime() >= clickedAt.current - 60_000;
    if (!runIsOurs) return setPhase("launching");
    if (run.status !== "completed") return setPhase("reading");
    if (run.conclusion !== "success") {
      setError("La sincronización falló. Revisa el historial en GitHub.");
      return setPhase("error");
    }
    // Terminó: ¿cambió el catálogo (el repo tiene una meta más nueva que la web)?
    const repoAt = data.repo?.syncedAt ?? null;
    const deployedAt = data.deployed.syncedAt;
    if (repoAt && repoAt !== deployedAt) return setPhase("publishing");
    if (startDeployed.current && deployedAt !== startDeployed.current) return setPhase("done");
    // Corrió bien y no hay nada nuevo que publicar.
    setPhase("nochange");
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  // Sondeo mientras hay algo en curso.
  const active = phase === "launching" || phase === "reading" || phase === "publishing";
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      load().then(derive).catch((e) => setError(e.message));
    }, 8000);
    return () => clearInterval(t);
  }, [active, load, derive]);

  const trigger = async () => {
    setError(null);
    clickedAt.current = Date.now();
    startDeployed.current = st?.deployed.syncedAt ?? null;
    setPhase("launching");
    const r = await fetch("/api/admin/sync-catalog", { method: "POST" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(data.error || "No se pudo lanzar la sincronización.");
      setPhase("error");
      return;
    }
    setTimeout(() => load().then(derive).catch(() => {}), 3000);
  };

  const running = st?.run && st.run.status !== "completed";
  const busy = active || Boolean(running);

  const phaseText: Record<Phase, string> = {
    idle: "",
    launching: "Lanzando la sincronización…",
    reading: "Leyendo productos, stock, fotos y precios de Odoo…",
    publishing: "Cambios detectados. Publicando en la web (2–3 min)…",
    done: "¡Listo! La web ya muestra el catálogo actualizado.",
    nochange: "Odoo no tiene cambios desde la última sincronización. La web ya está al día.",
    error: "",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex flex-col lg:flex-row lg:items-center gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${busy ? "bg-amber-400 animate-pulse" : "bg-green-500"}`} />
          <h2 className="font-bold text-brand-dark">Sincronización con Odoo</h2>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Catálogo en la web actualizado el{" "}
          <span className="font-semibold text-brand-dark">{fmtDate(st?.deployed.syncedAt)}</span>
          {st && (
            <span className="text-gray-400">
              {" "}· {st.deployed.total.toLocaleString("es-VE")} productos · {st.deployed.conPrecio.toLocaleString("es-VE")} con precio ·{" "}
              {st.deployed.conFoto.toLocaleString("es-VE")} con foto
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Se actualiza sola todos los días a las 6:30 a. m. Con el botón la lanzas ahora mismo. Odoo solo se lee, nunca se modifica.
        </p>

        {st?.run && !active && (
          <p className="text-xs text-gray-500 mt-2">
            Última ejecución: #{st.run.number} ({st.run.event === "schedule" ? "automática" : "manual"}) ·{" "}
            {fmtDate(st.run.updatedAt)} ·{" "}
            <span className={st.run.conclusion === "success" ? "text-green-600 font-semibold" : st.run.status !== "completed" ? "text-amber-600 font-semibold" : "text-red-600 font-semibold"}>
              {st.run.status !== "completed" ? "en curso" : st.run.conclusion === "success" ? "correcta" : "con error"}
            </span>
          </p>
        )}

        {phase !== "idle" && phase !== "error" && (
          <p className={`text-sm mt-3 font-medium ${phase === "done" || phase === "nochange" ? "text-green-700" : "text-amber-700"}`}>
            {active && (
              <span className="inline-block w-3.5 h-3.5 mr-2 align-[-2px] border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            )}
            {phaseText[phase]}
          </p>
        )}
        {error && <p className="text-sm mt-3 text-red-600 font-medium">{error}</p>}
        {st && !st.configured && (
          <p className="text-sm mt-3 text-amber-700">Falta configurar GITHUB_TOKEN en el servidor para lanzar sincronizaciones.</p>
        )}
      </div>

      <div className="flex flex-col items-stretch gap-2 shrink-0">
        <button
          onClick={trigger}
          disabled={!st || !st.configured || !st.canTrigger || busy}
          className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          <svg className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5.5 9a7 7 0 0111.9-2.5L20 9M18.5 15a7 7 0 01-11.9 2.5L4 15" />
          </svg>
          {busy ? "Actualizando…" : "Actualizar desde Odoo"}
        </button>
        {st?.actionsUrl && (
          <a href={st.run?.url ?? st.actionsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-center text-gray-400 hover:text-brand-orange">
            Ver historial en GitHub
          </a>
        )}
      </div>
    </div>
  );
}
