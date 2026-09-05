import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Centro de comando · Uniparts Andina",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Protege todo el panel: sin sesión válida redirige a /admin/login.
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <AdminSidebar user={user} />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
