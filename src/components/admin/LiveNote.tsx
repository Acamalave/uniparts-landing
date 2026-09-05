/** Indica que la sección lee datos en vivo desde Odoo, o muestra el error si falló. */
export default function LiveNote({ error, source = "Odoo" }: { error?: string | null; source?: string }) {
  if (error) {
    return (
      <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>
          No se pudo leer {source}: {error}. Se reintenta automáticamente.
        </span>
      </div>
    );
  }
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3.5 py-1.5 text-xs font-medium text-green-700">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Datos en vivo desde {source} · se actualizan cada 5 min
    </div>
  );
}
