// Cliente Odoo (JSON-RPC) — SOLO servidor. Nunca importar desde componentes cliente.
// Credenciales en .env.local / Vercel: ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY.

function cfg() {
  const url = process.env.ODOO_URL;
  const db = process.env.ODOO_DB;
  const user = process.env.ODOO_USER;
  const key = process.env.ODOO_API_KEY || process.env.ODOO_PASSWORD;
  if (!url || !db || !user || !key) {
    throw new Error("Odoo no configurado: faltan ODOO_URL / ODOO_DB / ODOO_USER / ODOO_API_KEY.");
  }
  return { url: url.replace(/\/$/, ""), db, user, key };
}

export const ODOO_COMPANY_ID = Number(process.env.ODOO_COMPANY_ID || 2);

async function rpc<T>(service: string, method: string, args: unknown[]): Promise<T> {
  const { url } = cfg();
  const r = await fetch(`${url}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: Date.now() }),
    cache: "no-store",
  });
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error(`Odoo respondió ${r.status} sin JSON.`);
  const j = await r.json();
  if (j.error) throw new Error(j.error?.data?.message || j.error?.message || "Error de Odoo");
  return j.result as T;
}

let uidPromise: Promise<number> | null = null;
/** Autentica una sola vez por proceso (uid en memoria). */
export function odooUid(): Promise<number> {
  if (!uidPromise) {
    const { db, user, key } = cfg();
    uidPromise = rpc<number | false>("common", "authenticate", [db, user, key, {}])
      .then((u) => {
        if (!u) throw new Error("Odoo: autenticación denegada (revisa ODOO_API_KEY).");
        return u;
      })
      .catch((e) => {
        uidPromise = null;
        throw e;
      });
  }
  return uidPromise;
}

export async function executeKw<T>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const { db, key } = cfg();
  const uid = await odooUid();
  return rpc<T>("object", "execute_kw", [db, uid, key, model, method, args, kwargs]);
}

export type Domain = unknown[];

export const searchRead = <T = Record<string, unknown>>(
  model: string,
  domain: Domain,
  fields: string[],
  opts: { limit?: number; offset?: number; order?: string } = {}
) => executeKw<T[]>(model, "search_read", [domain], { fields, ...opts });

export const searchCount = (model: string, domain: Domain) =>
  executeKw<number>(model, "search_count", [domain]);

export const readGroup = <T = Record<string, unknown>>(
  model: string,
  domain: Domain,
  fields: string[],
  groupby: string[],
  opts: { orderby?: string; limit?: number } = {}
) => executeKw<T[]>(model, "read_group", [domain, fields, groupby], { lazy: false, ...opts });
