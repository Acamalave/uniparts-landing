import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/session";
import { updateWebOrderStatus } from "@/lib/admin/web-orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/shop/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAN_UPDATE = new Set(["superadmin", "owner", "gerente", "asesor"]);

/** Cambia el estado de un pedido de la tienda web. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!CAN_UPDATE.has(session.rol)) return NextResponse.json({ error: "Tu rol no puede cambiar pedidos." }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const status = body.status as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return NextResponse.json({ error: "Estado inválido." }, { status: 400 });

  try {
    await updateWebOrderStatus(params.id, status, session.email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 404 });
  }
}
