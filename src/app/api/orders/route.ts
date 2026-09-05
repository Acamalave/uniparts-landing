import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/admin/firebase-admin";
import { products } from "@/lib/catalog";
import { PAYMENT_METHODS, SEDES, MAX_QTY_PER_ITEM } from "@/lib/shop/config";
import { isValidEmail, normalizeVePhone, type OrderInput, type OrderItem } from "@/lib/shop/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Crea un pedido de la tienda web en Firestore (`orders/{id}`).
 * Los precios y totales se calculan en el servidor a partir del catálogo: nunca se confía en el cliente.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as OrderInput | null;
  if (!body || typeof body !== "object") return bad("Pedido inválido.");
  if (body.website) return NextResponse.json({ ok: true, number: "UP-00000" }); // honeypot: bot

  // --- Artículos ---
  if (!Array.isArray(body.items) || body.items.length === 0) return bad("El carrito está vacío.");
  if (body.items.length > 60) return bad("Demasiados artículos en un solo pedido; escríbenos por WhatsApp.");
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  for (const raw of body.items) {
    const p = byId.get(Number(raw?.id));
    const qty = Math.floor(Number(raw?.qty));
    if (!p || !Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) return bad("Hay un artículo inválido en el carrito.");
    if (p.price == null) return bad(`"${p.name}" no tiene precio en línea; solicítalo por WhatsApp.`);
    items.push({ id: p.id, name: p.name, ref: p.ref, price: p.price, qty, image: p.image, categoryLabel: p.categoryLabel });
  }
  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

  // --- Cliente ---
  const nombre = clean(body.customer?.nombre, 120);
  const telefono = normalizeVePhone(clean(body.customer?.telefono, 40));
  const email = clean(body.customer?.email, 120);
  if (nombre.length < 3) return bad("Indica tu nombre.");
  if (!telefono) return bad("Indica un número de WhatsApp venezolano válido (04xx-xxxxxxx).");
  if (email && !isValidEmail(email)) return bad("El correo no tiene un formato válido.");

  // --- Entrega ---
  const type = body.delivery?.type === "retiro" ? "retiro" : body.delivery?.type === "envio" ? "envio" : null;
  if (!type) return bad("Elige envío o retiro en sede.");
  // Firestore no acepta `undefined`: todos los campos opcionales van como null.
  const delivery = {
    type,
    sede: null as string | null,
    estado: null as string | null,
    ciudad: null as string | null,
    direccion: null as string | null,
    notas: clean(body.delivery?.notas, 500) || null,
  };
  if (type === "retiro") {
    const sede = SEDES.find((s) => s.id === body.delivery?.sede)?.id;
    if (!sede) return bad("Elige la sede de retiro.");
    delivery.sede = sede;
  } else {
    delivery.estado = clean(body.delivery?.estado, 60) || null;
    delivery.ciudad = clean(body.delivery?.ciudad, 80) || null;
    delivery.direccion = clean(body.delivery?.direccion, 300) || null;
    if (!delivery.estado || !delivery.ciudad || (delivery.direccion?.length ?? 0) < 8) return bad("Completa estado, ciudad y dirección de envío.");
  }

  // --- Pago ---
  const method = PAYMENT_METHODS.find((m) => m.id === body.payment?.method);
  if (!method) return bad("Elige un método de pago.");
  const payment = { method: method.id, reference: clean(body.payment?.reference, 60) || null };

  // --- Número correlativo + guardado (transacción) ---
  const counterRef = adminDb.collection("counters").doc("orders");
  const orderRef = adminDb.collection("orders").doc();
  let number: string;
  try {
    number = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const seq = ((snap.data()?.seq as number | undefined) ?? 0) + 1;
    const num = `UP-${String(seq).padStart(5, "0")}`;
    tx.set(counterRef, { seq }, { merge: true });
    tx.set(orderRef, {
      number: num,
      createdAt: FieldValue.serverTimestamp(),
      status: "nuevo",
      statusHistory: [{ status: "nuevo", at: new Date().toISOString(), by: "web" }],
      items,
      subtotal,
      currency: "USD",
      customer: { nombre, telefono, email: email || null, empresa: clean(body.customer?.empresa, 120) || null, rif: clean(body.customer?.rif, 30) || null },
      delivery,
      payment,
      source: "web",
      userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? null,
    });
    return num;
    });
  } catch (e) {
    console.error("[orders] no se pudo guardar el pedido:", e);
    return bad("No pudimos registrar el pedido en este momento. Inténtalo de nuevo o escríbenos por WhatsApp.", 500);
  }

  return NextResponse.json({ ok: true, number, subtotal, id: orderRef.id });
}
