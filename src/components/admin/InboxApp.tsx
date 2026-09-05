"use client";
import { useState } from "react";
import { CONVERSATIONS, type Conversation } from "@/lib/admin/data";

const canalDot: Record<Conversation["canal"], string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-pink-500",
  messenger: "bg-blue-500",
};

export default function InboxApp() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0]?.id);
  const active = CONVERSATIONS.find((c) => c.id === activeId);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-[calc(100vh-230px)] min-h-[460px]">
      {/* Lista */}
      <div className="w-full sm:w-80 border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Buscar conversación"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm outline-none focus:border-brand-orange/40"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${
                activeId === c.id ? "bg-brand-orange/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-brand-dark/5 text-brand-dark flex items-center justify-center font-bold">
                  {c.nombre.charAt(0)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${canalDot[c.canal]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-brand-dark truncate">{c.nombre}</p>
                  <span className="text-[11px] text-gray-400 shrink-0">{c.hora}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-xs text-gray-500 truncate">{c.ultimo}</p>
                  {c.noLeidos > 0 && (
                    <span className="shrink-0 bg-green-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                      {c.noLeidos}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="hidden sm:flex flex-1 flex-col bg-[#efeae2]/40">
        {active ? (
          <>
            <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-dark/5 text-brand-dark flex items-center justify-center font-bold">
                {active.nombre.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-brand-dark text-sm">{active.nombre}</p>
                <p className="text-xs text-gray-400 capitalize">{active.canal} · {active.telefono}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {active.mensajes.map((m, i) => (
                <div key={i} className={`flex ${m.de === "negocio" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                      m.de === "negocio"
                        ? "bg-[#d9fdd3] text-brand-dark rounded-br-sm"
                        : "bg-white text-brand-dark rounded-bl-sm"
                    }`}
                  >
                    {m.texto}
                    <span className="block text-[10px] text-gray-400 text-right mt-0.5">{m.hora}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                placeholder="Escribe un mensaje… (demo)"
                disabled
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 text-sm outline-none disabled:cursor-not-allowed"
              />
              <button disabled className="w-10 h-10 rounded-full bg-brand-orange/40 text-white flex items-center justify-center cursor-not-allowed">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Selecciona una conversación
          </div>
        )}
      </div>
    </div>
  );
}
