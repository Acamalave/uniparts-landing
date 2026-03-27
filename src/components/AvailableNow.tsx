"use client";

const whatsappNumber = "584147006020";

const equipment = [
  {
    name: "Montacargas Contrabalanceado Litio",
    brand: "Unilift",
    capacity: "2.0 Ton",
    type: "Electrico Litio",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80",
    badge: "EN STOCK",
    features: ["Bateria de litio", "Carga rapida", "Bajo mantenimiento"],
  },
  {
    name: "Apilador Electrico US20LI",
    brand: "Unilift",
    capacity: "2.0 Ton",
    type: "Electrico",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
    badge: "EN STOCK",
    features: ["5m elevacion", "Pasillo angosto", "Operacion silenciosa"],
  },
  {
    name: "Montacargas Three Wheel",
    brand: "Unilift",
    capacity: "1.5 - 2.0 Ton",
    type: "Electrico Litio",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    badge: "DISPONIBLE",
    features: ["3 ruedas", "Maxima maniobrabilidad", "Interior/Exterior"],
  },
  {
    name: "Transpaleta Electrica",
    brand: "Unilift",
    capacity: "2.5 Ton",
    type: "Electrica",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80",
    badge: "EN STOCK",
    features: ["Carga/descarga rapida", "Compacta", "Facil operacion"],
  },
];

export default function AvailableNow() {
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
              Listos para entrega. Consulta precios directamente.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero conocer todo el catalogo de equipos disponibles")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange hover:text-brand-orange-dark font-semibold text-sm flex items-center gap-1 shrink-0"
          >
            Ver catalogo completo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipment.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-orange/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  {item.badge}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-brand-orange text-xs font-semibold uppercase tracking-wide">
                  {item.brand}
                </p>
                <h3 className="text-lg font-bold text-brand-dark mt-1 leading-tight">
                  {item.name}
                </h3>

                <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                    {item.capacity}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                    {item.type}
                  </span>
                </div>

                <ul className="mt-4 space-y-1">
                  {item.features.map((f, j) => (
                    <li key={j} className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-brand-orange shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, me interesa el ${item.name} (${item.capacity}) que vi disponible en su pagina. Me pueden enviar precio y condiciones?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full bg-brand-dark hover:bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  Consultar precio
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
