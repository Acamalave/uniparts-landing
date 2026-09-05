import { PageHeader, Card } from "@/components/admin/ui";
import { getTopCustomers, fmtMoney, fmtOdooDate } from "@/lib/admin/odoo-data";
import LiveNote from "@/components/admin/LiveNote";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  let customers: Awaited<ReturnType<typeof getTopCustomers>> = [];
  let error: string | null = null;
  try {
    customers = await getTopCustomers(80);
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} clientes de Uniparts Andina, ordenados por compras confirmadas (USD)`}
      />
      <LiveNote error={error} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Contacto</th>
                <th className="px-5 py-3 font-semibold">Ciudad</th>
                <th className="px-5 py-3 font-semibold text-center">Pedidos</th>
                <th className="px-5 py-3 font-semibold text-right">Total comprado</th>
                <th className="px-5 py-3 font-semibold text-right">Último pedido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center text-sm font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <p className="text-brand-dark font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    <p>{c.phone || "—"}</p>
                    {c.email && <p className="text-gray-400 text-xs">{c.email}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.city || "—"}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{c.pedidos}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-dark whitespace-nowrap">{fmtMoney(c.total)}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{fmtOdooDate(c.lastOrder)}</td>
                </tr>
              ))}
              {customers.length === 0 && !error && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Sin clientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
