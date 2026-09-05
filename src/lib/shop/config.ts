// Configuración de la tienda (checkout). Editar aquí datos de pago y sedes.
// Los datos bancarios vacíos se muestran como "te los enviamos por WhatsApp".

export type PaymentMethodId = "pago-movil" | "transferencia" | "zelle" | "al-recibir";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  description: string;
  /** Líneas con los datos para pagar (banco, teléfono, RIF, correo…). Vacío = se envían por WhatsApp. */
  details: string[];
  /** Si true, el cliente puede escribir el número de referencia del pago. */
  askReference: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pago-movil",
    label: "Pago móvil",
    description: "Bolívares a tasa BCV del día",
    details: [],
    askReference: true,
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    description: "Bolívares o dólares",
    details: [],
    askReference: true,
  },
  {
    id: "zelle",
    label: "Zelle",
    description: "Dólares",
    details: [],
    askReference: true,
  },
  {
    id: "al-recibir",
    label: "Pagar al recibir o retirar",
    description: "Efectivo, punto de venta o pago móvil en la entrega",
    details: [],
    askReference: false,
  },
];

export type Sede = { id: "valencia" | "barcelona"; label: string; address: string };

export const SEDES: Sede[] = [
  { id: "valencia", label: "Sede Valencia", address: "Valencia, Carabobo" },
  { id: "barcelona", label: "Sede Oriente", address: "Barcelona, Anzoátegui" },
];

export const ESTADOS_VE = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes",
  "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "La Guaira", "Lara", "Mérida",
  "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo",
  "Yaracuy", "Zulia",
];

export const SHIPPING_NOTE =
  "El costo del envío depende del destino y del peso; te lo confirmamos por WhatsApp antes de despachar. Retiro en sede: sin costo.";

export const CART_STORAGE_KEY = "up_cart_v1";
export const CHECKOUT_STORAGE_KEY = "up_checkout_v1";
export const MAX_QTY_PER_ITEM = 99;
