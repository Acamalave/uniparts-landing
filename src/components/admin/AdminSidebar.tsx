"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type SidebarUser = { nombre: string; rol: string; email: string };

const nav = [
  { href: "/admin", label: "Inicio", exact: true, icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1V10" />
  ) },
  { href: "/admin/pedidos", label: "Pedidos", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.6 3.5A1 1 0 006.3 18H17m0 0a2 2 0 100 4 2 2 0 000-4zm-9 2a2 2 0 11-4 0 2 2 0 014 0z" />
  ) },
  { href: "/admin/clientes", label: "Clientes", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-2-5.24" />
  ) },
  { href: "/admin/inbox", label: "Inbox", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.4A8 8 0 1121 12z" />
  ) },
  { href: "/admin/metricas", label: "Métricas", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3v18h18M8 15v3M13 10v8M18 6v12" />
  ) },
  { href: "/admin/salud", label: "Salud de datos", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12h4l2 5 4-12 2 7h6" />
  ) },
  { href: "/admin/configuracion", label: "Configuración", icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  ) },
];

export default function AdminSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const NavLinks = () => (
    <nav className="flex-1 px-3 space-y-1">
      {nav.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {item.icon}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Topbar móvil */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-brand-dark flex items-center justify-between px-4">
        <Image src="/logo-uniparts-white.png" alt="Uniparts" width={120} height={32} className="h-7 w-auto" />
        <button onClick={() => setOpen(!open)} className="text-white p-2" aria-label="Menú">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-dark flex flex-col py-6 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 mb-8 flex items-center gap-2">
          <Image src="/logo-uniparts-white.png" alt="Uniparts Andina" width={150} height={40} className="h-8 w-auto" />
        </div>
        <p className="px-6 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
          Centro de comando
        </p>
        <NavLinks />
        <div className="px-5 pt-4 mt-auto border-t border-white/10">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="w-9 h-9 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center text-sm font-bold">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.nombre}</p>
              <p className="text-white/40 text-xs truncate">{user.rol}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full text-center text-xs text-white/40 hover:text-white py-2"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Backdrop móvil */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
