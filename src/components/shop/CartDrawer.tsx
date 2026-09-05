"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/shop/cart";
import { fmtPrice } from "@/lib/catalog";
import QtyControl from "./QtyControl";

/** Cajón lateral del carrito. Se abre al agregar un producto o desde el header. */
export default function CartDrawer() {
  const { items, open, closeCart, setQty, remove, subtotal, count } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeCart]);

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-brand-dark/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-xl text-brand-dark">Tu carrito</h2>
            <p className="text-xs text-gray-400">{count} {count === 1 ? "artículo" : "artículos"}</p>
          </div>
          <button onClick={closeCart} aria-label="Cerrar" className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Tu carrito está vacío.</p>
              <button onClick={closeCart} className="text-brand-orange font-semibold text-sm hover:underline">Seguir comprando</button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((it) => (
                <li key={it.id} className="py-4 flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt="" className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <span className="text-[10px] text-gray-300">Sin foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 truncate">{it.categoryLabel}{it.ref ? ` · ${it.ref}` : ""}</p>
                    <p className="text-sm font-semibold text-brand-dark leading-snug line-clamp-2">{it.name}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QtyControl value={it.qty} onChange={(q) => setQty(it.id, q)} size="sm" />
                      <p className="text-sm font-semibold text-brand-dark tabular-nums">US$ {fmtPrice(it.price * it.qty)}</p>
                    </div>
                  </div>
                  <button onClick={() => remove(it.id)} aria-label="Quitar" className="self-start text-gray-300 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-xl font-semibold text-brand-dark tabular-nums">US$ {fmtPrice(subtotal)}</span>
            </div>
            <p className="text-[11px] text-gray-400">Envío se confirma por WhatsApp según destino. Retiro en sede sin costo.</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Finalizar pedido
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <button onClick={closeCart} className="w-full text-sm text-gray-500 hover:text-brand-dark py-1">Seguir comprando</button>
          </footer>
        )}
      </aside>
    </div>
  );
}
