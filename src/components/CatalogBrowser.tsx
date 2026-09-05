"use client";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { products, CATEGORIES, GROUPS, type Group } from "@/lib/catalog";
import ProductCard from "./ProductCard";

const PAGE = 48;

export default function CatalogBrowser() {
  const params = useSearchParams();
  const grupoParam = params.get("grupo") as Group | null;
  const catParam = params.get("cat");
  const initial =
    grupoParam && GROUPS[grupoParam]
      ? `grupo:${grupoParam}`
      : catParam && CATEGORIES.some((c) => c.key === catParam)
        ? catParam
        : "all";

  const [cat, setCat] = useState<string>(initial);
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [cat, q]);

  const activeGroup: Group | null = cat.startsWith("grupo:")
    ? (cat.slice(6) as Group)
    : (CATEGORIES.find((c) => c.key === cat)?.group ?? null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat.startsWith("grupo:") ? p.group !== cat.slice(6) : cat !== "all" && p.category !== cat) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.ref || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term) ||
        p.brands.some((b) => b.toLowerCase().includes(term))
      );
    });
  }, [cat, q]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: products.length };
    for (const p of products) {
      m[p.category] = (m[p.category] || 0) + 1;
      m[`grupo:${p.group}`] = (m[`grupo:${p.group}`] || 0) + 1;
    }
    return m;
  }, []);

  // Chips de categoría: si hay un grupo activo, solo las de ese grupo.
  const catChips = CATEGORIES.filter((c) => !activeGroup || c.group === activeGroup);
  const visible = filtered.slice(0, shown);

  const chip = (key: string, label: string, kind: "all" | "group" | "cat") => {
    const active = cat === key;
    return (
      <button
        key={key}
        onClick={() => setCat(key)}
        className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
          active
            ? "bg-brand-orange text-white"
            : kind === "group"
              ? "bg-brand-dark text-white hover:bg-brand-orange/90"
              : "bg-white text-gray-600 border border-gray-200 hover:border-brand-orange/50"
        }`}
      >
        {label}
        <span className={`ml-1.5 ${active || kind === "group" ? "text-white/70" : "text-gray-400"}`}>
          {(counts[key] || 0).toLocaleString("es-VE")}
        </span>
      </button>
    );
  };

  return (
    <div>
      {/* Buscador */}
      <div className="relative max-w-md mb-5">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por referencia, modelo, marca o medida (ej: 6.00-9, TOYOTA)"
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm transition-all"
        />
      </div>

      {/* Grupos */}
      <div className="flex flex-wrap gap-2 mb-3">
        {chip("all", "Todos", "all")}
        {(Object.keys(GROUPS) as Group[]).map((g) => chip(`grupo:${g}`, GROUPS[g].label, "group"))}
      </div>
      {/* Categorías */}
      <div className="flex flex-wrap gap-2 mb-8">
        {catChips.map((c) => chip(c.key, c.label, "cat"))}
      </div>

      <p className="text-gray-500 text-sm mb-5">
        {filtered.length.toLocaleString("es-VE")} {filtered.length === 1 ? "producto" : "productos"}
        {q && <span> para “{q}”</span>}
      </p>

      {visible.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {shown < filtered.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setShown((s) => s + PAGE)}
                className="bg-brand-dark hover:bg-brand-orange text-white font-bold px-8 py-3.5 rounded-xl transition-all"
              >
                Cargar más ({(filtered.length - shown).toLocaleString("es-VE")} restantes)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          No encontramos productos con ese criterio. Prueba otra búsqueda o escríbenos por WhatsApp.
        </div>
      )}
    </div>
  );
}
