import data from "@/data/catalog.json";

export type Product = {
  id: number;
  slug: string;
  name: string;
  ref: string | null;
  description: string | null;
  category: string;
  categoryLabel: string;
  image: string | null;
};

export const products = data as Product[];

export const CATEGORIES: { key: string; label: string }[] = [
  { key: "montacargas", label: "Montacargas" },
  { key: "transpaletas", label: "Transpaletas manuales" },
  { key: "llantas", label: "Llantas y cauchos" },
  { key: "cilindros-gas", label: "Cilindros y sistema GLP" },
  { key: "asientos", label: "Asientos" },
  { key: "accesorios", label: "Accesorios" },
];

export const WHATSAPP_NUMBER = "584144025540";

/** Producto "portada" de una categoría (el primero con foto). */
export function categoryCover(key: string): Product | undefined {
  return (
    products.find((p) => p.category === key && p.image) ??
    products.find((p) => p.category === key)
  );
}

/** Selección variada para la tienda: rota por categorías tomando productos con foto. */
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

