import Link from "next/link";
import { IconForklift, IconGear } from "@/components/Icons";
import { storeHighlights, fmtPrice } from "@/lib/catalog";
import HeroShowcase from "@/components/HeroShowcase";

// Grano sutil (SVG inline) para dar textura al fondo oscuro.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Hero() {
  // Productos reales (con foto) que rotan en el showcase del hero.
  const showcase = storeHighlights(6)
    .filter((p) => p.image)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image as string,
      categoryLabel: p.categoryLabel,
      ref: p.ref,
      href: `/catalogo?cat=${p.category}`,
      price: p.price != null ? fmtPrice(p.price) : null,
    }));

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center bg-brand-dark text-white overflow-hidden"
    >
      {/* ---- Atmósfera ---- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_18%,rgba(250,108,24,0.38),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_8%_92%,rgba(250,108,24,0.14),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 opacity-[0.14] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN }} />
      <div
        aria-hidden
        className="absolute -bottom-4 -left-2 right-0 select-none pointer-events-none font-display font-black text-[23vw] leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.07)] whitespace-nowrap"
      >
        Uniparts
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(135deg,#FA6C18_0_22px,#1A1A1A_22px_44px)]" />

      {/* ---- Contenido ---- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24 lg:py-0 grid lg:grid-cols-12 gap-12 items-center">
        {/* Columna de texto */}
        <div className="lg:col-span-7 stagger-children">
          <div className="inline-flex items-center gap-2 border border-brand-orange/40 bg-brand-orange/10 text-brand-orange px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide">
            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
            Equipos nuevos y usados · Venezuela
          </div>

          <h1 className="mt-7 font-display font-extrabold leading-[0.95] tracking-tight text-5xl sm:text-6xl lg:text-7xl xl:text-[5.75rem]">
            <span className="block">Tu operación</span>
            <span className="block text-brand-orange drop-shadow-[0_0_38px_rgba(250,108,24,0.45)]">
              no puede parar
            </span>
          </h1>
          <div className="mt-6 h-1 w-24 bg-brand-orange rounded-full animate-grow-line" />

          <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl text-balance">
            Montacargas de litio y combustión y repuestos de alta calidad para
            todas las marcas.
          </p>

          {/* Dos opciones */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl">
            <Link
              href="/catalogo?grupo=equipos"
              className="group relative overflow-hidden rounded-2xl bg-brand-orange text-white p-6 transition-all duration-300 hover:-translate-y-1 shadow-[0_24px_60px_-18px_rgba(250,108,24,0.75)]"
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
              <span className="relative text-white/95"><IconForklift className="w-9 h-9" /></span>
              <span className="relative block mt-5 font-display font-bold text-2xl">Equipos</span>
              <span className="relative block mt-1 text-sm text-white/85">
                Montacargas, apiladores y transpaletas
              </span>
              <span className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </Link>

            <Link
              href="/catalogo?grupo=repuestos"
              className="group relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur text-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/70 hover:bg-white/[0.09]"
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-brand-orange/10 transition-transform duration-500 group-hover:scale-150" />
              <span className="relative text-brand-orange"><IconGear className="w-9 h-9" /></span>
              <span className="relative block mt-5 font-display font-bold text-2xl">Repuestos</span>
              <span className="relative block mt-1 text-sm text-white/70">
                Llantas, motor, eléctrico, frenos, hidráulico y más
              </span>
              <span className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:bg-brand-orange">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs sm:text-sm text-white/55 tracking-wide">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />Stock permanente</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />Litio y combustión</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />Sedes Valencia y Barcelona</span>
          </div>
        </div>

        {/* Showcase animado de productos (escritorio) */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <HeroShowcase items={showcase} />
          {/* Dato flotante */}
          <div className="absolute -right-6 top-10 bg-white text-brand-dark rounded-2xl px-5 py-4 shadow-2xl animate-fade-in-up">
            <p className="font-display font-extrabold text-2xl text-brand-orange leading-none">En stock</p>
            <p className="text-xs text-gray-500 mt-1.5">equipos y repuestos<br />listos para entrega</p>
          </div>
        </div>
      </div>
    </section>
  );
}
