"use client";
import { Fragment, useState } from "react";
import { fmtPrice } from "@/lib/catalog";
import { PAYMENT_METHODS, SEDES } from "@/lib/shop/config";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, toWaNumber, type OrderStatus, type WebOrder } from "@/lib/shop/orders";

/** Tabla de pedidos de la tienda web con cambio de estado en línea y detalle desplegable. */
export default function WebOrdersTable({ orders, canUpdate }: { orders: WebOrder[]; canUpdate: boolean }) {
  const [rows, setRows] = useState(orders);
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (id: string, status: OrderStatus) => {
    setSaving(id);
    setError(null);
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) {
      setRows(prev);
      setError((await res.json().catch(() => ({}))).error || "No se pudo actualizar.");
    }
    setSaving(null);
  };

  if (rows.length === 0) {
    return <p className="px-5 py-10 text-center text-gray-400 text-sm">Aún no hay pedidos desde la tienda web.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {error && <p className="px-5 pt-3 text-sm text-red-600">{error}</p>}
      <table className="w-full text-sm min-w-[820px]">
        <thead>
          <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
            <th className="px-5 py-3 font-semibold">Pedido</th>
            <th className="px-5 py-3 font-semibold">Cliente</th>
            <th className="px-5 py-3 font-semibold">Entrega</th>
            <th className="px-5 py-3 font-semibold">Pago</th>
            <th className="px-5 py-3 font-semibold text-right">Total</th>
            <th className="px-5 py-3 font-semibold text-right">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((o) => {
            const pm = PAYMENT_METHODS.find((m) => m.id === o.payment.method)?.label ?? o.payment.method;
            const entrega = o.delivery.type === "retiro"
              ? `Retiro · ${SEDES.find((s) => s.id === o.delivery.sede)?.label ?? o.delivery.sede}`
              : `Envío · ${o.delivery.ciudad}, ${o.delivery.estado}`;
            const isOpen = openId === o.id;
            return (
              <Fragment key={o.id}>
                <tr className="hover:bg-gray-50/60 cursor-pointer" onClick={() => setOpenId(isOpen ? null : o.id)}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-brand-dark">{o.number}</p>
                    <p className="text-xs text-gray-400">{o.createdAtLabel}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-brand-dark">{o.customer.nombre}{o.customer.empresa ? <span className="text-gray-400"> · {o.customer.empresa}</span> : null}</p>
                    <a
                      href={`https://wa.me/${toWaNumber(o.customer.telefono)}?text=${encodeURIComponent(`Hola ${o.customer.nombre}, te escribimos de Uniparts por tu pedido ${o.number}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-green-700 hover:underline"
                    >
                      {o.customer.telefono} · WhatsApp
                    </a>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{entrega}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {pm}
                    {o.payment.reference && <p className="text-xs text-gray-400">Ref. {o.payment.reference}</p>}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-brand-dark whitespace-nowrap tabular-nums">US$ {fmtPrice(o.subtotal)}</td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      disabled={!canUpdate || saving === o.id}
                      onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                      className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer disabled:cursor-default ${ORDER_STATUS_STYLE[o.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-gray-50/70">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div className="md:col-span-2">
                          <p className="text-xs font-semibold text-gray-400 mb-2">Artículos</p>
                          <ul className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100">
                            {o.items.map((it) => (
                              <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-2">
                                <span className="min-w-0">
                                  <span className="block text-brand-dark truncate">{it.name}</span>
                                  <span className="text-xs text-gray-400">{it.ref ?? "—"} · {it.categoryLabel}</span>
                                </span>
                                <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">{it.qty} × US$ {fmtPrice(it.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">Contacto</p>
                            <p className="text-brand-dark">{o.customer.nombre}</p>
                            {o.customer.email && <p className="text-gray-500">{o.customer.email}</p>}
                            {o.customer.rif && <p className="text-gray-500">RIF {o.customer.rif}</p>}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">Entrega</p>
                            {o.delivery.type === "retiro" ? (
                              <p className="text-gray-600">{SEDES.find((s) => s.id === o.delivery.sede)?.label}</p>
                            ) : (
                              <p className="text-gray-600">{o.delivery.direccion}<br />{o.delivery.ciudad}, {o.delivery.estado}</p>
                            )}
                            {o.delivery.notas && <p className="text-gray-500 italic mt-1">“{o.delivery.notas}”</p>}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
