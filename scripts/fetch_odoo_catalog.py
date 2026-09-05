#!/usr/bin/env python3
"""
Sincroniza el catálogo de UNIPARTS desde Odoo (grupobuco.odoo.com) -> src/data/catalog.json

SOLO LECTURA: este script únicamente consulta Odoo (search_read / read). Nunca escribe.

Alcance ("productos asignados al negocio Uniparts"), evaluado en el contexto de la
empresa Uniparts (ODOO_COMPANY_ID, por defecto 2) porque el stock depende de la empresa:
  - EQUIPOS: vendibles con stock > 0 en categorías de montacargas / transpaletas
    eléctricas / equipos de almacén.
  - REPUESTOS: el filtro favorito de Odoo `upandina.com` (vendibles, con stock > 0,
    excluyendo categorías de equipos y "mercancía por identificar / no usar").

Las fotos NO se descargan: el sitio las sirve bajo demanda desde Odoo vía
/api/odoo-image/<id>. Aquí solo se detecta (por hash de la miniatura) qué productos
tienen una foto real y cuáles traen el logo genérico de ML.PARTS.

Uso:  python3 scripts/fetch_odoo_catalog.py
"""
import xmlrpc.client, ssl, os, json, base64, re, hashlib, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_OUT = os.path.join(ROOT, "src", "data", "catalog.json")
PLACEHOLDERS_OUT = os.path.join(ROOT, "src", "data", "odoo-placeholders.json")

# Categorías de Odoo -> (clave, etiqueta, grupo). Cualquier otra cae en el mapeo genérico.
CATEGORY_MAP = {
    18: ("montacargas", "Montacargas", "equipos"),
    21: ("montacargas", "Montacargas", "equipos"),
    19: ("transpaletas-electricas", "Transpaletas eléctricas", "equipos"),
    22: ("transpaletas-electricas", "Transpaletas eléctricas", "equipos"),
    17: ("equipos-almacen", "Equipos de almacén", "equipos"),
    20: ("equipos-almacen", "Equipos de almacén", "equipos"),
    25: ("transpaletas", "Transpaletas manuales", "equipos"),
    24: ("llantas", "Llantas y cauchos", "repuestos"),
    59: ("llantas", "Llantas y cauchos", "repuestos"),
    72: ("asientos", "Asientos", "repuestos"),
    73: ("asientos", "Asientos", "repuestos"),
    64: ("accesorios", "Accesorios", "repuestos"),
    26: ("baterias", "Baterías", "repuestos"),
    74: ("cargadores", "Cargadores", "repuestos"),
    71: ("tanques-glp", "Tanques y cilindros GLP", "repuestos"),
    44: ("combustible", "Combustible y GLP", "repuestos"),
    54: ("motor", "Motor", "repuestos"),
    47: ("electrico", "Sistema eléctrico", "repuestos"),
    45: ("direccion", "Dirección", "repuestos"),
    50: ("frenos", "Frenos", "repuestos"),
    52: ("mastil", "Mástil", "repuestos"),
    43: ("chasis", "Chasis", "repuestos"),
    51: ("hidraulico", "Hidráulico", "repuestos"),
    55: ("transmision", "Transmisión", "repuestos"),
    49: ("filtros", "Filtros", "repuestos"),
    48: ("refrigeracion", "Refrigeración", "repuestos"),
    46: ("eje-motriz", "Eje motriz", "repuestos"),
    23: ("repuestos-otros", "Otros repuestos", "repuestos"),
}
EQUIPO_CATEGS = [18, 21, 19, 22, 17, 20]
UPANDINA_EXCLUDED = [19, 22, 18, 21, 1, 2, 17, 20]  # tal cual el filtro favorito `upandina.com`
EXCLUDE_NAMES = ["(copia)", "(copy)", "no usar", "test", "prueba"]


def load_env():
    env = {}
    with open(os.path.join(ROOT, ".env.local")) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def slugify(s):
    s = (s or "").lower()
    s = re.sub(r"[áàä]", "a", s); s = re.sub(r"[éèë]", "e", s); s = re.sub(r"[íìï]", "i", s)
    s = re.sub(r"[óòö]", "o", s); s = re.sub(r"[úùü]", "u", s); s = s.replace("ñ", "n")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:70] or "producto"


def map_category(categ):
    """categ = [id, 'PARTS (REPUESTOS) / ENGINE (MOTOR)']"""
    cid, name = categ[0], categ[1]
    if cid in CATEGORY_MAP:
        return CATEGORY_MAP[cid]
    last = name.split("/")[-1].strip()
    m = re.search(r"\(([^)]+)\)", last)
    label = (m.group(1) if m else last).strip().capitalize()
    return (slugify(label), label, "repuestos")


