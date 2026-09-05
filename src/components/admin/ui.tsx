import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-black text-brand-dark">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>{children}</div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  accent = "orange",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "orange" | "green" | "blue" | "amber" | "dark";
}) {
  const accents: Record<string, string> = {
    orange: "text-brand-orange",
    green: "text-green-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    dark: "text-brand-dark",
  };
  return (
    <Card className="p-5">
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-black mt-2 ${accents[accent]}`}>{value}</p>
      {hint && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    </Card>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

/** Aviso de que la sección usa datos de ejemplo hasta conectar la fuente real. */
export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
      <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
