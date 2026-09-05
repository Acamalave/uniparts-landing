// Persistencia del inbox en Firestore (Admin SDK): conversations/{id}/messages/{mid}
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/admin/firebase-admin";
import type { Attachment, Channel, Conversation, Message } from "./types";

const conversations = () => adminDb.collection("conversations");
export const conversationId = (channel: Channel, contactId: string) => `${channel}:${contactId}`;

const toIso = (v: unknown): string => {
  const d = (v as { toDate?: () => Date } | undefined)?.toDate?.();
  return (d ?? new Date(0)).toISOString();
};

function toConversation(id: string, d: FirebaseFirestore.DocumentData): Conversation {
  return {
    id,
    channel: d.channel,
    contactId: d.contactId,
    name: d.name || "Contacto",
    username: d.username ?? null,
    avatar: d.avatar ?? null,
    lastMessage: d.lastMessage ?? "",
    lastAt: toIso(d.lastAt),
    lastDirection: d.lastDirection ?? "in",
    unread: d.unread ?? 0,
  };
}

function toMessage(id: string, d: FirebaseFirestore.DocumentData): Message {
  return {
    id,
    direction: d.direction,
    text: d.text ?? "",
    attachments: d.attachments ?? [],
    at: toIso(d.at),
    status: d.status,
    by: d.by ?? null,
    error: d.error ?? null,
  };
}

const preview = (text: string, attachments: Attachment[]) =>
  text || (attachments.length ? `📎 ${attachments[0].type}` : "");

/** Mensaje entrante (o eco de uno enviado desde Meta Business Suite). Idempotente por `mid`. */
export async function recordIncoming(opts: {
  channel: Channel;
  contactId: string;
  mid: string;
  text: string;
  attachments: Attachment[];
  at: Date;
  direction?: "in" | "out";
  profile?: () => Promise<{ name: string; username: string | null; avatar: string | null }>;
}): Promise<boolean> {
  const direction = opts.direction ?? "in";
  const convRef = conversations().doc(conversationId(opts.channel, opts.contactId));
  const msgRef = convRef.collection("messages").doc(opts.mid || `${Date.now()}`);
  const exists = (await msgRef.get()).exists;
  if (exists) return false;

  const convSnap = await convRef.get();
  let profile: { name: string; username: string | null; avatar: string | null } | null = null;
  if (!convSnap.exists && opts.profile) profile = await opts.profile();

  const batch = adminDb.batch();
  batch.set(msgRef, {
    direction,
    text: opts.text,
    attachments: opts.attachments,
    at: opts.at,
    status: "sent",
    by: direction === "out" ? "meta" : null,
    error: null,
  });
  batch.set(
    convRef,
    {
      channel: opts.channel,
      contactId: opts.contactId,
      ...(profile ? { name: profile.name, username: profile.username, avatar: profile.avatar } : {}),
      lastMessage: preview(opts.text, opts.attachments),
      lastAt: opts.at,
      lastDirection: direction,
      unread: direction === "in" ? FieldValue.increment(1) : 0,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
  return true;
}

/** Mensaje saliente enviado desde el admin. */
export async function recordOutgoing(opts: {
  conversationId: string;
  mid: string;
  text: string;
  by: string;
  status: "sent" | "failed";
  error?: string | null;
}): Promise<Message> {
  const convRef = conversations().doc(opts.conversationId);
  const msgRef = convRef.collection("messages").doc(opts.mid || `out-${Date.now()}`);
  const at = new Date();
  const data = { direction: "out", text: opts.text, attachments: [], at, status: opts.status, by: opts.by, error: opts.error ?? null };
  const batch = adminDb.batch();
  batch.set(msgRef, data);
  if (opts.status === "sent") {
    batch.set(convRef, { lastMessage: opts.text, lastAt: at, lastDirection: "out", unread: 0, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  return toMessage(msgRef.id, data);
}

export async function listConversations(limit = 100): Promise<Conversation[]> {
  const snap = await conversations().orderBy("lastAt", "desc").limit(limit).get();
  return snap.docs.map((d) => toConversation(d.id, d.data()));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const snap = await conversations().doc(id).get();
  return snap.exists ? toConversation(snap.id, snap.data()!) : null;
}

export async function listMessages(id: string, limit = 200): Promise<Message[]> {
  const snap = await conversations().doc(id).collection("messages").orderBy("at", "asc").limitToLast(limit).get();
  return snap.docs.map((d) => toMessage(d.id, d.data()));
}

export async function markRead(id: string): Promise<void> {
  await conversations().doc(id).set({ unread: 0 }, { merge: true });
}

export async function countUnreadConversations(): Promise<number> {
  const snap = await conversations().where("unread", ">", 0).count().get();
  return snap.data().count;
}