def main():
    env = load_env()
    url, db, user = env["ODOO_URL"], env["ODOO_DB"], env["ODOO_USER"]
    key = env.get("ODOO_API_KEY") or env["ODOO_PASSWORD"]
    company = int(env.get("ODOO_COMPANY_ID", "2"))
    ctx = ssl._create_unverified_context()
    uid = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common", context=ctx).authenticate(db, user, key, {})
    if not uid:
        raise SystemExit("Odoo: autenticación denegada (revisa ODOO_API_KEY)")
    models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object", context=ctx)
    CTX = {"allowed_company_ids": [company], "force_company": company}

    def kw(model, method, args, **k):
        k.setdefault("context", CTX)
        return models.execute_kw(db, uid, key, model, method, args, k)

    fields = ["id", "name", "default_code", "description_sale", "categ_id", "qty_available", "product_brand_ids"]
    dom_equipos = ["&", ("sale_ok", "=", True), "&", ("qty_available", ">", 0), ("categ_id", "in", EQUIPO_CATEGS)]
    dom_upandina = ["&", ("type", "in", ["consu", "product"]), "&", ("sale_ok", "=", True), "&",
                    ("qty_available", ">", 0), ("categ_id", "not in", UPANDINA_EXCLUDED)]

    equipos = kw("product.template", "search_read", [dom_equipos], fields=fields, order="name")
    repuestos = kw("product.template", "search_read", [dom_upandina], fields=fields, order="name")
    print(f"Odoo (empresa {company}) -> equipos con stock: {len(equipos)} | upandina.com: {len(repuestos)}")

    # Marcas
    brand_ids = sorted({b for p in equipos + repuestos for b in (p.get("product_brand_ids") or [])})
    brands = {b["id"]: b["name"] for b in kw("product.brand", "read", [brand_ids], fields=["name"])} if brand_ids else {}

    # Detección de foto real vs. logo genérico usando la miniatura (image_128) por hash.
    all_ids = [p["id"] for p in equipos + repuestos]
    thumb_hash = {}
    for i in range(0, len(all_ids), 200):
        chunk = all_ids[i:i + 200]
        for r in kw("product.template", "read", [chunk], fields=["image_128"]):
            if r.get("image_128"):
                thumb_hash[r["id"]] = hashlib.md5(base64.b64decode(r["image_128"])).hexdigest()
    counts = collections.Counter(thumb_hash.values())
    placeholders = {h for h, n in counts.items() if n >= 5}  # una misma imagen en >=5 productos = genérica
    print(f"miniaturas: {len(thumb_hash)} | hashes placeholder detectados: {len(placeholders)} "
          f"(cubren {sum(counts[h] for h in placeholders)} productos)")

    catalog, seen = [], set()

    def add(plist, forced_group=None):
        for p in plist:
            if p["id"] in seen:
                continue
            nm = (p.get("name") or "").lower()
            if any(x in nm for x in EXCLUDE_NAMES):
                continue
            seen.add(p["id"])
            ckey, clabel, cgroup = map_category(p["categ_id"])
            group = forced_group or cgroup
            h = thumb_hash.get(p["id"])
            has_photo = bool(h) and h not in placeholders
            catalog.append({
                "id": p["id"],
                "slug": slugify((p.get("name") or "") + "-" + (p.get("default_code") or "")),
                "name": (p.get("name") or "").strip(),
                "ref": (p.get("default_code") or "").strip() or None,
                "description": (p.get("description_sale") or "").strip() or None,
                "group": group,
                "category": ckey,
                "categoryLabel": clabel,
                "brands": [brands[b] for b in (p.get("product_brand_ids") or []) if b in brands],
                "qty": int(p.get("qty_available") or 0),
                "image": f"/api/odoo-image/{p['id']}" if has_photo else None,
            })

    add(equipos, forced_group="equipos")
    add(repuestos)

    order = {"equipos": 0, "repuestos": 1}
    catalog.sort(key=lambda p: (order[p["group"]], p["categoryLabel"], p["name"]))

    with open(DATA_OUT, "w") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=1)
    with open(PLACEHOLDERS_OUT, "w") as f:
        json.dump({"image128": sorted(placeholders), "image512": ["3e49ee0ae59dfddf175c46cb05330a84"]}, f, indent=2)

    by_group = collections.Counter(p["group"] for p in catalog)
    by_cat = collections.Counter(p["categoryLabel"] for p in catalog)
    print(f"\nTOTAL: {len(catalog)} | por grupo: {dict(by_group)} | con foto real: {sum(1 for p in catalog if p['image'])}")
    for c, n in by_cat.most_common():
        print(f"  {n:>5}  {c}")
    print("JSON ->", DATA_OUT)


if __name__ == "__main__":
    main()
