"use client";
import { useCart } from "@/lib/shop/cart";

/** Ícono del carrito para el header, con contador. */
export default function CartButton({ className = "" }: { className?: string }) {
  const { count, openCart, ready } = useCart();
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir carrito (${count} ${count === 1 ? "artículo" : "artículos"})`}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-white/85 hover:text-white hover:bg-white/10 transition-colors ${className}`}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
