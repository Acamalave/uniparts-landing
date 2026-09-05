"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products, CATEGORIES } from "@/lib/catalog";
import ProductCard from "./ProductCard";

// Grupos de alto nivel (las dos opciones del hero)
const GROUPS: Record<string, { label: string; cats: string[] }> = {
  equipos: { label: "Equipos", cats: ["montacargas", "transpaletas"] },
  repuestos: { label: "Repuestos", cats: ["llantas", "cilindros-gas", "asientos", "accesorios"] },
};

export default function CatalogBrowser() {
  const params = useSearchParams();
  const grupoParam = params.get("grupo");
  const catParam = params.get("cat");
  const initial =
    grupoParam && GROUPS[grupoParam]
      ? `grupo:${grupoParam}`
      : catParam && CATEGORIES.some((c) => c.key === catParam)
        ? catParam
        : "all";

  const [cat, setCat] = useState<string>(initial);
  const [q, setQ] = useState("");

  const matchesCat = (category: string, key: string) => {
    if (key === "all") return true;
    if (key.startsWith("grupo:")) return GROUPS[key.slice(6)]?.cats.includes(category) ?? false;
    return category === key;
  };

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: products.length };
    for (const p of products) m[p.category] = (m[p.category] || 0) + 1;
    for (const g of Object.keys(GROUPS)) m[`grupo:${g}`] = products.filter((p) => matchesCat(p.category, `grupo:${g}`)).length;
    return m;
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (!matchesCat(p.category, cat)) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.ref || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
      );
    });
  }, [cat, q]);

  const groupChips = Object.entries(GROUPS).map(([k, g]) => ({ key: `grupo:${k}`, label: g.label }));
  const chips = [{ key: "all", label: "Todos" }, ...groupChips, ...CATEGORIES];

  return (
    <div>
      {/* Buscador */}
      <div className="relative max-w-md mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por modelo, referencia o medida (ej: 6.00-9, ACC30D)"
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
        />
      </div>

      {/* Filtros: grupos + categorías */}
      <div className="flex flex-wrap gap-2 mb-8">
        {chips.map((c, i) => {
          const isGroup = c.key.startsWith("grupo:");
          const active = cat === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                active
                  ? "bg-brand-orange text-white"
                  : isGroup
                    ? "bg-brand-dark text-white hover:bg-brand-orange/90"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-orange/50"
              } ${i === groupChips.length ? "ml-2" : ""}`}
            >
              {c.label}
              <span className={`ml-1.5 ${active || isGroup ? "text-white/70" : "text-gray-400"}`}>
                {counts[c.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resultados */}
      <p className="text-gray-500 text-sm mb-5">
        {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          No encontramos productos con ese criterio. Prueba otra búsqueda o
          escríbenos por WhatsApp.
        </div>
      )}
    </div>
  );
}
