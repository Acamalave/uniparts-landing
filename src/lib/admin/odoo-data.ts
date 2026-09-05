// Datos del admin leídos EN VIVO desde Odoo (con caché de 5 minutos). Solo servidor.
import { unstable_cache } from "next/cache";
import { searchRead, searchCount, readGroup, ODOO_COMPANY_ID } from "@/lib/odoo";
import { dataHealth } from "@/lib/admin/data";

const REVALIDATE = 300; // 5 min
const COMPANY = ["company_id", "=", ODOO_COMPANY_ID];
const USD = ["currency_id.name", "=", "USD"];
const CONFIRMADOS = ["state", "in", ["sale", "done"]];

/* ---------- Tipos ---------- */
export type OdooOrder = {
  id: number;
  name: string;
  partner: string;
  partnerId: number;
  date: string; // "YYYY-MM-DD HH:MM:SS" (UTC)
  total: number;
  currency: string;
  state: string;
};
export type OdooCustomer = {
  id: number;
  name: string;
  pedidos: number;
  total: number; // USD, pedidos confirmados
  phone?: string;
  email?: string;
  city?: string;
  lastOrder?: string;
};
export type OdooStats = {
  ventasMesUSD: number;
  pedidosMes: number;
  cotizacionesAbiertas: number;
  totalPedidos: number;
  clientesActivos: number;
  byState: { state: string; n: number; total: number }[];
  byMonth: { mes: string; total: number; n: number }[];
};

export const ORDER_STATE_LABEL: Record<string, string> = {
  draft: "cotización",
  sent: "cot. enviada",
  sale: "confirmado",
  done: "cerrado",
  cancel: "cancelado",
};
export const ORDER_STATE_STYLE: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  sent: "bg-amber-100 text-amber-700",
  sale: "bg-green-100 text-green-700",
  done: "bg-blue-100 text-blue-700",
  cancel: "bg-red-100 text-red-600",
};

/* ---------- Helpers ---------- */
type Rel = [number, string] | false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rel = (v: any): Rel => (Array.isArray(v) ? [v[0], v[1]] : false);

export function fmtOdooDate(s?: string) {
  if (!s) return "—";
  return new Date(s.replace(" ", "T") + "Z").toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Caracas",
  });
}
export function fmtMoney(n: number, currency = "USD") {
  if (currency.toUpperCase() === "USD") {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(n);
  }
  return `${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n)} ${currency}`;
}

function monthStartUTC(offsetMonths = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offsetMonths, 1))
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

/* ---------- Pedidos ---------- */
const ORDER_FIELDS = ["name", "partner_id", "date_order", "amount_total", "state", "currency_id"];

export const getRecentOrders = unstable_cache(
  async (limit = 60): Promise<OdooOrder[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await searchRead<any>("sale.order", [COMPANY], ORDER_FIELDS, {
      limit,
      order: "date_order desc",
    });
    return rows.map((o) => {
      const p = rel(o.partner_id);
      const c = rel(o.currency_id);
      return {
        id: o.id,
        name: o.name,
        partner: p ? p[1] : "—",
        partnerId: p ? p[0] : 0,
        date: o.date_order,
        total: o.amount_total || 0,
        currency: c ? c[1] : "",
        state: o.state,
      };
    });
  },
  ["odoo-recent-orders"],
  { revalidate: REVALIDATE }
);

