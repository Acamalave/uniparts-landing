import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Image
              src="/logo-uniparts-white.png"
              alt="Uniparts Andina"
              width={160}
              height={44}
              className="h-10 w-auto mb-4"
            />
            <p className="text-white/50 text-sm leading-relaxed">
              Distribuidor autorizado Unilift en Venezuela. Montacargas de
              litio, repuestos y servicio tecnico especializado.
            </p>
            <p className="text-white/30 text-xs mt-3">RIF: J400235766</p>
          </div>

          {/* Equipos */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
              Equipos
            </h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>
                <a href="#equipos" className="hover:text-brand-orange transition-colors">
                  Montacargas de Litio
                </a>
              </li>
              <li>
                <a href="#equipos" className="hover:text-brand-orange transition-colors">
                  Apiladores Electricos
                </a>
              </li>
              <li>
                <a href="#equipos" className="hover:text-brand-orange transition-colors">
                  Transpaletas
                </a>
              </li>
              <li>
                <a href="#equipos" className="hover:text-brand-orange transition-colors">
                  Pasillo Angosto
                </a>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
              Servicios
            </h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>
                <a href="#repuestos" className="hover:text-brand-orange transition-colors">
                  Repuestos
                </a>
              </li>
              <li>
                <a href="#repuestos" className="hover:text-brand-orange transition-colors">
                  Cauchos
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-brand-orange transition-colors">
                  Servicio Tecnico
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-brand-orange transition-colors">
                  Mantenimiento
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>(0241) 7006020</li>
              <li>comercial@upandina.com</li>
              <li>Valencia, Carabobo, Venezuela</li>
              <li>Lun - Vie: 8AM - 5PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Uniparts Andina. Todos los
            derechos reservados.
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/unipartsandina"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-brand-orange transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
