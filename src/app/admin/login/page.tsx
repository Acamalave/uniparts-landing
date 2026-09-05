import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Acceso · Uniparts Andina",
  robots: { index: false, follow: false },
};

export default async function AdminLogin() {
  // Si ya hay sesión válida, directo al panel.
  if (await getSession()) redirect("/admin");

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo-uniparts-white.png" alt="Uniparts Andina" width={180} height={48} className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-black text-brand-dark text-center">Centro de comando</h1>
          <p className="text-gray-500 text-sm text-center mt-1 mb-6">Acceso para el equipo</p>
          <LoginForm />
          <p className="text-[11px] text-gray-400 text-center mt-5">
            Acceso solo para usuarios autorizados de Uniparts Andina.
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Uniparts Andina · Centro de comando
        </p>
      </div>
    </div>
  );
}
