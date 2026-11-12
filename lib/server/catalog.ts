import "server-only";
import { DEFAULT_CATALOG } from "@/lib/catalog";
import type { Catalog } from "@/lib/pizza";
import { catalogOf, peek } from "./store";

/** Catálogo vigente (el guardado desde /admin, o el inicial). */
export const getCatalog = (): Promise<Catalog> => peek((db) => catalogOf(db) ?? DEFAULT_CATALOG);
