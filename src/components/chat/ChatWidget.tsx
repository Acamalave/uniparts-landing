"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/shop/cart";
import { fmtPrice, WHATSAPP_NUMBER } from "@/lib/catalog";

type Hit = { id: number; nombre: string; ref: string | null; categoria: string; precioUsd: number | null; enStock: boolean; foto: string | null };
type Msg = { id: string; role: "user" | "assistant" | "agent"; text: string; products?: Hit[]; at: string };

const SESSION_KEY = "up_chat_session";
const HISTORY_KEY = "up_chat_v1";
const SUGGESTIONS = ["¿Tienen llantas 7.00-12?", "Horario y sedes", "¿Cómo compro en la tienda?", "Quiero cotizar un montacargas"];

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "") : `${Date.now()}${Math.random().toString(36).slice(2, 12)}`);

/** Chat público con el asistente "Uni" (IA) y toma de control por asesores desde el Inbox. */
export default function ChatWidget() {
  const pathname = usePathname();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<string>("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [unseen, setUnseen] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sesión + historial local
  useEffect(() => {
    try {
      let s = localStorage.getItem(SESSION_KEY);
      if (!s) {
        s = newId();
        localStorage.setItem(SESSION_KEY, s);
      }
      setSession(s);
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) {
        const parsed = JSON.parse(h) as { msgs: Msg[]; handoff?: boolean };
        setMsgs(parsed.msgs ?? []);
        setHandoff(Boolean(parsed.handoff));
      }
    } catch {
      setSession(newId());
    }
  }, []);
  useEffect(() => {
    if (!session) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ msgs: msgs.slice(-40), handoff }));
    } catch {}
  }, [msgs, handoff, session]);

  useEffect(() => {
    if (open) {
      setUnseen(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs.length, busy, open]);

  // Sondeo: respuestas de un asesor humano (cuando hay conversación)
  const poll = useCallback(async () => {
    if (!session || msgs.length === 0) return;
    const last = msgs[msgs.length - 1]?.at ?? new Date(0).toISOString();
    try {
      const r = await fetch(`/api/chat?session=${session}&since=${encodeURIComponent(last)}`, { cache: "no-store" });
      if (!r.ok) return;
      const d = (await r.json()) as { messages: { id: string; text: string; at: string }[]; handoff: boolean };
      if (d.handoff) setHandoff(true);
      if (d.messages.length) {
        setMsgs((ms) => {
          const known = new Set(ms.map((m) => m.id));
          const fresh = d.messages.filter((m) => !known.has(m.id)).map((m) => ({ id: m.id, role: "agent" as const, text: m.text, at: m.at }));
          if (fresh.length && !open) setUnseen((n) => n + fresh.length);
          return fresh.length ? [...ms, ...fresh] : ms;
        });
      }
    } catch {}
  }, [session, msgs, open]);
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, open ? 6000 : 20000);
    return () => clearInterval(t);
  }, [poll, open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy || !session) return;
    setDraft("");
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text: t, at: new Date().toISOString() };
    setMsgs((ms) => [...ms, userMsg]);
    setBusy(true);
    try {
      const history = [...msgs, userMsg]
        .filter((m) => m.role !== "agent")
        .slice(-20, -1)
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session, message: t, history }),
      });
      const d = (await r.json().catch(() => ({}))) as { reply: string | null; products?: Hit[]; handoff?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error || "Error");
      if (d.handoff) setHandoff(true);
      if (d.reply) {
        setMsgs((ms) => [...ms, { id: `a-${Date.now()}`, role: "assistant", text: d.reply!, products: d.products, at: new Date().toISOString() }]);
      } else {
        setMsgs((ms) => [...ms, { id: `s-${Date.now()}`, role: "assistant", text: "Un asesor de Uniparts está atendiendo esta conversación y te responde en breve.", at: new Date().toISOString() }]);
      }
    } catch {
      setMsgs((ms) => [...ms, { id: `e-${Date.now()}`, role: "assistant", text: `No pude responder ahora mismo. Escríbenos al WhatsApp +58 414-4025540 o inténtalo de nuevo.`, at: new Date().toISOString() }]);
    } finally {
      setBusy(false);
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  const transcript = msgs.slice(-8).map((m) => `${m.role === "user" ? "Yo" : "Uni"}: ${m.text}`).join("\n");
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, vengo del chat de la web.\n${transcript}`.slice(0, 1500))}`;

  return (
    <>
      {/* Lanzador */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar chat" : "Abrir chat con Uni"}
        className={`fixed right-6 bottom-24 z-[55] flex items-center gap-2 rounded-full shadow-2xl transition-all ${
          open ? "bg-brand-dark text-white px-4 py-3" : "bg-white text-brand-dark pl-2 pr-4 py-2 border border-gray-200 hover:border-brand-orange"
        }`}
      >
        <span className="relative w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-display font-extrabold">
          U
          {!open && unseen > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unseen}</span>
          )}
        </span>
        <span className="text-sm font-semibold">{open ? "Cerrar" : "Chat con Uni"}</span>
      </button>

      {/* Panel */}
      <div
        className={`fixed z-[56] inset-0 sm:inset-auto sm:right-6 sm:bottom-40 sm:w-[380px] sm:h-[min(600px,calc(100vh-11rem))] bg-white sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-200 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <header className="bg-brand-dark text-white px-4 py-3 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center font-display font-extrabold text-lg">U</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">Uni · Asistente de Uniparts</p>
            <p className="text-[11px] text-white/60 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${handoff ? "bg-amber-400" : "bg-green-400"}`} />
              {handoff ? "Un asesor sigue la conversación" : "Responde al instante · 24/7"}
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="sm:hidden text-white/70 p-1" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f7f8fa]">
          {msgs.length === 0 && (
            <div>
              <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-brand-dark shadow-sm max-w-[88%]">
                ¡Hola! Soy Uni. Puedo buscar repuestos por referencia o medida, decirte precios y stock, y ayudarte a comprar. ¿Qué necesitas?
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs bg-white border border-gray-200 hover:border-brand-orange text-brand-dark rounded-full px-3 py-1.5 transition">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm whitespace-pre-wrap break-words ${
                  m.role === "user" ? "bg-brand-orange text-white rounded-br-md" : m.role === "agent" ? "bg-brand-dark text-white rounded-bl-md" : "bg-white text-brand-dark rounded-bl-md"
                }`}
              >
                {m.role === "agent" && <p className="text-[10px] text-white/60 mb-0.5">Asesor Uniparts</p>}
                {m.text}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="mt-2 w-full space-y-2">
                  {m.products.slice(0, 4).map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-2.5 flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {p.foto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.foto} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-[9px] text-gray-300">Sin foto</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 truncate">{p.categoria}{p.ref ? ` · ${p.ref}` : ""}</p>
                        <p className="text-xs font-semibold text-brand-dark leading-snug line-clamp-2">{p.nombre}</p>
                        <p className="text-xs mt-0.5 tabular-nums">{p.precioUsd != null ? <span className="font-semibold text-brand-dark">US$ {fmtPrice(p.precioUsd)}</span> : <span className="text-gray-400">Precio a consultar</span>}</p>
                      </div>
                      {p.precioUsd != null ? (
                        <button
                          onClick={() => cart.add({ id: p.id, name: p.nombre, ref: p.ref, price: p.precioUsd!, image: p.foto, categoryLabel: p.categoria })}
                          className="shrink-0 text-[11px] font-semibold bg-brand-orange hover:bg-brand-orange-dark text-white px-2.5 py-1.5 rounded-lg"
                        >
                          Agregar
                        </button>
                      ) : (
                        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero cotizar: ${p.nombre}${p.ref ? ` (${p.ref})` : ""}`)}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] font-semibold bg-brand-dark text-white px-2.5 py-1.5 rounded-lg">
                          Cotizar
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex items-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <footer className="border-t border-gray-100 p-3 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              placeholder="Escribe tu pregunta…"
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-orange/50 max-h-28"
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Enviar" className="shrink-0 w-10 h-10 rounded-xl bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-40 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>Respuestas con IA sobre nuestro inventario real.</span>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-green-700 font-semibold hover:underline">Hablar por WhatsApp</a>
          </div>
        </footer>
      </div>
    </>
  );
}
