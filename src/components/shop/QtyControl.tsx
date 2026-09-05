"use client";
import { MAX_QTY_PER_ITEM } from "@/lib/shop/config";

/** Control de cantidad (− n +). */
export default function QtyControl({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-8" : "h-10";
  const w = size === "sm" ? "w-8" : "w-10";
  return (
    <div className={`inline-flex items-center rounded-lg border border-gray-200 overflow-hidden ${h}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Quitar uno"
        className={`${w} h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-brand-dark`}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY_PER_ITEM}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(1, Math.min(MAX_QTY_PER_ITEM, n)));
        }}
        aria-label="Cantidad"
        className={`${size === "sm" ? "w-9 text-sm" : "w-12"} h-full text-center font-semibold text-brand-dark tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Agregar uno"
        className={`${w} h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-brand-dark`}
      >
        +
      </button>
    </div>
  );
}
