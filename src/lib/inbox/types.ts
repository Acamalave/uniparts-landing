// Tipos del inbox unificado (Messenger · Instagram · WhatsApp).
export type Channel = "messenger" | "instagram" | "whatsapp" | "web";

export const CHANNEL_LABEL: Record<Channel, string> = {
  messenger: "Messenger",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  web: "Chat web",
};

export type Attachment = { type: string; url: string | null };

export type Message = {
  id: string;
  direction: "in" | "out";
  text: string;
  attachments: Attachment[];
  at: string; // ISO
  status?: "sent" | "failed";
  by?: string | null; // correo del agente que respondió (out)
  error?: string | null;
};

export type Conversation = {
  id: string; // `${channel}:${contactId}`
  channel: Channel;
  contactId: string; // PSID / IGSID / wa_id
  name: string;
  username: string | null;
  avatar: string | null;
  lastMessage: string;
  lastAt: string; // ISO
  lastDirection: "in" | "out";
  unread: number;
  /** Chat web: un asesor humano tomó la conversación (la IA deja de responder). */
  handoff?: boolean;
};
