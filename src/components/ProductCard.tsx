import { Product, WHATSAPP_NUMBER } from "@/lib/catalog";

export default function ProductCard({ product }: { product: Product }) {
  const msg = `Hola, quiero información y precio de: ${product.name}${
    product.ref ? ` (Ref: ${product.ref})` : ""
  }`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-orange/30 transition-all duration-300 flex flex-col">
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Foto a solicitud</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-brand-dark/80 backdrop-blur text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
          {product.categoryLabel}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        {product.ref && (
          <p className="text-brand-orange text-xs font-semibold tracking-wide">
            {product.ref}
          </p>
        )}
        <h3 className="text-sm font-bold text-brand-dark mt-1 leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
            {product.description}
          </p>
        )}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-4"
        >
          <span className="flex items-center justify-center gap-2 w-full bg-brand-dark hover:bg-brand-orange text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
            Consultar precio
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}
