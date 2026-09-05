import { PageHeader, Card, Badge, DemoNote } from "@/components/admin/ui";
import { CUSTOMERS, usd } from "@/lib/admin/data";

const etapaStyle: Record<string, string> = {
  nuevo: "bg-gray-100 text-gray-600",
  contactado: "bg-blue-100 text-blue-700",
  cotizado: "bg-amber-100 text-amber-700",
  ganado: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-600",
};

export default function ClientesPage() {
  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${CUSTOMERS.length} clientes en el directorio`} />
      <DemoNote>
        Datos de ejemplo. Se conectarán a <strong>Odoo (res.partner)</strong> +
        los leads del inbox cuando estén las credenciales.
      </DemoNote>

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
                <th className="px-5 py-3 font-semibold text-right">Etapa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {CUSTOMERS.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center text-sm font-bold shrink-0">
                        {c.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="text-brand-dark font-medium">{c.nombre}</p>
                        {c.empresa && <p className="text-gray-400 text-xs">{c.empresa}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    <p>{c.telefono}</p>
                    {c.email && <p className="text-gray-400 text-xs">{c.email}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.ciudad}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{c.pedidos}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-dark">{usd(c.total)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge className={etapaStyle[c.etapa]}>{c.etapa}</Badge>
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
