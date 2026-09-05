// Pedidos de la tienda web (Firestore `orders`) para el admin.
import { adminDb } from "./firebase-admin";
import type { OrderStatus, WebOrder } from "@/lib/shop/orders";

const fmtDate = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Caracas" });

function toWebOrder(id: string, d: FirebaseFirestore.DocumentData): WebOrder {
  const created = (d.createdAt?.toDate?.() as Date | undefined) ?? new Date(0);
  return {
    id,
    number: d.number,
    createdAt: created.toISOString(),
    createdAtLabel: fmtDate.format(created),
    status: d.status as OrderStatus,
    items: d.items ?? [],
    subtotal: d.subtotal ?? 0,
    currency: "USD",
    customer: d.customer ?? {},
    delivery: d.delivery ?? { type: "envio" },
    payment: d.payment ?? { method: "al-recibir" },
    source: "web",
  };
}

export async function listWebOrders(limit = 100): Promise<WebOrder[]> {
  const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((doc) => toWebOrder(doc.id, doc.data()));
}

export async function countNewWebOrders(): Promise<number> {
  const snap = await adminDb.collection("orders").where("status", "==", "nuevo").count().get();
  return snap.data().count;
}

export async function updateWebOrderStatus(id: string, status: OrderStatus, by: string): Promise<void> {
  const ref = adminDb.collection("orders").doc(id);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Pedido no encontrado");
    const history = (snap.data()?.statusHistory as unknown[]) ?? [];
    tx.update(ref, { status, statusHistory: [...history, { status, at: new Date().toISOString(), by }] });
  });
}
