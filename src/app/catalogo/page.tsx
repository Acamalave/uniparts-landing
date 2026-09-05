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
    "Más de 2.500 repuestos y equipos para montacargas con stock real en Venezuela: motor, sistema eléctrico, dirección, frenos, mástil, hidráulico, transmisión, filtros, llantas y cauchos (6.00-9, 7.00-12, 6.50-10), cilindros GLP, montacargas y transpaletas.",
  keywords:
    "repuestos montacargas Venezuela, catálogo repuestos montacargas, llantas montacargas 6.00-9 7.00-12 6.50-10, repuestos Toyota Hyster Clark montacargas, montacargas Unilift, transpaleta manual, cilindro GLP montacargas, filtros montacargas",
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
              {products.length.toLocaleString("es-VE")} productos con stock real
              en nuestros almacenes: montacargas y transpaletas, llantas y
              cauchos, y repuestos de motor, sistema eléctrico, dirección,
              frenos, mástil, hidráulico, transmisión y más. Busca por
              referencia, modelo o marca, agrega al carrito y paga en minutos.
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
