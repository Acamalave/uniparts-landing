"use client";

const whatsappNumber = "584147006020";

const options = [
  {
    title: "Compra",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Adquiere tu equipo nuevo con garantia completa Unilift",
    features: [
      "Equipo 100% tuyo",
      "Garantia de fabrica",
      "Soporte tecnico incluido",
      "Repuestos garantizados",
    ],
    ideal: "Uso continuo, +3 anos",
    cta: "Cotizar compra",
    ctaMsg: "Hola, quiero cotizar la compra de un montacargas nuevo",
    highlight: true,
  },
  {
    title: "Alquiler",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Equipo listo cuando lo necesites, sin compromiso a largo plazo",
    features: [
      "Sin inversion inicial alta",
      "Mantenimiento incluido",
      "Reemplazo inmediato",
      "Ideal para temporadas altas",
    ],
    ideal: "Proyectos puntuales",
    cta: "Cotizar alquiler",
    ctaMsg: "Hola, necesito cotizar el alquiler de un montacargas",
    highlight: false,
  },
  {
    title: "Leasing",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: "Cuotas flexibles con opcion de compra al final del contrato",
    features: [
      "Cuotas mensuales fijas",
      "Beneficio fiscal",
      "Opcion de compra",
      "Actualizacion de flota",
    ],
    ideal: "Flexibilidad financiera",
    cta: "Consultar opciones",
    ctaMsg: "Hola, me interesa conocer las opciones de leasing para montacargas",
    highlight: false,
  },
];

export default function CompareOptions() {
  return (
    <section className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
            Opciones flexibles
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Compra, alquila o leasing
          </h2>
          <p className="text-white/50 mt-3 max-w-lg mx-auto">
            Elige la modalidad que mejor se adapte a tu operacion y presupuesto
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {options.map((option, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all ${
                option.highlight
                  ? "bg-brand-orange text-white ring-2 ring-brand-orange scale-[1.02]"
                  : "bg-white/5 text-white border border-white/10 hover:border-brand-orange/50"
              }`}
            >
              {option.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-brand-orange text-xs font-bold px-4 py-1 rounded-full">
                  MAS POPULAR
                </span>
              )}

              <div className={`mb-4 ${option.highlight ? "text-white" : "text-brand-orange"}`}>
                {option.icon}
              </div>

              <h3 className="text-2xl font-bold mb-2">{option.title}</h3>
              <p className={`text-sm mb-6 ${option.highlight ? "text-white/80" : "text-white/50"}`}>
                {option.description}
              </p>

              <ul className="space-y-3 mb-6">
                {option.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <svg
                      className={`w-4 h-4 shrink-0 ${option.highlight ? "text-white" : "text-brand-orange"}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    <span className={option.highlight ? "text-white/90" : "text-white/70"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <p className={`text-xs mb-6 ${option.highlight ? "text-white/70" : "text-white/40"}`}>
                Ideal para: {option.ideal}
              </p>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(option.ctaMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center font-bold py-3.5 rounded-xl text-sm transition-all ${
                  option.highlight
                    ? "bg-white text-brand-orange hover:bg-white/90"
                    : "bg-brand-orange hover:bg-brand-orange-dark text-white"
                }`}
              >
                {option.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
