// Sirve la foto de un producto directamente desde Odoo (SOLO LECTURA), con caché en el CDN.
// Omite las imágenes que son solo el logo genérico de ML.PARTS.
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { executeKw, ODOO_COMPANY_ID } from "@/lib/odoo";
import { products } from "@/lib/catalog";
import placeholders from "@/data/odoo-placeholders.json";

export const runtime = "nodejs";

const ALLOWED = new Set(products.map((p) => p.id));
const PH128 = new Set(placeholders.image128 as string[]);
const PH512 = new Set(placeholders.image512 as string[]);

function contentType(buf: Buffer) {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.subarray(0, 4).toString() === "RIFF") return "image/webp";
  return "application/octet-stream";
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || !ALLOWED.has(id)) {
    return new NextResponse("No encontrado", { status: 404 });
  }
  try {
    const [rec] = await executeKw<{ image_512?: string; image_128?: string }[]>(
      "product.template",
      "read",
      [[id]],
      { fields: ["image_512", "image_128"], context: { allowed_company_ids: [ODOO_COMPANY_ID] } }
    );
    if (!rec?.image_512) return new NextResponse("Sin imagen", { status: 404 });
    const buf = Buffer.from(rec.image_512, "base64");
    const h512 = createHash("md5").update(buf).digest("hex");
    const h128 = rec.image_128 ? createHash("md5").update(Buffer.from(rec.image_128, "base64")).digest("hex") : "";
    if (PH512.has(h512) || PH128.has(h128)) return new NextResponse("Imagen genérica", { status: 404 });
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType(buf),
        "Content-Length": String(buf.length),
        // Caché agresiva: navegador 1 día, CDN 7 días (las fotos cambian rara vez).
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Odoo no disponible", { status: 502 });
  }
}
