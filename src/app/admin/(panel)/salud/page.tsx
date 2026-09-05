import { PageHeader, Card, Kpi } from "@/components/admin/ui";
import { dataHealth } from "@/lib/admin/data";

export default function SaludPage() {
  const h = dataHealth();
  const cats = Object.entries(h.porCategoria).sort((a, b) => b[1] - a[1]);

  const gravedadColor = (ok: number, total: number) => {
    const p = ok / total;
    if (p >= 0.85) return "text-green-600";
    if (p >= 0.6) return "text-amber-600";
    return "text-red-600";
  };
  const barColor = (ok: number, total: number) => {
    const p = ok / total;
    if (p >= 0.85) return "bg-green-500";
    if (p >= 0.6) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div>
      <PageHeader
        title="Salud de datos"
        subtitle="Calidad del catálogo sincronizado desde Odoo (datos reales)"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Productos totales" value={String(h.total)} accent="dark" />
        <Kpi label="Sin foto" value={String(h.sinImagen)} accent={h.sinImagen > h.total * 0.3 ? "amber" : "green"} hint={`${h.pct(h.sinImagen)}% del catálogo`} />
        <Kpi label="Sin referencia" value={String(h.sinRef)} accent={h.sinRef > 0 ? "amber" : "green"} />
        <Kpi label="Sin descripción" value={String(h.sinDescripcion)} accent={h.sinDescripcion > h.total * 0.5 ? "amber" : "green"} hint={`${h.pct(h.sinDescripcion)}% del catálogo`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chequeos de calidad */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-5">Chequeos de calidad</h2>
          <div className="space-y-5">
            {h.checks.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{c.label}</span>
                  <span className={`font-semibold ${gravedadColor(c.ok, c.total)}`}>
                    {c.ok}/{c.total}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(c.ok, c.total)}`} style={{ width: `${(c.ok / c.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Recomendación: cargar fotos y descripciones a los productos con vacíos
            en Odoo mejora la conversión y el SEO de la tienda.
          </p>
        </Card>

        {/* Distribución por categoría */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-5">Productos por categoría</h2>
          <div className="space-y-3">
            {cats.map(([cat, n]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-40 text-sm text-gray-600 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange rounded-full" style={{ width: `${(n / h.total) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-brand-dark">{n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ejemplos sin foto */}
      {h.ejemplosSinFoto.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="font-bold text-brand-dark mb-4">
            Productos sin foto <span className="text-gray-400 font-normal text-sm">(muestra)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {h.ejemplosSinFoto.map((p) => (
              <span key={p.id} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-gray-600">
                {p.ref ? `${p.ref} · ` : ""}{p.name}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
