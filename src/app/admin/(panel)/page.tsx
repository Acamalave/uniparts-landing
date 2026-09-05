import Link from "next/link";
import { PageHeader, Kpi, Card, Badge } from "@/components/admin/ui";
import { dataHealth } from "@/lib/admin/data";
import {
  getOrderStats,
  getRecentOrders,
  getPendingTasks,
  fmtMoney,
  ORDER_STATE_LABEL,
  ORDER_STATE_STYLE,
} from "@/lib/admin/odoo-data";
import LiveNote from "@/components/admin/LiveNote";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";
const TZ = "America/Caracas";

function saludo() {
  const hora = parseInt(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ }), 10);
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}
function fechaLarga() {
  const s = new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function AdminHome() {
  const user = await requireAdmin();
  const nombre = user.nombre.split(" ")[0];
  const health = dataHealth();

  let stats: Awaited<ReturnType<typeof getOrderStats>> | null = null;
  let recientes: Awaited<ReturnType<typeof getRecentOrders>> = [];
  let error: string | null = null;
  try {
    [stats, recientes] = await Promise.all([getOrderStats(), getRecentOrders(5)]);
  } catch (e) {
    error = (e as Error).message;
  }
  const tareas = await getPendingTasks();

  return (
    <div>
      <PageHeader title={`${saludo()}, ${nombre}`} subtitle={fechaLarga()} />
      <LiveNote error={error} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Ventas del mes" value={stats ? fmtMoney(stats.ventasMesUSD) : "—"} accent="green" hint="Confirmadas · USD" />
        <Kpi label="Pedidos del mes" value={stats ? String(stats.pedidosMes) : "—"} accent="dark" hint={stats ? `${stats.totalPedidos.toLocaleString("es-VE")} históricos` : undefined} />
        <Kpi label="Cotizaciones abiertas" value={stats ? String(stats.cotizacionesAbiertas) : "—"} accent="amber" hint="Este mes · por seguir" />
        <Kpi label="Productos en catálogo" value={String(health.total)} accent="orange" hint={`${health.total - health.sinImagen} con foto`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-dark">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-brand-orange text-sm font-semibold hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recientes.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-dark">{o.name}</p>
                  <p className="text-xs text-gray-500 truncate">{o.partner}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-brand-dark whitespace-nowrap">{fmtMoney(o.total, o.currency)}</p>
                  <Badge className={ORDER_STATE_STYLE[o.state] || "bg-gray-100 text-gray-600"}>{ORDER_STATE_LABEL[o.state] || o.state}</Badge>
                </div>
              </div>
            ))}
            {recientes.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin pedidos para mostrar.</p>}
          </div>
        </Card>

        {/* Para atender ahora */}
        <Card className="p-5">
          <h2 className="font-bold text-brand-dark mb-4">Para atender ahora</h2>
          <ul className="space-y-3">
            {tareas.map((t, i) => (
              <li key={i}>
                <Link href={t.href} className="group flex items-start gap-3 text-sm text-gray-600 hover:text-brand-dark">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                  <span className="group-hover:underline">{t.txt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
