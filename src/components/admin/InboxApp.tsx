"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANNEL_LABEL, type Channel, type Conversation, type Message } from "@/lib/inbox/types";

const canalDot: Record<Channel, string> = {
  whatsapp: "bg-green-500",
  instagram: "bg-pink-500",
  messenger: "bg-blue-500",
};

const fmtTime = new Intl.DateTimeFormat("es-VE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Caracas" });
const fmtDay = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short", timeZone: "America/Caracas" });
const when = (iso: string) => {
  const d = new Date(iso);
  return Date.now() - d.getTime() < 20 * 3600 * 1000 ? fmtTime.format(d) : fmtDay.format(d);
};

type Filter = "todos" | Channel;

/** Inbox unificado en vivo: lista de conversaciones + hilo + respuesta. Sondeo cada pocos segundos. */
export default function InboxApp({ initialUnread = 0 }: { initialUnread?: number }) {
  const [convs, setConvs] = useState<Conversation[] | null>(null);
  const [channels, setChannels] = useState<Record<Channel, boolean>>({ messenger: false, instagram: false, whatsapp: false });
  const [filter, setFilter] = useState<Filter>("todos");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const unreadTotal = convs ? convs.reduce((n, c) => n + c.unread, 0) : initialUnread;

  const loadConvs = useCallback(async () => {
    const r = await fetch("/api/admin/inbox", { cache: "no-store" });
    if (!r.ok) throw new Error("No se pudo cargar el inbox.");
    const d = (await r.json()) as { conversations: Conversation[]; channels: Record<Channel, boolean> };
    setConvs(d.conversations);
    setChannels(d.channels);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const r = await fetch(`/api/admin/inbox/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!r.ok) return;
    const d = (await r.json()) as { messages: Message[] };
    setMessages(d.messages);
    setConvs((cs) => cs?.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) ?? cs);
  }, []);

  useEffect(() => {
    loadConvs().catch((e) => setError(e.message));
    const t = setInterval(() => {
      if (document.visibilityState === "visible") loadConvs().catch(() => {});
    }, 8000);
    return () => clearInterval(t);
  }, [loadConvs]);

  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    loadMessages(activeId);
    const t = setInterval(() => {
      if (document.visibilityState === "visible") loadMessages(activeId);
    }, 5000);
    return () => clearInterval(t);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeId]);

  const visible = useMemo(() => {
    const list = convs ?? [];
    const needle = q.trim().toLowerCase();
    return list.filter(
      (c) =>
        (filter === "todos" || c.channel === filter) &&
        (!needle || c.name.toLowerCase().includes(needle) || (c.username ?? "").toLowerCase().includes(needle) || c.lastMessage.toLowerCase().includes(needle))
    );
  }, [convs, filter, q]);

  const active = convs?.find((c) => c.id === activeId) ?? null;

  const send = async () => {
    if (!active || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    const text = draft.trim();
    setDraft("");
    const r = await fetch(`/api/admin/inbox/${encodeURIComponent(active.id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = (await r.json().catch(() => ({}))) as { message?: Message; error?: string };
    if (d.message) setMessages((ms) => [...ms, d.message!]);
    if (!r.ok) setError(d.error || "No se pudo enviar.");
    else loadConvs().catch(() => {});
    setSending(false);
  };

  const anyConnected = channels.messenger || channels.instagram || channels.whatsapp;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex h-[calc(100vh-230px)] min-h-[520px]">
      {/* Lista */}
      <div className={`w-full sm:w-80 lg:w-96 border-r border-gray-100 flex flex-col shrink-0 ${active ? "hidden sm:flex" : "flex"}`}>
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 space-y-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar conversación"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm outline-none focus:border-brand-orange/40"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["todos", "messenger", "instagram", "whatsapp"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border transition ${
                  filter === f ? "bg-brand-dark text-white border-brand-dark" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {f === "todos" ? `Todos${unreadTotal ? ` · ${unreadTotal}` : ""}` : CHANNEL_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convs === null && <p className="p-6 text-sm text-gray-400">Cargando…</p>}
          {convs !== null && visible.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              {convs.length === 0
                ? anyConnected
                  ? "Aún no hay conversaciones. Cuando alguien escriba por Messenger o Instagram aparecerá aquí."
                  : "Sin conversaciones. Conecta Messenger e Instagram en Configuración para recibir mensajes."
                : "Nada coincide con la búsqueda."}
            </div>
          )}
          {visible.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${
                activeId === c.id ? "bg-brand-orange/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative shrink-0">
                {c.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatar} alt="" className="w-11 h-11 rounded-full object-cover bg-gray-100" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand-dark/5 text-brand-dark flex items-center justify-center font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${canalDot[c.channel]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${c.unread ? "font-bold text-brand-dark" : "font-semibold text-brand-dark"}`}>{c.name}</p>
                  <span className="text-[11px] text-gray-400 shrink-0">{when(c.lastAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className={`text-xs truncate ${c.unread ? "text-brand-dark font-medium" : "text-gray-500"}`}>
                    {c.lastDirection === "out" && <span className="text-gray-400">Tú: </span>}
                    {c.lastMessage}
                  </p>
                  {c.unread > 0 && (
                    <span className="shrink-0 bg-brand-orange text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hilo */}
      <div className={`flex-1 flex-col min-w-0 ${active ? "flex" : "hidden sm:flex"}`}>
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-9 7l3.5-3.5H18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v15z" />
            </svg>
            <p className="text-sm">Elige una conversación para responder.</p>
            <p className="text-xs mt-1">
              {(["messenger", "instagram", "whatsapp"] as Channel[]).map((ch) => (
                <span key={ch} className="inline-flex items-center gap-1 mr-3">
                  <span className={`w-2 h-2 rounded-full ${channels[ch] ? canalDot[ch] : "bg-gray-300"}`} />
                  {CHANNEL_LABEL[ch]} {channels[ch] ? "conectado" : "pendiente"}
                </span>
              ))}
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <button onClick={() => setActiveId(null)} className="sm:hidden text-gray-500 -ml-1 p-1" aria-label="Volver">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="relative shrink-0">
                {active.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-dark/5 text-brand-dark flex items-center justify-center font-bold">{active.name.charAt(0).toUpperCase()}</div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${canalDot[active.channel]}`} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-brand-dark truncate">{active.name}</p>
                <p className="text-xs text-gray-400">
                  {CHANNEL_LABEL[active.channel]}
                  {active.username ? ` · @${active.username}` : ""}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#f7f8fa]">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                      m.direction === "out"
                        ? m.status === "failed"
                          ? "bg-red-50 text-red-700 border border-red-200 rounded-br-md"
                          : "bg-brand-orange text-white rounded-br-md"
                        : "bg-white text-brand-dark rounded-bl-md"
                    }`}
                  >
                    {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                    {m.attachments.map((a, i) =>
                      a.url && a.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={a.url} alt="" className="mt-1 rounded-lg max-h-64" />
                      ) : (
                        <a key={i} href={a.url ?? "#"} target="_blank" rel="noopener noreferrer" className="block mt-1 underline text-xs">
                          📎 {a.type}
                        </a>
                      )
                    )}
                    <p className={`text-[10px] mt-1 ${m.direction === "out" && m.status !== "failed" ? "text-white/70" : "text-gray-400"}`}>
                      {fmtTime.format(new Date(m.at))}
                      {m.direction === "out" && m.by && m.by !== "meta" ? ` · ${m.by.split("@")[0]}` : ""}
                      {m.status === "failed" ? ` · no enviado: ${m.error}` : ""}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <footer className="border-t border-gray-100 p-3">
              {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={`Responder por ${CHANNEL_LABEL[active.channel]}… (Enter envía, Shift+Enter salto de línea)`}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-orange/50 max-h-32"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="shrink-0 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
                >
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </form>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
