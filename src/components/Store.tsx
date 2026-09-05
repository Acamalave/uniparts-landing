import Link from "next/link";
import type { ComponentType } from "react";
import { products, CATEGORIES, categoryCover, storeHighlights } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import { IconForklift, IconPallet, IconTire, IconHydraulic, IconGear, IconWrench } from "@/components/Icons";

// Icono de respaldo por categoría cuando ningún producto tiene foto real.
const FALLBACK_ICON: Record<string, ComponentType<{ className?: string }>> = {
  montacargas: IconForklift,
  transpaletas: IconPallet,
  llantas: IconTire,
  "cilindros-gas": IconHydraulic,
  asientos: IconGear,
  accesorios: IconWrench,
};

export default function Store() {
  const highlights = storeHighlights(8);

  return (
    <section id="tienda" className="relative py-24 bg-white overflow-hidden">
      {/* Acento de fondo: palabra fantasma en trazo, muy sutil */}
      <div
        aria-hidden
        className="absolute -top-6 right-0 select-none pointer-events-none font-display font-black text-[14vw] leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(26,26,26,0.06)] whitespace-nowrap"
      >
        TIENDA
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-brand-orange font-semibold text-xs uppercase tracking-[0.22em]">
              <span className="w-8 h-px bg-brand-orange" />
              Nuestra tienda online
            </span>
            <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-[1.02] tracking-tight text-brand-dark">
              Todo lo que mueve tu operación,{" "}
              <span className="text-brand-orange">en un solo lugar</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl">
              Equipos y repuestos de nuestro inventario real. Elige lo que
              necesitas, consulta el precio y te respondemos por WhatsApp.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start lg:self-auto rounded-full bg-brand-gray-light border border-gray-200 px-4 py-2 text-sm text-gray-600 shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Catálogo sincronizado desde Odoo · {products.length} productos
          </span>
        </div>

        {/* Categorías */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => {
            const cover = categoryCover(c.key);
            const n = products.filter((p) => p.category === c.key).length;
            const Fallback = FALLBACK_ICON[c.key] ?? IconGear;
            return (
              <Link
                key={c.key}
                href={`/catalogo?cat=${c.key}`}
                className="group relative rounded-2xl bg-brand-gray-light border border-gray-100 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-orange/40"
              >
                <div className="aspect-square rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  {cover?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.image}
                      alt={c.label}
                      loading="lazy"
                      className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Fallback className="w-16 h-16 text-brand-orange/80 transition-transform duration-500 group-hover:scale-110" />
                  )}
                </div>
                <p className="mt-4 font-display font-bold text-sm text-brand-dark leading-tight">{c.label}</p>
                <p className="text-xs text-gray-500 mt-1">{n} {n === 1 ? "producto" : "productos"}</p>
                <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Lo más buscado */}
        <div className="mt-16 flex items-end justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-2xl text-brand-dark">Lo más buscado</h3>
            <p className="text-gray-500 text-sm mt-1">Una muestra de equipos y repuestos con foto y referencia.</p>
          </div>
          <Link href="/catalogo" className="text-brand-orange font-semibold text-sm hover:underline shrink-0 flex items-center gap-1">
            Ver toda la tienda
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {highlights.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Cierre */}
        <div className="mt-14 relative overflow-hidden rounded-3xl bg-brand-dark text-white p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_92%_50%,rgba(250,108,24,0.4),transparent_55%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(135deg,#FA6C18_0_18px,transparent_18px_36px)] opacity-70" />
          <div className="relative">
            <p className="font-display font-bold text-2xl sm:text-3xl leading-tight">
              Explora los {products.length} productos de la tienda
            </p>
            <p className="text-white/60 mt-2 max-w-xl">
              Montacargas, transpaletas, llantas, cilindros GLP, asientos y
              accesorios. Stock real y respuesta en minutos.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/catalogo" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-7 py-4 rounded-xl text-center transition-all">
              Ver toda la tienda
            </Link>
            <Link href="#buscador" className="bg-white/10 border border-white/20 hover:bg-white/15 font-semibold px-7 py-4 rounded-xl text-center transition-all">
              Ayúdame a elegir
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
