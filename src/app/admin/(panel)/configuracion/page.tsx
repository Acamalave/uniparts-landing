import { PageHeader, Card, Badge, DemoNote } from "@/components/admin/ui";
import { roleBadge } from "@/lib/admin/config";
import { listAdmins } from "@/lib/admin/users";

const integraciones = [
  { nombre: "Odoo (ERP)", detalle: "Catálogo, pedidos, clientes, stock", estado: "pendiente" },
  { nombre: "Firebase", detalle: "Cotizaciones del formulario web", estado: "conectado" },
  { nombre: "WhatsApp Cloud API (Meta)", detalle: "Inbox real · +58 414-4025540", estado: "pendiente" },
  { nombre: "Login por usuario (roles)", detalle: "Firebase Auth + Firestore (admins)", estado: "conectado" },
];

const estadoStyle: Record<string, string> = {
  conectado: "bg-green-100 text-green-700",
  pendiente: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-600",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-brand-dark font-medium">{value}</p>
    </div>
  );
}

export default async function ConfiguracionPage() {
  const users = await listAdmins();
  return (
    <div>
      <PageHeader title="Configuración" subtitle="Datos del negocio e integraciones" />
      <DemoNote>
        Vista de solo lectura por ahora. La edición y el guardado se habilitan al
        conectar la base de datos del admin.
      </DemoNote>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Datos del negocio */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-5">Datos del negocio</h2>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Nombre comercial" value="Uniparts Andina, C.A." />
            <Field label="RIF" value="J-400235766" />
            <Field label="WhatsApp" value="+58 414-4025540" />
            <Field label="Teléfono" value="(0241) 7006020" />
            <Field label="Correo" value="comercial@upandina.com" />
            <Field label="Horario" value="Lun–Vie 7:30 AM – 4:30 PM" />
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-5">
            <Field label="Sede Valencia" value="C.C. SCI Galpones Tacarigua, Carabobo" />
            <Field label="Sede Oriente" value="C.I RVALL, Barcelona, Anzoátegui" />
          </div>
        </Card>

        {/* Integraciones */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-5">Integraciones</h2>
          <div className="space-y-3">
            {integraciones.map((i) => (
              <div key={i.nombre} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-dark">{i.nombre}</p>
                  <p className="text-xs text-gray-400">{i.detalle}</p>
                </div>
                <Badge className={estadoStyle[i.estado]}>{i.estado}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Redes */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-5">Redes sociales</h2>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <Field label="Instagram" value="instagram.com/uniparts_andina" />
            <Field label="Facebook" value="facebook.com/upandina" />
            <Field label="LinkedIn" value="linkedin.com/company/uniparts-andina" />
          </div>
        </Card>

        {/* Usuarios y roles */}
        <Card className="p-6">
          <h2 className="font-bold text-brand-dark mb-5">Usuarios y roles</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.uid}
                className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center text-sm font-bold shrink-0">
                    {u.nombre.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{u.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <Badge className={roleBadge[u.rol]}>{u.rol}</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Usuarios leídos en vivo desde Firebase. Próximo paso: invitar por
            correo, activar/desactivar y cambiar roles desde aquí.
          </p>
        </Card>
      </div>
    </div>
  );
}
