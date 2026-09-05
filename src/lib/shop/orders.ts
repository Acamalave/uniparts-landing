// Tipos y validaciones compartidas (cliente + servidor) de los pedidos de la tienda web.
import type { PaymentMethodId } from "./config";

export type OrderStatus = "nuevo" | "confirmado" | "pagado" | "enviado" | "entregado" | "cancelado";

export const ORDER_STATUSES: OrderStatus[] = ["nuevo", "confirmado", "pagado", "enviado", "entregado", "cancelado"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  confirmado: "Confirmado",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  nuevo: "bg-brand-orange/10 text-brand-orange",
  confirmado: "bg-blue-100 text-blue-700",
  pagado: "bg-green-100 text-green-700",
  enviado: "bg-purple-100 text-purple-700",
  entregado: "bg-gray-100 text-gray-700",
  cancelado: "bg-red-100 text-red-700",
};

export type DeliveryType = "envio" | "retiro";

export type OrderItemInput = { id: number; qty: number };

export type OrderInput = {
  items: OrderItemInput[];
  customer: { nombre: string; telefono: string; email?: string; empresa?: string; rif?: string };
  delivery: {
    type: DeliveryType;
    sede?: "valencia" | "barcelona";
    estado?: string;
    ciudad?: string;
    direccion?: string;
    notas?: string;
  };
  payment: { method: PaymentMethodId; reference?: string };
  /** Honeypot anti-bots: debe venir vacío. */
  website?: string;
};

export type OrderItem = {
  id: number;
  name: string;
  ref: string | null;
  price: number;
  qty: number;
  image: string | null;
  categoryLabel: string;
};

export type WebOrder = {
  id: string;
  number: string;
  createdAt: string; // ISO
  createdAtLabel: string; // formateada en el servidor (evita diferencias de ICU entre Node y navegador)
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  currency: "USD";
  customer: OrderInput["customer"];
  delivery: OrderInput["delivery"];
  payment: OrderInput["payment"];
  source: "web";
};

/** Móvil venezolano: 0412/0414/0416/0424/0426 + 7 dígitos (acepta +58 y separadores). */
export const normalizeVePhone = (raw: string): string | null => {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("58")) digits = "0" + digits.slice(2);
  return /^0(412|414|416|424|426)\d{7}$/.test(digits) ? digits : null;
};

export const isValidEmail = (raw: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());

/** WhatsApp internacional a partir de un móvil nacional normalizado (04xx…). */
export const toWaNumber = (phone: string) => "58" + phone.replace(/^0/, "");
