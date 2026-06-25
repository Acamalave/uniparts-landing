#!/usr/bin/env python3
"""
Extrae el catálogo de productos desde el Odoo del Grupo Buco (ml.parts)
y genera src/data/catalog.json + imágenes en public/odoo/.

Solo lectura. Lee credenciales de .env.local (ODOO_URL/ODOO_DB/ODOO_USER/ODOO_PASSWORD).
No incluye precios (decisión: "Consultar precio" por WhatsApp).

Uso:  python3 scripts/fetch_odoo_catalog.py
"""
import xmlrpc.client, ssl, os, json, base64, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "public", "odoo")
DATA_OUT = os.path.join(ROOT, "src", "data", "catalog.json")


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
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60] or "producto"


def ext_from_b64(b):
    head = base64.b64decode(b[:24])
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if head[:3] == b"\xff\xd8\xff":
        return "jpg"
    if head[:4] == b"RIFF":
        return "webp"
    return "png"


# Grupos del catálogo: (clave, etiqueta, [categ_ids], filtro_nombre|None, tope)
GROUPS = [
    ("montacargas", "Montacargas", [18, 21], None, 200),
    ("transpaletas", "Transpaletas manuales", [25], None, 50),
    ("llantas", "Llantas y cauchos", [24, 59], None, 14),
    ("cilindros-gas", "Cilindros y sistema GLP", None, None, 8),
    ("asientos", "Asientos", [72, 73], None, 10),
    ("accesorios", "Accesorios", [64], None, 12),
]
# Excluir registros de prueba / duplicados / no comerciales
EXCLUDE = ["(copia)", "(copy)", "no usar", "test", "prueba"]
# Tamaños de llanta prioritarios (SEO) que queremos asegurar si existen
TIRE_SIZES = ["6.00-9", "7.00-12", "6.50-10", "28x9-15", "18x7-8", "8.25-15"]


def main():
    env = load_env()
    base, db = env["ODOO_URL"], env["ODOO_DB"]
    user, pwd = env["ODOO_USER"], env["ODOO_PASSWORD"]
    ctx = ssl._create_unverified_context()
    uid = xmlrpc.client.ServerProxy(f"{base}/xmlrpc/2/common", context=ctx).authenticate(db, user, pwd, {})
    models = xmlrpc.client.ServerProxy(f"{base}/xmlrpc/2/object", context=ctx)

    def kw(model, method, args, **k):
        return models.execute_kw(db, uid, pwd, model, method, args, k)

    os.makedirs(IMG_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(DATA_OUT), exist_ok=True)
    fields = ["id", "name", "default_code", "description_sale", "categ_id", "image_512"]
    catalog = []
    seen = set()

    def add_products(group_key, label, recs):
        added = 0
        for p in recs:
            if p["id"] in seen:
                continue
            nm = (p.get("name") or "").lower()
            if any(x in nm for x in EXCLUDE):
                continue
            seen.add(p["id"])
            img = None
            if p.get("image_512"):
                try:
                    ext = ext_from_b64(p["image_512"])
                    fn = f"{p['id']}.{ext}"
                    with open(os.path.join(IMG_DIR, fn), "wb") as fh:
                        fh.write(base64.b64decode(p["image_512"]))
                    img = f"/odoo/{fn}"
                except Exception as e:
                    print("  img err", p["id"], str(e)[:60])
            catalog.append({
                "id": p["id"],
                "slug": slugify((p.get("name") or "") + "-" + (p.get("default_code") or "")),
                "name": (p.get("name") or "").strip(),
                "ref": (p.get("default_code") or "").strip() or None,
                "description": (p.get("description_sale") or "").strip() or None,
                "category": group_key,
                "categoryLabel": label,
                "image": img,
            })
            added += 1
        return added

    for key, label, cats, name_terms, cap in GROUPS:
        if cats:
            dom = [("sale_ok", "=", True), ("categ_id", "in", cats)]
        else:
            dom = ["&", ("sale_ok", "=", True), ("|",) ]  # placeholder, replaced below
        if name_terms:
            # OR de varios términos en el nombre
            or_clause = []
            for i, t in enumerate(name_terms):
                or_clause.append(("name", "ilike", t))
            dom = [("sale_ok", "=", True)]
            # construir dominio OR
            dom = ["&", ("sale_ok", "=", True)] + ["|"] * (len(name_terms) - 1) + [("name", "ilike", t) for t in name_terms]
        # Cilindros de gas: primero el cilindro/tanque GLP real, luego el sistema GLP
        if key == "cilindros-gas":
            cyl = kw("product.template", "search_read",
                     [["&", ("sale_ok", "=", True), "|", "|",
                       ("categ_id", "=", 71), ("name", "ilike", "LPG CYLINDER"), ("name", "ilike", "LPG TANK")]],
                     fields=fields, limit=5)
            system = kw("product.template", "search_read",
                        [["&", ("sale_ok", "=", True), "|", "|",
                          ("name", "ilike", "LPG KIT"), ("name", "ilike", "LPG"), ("name", "ilike", "GLP")]],
                        fields=fields, limit=cap)
            recs = cyl + system
            n = add_products(key, label, recs[:cap])
            print(f"{label:28} -> {n} productos")
            continue
        # Llantas: priorizar tamaños SEO
        if key == "llantas":
            priority = []
            for size in TIRE_SIZES:
                recs = kw("product.template", "search_read",
                          [[("sale_ok", "=", True), ("categ_id", "in", cats), ("name", "ilike", size)]],
                          fields=fields, limit=3)
                priority += recs
            # rellenar con llantas que tengan imagen
            rest = kw("product.template", "search_read",
                      [[("sale_ok", "=", True), ("categ_id", "in", cats), ("image_512", "!=", False)]],
                      fields=fields, limit=cap)
            recs = priority + rest
        else:
            recs = kw("product.template", "search_read", [dom], fields=fields, limit=cap)
        n = add_products(key, label, recs[:cap] if key != "montacargas" and key != "transpaletas" else recs)
        print(f"{label:28} -> {n} productos")

    with open(DATA_OUT, "w") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    by = {}
    for c in catalog:
        by[c["category"]] = by.get(c["category"], 0) + 1
    print("\nTOTAL:", len(catalog), "| por categoría:", by)
    print("con imagen:", sum(1 for c in catalog if c["image"]))
    print("JSON ->", DATA_OUT)


if __name__ == "__main__":
    main()
