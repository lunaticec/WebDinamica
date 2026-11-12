import { DEFAULT_CATALOG, sanitizeCatalog } from "@/lib/catalog";
import { isAdmin, json } from "@/lib/server/http";
import { catalogOf, withDb } from "@/lib/server/store";

/** Lee el catálogo vigente (para el editor del panel). */
export async function GET() {
  if (!(await isAdmin())) return json({ error: "No autorizado" }, 401);
  return json(await withDb((db) => catalogOf(db)));
}

/** Guarda el catálogo completo. Todo se valida y limpia en el servidor antes de guardar. */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return json({ error: "No autorizado" }, 401);
  const body = await req.json().catch(() => null);

  const result = await withDb((db) => {
    const clean = sanitizeCatalog(body, catalogOf(db).version);
    if ("error" in clean) return { status: 400, error: clean.error };
    db.catalog = clean.catalog;
    return { status: 200, catalog: clean.catalog };
  });
  const { status, ...rest } = result;
  return json(rest, status);
}

/** Restablece el catálogo inicial. */
export async function DELETE() {
  if (!(await isAdmin())) return json({ error: "No autorizado" }, 401);
  const catalog = await withDb((db) => {
    db.catalog = { ...DEFAULT_CATALOG, version: catalogOf(db).version + 1 };
    return db.catalog;
  });
  return json({ catalog });
}
