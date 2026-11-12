import "server-only";
import { SHOP, POLICY } from "@/lib/config";
import {
  CRUSTS,
  ING_BY_ID,
  MAX_PER_INGREDIENT,
  SIZES,
  calcPrice,
  type CartItem,
  type Counts,
  type CrustId,
  type Delivery,
  type IngredientId,
  type SizeId,
} from "@/lib/pizza";

/**
 * Recalcula TODO en el servidor: el cliente sólo envía qué pizza quiere,
 * nunca cuánto cuesta. Así nadie puede manipular el precio desde el navegador.
 */
export function priceCart(raw: unknown, delivery: Delivery) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 10) return { error: "Pedido inválido" } as const;

  const items: CartItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") return { error: "Pedido inválido" } as const;
    const { name, size, crust, ingredients } = r as Record<string, unknown>;
    if (!SIZES.some((s) => s.id === size) || !CRUSTS.some((c) => c.id === crust)) return { error: "Pedido inválido" } as const;

    const counts: Counts = {};
    if (ingredients && typeof ingredients === "object") {
      for (const [id, q] of Object.entries(ingredients)) {
        if (!(id in ING_BY_ID) || !Number.isInteger(q) || (q as number) < 0 || (q as number) > MAX_PER_INGREDIENT)
          return { error: "Ingredientes inválidos" } as const;
        if (q) counts[id as IngredientId] = q as number;
      }
    }
    const price = Math.round(calcPrice(counts, size as SizeId, crust as CrustId) * 100) / 100;
    items.push({
      uid: String(items.length),
      name: typeof name === "string" ? name.trim().slice(0, 40) || "Pizza personalizada" : "Pizza personalizada",
      size: size as SizeId,
      crust: crust as CrustId,
      ingredients: counts,
      price,
    });
  }

  const deliveryFeeCents = delivery === "domicilio" ? Math.round(SHOP.deliveryFee * 100) : 0;
  const totalCents = items.reduce((s, i) => s + Math.round(i.price * 100), 0) + deliveryFeeCents;
  return { items, deliveryFeeCents, totalCents } as const;
}

/** PayPhone exige separar base imponible e IVA. Los precios del menú ya incluyen IVA. */
export function splitTax(totalCents: number) {
  const base = Math.round(totalCents / (1 + POLICY.iva));
  return { amountWithTax: base, tax: totalCents - base };
}
