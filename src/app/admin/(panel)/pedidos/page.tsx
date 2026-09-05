import { PageHeader, Card, Badge, DemoNote } from "@/components/admin/ui";
import { ORDERS, usd, orderStateStyle } from "@/lib/admin/data";

const canalStyle: Record<string, string> = {
  web: "bg-gray-100 text-gray-600",
  whatsapp: "bg-green-100 text-green-700",
  mostrador: "bg-blue-100 text-blue-700",
};

export default function PedidosPage() {
  const total = ORDERS.filter((o) => o.estado !== "cancelado").reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <PageHeader title="Pedidos" subtitle={`${ORDERS.length} pedidos · ${usd(total)} en total`} />
      <DemoNote>
        Datos de ejemplo. Se conectarán a <strong>Odoo (sale.order)</strong> de la
        compañía Uniparts Andina cuando esté la API key.
      </DemoNote>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Canal</th>
                <th className="px-5 py-3 font-semibold text-center">Ítems</th>
                <th className="px-5 py-3 font-semibold text-right">Total</th>
                <th className="px-5 py-3 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-semibold text-brand-dark">{o.ref}</td>
                  <td className="px-5 py-3">
                    <p className="text-brand-dark">{o.cliente}</p>
                    {o.empresa && <p className="text-gray-400 text-xs">{o.empresa}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(o.fecha).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={canalStyle[o.canal]}>{o.canal}</Badge>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-600">{o.items}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-dark">{usd(o.total)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge className={orderStateStyle[o.estado]}>{o.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
