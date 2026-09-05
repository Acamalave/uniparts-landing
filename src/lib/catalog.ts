import data from "@/data/catalog.json";

export type Group = "equipos" | "repuestos";

export type Product = {
  id: number;
  slug: string;
  name: string;
  ref: string | null;
  description: string | null;
  group: Group;
  category: string;
  categoryLabel: string;
  brands: string[];
  qty: number;
  image: string | null; // /api/odoo-image/<id> (servida bajo demanda desde Odoo) o null
};

export const products = data as Product[];

export const GROUPS: Record<Group, { label: string; description: string }> = {
  equipos: { label: "Equipos", description: "Montacargas, apiladores y transpaletas" },
  repuestos: { label: "Repuestos", description: "Llantas, motor, eléctrico, frenos, hidráulico…" },
};

export type Category = { key: string; label: string; group: Group; count: number };

/** Categorías presentes en el catálogo: equipos primero, luego repuestos por cantidad. */
export const CATEGORIES: Category[] = (() => {
  const m = new Map<string, Category>();
  for (const p of products) {
    const c = m.get(p.category);
    if (c) c.count++;
    else m.set(p.category, { key: p.category, label: p.categoryLabel, group: p.group, count: 1 });
  }
  return Array.from(m.values()).sort((a, b) =>
    a.group !== b.group ? (a.group === "equipos" ? -1 : 1) : b.count - a.count
  );
})();

export const countByGroup = (g: Group) => products.filter((p) => p.group === g).length;

export const WHATSAPP_NUMBER = "584144025540";

/** Producto "portada" de una categoría (el primero con foto). */
export function categoryCover(key: string): Product | undefined {
  return (
    products.find((p) => p.category === key && p.image) ??
    products.find((p) => p.category === key)
  );
}

/** Selección variada: rota por categorías (equipos primero) tomando productos con foto. */
export function storeHighlights(limit = 8): Product[] {
  const pools = CATEGORIES.map((c) => products.filter((p) => p.category === c.key && p.image));
  const out: Product[] = [];
  let i = 0;
  while (out.length < limit && pools.some((l) => l.length > 0)) {
    const pool = pools[i % pools.length];
    if (pool.length) out.push(pool.shift()!);
    i++;
  }
  return out;
}
