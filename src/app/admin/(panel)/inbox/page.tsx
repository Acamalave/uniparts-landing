import { PageHeader } from "@/components/admin/ui";
import InboxApp from "@/components/admin/InboxApp";
import { metaConfigured } from "@/lib/inbox/meta";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  const meta = metaConfigured();
  return (
    <div>
      <PageHeader title="Inbox" subtitle="Bandeja unificada de mensajes (Messenger · Instagram · WhatsApp)" />
      {!meta && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="mt-0.5">⚠️</span>
          <span>
            Messenger e Instagram todavía no están conectados: faltan las credenciales de Meta. Los pasos y el token de verificación están en{" "}
            <Link href="/admin/configuracion" className="font-semibold underline">Configuración → Meta</Link>. WhatsApp Cloud API queda para la siguiente etapa.
          </span>
        </div>
      )}
      <InboxApp />
    </div>
  );
}
