"use client";

const stats = [
  { number: "500+", label: "Equipos vendidos", icon: "🏗️" },
  { number: "200+", label: "Clientes activos", icon: "🤝" },
  { number: "24h", label: "Tiempo de respuesta", icon: "⏱️" },
  { number: "100%", label: "Cobertura nacional", icon: "🇻🇪" },
];

const reasons = [
  {
    title: "Distribuidor autorizado Unilift",
    description:
      "Somos el distribuidor oficial en Venezuela de la marca Unilift, garantizando equipos originales con respaldo directo de fabrica.",
  },
  {
    title: "Servicio tecnico especializado",
    description:
      "Equipo de tecnicos capacitados para mantenimiento preventivo y correctivo. Soporte en toda Venezuela.",
  },
  {
    title: "Stock de repuestos permanente",
    description:
      "Amplio inventario de repuestos originales y alternativos listos para despacho inmediato.",
  },
  {
    title: "Tecnologia de litio",
    description:
      "Equipos de ultima generacion con baterias de litio: carga rapida, mayor duracion y cero mantenimiento de bateria.",
  },
];

export default function WhyUs() {
  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-brand-gray-light"
            >
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl sm:text-4xl font-black text-brand-orange">
                {stat.number}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Why us content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
              Por que elegirnos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2 mb-8">
              Tu aliado en logistica e{" "}
              <span className="text-brand-orange">industria</span>
            </h2>

            <div className="space-y-6">
              {reasons.map((reason, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-brand-orange"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark">{reason.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image / Visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
                alt="Equipo de trabajo Uniparts Andina"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-5 max-w-[220px]">
              <p className="text-brand-orange text-3xl font-black">Unilift</p>
              <p className="text-sm text-gray-500 mt-1">
                Distribuidor oficial en Venezuela
              </p>
            </div>
          </div>
        </div>

        {/* Industries served */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-8">
            Industrias que confian en nosotros
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-gray-400">
            {[
              "Manufactura",
              "Logistica",
              "Alimentos",
              "Construccion",
              "Farmaceutica",
              "Automotriz",
            ].map((industry) => (
              <span
                key={industry}
                className="text-sm font-semibold uppercase tracking-wide px-4 py-2 bg-gray-50 rounded-lg"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
