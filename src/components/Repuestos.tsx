"use client";
import { IconTire, IconBattery, IconHydraulic, IconEngine, IconElectric, IconChain } from "@/components/Icons";

const whatsappNumber = "584147006020";

const categories = [
  {
    name: "Cauchos Solidos",
    description: "Alta duracion para todo tipo de montacargas",
    icon: <IconTire className="w-7 h-7" />,
    msg: "Hola, necesito cotizar cauchos solidos para montacargas",
  },
  {
    name: "Baterias de Litio",
    description: "Tecnologia de ultima generacion",
    icon: <IconBattery className="w-7 h-7" />,
    msg: "Hola, necesito cotizar baterias de litio para montacargas",
  },
  {
    name: "Sistema Hidraulico",
    description: "Bombas, cilindros, mangueras y sellos",
    icon: <IconHydraulic className="w-7 h-7" />,
    msg: "Hola, necesito repuestos del sistema hidraulico",
  },
  {
    name: "Motor y Transmision",
    description: "Repuestos originales y alternativos",
    icon: <IconEngine className="w-7 h-7" />,
    msg: "Hola, necesito repuestos de motor y transmision",
  },
  {
    name: "Sistema Electrico",
    description: "Contactores, cables, controladores",
    icon: <IconElectric className="w-7 h-7" />,
    msg: "Hola, necesito repuestos del sistema electrico",
  },
  {
    name: "Cadenas y Rodillos",
    description: "Para mastiles y sistemas de elevacion",
    icon: <IconChain className="w-7 h-7" />,
    msg: "Hola, necesito cadenas y rodillos para montacargas",
  },
];

export default function Repuestos() {
  return (
    <section id="repuestos" className="py-20 bg-brand-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
            Stock permanente
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2">
            Repuestos y cauchos
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Originales y alternativos para todas las marcas. Cotiza en menos de
            2 horas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <a
              key={i}
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(cat.msg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 bg-white p-6 rounded-xl border border-gray-100 hover:border-brand-orange/30 hover:shadow-lg transition-all"
            >
              <span className="shrink-0 text-brand-orange">{cat.icon}</span>
              <div>
                <h3 className="font-bold text-brand-dark group-hover:text-brand-orange transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                <span className="text-brand-orange text-xs font-semibold mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Consultar disponibilidad
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Guarantee banner */}
        <div className="mt-12 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <svg className="w-12 h-12 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-brand-dark text-lg">
              Garantia en todos nuestros repuestos
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Trabajamos con repuestos originales y alternativos certificados.
              Soporte tecnico nacional para instalacion y mantenimiento.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, necesito cotizar repuestos para mi montacargas")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            Cotizar repuestos
          </a>
        </div>
      </div>
    </section>
  );
}
