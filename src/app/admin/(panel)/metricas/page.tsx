import { PageHeader, Card, Kpi, DemoNote } from "@/components/admin/ui";
import { metrics, usd } from "@/lib/admin/data";

const etapaLabel: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cotizado: "Cotizado",
  ganado: "Ganado",
  perdido: "Perdido",
};

export default function MetricasPage() {
  const m = metrics();
  const maxVenta = Math.max(...m.ventasPorMes.map((x) => x.v));
  const maxEmbudo = Math.max(...m.embudo.map((x) => x.n), 1);
  const conversion = Math.round(
    ((m.embudo.find((e) => e.etapa === "ganado")?.n || 0) /
      m.embudo.reduce((s, e) => s + e.n, 0 || 1)) * 100
  );

  return (
    <div>
      <PageHeader title="Métricas" subtitle="Desempeño comercial" />
      <DemoNote>
        Datos de ejemplo. Se alimentarán de <strong>Odoo</strong> (ventas, pedidos)
        y del inbox (leads, conversión) al conectar las fuentes.
      </DemoNote>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Ventas del mes" value={usd(m.ventasMes)} accent="green" />
        <Kpi label="Pedidos" value={String(m.pedidosMes)} accent="dark" />
        <Kpi label="Tasa de conversión" value={`${conversion}%`} accent="orange" hint="Leads → ganados" />
        <Kpi label="Ticket promedio" value={usd(m.ventasMes / Math.max(m.pedidosMes, 1))} accent="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ventas por mes */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-6">Ventas por mes</h2>
          <div className="flex items-end justify-between gap-3 h-48">
            {m.ventasPorMes.map((x) => (
              <div key={x.mes} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-40">
                  <div
                    className="w-full max-w-[42px] bg-brand-orange/80 rounded-t-lg hover:bg-brand-orange transition-colors"
                    style={{ height: `${Math.max((x.v / maxVenta) * 100, 4)}%` }}
                    title={usd(x.v)}
                  />
                </div>
                <span className="text-xs text-gray-400">{x.mes}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Embudo */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-6">Embudo de ventas</h2>
          <div className="space-y-3">
            {m.embudo.map((e) => (
              <div key={e.etapa}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{etapaLabel[e.etapa]}</span>
                  <span className="font-semibold text-brand-dark">{e.n}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-dark rounded-full"
                    style={{ width: `${(e.n / maxEmbudo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
