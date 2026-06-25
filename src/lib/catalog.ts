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

/** Productos destacados para el landing: montacargas con foto + una transpaleta. */
export function featuredProducts(limit = 8): Product[] {
  const forklifts = products.filter((p) => p.category === "montacargas" && p.image);
  const pallet = products.find((p) => p.category === "transpaletas" && p.image);
  const list = [...forklifts];
  if (pallet) list.splice(3, 0, pallet);
  return list.slice(0, limit);
}
