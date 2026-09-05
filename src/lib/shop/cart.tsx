"use client";
// Carrito de compras: estado global en React + persistencia en localStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CART_STORAGE_KEY, MAX_QTY_PER_ITEM } from "./config";
import type { OrderItem } from "./orders";

export type CartItem = OrderItem;

type CartState = {
  items: CartItem[];
  ready: boolean; // true cuando ya se leyó localStorage (evita parpadeo SSR)
  open: boolean;
  lastAdded: number | null;
};

type CartApi = CartState & {
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartApi | null>(null);

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    return Array.isArray(parsed.items) ? parsed.items.filter((i) => i && i.id && i.qty > 0) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, savedAt: Date.now() }));
  } catch {
    /* almacenamiento no disponible (modo privado): el carrito vive solo en memoria */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], ready: false, open: false, lastAdded: null });

  useEffect(() => {
    setState((s) => ({ ...s, items: load(), ready: true }));
    // Sincroniza entre pestañas.
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) setState((s) => ({ ...s, items: load() }));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (items: CartItem[]) => CartItem[]) => {
    setState((s) => {
      const items = fn(s.items);
      save(items);
      return { ...s, items };
    });
  }, []);

  const add = useCallback<CartApi["add"]>(
    (item, qty = 1) => {
      update((items) => {
        const i = items.findIndex((x) => x.id === item.id);
        if (i >= 0) {
          const next = [...items];
          next[i] = { ...next[i], qty: Math.min(MAX_QTY_PER_ITEM, next[i].qty + qty) };
          return next;
        }
        return [...items, { ...item, qty: Math.min(MAX_QTY_PER_ITEM, qty) }];
      });
      setState((s) => ({ ...s, open: true, lastAdded: item.id }));
    },
    [update]
  );

  const setQty = useCallback<CartApi["setQty"]>(
    (id, qty) =>
      update((items) =>
        qty <= 0
          ? items.filter((x) => x.id !== id)
          : items.map((x) => (x.id === id ? { ...x, qty: Math.min(MAX_QTY_PER_ITEM, qty) } : x))
      ),
    [update]
  );
  const remove = useCallback<CartApi["remove"]>((id) => update((items) => items.filter((x) => x.id !== id)), [update]);
  const clear = useCallback(() => update(() => []), [update]);
  const openCart = useCallback(() => setState((s) => ({ ...s, open: true })), []);
  const closeCart = useCallback(() => setState((s) => ({ ...s, open: false, lastAdded: null })), []);

  const value = useMemo<CartApi>(() => {
    const count = state.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = state.items.reduce((n, i) => n + i.price * i.qty, 0);
    return { ...state, count, subtotal, add, setQty, remove, clear, openCart, closeCart };
  }, [state, add, setQty, remove, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
