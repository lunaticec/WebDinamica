"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Catalog } from "@/lib/pizza";

const Ctx = createContext<Catalog | null>(null);

/** Entrega el catálogo (precios, ingredientes, promociones, datos del negocio) a toda la app. */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return <Ctx.Provider value={catalog}>{children}</Ctx.Provider>;
}

export function useCatalog(): Catalog {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  return c;
}
