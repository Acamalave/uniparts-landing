"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/shop/cart";
import { fmtPrice, WHATSAPP_NUMBER } from "@/lib/catalog";
import { CHECKOUT_STORAGE_KEY, ESTADOS_VE, PAYMENT_METHODS, SEDES, SHIPPING_NOTE, type PaymentMethodId } from "@/lib/shop/config";
import { isValidEmail, normalizeVePhone, type DeliveryType } from "@/lib/shop/orders";
import QtyControl from "./QtyControl";

type Step = 1 | 2 | 3 | 4;

type Form = {
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  rif: string;
  deliveryType: DeliveryType;
  sede: "valencia" | "barcelona";
  estado: string;
  ciudad: string;
  direccion: string;
  notas: string;
  method: PaymentMethodId;
  reference: string;
};

const EMPTY: Form = {
  nombre: "", telefono: "", email: "", empresa: "", rif: "",
  deliveryType: "envio", sede: "valencia", estado: "Carabobo", ciudad: "", direccion: "", notas: "",
  method: "pago-movil", reference: "",
};

const STEPS = ["Carrito", "Envío", "Pago", "Listo"];

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

/** Checkout en 4 pasos: carrito → envío → pago → confirmación. Sin cuenta, sin fricción. */
export default function Checkout() {
  const cart = useCart();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [done, setDone] = useState<{ number: string; items: typeof cart.items; subtotal: number } | null>(null);

  // Recupera los datos del cliente de un pedido anterior (menos fricción al repetir).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) setForm((f) => ({ ...f, ...(JSON.parse(raw) as Partial<Form>), reference: "" }));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      const { reference: _r, ...rest } = form; // eslint-disable-line @typescript-eslint/no-unused-vars
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(rest));
    } catch {}
  }, [form]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateShipping = () => {
    const e: typeof errors = {};
    if (form.nombre.trim().length < 3) e.nombre = "Indica tu nombre.";
    if (!normalizeVePhone(form.telefono)) e.telefono = "Número venezolano válido: 0414-1234567.";
    if (form.email && !isValidEmail(form.email)) e.email = "Correo inválido.";
    if (form.deliveryType === "envio") {
      if (!form.estado) e.estado = "Elige el estado.";
      if (!form.ciudad.trim()) e.ciudad = "Indica la ciudad.";
      if (form.direccion.trim().length < 8) e.direccion = "Escribe la dirección completa.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const method = useMemo(() => PAYMENT_METHODS.find((m) => m.id === form.method)!, [form.method]);

  const submit = async () => {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((i) => ({ id: i.id, qty: i.qty })),
          customer: { nombre: form.nombre, telefono: form.telefono, email: form.email, empresa: form.empresa, rif: form.rif },
          delivery:
            form.deliveryType === "retiro"
              ? { type: "retiro", sede: form.sede, notas: form.notas }
              : { type: "envio", estado: form.estado, ciudad: form.ciudad, direccion: form.direccion, notas: form.notas },
          payment: { method: form.method, reference: form.reference },
          website: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No pudimos registrar el pedido. Inténtalo de nuevo.");
      setDone({ number: data.number, items: cart.items, subtotal: cart.subtotal });
      cart.clear();
      setStep(4);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setSending(false);
    }
  };

  /* ---------- Vacío ---------- */
  if (cart.ready && cart.items.length === 0 && step !== 4) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 mb-5">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-brand-dark">Tu carrito está vacío</h1>
        <p className="text-gray-500 mt-2">Explora el catálogo y agrega los repuestos que necesitas.</p>
        <Link href="/catalogo" className="inline-flex mt-6 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  /* ---------- Confirmación ---------- */
  if (step === 4 && done) {
    const resumen = done.items.map((i) => `• ${i.qty} × ${i.name}${i.ref ? ` (${i.ref})` : ""}`).join("\n");
    const wa = `Hola, acabo de hacer el pedido ${done.number} en la tienda web de Uniparts.\n${resumen}\nSubtotal: US$ ${fmtPrice(done.subtotal)}\nPago: ${method.label}${form.reference ? ` (ref. ${form.reference})` : ""}`;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-xs font-semibold text-brand-orange tracking-wide">Pedido recibido</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-dark mt-2">{done.number}</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            Gracias, {form.nombre.split(" ")[0]}. Te confirmamos disponibilidad, {form.deliveryType === "envio" ? "costo de envío" : "hora de retiro"} y los datos de pago por WhatsApp en minutos.
          </p>

          <div className="mt-8 text-left bg-brand-gray-light rounded-2xl p-5">
            <ul className="divide-y divide-gray-200/70">
              {done.items.map((i) => (
                <li key={i.id} className="py-2.5 flex justify-between gap-3 text-sm">
                  <span className="text-brand-dark min-w-0 truncate">{i.qty} × {i.name}</span>
                  <span className="tabular-nums text-gray-600 whitespace-nowrap">US$ {fmtPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-3 mt-1 border-t border-gray-200/70 font-semibold text-brand-dark">
              <span>Subtotal</span><span className="tabular-nums">US$ {fmtPrice(done.subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{method.label} · {form.deliveryType === "retiro" ? SEDES.find((s) => s.id === form.sede)?.label : `Envío a ${form.ciudad}, ${form.estado}`}</p>
          </div>

          {method.details.length > 0 && (
            <div className="mt-5 text-left bg-white border border-brand-orange/30 rounded-2xl p-5">
              <p className="text-sm font-semibold text-brand-dark mb-2">Datos para tu {method.label.toLowerCase()}</p>
              <ul className="text-sm text-gray-600 space-y-1">{method.details.map((d) => <li key={d}>{d}</li>)}</ul>
              <p className="text-xs text-gray-400 mt-3">Envíanos el comprobante por WhatsApp indicando el número {done.number}.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(wa)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors"
            >
              Confirmar por WhatsApp
            </a>
            <Link href="/catalogo" className="inline-flex items-center justify-center bg-white border border-gray-200 hover:border-brand-orange text-brand-dark font-semibold px-6 py-3.5 rounded-xl transition-colors">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Pasos 1-3 ---------- */
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 xl:col-span-8">
        {/* Stepper */}
        <ol className="flex items-center gap-2 mb-8 text-xs sm:text-sm">
          {STEPS.slice(0, 3).map((label, i) => {
            const n = (i + 1) as Step;
            const state = n < step ? "done" : n === step ? "current" : "todo";
            return (
              <li key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={n >= step}
                  onClick={() => setStep(n)}
                  className={`flex items-center gap-2 ${state === "todo" ? "text-gray-400" : "text-brand-dark"} disabled:cursor-default`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    state === "current" ? "bg-brand-orange text-white" : state === "done" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {state === "done" ? "✓" : n}
                  </span>
                  <span className={state === "current" ? "font-semibold" : ""}>{label}</span>
                </button>
                {i < 2 && <span className="w-6 sm:w-10 h-px bg-gray-200" />}
              </li>
            );
          })}
        </ol>

        {/* Paso 1: carrito */}
        {step === 1 && (
          <section className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-7">
            <h1 className="font-display font-bold text-2xl text-brand-dark">Revisa tu pedido</h1>
            <p className="text-sm text-gray-500 mt-1">Ajusta cantidades y confirma para continuar.</p>
            <ul className="divide-y divide-gray-100 mt-5">
              {cart.items.map((it) => (
                <li key={it.id} className="py-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-[10px] text-gray-300">Sin foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400">{it.categoryLabel}{it.ref ? ` · ${it.ref}` : ""}</p>
                    <p className="text-sm font-semibold text-brand-dark leading-snug">{it.name}</p>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <QtyControl value={it.qty} onChange={(q) => cart.setQty(it.id, q)} size="sm" />
                        <button onClick={() => cart.remove(it.id)} className="text-xs text-gray-400 hover:text-red-500">Quitar</button>
                      </div>
                      <p className="text-sm text-gray-500 tabular-nums">
                        {it.qty > 1 && <span className="text-gray-400">{it.qty} × US$ {fmtPrice(it.price)} = </span>}
                        <span className="font-semibold text-brand-dark">US$ {fmtPrice(it.price * it.qty)}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link href="/catalogo" className="text-sm text-gray-500 hover:text-brand-dark">← Agregar más productos</Link>
              <button onClick={() => setStep(2)} className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-7 py-3.5 rounded-xl transition-colors">
                Confirmar y continuar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </section>
        )}

        {/* Paso 2: envío */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validateShipping()) setStep(3);
            }}
            className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-7 space-y-6"
            noValidate
          >
            <div>
              <h1 className="font-display font-bold text-2xl text-brand-dark">¿A quién y dónde entregamos?</h1>
              <p className="text-sm text-gray-500 mt-1">Solo lo necesario. Sin crear cuenta.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="nombre">Nombre y apellido *</label>
                <input id="nombre" autoComplete="name" className={inputCls} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: María Pérez" />
                {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="telefono">WhatsApp *</label>
                <input id="telefono" type="tel" inputMode="tel" autoComplete="tel" className={inputCls} value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="0414-1234567" />
                {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="email">Correo <span className="font-normal text-gray-400">(opcional)</span></label>
                <input id="email" type="email" inputMode="email" autoComplete="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="tu@correo.com" />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="empresa">Empresa <span className="font-normal text-gray-400">(opcional)</span></label>
                <input id="empresa" autoComplete="organization" className={inputCls} value={form.empresa} onChange={(e) => set("empresa", e.target.value)} placeholder="Nombre de la empresa" />
              </div>
              <div>
                <label className={labelCls} htmlFor="rif">RIF <span className="font-normal text-gray-400">(para factura)</span></label>
                <input id="rif" className={inputCls} value={form.rif} onChange={(e) => set("rif", e.target.value)} placeholder="J-12345678-9" />
              </div>
            </div>

            {/* Tipo de entrega */}
            <div>
              <p className={labelCls}>Entrega</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  { id: "envio", title: "Envío a domicilio", desc: "A todo el país. Costo según destino." },
                  { id: "retiro", title: "Retiro en sede", desc: "Valencia o Barcelona. Sin costo." },
                ] as { id: DeliveryType; title: string; desc: string }[]).map((opt) => (
                  <label key={opt.id} className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${form.deliveryType === opt.id ? "border-brand-orange bg-brand-orange/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="deliveryType" className="mt-1 accent-brand-orange" checked={form.deliveryType === opt.id} onChange={() => set("deliveryType", opt.id)} />
                    <span>
                      <span className="block text-sm font-semibold text-brand-dark">{opt.title}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {form.deliveryType === "retiro" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {SEDES.map((s) => (
                  <label key={s.id} className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${form.sede === s.id ? "border-brand-orange bg-brand-orange/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="sede" className="accent-brand-orange" checked={form.sede === s.id} onChange={() => set("sede", s.id)} />
                    <span>
                      <span className="block text-sm font-semibold text-brand-dark">{s.label}</span>
                      <span className="block text-xs text-gray-500">{s.address}</span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="estado">Estado *</label>
                  <select id="estado" className={inputCls} value={form.estado} onChange={(e) => set("estado", e.target.value)}>
                    {ESTADOS_VE.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.estado && <p className="text-xs text-red-600 mt-1">{errors.estado}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="ciudad">Ciudad *</label>
                  <input id="ciudad" autoComplete="address-level2" className={inputCls} value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Ej: Valencia" />
                  {errors.ciudad && <p className="text-xs text-red-600 mt-1">{errors.ciudad}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="direccion">Dirección *</label>
                  <input id="direccion" autoComplete="street-address" className={inputCls} value={form.direccion} onChange={(e) => set("direccion", e.target.value)} placeholder="Calle, edificio o galpón, punto de referencia" />
                  {errors.direccion && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
                </div>
              </div>
            )}

            <div>
              <label className={labelCls} htmlFor="notas">Notas <span className="font-normal text-gray-400">(opcional)</span></label>
              <textarea id="notas" rows={2} className={inputCls} value={form.notas} onChange={(e) => set("notas", e.target.value)} placeholder="Horario de recepción, modelo del equipo, etc." />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-brand-dark text-left">← Volver al carrito</button>
              <button type="submit" className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-7 py-3.5 rounded-xl transition-colors">
                Continuar al pago
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </form>
        )}

        {/* Paso 3: pago */}
        {step === 3 && (
          <section className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-7 space-y-6">
            <div>
              <h1 className="font-display font-bold text-2xl text-brand-dark">¿Cómo prefieres pagar?</h1>
              <p className="text-sm text-gray-500 mt-1">Elige el método; te enviamos los datos y confirmamos por WhatsApp.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${form.method === m.id ? "border-brand-orange bg-brand-orange/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="method" className="mt-1 accent-brand-orange" checked={form.method === m.id} onChange={() => set("method", m.id)} />
                  <span>
                    <span className="block text-sm font-semibold text-brand-dark">{m.label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="rounded-2xl bg-brand-gray-light p-4 text-sm text-gray-600">
              {method.details.length > 0 ? (
                <ul className="space-y-1">{method.details.map((d) => <li key={d}>{d}</li>)}</ul>
              ) : method.id === "al-recibir" ? (
                <p>Pagas cuando recibas o retires tu pedido. Aceptamos efectivo, punto de venta y pago móvil.</p>
              ) : (
                <p>Al confirmar te enviamos por WhatsApp los datos para el {method.label.toLowerCase()}. Puedes pagar después de confirmar disponibilidad.</p>
              )}
            </div>

            {method.askReference && (
              <div className="max-w-sm">
                <label className={labelCls} htmlFor="reference">Referencia del pago <span className="font-normal text-gray-400">(si ya pagaste)</span></label>
                <input id="reference" className={inputCls} value={form.reference} onChange={(e) => set("reference", e.target.value)} placeholder="Últimos dígitos de la referencia" />
              </div>
            )}

            {sendError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{sendError}</p>}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-brand-dark text-left">← Volver a envío</button>
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-bold px-7 py-3.5 rounded-xl transition-colors"
              >
                {sending ? "Enviando pedido…" : `Confirmar pedido · US$ ${fmtPrice(cart.subtotal)}`}
              </button>
            </div>
            <p className="text-[11px] text-gray-400">Al confirmar aceptas que te contactemos por WhatsApp para coordinar pago y entrega. Precios en USD; el IVA y el envío se indican en la confirmación.</p>
          </section>
        )}
      </div>

      {/* Resumen lateral */}
      <aside className="lg:col-span-5 xl:col-span-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-semibold text-brand-dark">Resumen</h2>
          <ul className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
            {cart.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-600 min-w-0 truncate">{i.qty} × {i.name}</span>
                <span className="tabular-nums text-brand-dark whitespace-nowrap">US$ {fmtPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Artículos</span><span className="tabular-nums">{cart.count}</span></div>
            <div className="flex justify-between text-gray-500"><span>Envío</span><span>{form.deliveryType === "retiro" ? "Gratis (retiro)" : "Por confirmar"}</span></div>
            <div className="flex justify-between items-baseline pt-2 text-brand-dark">
              <span className="font-semibold">Subtotal</span>
              <span className="text-2xl font-semibold tabular-nums tracking-tight"><span className="text-xs text-gray-400 mr-1">US$</span>{fmtPrice(cart.subtotal)}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">{SHIPPING_NOTE}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Stock real · respuesta en minutos por WhatsApp
          </div>
        </div>
      </aside>
    </div>
  );
}
