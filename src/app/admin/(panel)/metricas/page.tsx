import { PageHeader, Card, Kpi } from "@/components/admin/ui";
import { getOrderStats, fmtMoney, ORDER_STATE_LABEL } from "@/lib/admin/odoo-data";
import LiveNote from "@/components/admin/LiveNote";

export const dynamic = "force-dynamic";

export default async function MetricasPage() {
  let s: Awaited<ReturnType<typeof getOrderStats>> | null = null;
  let error: string | null = null;
  try {
    s = await getOrderStats();
  } catch (e) {
    error = (e as Error).message;
  }

  const byMonth = s?.byMonth ?? [];
  const maxMes = Math.max(...byMonth.map((m) => m.total), 1);
  const byState = (s?.byState ?? []).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const maxState = Math.max(...byState.map((x) => x.n), 1);
  const confirmados = byState.filter((x) => ["sale", "done"].includes(x.state)).reduce((a, x) => a + x.n, 0);
  const totalNoCancel = byState.filter((x) => x.state !== "cancel").reduce((a, x) => a + x.n, 0);
  const conversion = totalNoCancel ? Math.round((confirmados / totalNoCancel) * 100) : 0;
  const ticket = s && s.pedidosMes ? s.ventasMesUSD / Math.max(s.pedidosMes, 1) : 0;

  return (
    <div>
      <PageHeader title="Métricas" subtitle="Desempeño comercial de Uniparts Andina (USD)" />
      <LiveNote error={error} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Ventas del mes" value={s ? fmtMoney(s.ventasMesUSD) : "—"} accent="green" hint="Confirmadas · USD" />
        <Kpi label="Pedidos del mes" value={s ? String(s.pedidosMes) : "—"} accent="dark" />
        <Kpi label="Tasa de conversión" value={s ? `${conversion}%` : "—"} accent="orange" hint="Cotizaciones → confirmados (histórico)" />
        <Kpi label="Clientes activos" value={s ? String(s.clientesActivos) : "—"} accent="blue" hint="Con compras en 12 meses" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ventas por mes */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-1">Ventas confirmadas por mes</h2>
          <p className="text-xs text-gray-400 mb-6">Últimos 6 meses · USD</p>
          {byMonth.length ? (
            <div className="flex items-end justify-between gap-3 h-52">
              {byMonth.map((m) => (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{fmtMoney(m.total)}</span>
                  <div className="w-full flex items-end justify-center h-36">
                    <div
                      className="w-full max-w-[44px] bg-brand-orange/80 rounded-t-lg hover:bg-brand-orange transition-colors"
                      style={{ height: `${Math.max((m.total / maxMes) * 100, 3)}%` }}
                      title={`${m.n} pedidos`}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 truncate max-w-full">{m.mes}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin datos.</p>
          )}
        </Card>

        {/* Por estado */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-1">Pedidos por estado</h2>
          <p className="text-xs text-gray-400 mb-6">Histórico · USD</p>
          <div className="space-y-3">
            {byState.map((x) => (
              <div key={x.state}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{ORDER_STATE_LABEL[x.state] || x.state}</span>
                  <span className="font-semibold text-brand-dark">
                    {x.n.toLocaleString("es-VE")} <span className="text-gray-400 font-normal">· {fmtMoney(x.total)}</span>
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${x.state === "cancel" ? "bg-red-400" : "bg-brand-dark"}`} style={{ width: `${(x.n / maxState) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {s && <p className="text-xs text-gray-400 mt-5">Ticket promedio del mes: <strong className="text-brand-dark">{fmtMoney(ticket)}</strong></p>}
        </Card>
      </div>
    </div>
  );
}
