import Link from "next/link";
import { PageHeader, Kpi, Card, Badge, DemoNote } from "@/components/admin/ui";
import { ORDERS, CUSTOMERS, metrics, usd, orderStateStyle, dataHealth } from "@/lib/admin/data";

export default function AdminHome() {
  const m = metrics();
  const health = dataHealth();
  const cotizacionesAbiertas = CUSTOMERS.filter((c) => c.etapa === "cotizado").length;
  const recientes = ORDERS.slice(0, 5);

  const tareas = [
    { txt: `${m.leadsSinContactar} lead(s) sin contactar`, href: "/admin/clientes" },
    { txt: `${cotizacionesAbiertas} cotización(es) abiertas por seguir`, href: "/admin/clientes" },
    { txt: `${health.sinImagen} productos sin foto en el catálogo`, href: "/admin/salud" },
    { txt: "3 conversaciones sin responder en el inbox", href: "/admin/inbox" },
  ];

  return (
    <div>
      <PageHeader
        title="Inicio"
        subtitle="Resumen operativo de Uniparts Andina"
      />
      <DemoNote>
        Vista con <strong>datos de ejemplo</strong>. Al conectar Odoo (pedidos,
        clientes, ventas) y WhatsApp, estos números pasan a ser reales
        automáticamente.
      </DemoNote>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Ventas del mes" value={usd(m.ventasMes)} accent="green" hint="Pedidos no cancelados" />
        <Kpi label="Pedidos del mes" value={String(m.pedidosMes)} accent="dark" />
        <Kpi label="Leads sin contactar" value={String(m.leadsSinContactar)} accent="amber" hint="Requieren seguimiento" />
        <Kpi label="Productos en catálogo" value={String(health.total)} accent="orange" hint="Sincronizados de Odoo" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-dark">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-brand-orange text-sm font-semibold hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recientes.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-dark">{o.ref}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {o.cliente}
                    {o.empresa ? ` · ${o.empresa}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-brand-dark">{usd(o.total)}</p>
                  <Badge className={orderStateStyle[o.estado]}>{o.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Para atender ahora */}
        <Card className="p-5">
          <h2 className="font-bold text-brand-dark mb-4">Para atender ahora</h2>
          <ul className="space-y-3">
            {tareas.map((t, i) => (
              <li key={i}>
                <Link
                  href={t.href}
                  className="group flex items-start gap-3 text-sm text-gray-600 hover:text-brand-dark"
                >
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
