// Meta Graph API (Messenger + Instagram) — solo servidor.
// Variables: META_VERIFY_TOKEN (webhook), META_APP_SECRET (firma), META_PAGE_ACCESS_TOKEN, META_PAGE_ID.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Channel } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

export const metaEnv = () => ({
  verifyToken: process.env.META_VERIFY_TOKEN || "",
  appSecret: process.env.META_APP_SECRET || "",
  pageToken: process.env.META_PAGE_ACCESS_TOKEN || "",
  pageId: process.env.META_PAGE_ID || "",
});

export const metaConfigured = () => {
  const e = metaEnv();
  return Boolean(e.appSecret && e.pageToken && e.pageId);
};

/** Valida la firma X-Hub-Signature-256 del webhook con el App Secret. */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const { appSecret } = metaEnv();
  if (!appSecret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const got = header.slice(7);
  if (expected.length !== got.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(got, "hex"));
}

async function graph<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const { pageToken } = metaEnv();
  const url = new URL(`${GRAPH}/${path.replace(/^\//, "")}`);
  url.searchParams.set("access_token", pageToken);
  const res = await fetch(url, { ...init, cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Graph API ${res.status}`);
  }
  return data;
}

/** Nombre/foto del contacto. Messenger usa PSID; Instagram usa IGSID. Nunca lanza. */
export async function getProfile(channel: Channel, id: string): Promise<{ name: string; username: string | null; avatar: string | null }> {
  try {
    if (channel === "instagram") {
      const p = await graph<{ name?: string; username?: string; profile_pic?: string }>(`${id}?fields=name,username,profile_pic`);
      return { name: p.name || p.username || "Instagram", username: p.username || null, avatar: p.profile_pic || null };
    }
    const p = await graph<{ first_name?: string; last_name?: string; profile_pic?: string }>(`${id}?fields=first_name,last_name,profile_pic`);
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
    return { name: name || "Messenger", username: null, avatar: p.profile_pic || null };
  } catch {
    return { name: channel === "instagram" ? "Instagram" : "Messenger", username: null, avatar: null };
  }
}

/** Envía un texto por Messenger o Instagram (mismo endpoint de la Messenger Platform). */
export async function sendText(channel: Channel, recipientId: string, text: string): Promise<{ mid: string }> {
  if (channel === "whatsapp") throw new Error("WhatsApp Cloud API aún no está conectado.");
  const r = await graph<{ message_id?: string }>("me/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  });
  return { mid: r.message_id || "" };
}

export type MetaStatus = {
  configured: boolean;
  verifyToken: string;
  missing: string[];
  page: { id: string; name: string; instagram: string | null } | null;
  error: string | null;
};

/** Estado de la conexión para la pantalla de Configuración. */
export async function metaStatus(): Promise<MetaStatus> {
  const e = metaEnv();
  const missing = (["META_APP_SECRET", "META_PAGE_ACCESS_TOKEN", "META_PAGE_ID"] as const).filter((k) => {
    const map = { META_APP_SECRET: e.appSecret, META_PAGE_ACCESS_TOKEN: e.pageToken, META_PAGE_ID: e.pageId };
    return !map[k];
  });
  const base: MetaStatus = { configured: missing.length === 0, verifyToken: e.verifyToken, missing, page: null, error: null };
  if (!base.configured) return base;
  try {
    const p = await graph<{ id: string; name: string; instagram_business_account?: { id: string; username?: string } }>(
      `${e.pageId}?fields=name,instagram_business_account{username}`
    );
    base.page = { id: p.id, name: p.name, instagram: p.instagram_business_account?.username ?? null };
  } catch (err) {
    base.error = err instanceof Error ? err.message : "No se pudo consultar la página.";
  }
  return base;
}
