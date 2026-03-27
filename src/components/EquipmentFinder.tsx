"use client";
import { useState } from "react";

const whatsappNumber = "584147006020";

const steps = [
  {
    question: "Que tipo de equipo necesitas?",
    options: [
      { label: "Montacargas", icon: "🏗️", value: "montacargas" },
      { label: "Apilador", icon: "📦", value: "apilador" },
      { label: "Transpaleta", icon: "🔄", value: "transpaleta" },
      { label: "Repuestos / Cauchos", icon: "⚙️", value: "repuestos" },
    ],
  },
  {
    question: "Para que tipo de operacion?",
    options: [
      { label: "Almacen / Interior", icon: "🏭", value: "almacen" },
      { label: "Exterior / Patio", icon: "🌤️", value: "exterior" },
      { label: "Pasillo angosto", icon: "📐", value: "pasillo-angosto" },
      { label: "Carga pesada", icon: "💪", value: "carga-pesada" },
    ],
  },
  {
    question: "Que capacidad de carga requieres?",
    options: [
      { label: "Hasta 2 toneladas", icon: "1️⃣", value: "hasta-2t" },
      { label: "2 a 5 toneladas", icon: "2️⃣", value: "2-5t" },
      { label: "Mas de 5 toneladas", icon: "3️⃣", value: "mas-5t" },
      { label: "No estoy seguro", icon: "❓", value: "no-seguro" },
    ],
  },
];

export default function EquipmentFinder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  const getWhatsAppMessage = () => {
    const equipoMap: Record<string, string> = {
      montacargas: "Montacargas",
      apilador: "Apilador electrico",
      transpaleta: "Transpaleta",
      repuestos: "Repuestos/Cauchos",
    };
    const usoMap: Record<string, string> = {
      almacen: "Almacen/Interior",
      exterior: "Exterior/Patio",
      "pasillo-angosto": "Pasillo angosto",
      "carga-pesada": "Carga pesada",
    };
    const capMap: Record<string, string> = {
      "hasta-2t": "Hasta 2 ton",
      "2-5t": "2 a 5 ton",
      "mas-5t": "Mas de 5 ton",
      "no-seguro": "Por definir",
    };

    return encodeURIComponent(
      `Hola! Estoy buscando:\n` +
        `- Equipo: ${equipoMap[answers[0]] || answers[0]}\n` +
        `- Uso: ${usoMap[answers[1]] || answers[1]}\n` +
        `- Capacidad: ${capMap[answers[2]] || answers[2]}\n\n` +
        `Me pueden asesorar?`
    );
  };

  return (
    <section id="buscador" className="py-20 bg-brand-gray-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-brand-orange font-semibold text-sm uppercase tracking-widest">
            Exclusivo en Venezuela
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2">
            Encuentra tu equipo ideal
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Responde 3 preguntas y te recomendamos la mejor solucion para tu
            operacion
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100">
          {!showResult ? (
            <>
              {/* Progress bar */}
              <div className="flex gap-2 mb-8">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i <= currentStep ? "bg-brand-orange" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Step indicator */}
              <p className="text-brand-orange text-sm font-medium mb-2">
                Paso {currentStep + 1} de {steps.length}
              </p>

              {/* Question */}
              <h3 className="text-2xl font-bold text-brand-dark mb-8">
                {steps[currentStep].question}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {steps[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-brand-orange hover:bg-brand-orange/5 transition-all text-center"
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <span className="font-semibold text-brand-dark group-hover:text-brand-orange transition-colors">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Back button */}
              {currentStep > 0 && (
                <button
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                    setAnswers(answers.slice(0, -1));
                  }}
                  className="mt-6 text-gray-400 hover:text-brand-orange text-sm flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver
                </button>
              )}
            </>
          ) : (
            /* Result */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-3">
                Tenemos opciones para ti
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Hemos identificado tu necesidad. Un asesor especializado te
                contactara con las mejores opciones y precios.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${getWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1fb855] text-white font-bold px-8 py-4 rounded-xl text-base transition-all inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Recibir asesoria por WhatsApp
                </a>
                <button
                  onClick={reset}
                  className="text-gray-400 hover:text-brand-orange font-medium px-6 py-4 rounded-xl transition-colors"
                >
                  Buscar otro equipo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
