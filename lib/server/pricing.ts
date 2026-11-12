import "server-only";
import { quote } from "@/lib/promo";
import { calcPrice, crustOf, ingOf, sizeOf, type Catalog, type CartItem, type Counts, type Delivery } from "@/lib/pizza";

/**
 * Recalcula TODO en el servidor con el catálogo vigente: el cliente sólo envía qué pizza quiere
 * (y un código opcional), nunca cuánto cuesta. Así nadie puede manipular precios ni promociones.
 */
export function priceCart(cat: Catalog, raw: unknown, delivery: Delivery, code?: string) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 10) return { error: "Pedido inválido" } as const;

  const items: CartItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") return { error: "Pedido inválido" } as const;
    const { name, size, crust, ingredients } = r as Record<string, unknown>;
    if (typeof size !== "string" || typeof crust !== "string") return { error: "Pedido inválido" } as const;
    if (!cat.sizes.some((s) => s.id === size) || !cat.crusts.some((c) => c.id === crust))
      return { error: "El menú cambió. Recarga la página para ver los tamaños y masas actuales." } as const;

    const counts: Counts = {};
    if (ingredients && typeof ingredients === "object") {
      for (const [id, q] of Object.entries(ingredients)) {
        if (!q) continue;
        const ing = ingOf(cat, id);
        if (!ing || !Number.isInteger(q) || (q as number) < 0 || (q as number) > cat.policy.maxPerIngredient)
          return { error: "Ingredientes inválidos. Recarga la página." } as const;
        if (!ing.available) return { error: `"${ing.name}" ya no está disponible. Quítalo de tu pizza.` } as const;
        counts[id] = q as number;
      }
    }

    const price = Math.round(calcPrice(cat, counts, size, crust) * 100) / 100;
    const sz = sizeOf(cat, size);
    const cr = crustOf(cat, crust);
    const tops = Object.entries(counts)
      .map(([id, q]) => `${ingOf(cat, id)!.name}${q > 1 ? ` x${q}` : ""}`)
      .join(", ");
    items.push({
      uid: String(items.length),
      name: typeof name === "string" ? name.trim().slice(0, 40) || "Pizza personalizada" : "Pizza personalizada",
      size,
      crust,
      ingredients: counts,
      price,
      snap: { size: `${sz.label} ${sz.inches}″`.replace(/″$/, "″"), crust: cr.label, tops: tops || "Solo queso" },
    });
  }

  const q = quote(cat, items, delivery, code, new Date());
  return { items, quote: q } as const;
}

/** PayPhone exige separar base imponible e IVA. Los precios del menú ya incluyen IVA. */
export function splitTax(totalCents: number, iva: number) {
  const base = Math.round(totalCents / (1 + iva));
  return { amountWithTax: base, tax: totalCents - base };
}