/* ---------- Estadísticas ---------- */
export const getOrderStats = unstable_cache(
  async (): Promise<OdooStats> => {
    const inicioMes = monthStartUTC(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mes = await readGroup<any>("sale.order", [COMPANY, ["date_order", ">=", inicioMes]], ["amount_total:sum"], ["state"]);
    const pedidosMes = mes.reduce((s, g) => s + (g.__count || 0), 0);
    const cotizacionesAbiertas = mes
      .filter((g) => ["draft", "sent"].includes(g.state))
      .reduce((s, g) => s + (g.__count || 0), 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mesUSD = await readGroup<any>(
      "sale.order",
      [COMPANY, CONFIRMADOS, USD, ["date_order", ">=", inicioMes]],
      ["amount_total:sum"],
      ["state"]
    );
    const ventasMesUSD = mesUSD.reduce((s, g) => s + (g.amount_total || 0), 0);

    const totalPedidos = await searchCount("sale.order", [COMPANY]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byStateRaw = await readGroup<any>("sale.order", [COMPANY, USD], ["amount_total:sum"], ["state"]);
    const byState = byStateRaw.map((g) => ({ state: g.state, n: g.__count || 0, total: g.amount_total || 0 }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byMonthRaw = await readGroup<any>(
      "sale.order",
      [COMPANY, CONFIRMADOS, USD, ["date_order", ">=", monthStartUTC(-5)]],
      ["amount_total:sum"],
      ["date_order:month"]
    );
    const byMonth = byMonthRaw.map((g) => ({
      mes: String(g["date_order:month"] || ""),
      total: g.amount_total || 0,
      n: g.__count || 0,
    }));

    // Clientes con al menos un pedido confirmado en los últimos 12 meses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activos = await readGroup<any>(
      "sale.order",
      [COMPANY, CONFIRMADOS, ["date_order", ">=", monthStartUTC(-11)]],
      ["partner_id"],
      ["partner_id"]
    );

    return {
      ventasMesUSD,
      pedidosMes,
      cotizacionesAbiertas,
      totalPedidos,
      clientesActivos: activos.length,
      byState,
      byMonth,
    };
  },
  ["odoo-order-stats"],
  { revalidate: REVALIDATE }
);

/* ---------- Clientes (de Uniparts Andina, por pedidos confirmados en USD) ---------- */
export const getTopCustomers = unstable_cache(
  async (limit = 80): Promise<OdooCustomer[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grouped = await readGroup<any>(
      "sale.order",
      [COMPANY, CONFIRMADOS, USD],
      ["amount_total:sum", "date_order:max"],
      ["partner_id"],
      { orderby: "amount_total desc", limit }
    );
    const ids = grouped.map((g) => rel(g.partner_id)).filter(Boolean).map((p) => (p as [number, string])[0]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partners = ids.length
      ? await searchRead<any>("res.partner", [["id", "in", ids]], ["name", "phone", "mobile", "email", "city"])
      : [];
    const byId = new Map(partners.map((p) => [p.id, p]));
    return grouped.map((g) => {
      const p = rel(g.partner_id);
      const d = (p && byId.get(p[0])) || {};
      return {
        id: p ? p[0] : 0,
        name: p ? p[1] : d.name || "—",
        pedidos: g.__count || 0,
        total: g.amount_total || 0,
        phone: d.phone || d.mobile || undefined,
        email: d.email || undefined,
        city: d.city || undefined,
        lastOrder: g.date_order || undefined,
      };
    });
  },
  ["odoo-top-customers"],
  { revalidate: REVALIDATE }
);

/* ---------- Tareas pendientes (para el badge del header e Inicio) ---------- */
export async function getPendingTasks(): Promise<{ txt: string; href: string }[]> {
  const tareas: { txt: string; href: string }[] = [];
  try {
    const s = await getOrderStats();
    if (s.cotizacionesAbiertas > 0)
      tareas.push({ txt: `${s.cotizacionesAbiertas} cotización(es) abiertas este mes por seguir`, href: "/admin/pedidos" });
  } catch {
    /* Odoo no disponible: se omite */
  }
  const h = dataHealth();
  if (h.sinImagen > 0) tareas.push({ txt: `${h.sinImagen} productos sin foto en el catálogo`, href: "/admin/salud" });
  tareas.push({ txt: "Inbox de WhatsApp pendiente de conectar (Meta)", href: "/admin/inbox" });
  return tareas;
}
