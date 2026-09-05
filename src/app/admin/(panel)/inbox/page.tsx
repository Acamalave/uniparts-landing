import { PageHeader, DemoNote } from "@/components/admin/ui";
import InboxApp from "@/components/admin/InboxApp";

export default function InboxPage() {
  return (
    <div>
      <PageHeader title="Inbox" subtitle="Bandeja unificada de mensajes (WhatsApp · Instagram · Messenger)" />
      <DemoNote>
        Interfaz de ejemplo. El envío/recepción real se activa al configurar
        <strong> WhatsApp Cloud API (Meta)</strong> para el número +58 414-4025540.
      </DemoNote>
      <InboxApp />
    </div>
  );
}
