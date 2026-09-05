"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/shop/cart";
import type { CartItem } from "@/lib/shop/cart";

/** Botón "Agregar al carrito" con confirmación breve. */
export default function AddToCart({ item, className = "" }: { item: Omit<CartItem, "qty">; className?: string }) {
  const { add, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.find((i) => i.id === item.id)?.qty ?? 0;

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(t);
  }, [justAdded]);

  return (
    <button
      type="button"
      onClick={() => {
        add(item);
        setJustAdded(true);
      }}
      aria-label={`Agregar ${item.name} al carrito`}
      className={`flex items-center justify-center gap-2 w-full font-semibold py-2.5 rounded-xl text-sm transition-colors ${
        justAdded ? "bg-green-600 text-white" : "bg-brand-orange hover:bg-brand-orange-dark text-white"
      } ${className}`}
    >
      {justAdded ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Agregado
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {inCart > 0 ? `Agregar otro (${inCart} en carrito)` : "Agregar al carrito"}
        </>
      )}
    </button>
  );
}
