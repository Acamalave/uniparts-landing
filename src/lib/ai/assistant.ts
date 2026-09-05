// Asistente con IA (Claude) + herramientas sobre el catálogo. Solo servidor.
// Sin ANTHROPIC_API_KEY funciona en modo respaldo (búsqueda directa en el catálogo) para no romper el chat.
import Anthropic from "@anthropic-ai/sdk";
import { BUSINESS, SYSTEM_PROMPT } from "./knowledge";
import { listCategories, searchProducts, type ProductHit } from "./tools";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AssistantResult = {
  reply: string;
  products: ProductHit[];
  handoff: boolean; // el asistente pidió pasar a un asesor humano
  mode: "ia" | "respaldo";
};

const MODEL = process.env.AI_MODEL || "claude-sonnet-5";
const MAX_TOOL_ROUNDS = 4;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "buscar_productos",
    description:
      "Busca en el catálogo real de Uniparts (repuestos, llantas, baterías, equipos) por texto libre: nombre, referencia/código, marca, medida (ej. 7.00-12) o categoría. Devuelve nombre, referencia, categoría, precio en USD (null = se cotiza por WhatsApp) y si hay stock.",
    input_schema: {
      type: "object",
      properties: {
        consulta: { type: "string", description: "Texto a buscar, en las palabras del cliente o su referencia" },
        categoria: { type: "string", description: "Opcional: categoría para acotar (Motor, Frenos, Llantas y cauchos, Sistema eléctrico, etc.)" },
        limite: { type: "number", description: "Máximo de resultados (1–8, por defecto 5)" },
      },
      required: ["consulta"],
    },
  },
  {
    name: "listar_categorias",
    description: "Lista las categorías del catálogo con la cantidad de productos en stock en cada una.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "pasar_a_asesor",
    description:
      "Marca la conversación para que un asesor humano de Uniparts la continúe (aquí mismo o por WhatsApp). Úsala cuando el cliente lo pida o el tema exceda tus reglas.",
    input_schema: {
      type: "object",
      properties: { motivo: { type: "string", description: "Resumen breve de lo que necesita el cliente" } },
      required: ["motivo"],
    },
  },
];

export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

/** Modo respaldo sin IA: búsqueda directa + respuestas fijas. */
function fallback(turns: ChatTurn[]): AssistantResult {
  const last = turns[turns.length - 1]?.content ?? "";
  const t = last.toLowerCase();
  if (/asesor|humano|persona|hablar con alguien/.test(t)) {
    return { reply: `Claro, un asesor sigue contigo. También puedes escribirnos al WhatsApp ${BUSINESS.whatsapp}.`, products: [], handoff: true, mode: "respaldo" };
  }
  if (/horario|hora|abren|cierran/.test(t)) {
    return { reply: `Atendemos ${BUSINESS.horario}. Sedes: ${BUSINESS.sedes.join(" y ")}.`, products: [], handoff: false, mode: "respaldo" };
  }
  if (/pago|pagar|zelle|transferencia|pago m[oó]vil/.test(t)) {
    return { reply: `Aceptamos ${BUSINESS.pagos.join(", ")}. ${BUSINESS.moneda}`, products: [], handoff: false, mode: "respaldo" };
  }
  const hits = searchProducts(last, { limite: 4 });
  if (hits.length) {
    return {
      reply: `Esto es lo que encontré en nuestro inventario para "${last.trim()}". Puedes agregarlos al carrito o pedir una cotización por WhatsApp.`,
      products: hits,
      handoff: false,
      mode: "respaldo",
    };
  }
  return {
    reply: `Puedo ayudarte a buscar repuestos por nombre, referencia o medida (por ejemplo "llanta 7.00-12" o "filtro Toyota"). Si prefieres, escríbenos al WhatsApp ${BUSINESS.whatsapp}.`,
    products: [],
    handoff: false,
    mode: "respaldo",
  };
}

/** Ejecuta el asistente sobre el historial (el último turno debe ser del usuario). */
export async function runAssistant(turns: ChatTurn[]): Promise<AssistantResult> {
  if (!aiConfigured()) return fallback(turns);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = turns.slice(-16).map((t) => ({ role: t.role, content: t.content }));
  let products: ProductHit[] = [];
  let handoff = false;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
      tools: TOOLS,
    });

    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || toolUses.length === 0) {
      const reply = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply: reply || "¿En qué más puedo ayudarte?", products, handoff, mode: "ia" };
    }

    // Ejecutar herramientas y devolver resultados
    const results: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => {
      const input = (tu.input ?? {}) as Record<string, unknown>;
      let output: unknown;
      if (tu.name === "buscar_productos") {
        const hits = searchProducts(String(input.consulta ?? ""), {
          categoria: input.categoria ? String(input.categoria) : undefined,
          limite: typeof input.limite === "number" ? input.limite : undefined,
        });
        products = hits;
        output = hits.length ? hits : "Sin resultados en el catálogo para esa búsqueda.";
      } else if (tu.name === "listar_categorias") {
        output = listCategories();
      } else if (tu.name === "pasar_a_asesor") {
        handoff = true;
        output = "Conversación marcada para un asesor humano. Indícale al cliente que lo atenderán aquí o por WhatsApp.";
      } else {
        output = "Herramienta desconocida.";
      }
      return { type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(output) };
    });

    messages.push({ role: "assistant", content: res.content });
    messages.push({ role: "user", content: results });
  }

  return { reply: `Déjame pasarte con un asesor para ayudarte mejor. También puedes escribirnos al WhatsApp ${BUSINESS.whatsapp}.`, products, handoff: true, mode: "ia" };
}
