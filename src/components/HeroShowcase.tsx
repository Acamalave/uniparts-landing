"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export type ShowcaseItem = {
  id: number;
  name: string;
  image: string;
  categoryLabel: string;
  ref: string | null;
  href: string;
  price: string | null; // ya formateado (ej. "1.234,50") o null = a consultar
};

/** Showcase animado del hero: rota productos reales con transición suave. */
export default function HeroShowcase({
  items,
  interval = 3600,
}: {
  items: ShowcaseItem[];
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [paused, items.length, interval]);

  if (items.length === 0) return null;
  const cur = items[i];

  return (
    <div
      className="relative animate-slide-in-right"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Formas de acento detrás del panel */}
      <div className="absolute -inset-4 rounded-[2.2rem] bg-brand-orange/15 rotate-3" />
      <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-brand-orange/40 to-transparent -rotate-2" />

      {/* Panel */}
      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white border border-white/10 shadow-2xl">
        {/* Slides (todas montadas; solo la activa es visible) */}
        {items.map((it, idx) => {
          const active = idx === i;
          return (
            <div
              key={it.id}
              aria-hidden={!active}
              className={`absolute inset-0 flex items-center justify-center px-8 pt-16 pb-32 transition-all duration-700 ease-out ${
                active ? "opacity-100 scale-100" : "opacity-0 scale-[1.06] pointer-events-none"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.image}
                alt={it.name}
                loading={idx === 0 ? "eager" : "lazy"}
                className="max-h-full max-w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)]"
              />
            </div>
          );
        })}

        {/* Etiqueta superior */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 bg-brand-dark text-white text-[10px] font-semibold tracking-wide px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            En la tienda
          </span>
          <span className="text-[11px] text-gray-400 font-medium tabular-nums">
            {i + 1} / {items.length}
          </span>
        </div>

        {/* Pie con datos del producto */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent px-6 pt-12 pb-5">
          <span className="inline-block text-[10px] font-semibold tracking-wide text-brand-orange">
            {cur.categoryLabel}
          </span>
          <p key={cur.id} className="font-display font-bold text-lg text-brand-dark leading-tight mt-1 line-clamp-2 animate-fade-in-up">
            {cur.name}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            {cur.price ? (
              <p className="text-brand-dark leading-none tabular-nums tracking-tight">
                <span className="text-xs text-gray-400 mr-1">US$</span>
                <span className="text-base font-semibold">{cur.price}</span>
              </p>
            ) : cur.ref ? (
              <p className="text-xs text-gray-400">Ref. {cur.ref}</p>
            ) : (
              <span />
            )}
            <Link href={cur.href} className="text-xs font-semibold text-brand-orange hover:underline whitespace-nowrap">
              Ver en la tienda →
            </Link>
          </div>
          <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              key={`p-${i}`}
              className="h-full bg-brand-orange animate-progress"
              style={{ animationDuration: `${interval}ms`, animationPlayState: paused ? "paused" : "running" }}
            />
          </div>
        </div>
      </div>

      {/* Puntos */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
        {items.map((it, idx) => (
          <button
            key={it.id}
            onClick={() => setI(idx)}
            aria-label={`Ver ${it.name}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === i ? "w-7 bg-brand-orange" : "w-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
