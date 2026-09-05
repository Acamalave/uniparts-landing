import type { MetaStatus } from "@/lib/inbox/meta";
import { Badge } from "@/components/admin/ui";

/** Tarjeta de Configuración: estado de Messenger/Instagram y guía para conectar la app de Meta. */
export default function MetaSetup({ status, webhookUrl }: { status: MetaStatus; webhookUrl: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-brand-dark">Meta · Messenger e Instagram</h2>
        <Badge className={status.configured && !status.error ? "bg-green-100 text-green-700" : status.error ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}>
          {status.configured && !status.error ? "conectado" : status.error ? "error" : "pendiente"}
        </Badge>
      </div>

      {status.page && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
          Página <strong>{status.page.name}</strong> (ID {status.page.id})
          {status.page.instagram ? <> · Instagram <strong>@{status.page.instagram}</strong></> : <> · sin cuenta de Instagram vinculada</>}
        </div>
      )}
      {status.error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          Meta respondió con error: {status.error}. Revisa que el token de la página sea válido y tenga los permisos de mensajería.
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-1">URL del webhook (pegar en Meta → Webhooks → Callback URL)</p>
          <code className="block bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-brand-dark break-all select-all">{webhookUrl}</code>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Token de verificación (pegar en Meta → Verify token)</p>
          <code className="block bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs text-brand-dark break-all select-all">
            {status.verifyToken || "Falta META_VERIFY_TOKEN en el servidor"}
          </code>
        </div>
        {!status.configured && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Variables que faltan en Vercel</p>
            <div className="flex flex-wrap gap-1.5">
              {status.missing.map((m) => (
                <code key={m} className="bg-amber-50 border border-amber-100 text-amber-800 rounded px-2 py-0.5 text-xs">{m}</code>
              ))}
            </div>
          </div>
        )}
      </div>

      <details className="mt-5 text-sm text-gray-600">
        <summary className="cursor-pointer font-semibold text-brand-dark">Cómo conectar (una sola vez, ~15 min)</summary>
        <ol className="list-decimal pl-5 mt-3 space-y-1.5">
          <li>En <strong>developers.facebook.com</strong> crea una app de tipo <em>Business</em> (o usa la existente) y agrega los productos <strong>Messenger</strong> e <strong>Instagram</strong>.</li>
          <li>En Messenger → Configuración, vincula la página de Facebook de Uniparts y genera el <strong>token de acceso de página</strong> (permisos <code>pages_messaging</code>, <code>pages_manage_metadata</code>, <code>instagram_basic</code>, <code>instagram_manage_messages</code>). Para que no caduque, genera el token con un <em>usuario del sistema</em> del Business Manager.</li>
          <li>La cuenta de Instagram debe ser <strong>profesional</strong> y estar vinculada a esa página; en Instagram → Configuración → Mensajes, activa <em>Permitir acceso a mensajes</em>.</li>
          <li>En Webhooks, pega la URL y el token de verificación de arriba; suscribe los campos <code>messages</code> y <code>messaging_postbacks</code> tanto en <em>Page</em> como en <em>Instagram</em>.</li>
          <li>En Configuración de la app → Básica copia el <strong>App Secret</strong>. Carga en Vercel: <code>META_APP_SECRET</code>, <code>META_PAGE_ACCESS_TOKEN</code>, <code>META_PAGE_ID</code> y vuelve a desplegar.</li>
          <li>Mientras la app esté en modo desarrollo solo llegan mensajes de los administradores/testers de la app; para el público hay que pasar la <strong>revisión de Meta</strong> con esos permisos.</li>
        </ol>
      </details>
    </div>
  );
}
