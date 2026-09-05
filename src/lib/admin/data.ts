// Capa de datos del admin.
// NOTA: por ahora usa datos de ejemplo (mock) + datos reales del catálogo.
// Cuando estén las credenciales, estas funciones se reemplazan por consultas
// reales a Odoo (pedidos/clientes) y a WhatsApp/Meta (inbox) sin tocar la UI.

import { products } from "@/lib/catalog";

export const usd = (n: number) =>
  new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(n);

/* ---------------- Pedidos ---------------- */
export type OrderState =
  | "pendiente"
  | "pagado"
  | "enviado"
  | "entregado"
  | "cancelado";

export type Order = {
  id: string;
  ref: string;
  cliente: string;
  empresa?: string;
  fecha: string; // ISO
  total: number;
  estado: OrderState;
  items: number;
  canal: "web" | "whatsapp" | "mostrador";
};

export const ORDERS: Order[] = [
  { id: "1", ref: "PED-1042", cliente: "José Rondón", empresa: "Alimentos La Caracas", fecha: "2026-06-24", total: 68864.67, estado: "pendiente", items: 1, canal: "whatsapp" },
  { id: "2", ref: "PED-1041", cliente: "María González", empresa: "Distribuidora Andes", fecha: "2026-06-23", total: 1240.0, estado: "pagado", items: 4, canal: "web" },
  { id: "3", ref: "PED-1040", cliente: "Carlos Pérez", empresa: "Ferretería El Tornillo", fecha: "2026-06-22", total: 320.5, estado: "enviado", items: 6, canal: "whatsapp" },
  { id: "4", ref: "PED-1039", cliente: "Logística Valencia C.A.", fecha: "2026-06-20", total: 40510.0, estado: "entregado", items: 1, canal: "web" },
  { id: "5", ref: "PED-1038", cliente: "Ana Herrera", empresa: "Manufactura Carabobo", fecha: "2026-06-19", total: 890.0, estado: "pagado", items: 3, canal: "mostrador" },
  { id: "6", ref: "PED-1037", cliente: "Pedro Silva", fecha: "2026-06-18", total: 156.0, estado: "cancelado", items: 2, canal: "whatsapp" },
  { id: "7", ref: "PED-1036", cliente: "Inversiones Oriente 2020", fecha: "2026-06-17", total: 2450.0, estado: "entregado", items: 5, canal: "web" },
];

export const orderStateStyle: Record<OrderState, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  pagado: "bg-blue-100 text-blue-700",
  enviado: "bg-indigo-100 text-indigo-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

/* ---------------- Clientes ---------------- */
export type Customer = {
  id: string;
  nombre: string;
  empresa?: string;
  telefono: string;
  email?: string;
  ciudad: string;
  pedidos: number;
  total: number;
  etapa: "nuevo" | "contactado" | "cotizado" | "ganado" | "perdido";
};

export const CUSTOMERS: Customer[] = [
  { id: "1", nombre: "José Rondón", empresa: "Alimentos La Caracas", telefono: "+58 412-1234567", email: "jose@alimentoslc.com", ciudad: "Caracas", pedidos: 3, total: 71200, etapa: "cotizado" },
  { id: "2", nombre: "María González", empresa: "Distribuidora Andes", telefono: "+58 414-7654321", email: "maria@dandes.com", ciudad: "Mérida", pedidos: 5, total: 4210, etapa: "ganado" },
  { id: "3", nombre: "Carlos Pérez", empresa: "Ferretería El Tornillo", telefono: "+58 424-9988776", ciudad: "Valencia", pedidos: 8, total: 3120, etapa: "ganado" },
  { id: "4", nombre: "Logística Valencia C.A.", telefono: "+58 241-8001122", email: "compras@logval.com", ciudad: "Valencia", pedidos: 2, total: 81020, etapa: "ganado" },
  { id: "5", nombre: "Ana Herrera", empresa: "Manufactura Carabobo", telefono: "+58 416-3344556", ciudad: "Valencia", pedidos: 1, total: 890, etapa: "contactado" },
  { id: "6", nombre: "Pedro Silva", telefono: "+58 426-1122334", ciudad: "Barcelona", pedidos: 0, total: 0, etapa: "nuevo" },
];

