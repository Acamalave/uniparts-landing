"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type HeaderUser = { nombre: string; rol: string; email: string };

const nav = [
  { href: "/admin", label: "Inicio", exact: true, d: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1V10" },
  { href: "/admin/pedidos", label: "Pedidos", d: "M6 2h12l2 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7l2-5zM4 7h16M9 11a3 3 0 006 0" },
  { href: "/admin/clientes", label: "Clientes", d: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-2-5.24" },
  { href: "/admin/inbox", label: "Inbox", d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { href: "/admin/metricas", label: "Métricas", d: "M3 3v18h18M8 15v3M13 10v8M18 6v12" },
  { href: "/admin/salud", label: "Salud de datos", d: "M3 12h4l2 5 4-12 2 7h6" },
  { href: "/admin/configuracion", label: "Configuración", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

const Icon = ({ d, className = "w-[18px] h-[18px]" }: { d: string; className?: string }) => (
  <svg className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);

export default function AdminHeader({ user, pending = 0 }: { user: HeaderUser; pending?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-orange text-white shadow-lg shadow-black/10">
      <div className="relative h-16 flex items-center">
        {/* Marca: bloque oscuro que se funde con el naranja */}
        <Link
          href="/admin"
          className="relative h-full flex items-center gap-3 pl-5 pr-12 bg-brand-dark shrink-0 after:absolute after:inset-y-0 after:right-0 after:w-12 after:bg-gradient-to-r after:from-brand-dark after:to-brand-orange"
        >
          <Image src="/logo-uniparts-white.png" alt="UniParts" width={110} height={30} className="h-7 w-auto relative z-10" priority />
          <span className="hidden xl:inline relative z-10 font-bold text-[15px] tracking-tight whitespace-nowrap">
            Centro de comando
          </span>
        </Link>

        {/* Menú en píldoras (escritorio). `mx-auto` interno: centra si cabe, y si no, scroll desde el inicio. */}
        <nav className="hidden lg:flex flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1 mx-auto px-3">
            {nav.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    active ? "bg-white text-brand-orange shadow-md" : "text-white/95 hover:bg-white/15"
                  }`}
                >
                  <Icon d={item.d} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="flex-1 lg:hidden" />

        {/* Derecha: campana, usuario, salir, hamburguesa (móvil) */}
        <div className="flex items-center gap-3 sm:gap-4 pr-4 sm:pr-5 shrink-0">
          <button className="relative p-1.5 rounded-full hover:bg-white/15 transition-colors" aria-label="Notificaciones">
            <Icon d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" className="w-5 h-5" />
            {pending > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-brand-orange">
                {pending}
              </span>
            )}
          </button>

          <div className="hidden md:block text-right leading-tight">
            <p className="text-sm font-bold">{user.nombre}</p>
            <p className="text-[11px] text-white/80">
              {user.email} · {user.rol}
            </p>
          </div>
          <div className="md:hidden w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {user.nombre.charAt(0).toUpperCase()}
          </div>

          <button onClick={logout} className="flex items-center gap-1.5 text-sm font-medium hover:text-white/80 transition-colors" aria-label="Cerrar sesión">
            <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-1.5 rounded-full hover:bg-white/15 transition-colors"
            aria-label="Menú"
            aria-expanded={open}
          >
            <Icon d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} className="w-6 h-6" />
          </button>
        </div>

        {/* Desplegable móvil/tablet */}
        {open && (
          <div className="lg:hidden absolute inset-x-0 top-full bg-brand-dark border-t border-white/10 shadow-2xl">
            <nav className="px-3 py-2 grid gap-1">
              {nav.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      active ? "bg-brand-orange text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon d={item.d} className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
