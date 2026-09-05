// Herramientas del asistente: consultan el catálogo real (solo lectura).
import { CATEGORIES, products, type Product } from "@/lib/catalog";

export type ProductHit = {
  id: number;
  nombre: string;
  ref: string | null;
  categoria: string;
  marcas: string[];
  precioUsd: number | null;
  enStock: boolean;
  foto: string | null;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9./x-]+/g, " ")
    .trim();

const toHit = (p: Product): ProductHit => ({
  id: p.id,
  nombre: p.name,
  ref: p.ref,
  categoria: p.categoryLabel,
  marcas: p.brands ?? [],
  precioUsd: p.price,
  enStock: p.qty > 0,
  foto: p.image,
});

/** Búsqueda por texto libre: referencia exacta primero, luego coincidencia de términos en nombre/ref/marca/descripción. */
export function searchProducts(query: string, opts: { categoria?: string; limite?: number } = {}): ProductHit[] {
  const limit = Math.max(1, Math.min(opts.limite ?? 5, 8));
  const q = norm(query);
  if (!q) return [];
  const terms = q.split(" ").filter((t) => t.length > 1);
  const cat = opts.categoria ? norm(opts.categoria) : null;
  const pool = cat
    ? products.filter((p) => norm(p.categoryLabel).includes(cat) || norm(p.category).includes(cat))
    : products;

  const scored = pool
    .map((p) => {
      const name = norm(p.name);
      const ref = norm(p.ref ?? "");
      const brand = norm((p.brands ?? []).join(" "));
      const desc = norm(p.description ?? "");
      let score = 0;
      if (ref && (ref === q || ref.replace(/[-\s]/g, "") === q.replace(/[-\s]/g, ""))) score += 100;
      for (const t of terms) {
        if (name.includes(t)) score += 10;
        if (ref.includes(t)) score += 8;
        if (brand.includes(t)) score += 5;
        if (desc.includes(t)) score += 2;
      }
      if (score > 0 && p.price != null) score += 1; // preferimos lo que se puede comprar en línea
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));

  return scored.slice(0, limit).map((x) => toHit(x.p));
}

export function listCategories(): { categoria: string; grupo: string; productos: number }[] {
  return CATEGORIES.map((c) => ({ categoria: c.label, grupo: c.group, productos: c.count }));
}

export function getProductsByIds(ids: number[]): ProductHit[] {
  const set = new Set(ids);
  return products.filter((p) => set.has(p.id)).map(toHit);
}