/* ---------------- Inbox (WhatsApp) ---------------- */
export type ChatMsg = { de: "cliente" | "negocio"; texto: string; hora: string };
export type Conversation = {
  id: string;
  nombre: string;
  canal: "whatsapp" | "instagram" | "messenger";
  telefono?: string;
  ultimo: string;
  hora: string;
  noLeidos: number;
  etapa: Customer["etapa"];
  mensajes: ChatMsg[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "1", nombre: "José Rondón", canal: "whatsapp", telefono: "+58 412-1234567",
    ultimo: "¿Tienen el montacargas de 3 toneladas diésel?", hora: "10:32", noLeidos: 2, etapa: "cotizado",
    mensajes: [
      { de: "cliente", texto: "Buenos días, necesito un montacargas para almacén", hora: "10:20" },
      { de: "negocio", texto: "¡Hola José! Con gusto. ¿Qué capacidad de carga necesita?", hora: "10:25" },
      { de: "cliente", texto: "Unas 3 toneladas", hora: "10:30" },
      { de: "cliente", texto: "¿Tienen el montacargas de 3 toneladas diésel?", hora: "10:32" },
    ],
  },
  {
    id: "2", nombre: "María González", canal: "whatsapp", telefono: "+58 414-7654321",
    ultimo: "Perfecto, gracias por la cotización", hora: "09:15", noLeidos: 0, etapa: "ganado",
    mensajes: [
      { de: "cliente", texto: "Necesito cauchos 6.00-9", hora: "09:00" },
      { de: "negocio", texto: "Tenemos sólidos y neumáticos 6.00-9. Le paso precios.", hora: "09:10" },
      { de: "cliente", texto: "Perfecto, gracias por la cotización", hora: "09:15" },
    ],
  },
  {
    id: "3", nombre: "Ferretería El Tornillo", canal: "instagram", telefono: "+58 424-9988776",
    ultimo: "¿Manejan transpaletas manuales?", hora: "Ayer", noLeidos: 1, etapa: "contactado",
    mensajes: [
      { de: "cliente", texto: "¿Manejan transpaletas manuales?", hora: "Ayer" },
    ],
  },
  {
    id: "4", nombre: "Ana Herrera", canal: "whatsapp", telefono: "+58 416-3344556",
    ultimo: "Quedo pendiente entonces", hora: "Ayer", noLeidos: 0, etapa: "contactado",
    mensajes: [
      { de: "negocio", texto: "Le confirmo disponibilidad mañana temprano.", hora: "Ayer" },
      { de: "cliente", texto: "Quedo pendiente entonces", hora: "Ayer" },
    ],
  },
];

/* ---------------- Métricas (derivadas de los mocks) ---------------- */
export function metrics() {
  const ventasMes = ORDERS.filter((o) => o.estado !== "cancelado").reduce((s, o) => s + o.total, 0);
  const pedidosMes = ORDERS.length;
  const porEstado = ORDERS.reduce<Record<string, number>>((m, o) => {
    m[o.estado] = (m[o.estado] || 0) + 1;
    return m;
  }, {});
  const leadsSinContactar = CUSTOMERS.filter((c) => c.etapa === "nuevo").length;
  const embudo = (["nuevo", "contactado", "cotizado", "ganado", "perdido"] as const).map((e) => ({
    etapa: e,
    n: CUSTOMERS.filter((c) => c.etapa === e).length,
  }));
  const ventasPorMes = [
    { mes: "Ene", v: 32000 }, { mes: "Feb", v: 41000 }, { mes: "Mar", v: 38500 },
    { mes: "Abr", v: 52000 }, { mes: "May", v: 47800 }, { mes: "Jun", v: ventasMes },
  ];
  return { ventasMes, pedidosMes, porEstado, leadsSinContactar, embudo, ventasPorMes };
}

/* ---------------- Salud de datos (REAL, del catálogo) ---------------- */
export function dataHealth() {
  const total = products.length;
  const sinImagen = products.filter((p) => !p.image);
  const sinRef = products.filter((p) => !p.ref);
  const sinDescripcion = products.filter((p) => !p.description);
  const porCategoria = products.reduce<Record<string, number>>((m, p) => {
    m[p.categoryLabel] = (m[p.categoryLabel] || 0) + 1;
    return m;
  }, {});
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const checks = [
    { label: "Productos con foto", ok: total - sinImagen.length, total, gravedad: sinImagen.length > total * 0.3 ? "alta" : "media" as const },
    { label: "Productos con referencia (código)", ok: total - sinRef.length, total, gravedad: sinRef.length > 0 ? "media" : "ok" as const },
    { label: "Productos con descripción", ok: total - sinDescripcion.length, total, gravedad: sinDescripcion.length > total * 0.5 ? "alta" : "media" as const },
  ];
  return {
    total,
    sinImagen: sinImagen.length,
    sinRef: sinRef.length,
    sinDescripcion: sinDescripcion.length,
    porCategoria,
    checks,
    pct,
    ejemplosSinFoto: sinImagen.slice(0, 6),
  };
}
