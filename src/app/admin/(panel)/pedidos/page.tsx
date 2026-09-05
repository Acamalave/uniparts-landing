import { PageHeader, Card, Badge } from "@/components/admin/ui";
import { getRecentOrders, fmtOdooDate, fmtMoney, ORDER_STATE_LABEL, ORDER_STATE_STYLE } from "@/lib/admin/odoo-data";
import { listWebOrders } from "@/lib/admin/web-orders";
import { getSession } from "@/lib/admin/session";
import LiveNote from "@/components/admin/LiveNote";
import WebOrdersTable from "@/components/admin/WebOrdersTable";
import { fmtPrice } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await getSession();
  const canUpdate = ["superadmin", "owner", "gerente", "asesor"].includes(session?.rol ?? "");

  let webOrders: Awaited<ReturnType<typeof listWebOrders>> = [];
  let webError: string | null = null;
  try {
    webOrders = await listWebOrders(100);
  } catch (e) {
    webError = (e as Error).message;
  }
  const nuevos = webOrders.filter((o) => o.status === "nuevo").length;
  const webUsd = webOrders.filter((o) => !["cancelado"].includes(o.status)).reduce((s, o) => s + o.subtotal, 0);

  let orders: Awaited<ReturnType<typeof getRecentOrders>> = [];
  let error: string | null = null;
  try {
    orders = await getRecentOrders(60);
  } catch (e) {
    error = (e as Error).message;
  }
  const usdConfirmado = orders
    .filter((o) => ["sale", "done"].includes(o.state) && o.currency.toUpperCase() === "USD")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={`${webOrders.length} pedidos de la tienda web (${nuevos} nuevos · US$ ${fmtPrice(webUsd)} activos) · ${orders.length} últimos pedidos en Odoo`}
      />

      {/* Tienda web */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-bold text-brand-dark">Tienda web</h2>
        {nuevos > 0 && <Badge className="bg-brand-orange/10 text-brand-orange">{nuevos} por atender</Badge>}
      </div>
      {webError && <p className="text-sm text-red-600 mb-3">No se pudieron leer los pedidos web: {webError}</p>}
      <Card className="overflow-hidden mb-10">
        <WebOrdersTable orders={webOrders} canUpdate={canUpdate} />
      </Card>

      {/* Odoo */}
      <h2 className="font-bold text-brand-dark mb-3">Odoo · {fmtMoney(usdConfirmado)} confirmados en esta lista</h2>
      <LiveNote error={error} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
                <th className="px-5 py-3 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-semibold text-brand-dark">{o.name}</td>
                  <td className="px-5 py-3 text-brand-dark">{o.partner}</td>
                  <td className="px-5 py-3 text-gray-500">{fmtOdooDate(o.date)}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-dark whitespace-nowrap">{fmtMoney(o.total, o.currency)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge className={ORDER_STATE_STYLE[o.state] || "bg-gray-100 text-gray-600"}>{ORDER_STATE_LABEL[o.state] || o.state}</Badge>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !error && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Sin pedidos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
