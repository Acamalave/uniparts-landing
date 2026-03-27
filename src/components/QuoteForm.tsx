"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function QuoteForm() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    whatsapp: "",
    necesidad: "",
    urgencia: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await addDoc(collection(db, "cotizaciones"), {
        ...form,
        createdAt: serverTimestamp(),
        status: "nuevo",
      });
      setStatus("sent");
      setForm({ nombre: "", empresa: "", whatsapp: "", necesidad: "", urgencia: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contacto" className="py-20 bg-brand-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
              Cotizacion rapida
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2 mb-3">
              Solicita tu cotizacion
            </h2>
            <p className="text-gray-500 mb-8">
              Completa el formulario y te respondemos en menos de 2 horas en
              horario laboral.
            </p>

            {status === "sent" ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  Cotizacion enviada
                </h3>
                <p className="text-green-600 text-sm">
                  Nuestro equipo se pondra en contacto contigo a la brevedad.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 text-green-700 underline text-sm"
                >
                  Enviar otra cotizacion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={form.empresa}
                      onChange={handleChange}
                      placeholder="Nombre de tu empresa"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="04XX-XXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Que necesitas? *
                  </label>
                  <select
                    name="necesidad"
                    required
                    value={form.necesidad}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all bg-white"
                  >
                    <option value="">Selecciona una opcion</option>
                    <option value="montacargas-nuevo">Montacargas nuevo</option>
                    <option value="apilador">Apilador electrico</option>
                    <option value="transpaleta">Transpaleta</option>
                    <option value="repuestos">Repuestos</option>
                    <option value="cauchos">Cauchos</option>
                    <option value="servicio-tecnico">Servicio tecnico</option>
                    <option value="alquiler">Alquiler de equipo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgencia
                  </label>
                  <select
                    name="urgencia"
                    value={form.urgencia}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all bg-white"
                  >
                    <option value="">Selecciona</option>
                    <option value="inmediato">Inmediato</option>
                    <option value="1-2-semanas">1 a 2 semanas</option>
                    <option value="1-3-meses">1 a 3 meses</option>
                    <option value="planificando">Estoy planificando</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar cotizacion"
                  )}
                </button>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    Error al enviar. Por favor intenta de nuevo o contactanos por WhatsApp.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Contact info + Map */}
          <div className="space-y-6">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden h-64 lg:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3927.1!2d-68.01!3d10.18!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDEwJzQ4LjAiTiA2OMKwMDAnMzYuMCJX!5e0!3m2!1ses!2sve!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicacion Uniparts Andina"
              />
            </div>

            {/* Contact cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <h4 className="font-bold text-brand-dark text-sm">Direccion</h4>
                <p className="text-gray-500 text-xs mt-1">
                  Local #2, Av. 67, C.C. SCI de Galpones Tacarigua, PB. Valencia
                  2003, Carabobo
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-brand-dark text-sm">Telefono</h4>
                <p className="text-gray-500 text-xs mt-1">(0241) 7006020</p>
                <p className="text-gray-500 text-xs">comercial@upandina.com</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                </div>
                <h4 className="font-bold text-brand-dark text-sm">Horario</h4>
                <p className="text-gray-500 text-xs mt-1">
                  Lunes a Viernes: 8:00 AM - 5:00 PM
                </p>
                <p className="text-gray-500 text-xs">Sabados: 8:00 AM - 12:00 PM</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-[#25D366]/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <h4 className="font-bold text-brand-dark text-sm">WhatsApp</h4>
                <p className="text-gray-500 text-xs mt-1">Ventas: +58 414-7006020</p>
                <p className="text-gray-500 text-xs">Repuestos: +58 414-7006020</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
