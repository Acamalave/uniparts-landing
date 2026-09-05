import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/admin/session";
import { pendingTasks } from "@/lib/admin/data";

export const metadata: Metadata = {
  title: "Centro de comando · Uniparts Andina",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Protege todo el panel: sin sesión válida redirige a /admin/login.
  const user = await requireAdmin();
  const pending = pendingTasks().length;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <AdminHeader user={user} pending={pending} />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
