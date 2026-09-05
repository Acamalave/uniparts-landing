import { PageHeader, Card, Badge } from "@/components/admin/ui";
import { getRecentOrders, fmtOdooDate, fmtMoney, ORDER_STATE_LABEL, ORDER_STATE_STYLE } from "@/lib/admin/odoo-data";
import LiveNote from "@/components/admin/LiveNote";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
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
        subtitle={`Últimos ${orders.length} pedidos de Uniparts Andina · ${fmtMoney(usdConfirmado)} confirmados en esta lista`}
      />
      <LiveNote error={error} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
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
                  <td className="px-5 py-3 text-right font-bold text-brand-dark whitespace-nowrap">
                    {fmtMoney(o.total, o.currency)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Badge className={ORDER_STATE_STYLE[o.state] || "bg-gray-100 text-gray-600"}>
                      {ORDER_STATE_LABEL[o.state] || o.state}
                    </Badge>
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
