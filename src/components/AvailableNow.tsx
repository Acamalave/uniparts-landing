import Link from "next/link";
import { featuredProducts, products } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

export default function AvailableNow() {
  const items = featuredProducts(8);

  return (
    <section id="equipos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
              Disponibilidad inmediata
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2">
              Equipos disponibles ahora
            </h2>
            <p className="text-gray-500 mt-2">
              Una muestra de nuestro inventario. Consulta precios directamente.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-brand-orange hover:text-brand-orange-dark font-semibold text-sm flex items-center gap-1 shrink-0"
          >
            Ver catálogo completo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-8 py-4 rounded-xl text-base transition-all"
          >
            Ver los {products.length} productos del catálogo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
