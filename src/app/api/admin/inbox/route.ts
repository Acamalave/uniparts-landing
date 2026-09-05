import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/session";
import { listConversations } from "@/lib/inbox/store";
import { metaConfigured } from "@/lib/inbox/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lista de conversaciones del inbox (todas las vías). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const conversations = await listConversations(150);
    return NextResponse.json({
      conversations,
      channels: { messenger: metaConfigured(), instagram: metaConfigured(), whatsapp: false },
      now: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
