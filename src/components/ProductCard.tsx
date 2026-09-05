import { Product, WHATSAPP_NUMBER, fmtPrice } from "@/lib/catalog";

function IconWhatsApp({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Tarjeta de producto. Estructura fija para que la retícula se vea alineada:
 * foto → categoría/marca + referencia → nombre (2 líneas) → precio → botón.
 */
export default function ProductCard({ product }: { product: Product }) {
  const hasPrice = product.price != null;
  const brand = product.brands?.[0];
  const ref = product.ref ? ` (Ref: ${product.ref})` : "";
  const msg = hasPrice
    ? `Hola, quiero pedir: ${product.name}${ref} — precio web US$ ${fmtPrice(product.price!)}`
    : `Hola, quiero información y precio de: ${product.name}${ref}`;

  return (
    <article className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:border-brand-orange/40 transition-all duration-300 flex flex-col">
      {/* Foto (servida bajo demanda desde Odoo) */}
      <div className="relative aspect-[4/3] bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-300">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Foto a solicitud</span>
          </div>
        )}
        {product.qty > 0 && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur border border-green-100 text-green-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            En stock
          </span>
        )}
      </div>

      {/* Datos */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="text-gray-500 truncate">
            {product.categoryLabel}
            {brand && <span className="text-gray-400"> · {brand}</span>}
          </span>
          {product.ref && <span className="font-mono text-gray-400 shrink-0">{product.ref}</span>}
        </div>
        <h3 className="mt-1.5 text-sm font-semibold text-brand-dark leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-xs text-gray-400 line-clamp-1">{product.description}</p>
        )}

        {/* Precio + acción (siempre al pie, misma altura en todas las tarjetas) */}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-2 border-t border-gray-100 pt-3">
            {hasPrice ? (
              <p className="text-brand-dark tabular-nums tracking-tight" data-price>
                <span className="text-xs text-gray-400 mr-1">US$</span>
                <span className="text-lg font-semibold">{fmtPrice(product.price!)}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">Precio a consultar</p>
            )}
            <span className="text-[11px] text-gray-400">Respuesta en minutos</span>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-brand-dark hover:bg-brand-orange text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            <IconWhatsApp className="w-4 h-4" />
            {hasPrice ? "Pedir por WhatsApp" : "Consultar precio"}
          </a>
        </div>
      </div>
    </article>
  );
}
