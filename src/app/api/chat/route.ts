import { NextResponse } from "next/server";
import { runAssistant, type ChatTurn } from "@/lib/ai/assistant";
import { conversationId, getConversation, listMessages, recordIncoming, recordOutgoing } from "@/lib/inbox/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_RE = /^[a-zA-Z0-9_-]{16,64}$/;
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Chat público con el asistente. Cada sesión es una conversación del Inbox (canal "web"),
 * así un asesor puede verla y tomarla desde el admin.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { sessionId?: string; message?: string; history?: ChatTurn[] } | null;
  const sessionId = body?.sessionId ?? "";
  const message = (body?.message ?? "").trim().slice(0, 1500);
  if (!SESSION_RE.test(sessionId)) return bad("Sesión inválida.");
  if (!message) return bad("Escribe un mensaje.");

  const convId = conversationId("web", sessionId);
  const history: ChatTurn[] = Array.isArray(body?.history)
    ? body!.history!.filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string").slice(-20)
    : [];

  // Guardar el mensaje del cliente (si un asesor ya tomó la conversación, no responde la IA).
  const existing = await getConversation(convId).catch(() => null);
  const handedOff = Boolean(existing?.handoff);
  await recordIncoming({
    channel: "web",
    contactId: sessionId,
    mid: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: message,
    attachments: [],
    at: new Date(),
    countAsUnread: handedOff,
    profile: async () => ({ name: "Visitante web", username: null, avatar: null }),
  }).catch((e) => console.error("[chat] no se pudo guardar el mensaje:", e));

  if (handedOff) {
    return NextResponse.json({ reply: null, products: [], handoff: true, mode: "asesor" });
  }

  let result;
  try {
    result = await runAssistant([...history, { role: "user", content: message }]);
  } catch (e) {
    console.error("[chat] error del asistente:", e);
    result = {
      reply: "Tuve un problema para responder. Un asesor te atiende por WhatsApp +58 414-4025540 o vuelve a intentarlo en un momento.",
      products: [],
      handoff: true,
      mode: "ia" as const,
    };
  }

  const saved = await recordOutgoing({
    conversationId: convId,
    mid: `ia-${Date.now()}`,
    text: result.reply,
    by: "ia",
    status: "sent",
    handoff: result.handoff,
  }).catch(() => null);

  return NextResponse.json({
    reply: result.reply,
    products: result.products,
    handoff: result.handoff,
    mode: result.mode,
    messageId: saved?.id ?? null,
  });
}

/** Sondeo del widget: mensajes nuevos (p. ej. respuestas de un asesor) desde una fecha. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session") ?? "";
  const since = url.searchParams.get("since");
  if (!SESSION_RE.test(sessionId)) return bad("Sesión inválida.");
  const convId = conversationId("web", sessionId);
  const [conv, all] = await Promise.all([getConversation(convId), listMessages(convId, 100)]);
  if (!conv) return NextResponse.json({ messages: [], handoff: false });
  const sinceMs = since ? new Date(since).getTime() : 0;
  const messages = all
    .filter((m) => m.direction === "out" && m.by !== "ia" && new Date(m.at).getTime() > sinceMs)
    .map((m) => ({ id: m.id, text: m.text, at: m.at, by: m.by }));
  return NextResponse.json({ messages, handoff: Boolean(conv.handoff) });
}
