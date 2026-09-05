import { NextResponse } from "next/server";
import { getProfile, metaEnv, verifySignature } from "@/lib/inbox/meta";
import { recordIncoming } from "@/lib/inbox/store";
import type { Attachment, Channel } from "@/lib/inbox/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Verificación del webhook (Meta llama con hub.mode / hub.verify_token / hub.challenge). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const { verifyToken } = metaEnv();
  if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ error: "Verificación inválida." }, { status: 403 });
}

type MetaMessaging = {
  sender?: { id: string };
  recipient?: { id: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: { type?: string; payload?: { url?: string } }[];
  };
};

type MetaPayload = {
  object?: string;
  entry?: { id?: string; time?: number; messaging?: MetaMessaging[] }[];
};

/** Eventos de Messenger (object=page) e Instagram (object=instagram). */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }
  let payload: MetaPayload;
  try {
    payload = JSON.parse(raw) as MetaPayload;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const channel: Channel | null = payload.object === "page" ? "messenger" : payload.object === "instagram" ? "instagram" : null;
  if (!channel) return NextResponse.json({ ok: true, ignored: payload.object });

  let stored = 0;
  for (const entry of payload.entry ?? []) {
    for (const ev of entry.messaging ?? []) {
      const msg = ev.message;
      if (!msg || !ev.sender?.id) continue; // delivery/read/postback: se ignoran por ahora
      const isEcho = Boolean(msg.is_echo);
      // En un eco, el "sender" es la página y el contacto es el destinatario.
      const contactId = isEcho ? ev.recipient?.id : ev.sender.id;
      if (!contactId) continue;
      const attachments: Attachment[] = (msg.attachments ?? []).map((a) => ({ type: a.type || "archivo", url: a.payload?.url || null }));
      const text = msg.text || "";
      if (!text && attachments.length === 0) continue;
      try {
        const ok = await recordIncoming({
          channel,
          contactId,
          mid: msg.mid || `${ev.timestamp ?? Date.now()}`,
          text,
          attachments,
          at: new Date(ev.timestamp ?? Date.now()),
          direction: isEcho ? "out" : "in",
          profile: () => getProfile(channel, contactId),
        });
        if (ok) stored++;
      } catch (e) {
        console.error("[meta webhook] no se pudo guardar el mensaje:", e);
      }
    }
  }
  return NextResponse.json({ ok: true, stored });
}
