import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/session";
import { getConversation, listMessages, markRead, recordOutgoing } from "@/lib/inbox/store";
import { metaConfigured, sendText } from "@/lib/inbox/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAN_REPLY = new Set(["superadmin", "owner", "gerente", "asesor", "marketing"]);

/** Mensajes de una conversación (y la marca como leída). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const conversation = await getConversation(params.id);
  if (!conversation) return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  const messages = await listMessages(params.id);
  if (conversation.unread > 0) await markRead(params.id);
  return NextResponse.json({ conversation: { ...conversation, unread: 0 }, messages });
}

/** Responde en la conversación por la vía correspondiente. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!CAN_REPLY.has(session.rol)) return NextResponse.json({ error: "Tu rol no puede responder." }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = (body.text ?? "").trim().slice(0, 2000);
  if (!text) return NextResponse.json({ error: "Escribe un mensaje." }, { status: 400 });

  const conversation = await getConversation(params.id);
  if (!conversation) return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  // Chat web: la respuesta se guarda y el widget la recoge por sondeo; el asesor toma el control (la IA se calla).
  if (conversation.channel === "web") {
    const message = await recordOutgoing({ conversationId: params.id, mid: "", text, by: session.email, status: "sent", handoff: true });
    return NextResponse.json({ ok: true, message });
  }
  if (conversation.channel !== "whatsapp" && !metaConfigured()) {
    return NextResponse.json({ error: "Messenger/Instagram no están conectados (faltan credenciales de Meta)." }, { status: 503 });
  }

  try {
    const { mid } = await sendText(conversation.channel, conversation.contactId, text);
    const message = await recordOutgoing({ conversationId: params.id, mid, text, by: session.email, status: "sent" });
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    const error = e instanceof Error ? e.message : "No se pudo enviar.";
    const message = await recordOutgoing({ conversationId: params.id, mid: "", text, by: session.email, status: "failed", error });
    return NextResponse.json({ error, message }, { status: 502 });
  }
}
