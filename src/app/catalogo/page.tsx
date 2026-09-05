import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CatalogBrowser from "@/components/CatalogBrowser";
import { products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catálogo de montacargas, repuestos y llantas | Uniparts Andina",
  description:
    "Catálogo de montacargas de litio y combustión (nuevos y usados), transpaletas manuales Megalift, llantas y cauchos (6.00-9, 7.00-12, 6.50-10), cilindros de gas GLP, asientos y accesorios en Venezuela.",
  keywords:
    "catálogo montacargas, montacargas usados Venezuela, transpaleta manual Megalift, llantas montacargas 6.00-9 7.00-12 6.50-10, cilindro de gas GLP montacargas, asientos montacargas, repuestos montacargas",
};

export default function CatalogoPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-gray-light min-h-screen pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
              Catálogo completo
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2">
              Equipos, repuestos y llantas
            </h1>
            <p className="text-gray-500 mt-3 max-w-2xl">
              {products.length} productos disponibles: montacargas nuevos y
              usados, transpaletas manuales Megalift, llantas y cauchos,
              cilindros de gas GLP, asientos y accesorios. Consulta precio y
              disponibilidad por WhatsApp.
            </p>
          </div>

          {/* useSearchParams (filtro ?grupo=) requiere Suspense en páginas estáticas */}
          <Suspense fallback={<p className="text-gray-400 text-sm">Cargando catálogo…</p>}>
            <CatalogBrowser />
          </Suspense>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
