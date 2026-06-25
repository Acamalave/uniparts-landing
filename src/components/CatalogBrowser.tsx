"use client";
import { useMemo, useState } from "react";
import { products, CATEGORIES } from "@/lib/catalog";
import ProductCard from "./ProductCard";

export default function CatalogBrowser() {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: products.length };
    for (const p of products) m[p.category] = (m[p.category] || 0) + 1;
    return m;
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.ref || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
      );
    });
  }, [cat, q]);

  const chips = [{ key: "all", label: "Todos" }, ...CATEGORIES];

  return (
    <div>
      {/* Buscador */}
      <div className="relative max-w-md mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              cat === c.key
                ? "bg-brand-orange text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-brand-orange/50"
            }`}
          >
            {c.label}
            <span className={`ml-1.5 ${cat === c.key ? "text-white/70" : "text-gray-400"}`}>
              {counts[c.key] || 0}
            </span>
          </button>
        ))}
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
