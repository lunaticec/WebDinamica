import { SHOP } from "./config";

export type IngredientId =
  | "pepperoni"
  | "jamon"
  | "tocino"
  | "champinon"
  | "pimiento"
  | "cebolla"
  | "aceituna"
  | "tomate"
  | "pina"
  | "maiz"
  | "albahaca";

export type Ingredient = {
  id: IngredientId;
  name: string;
  /** Precio por porción en tamaño mediano */
  price: number;
  /** Piezas que aparecen en la pizza por cada porción */
  pieces: number;
  /** Tamaño de cada pieza (% del ancho de la pizza) */
  size: number;
};

export const MAX_PER_INGREDIENT = 3;

export const INGREDIENTS: Ingredient[] = [
  { id: "pepperoni", name: "Pepperoni", price: 1.5, pieces: 8, size: 14 },
  { id: "jamon", name: "Jamón", price: 1.25, pieces: 7, size: 15 },
  { id: "tocino", name: "Tocino", price: 1.5, pieces: 7, size: 15 },
  { id: "champinon", name: "Champiñón", price: 1, pieces: 7, size: 13 },
  { id: "pimiento", name: "Pimiento", price: 0.75, pieces: 8, size: 13 },
  { id: "cebolla", name: "Cebolla", price: 0.5, pieces: 8, size: 12 },
  { id: "aceituna", name: "Aceitunas", price: 0.75, pieces: 10, size: 8 },
  { id: "tomate", name: "Tomate", price: 0.75, pieces: 6, size: 14 },
  { id: "pina", name: "Piña", price: 1, pieces: 7, size: 13 },
  { id: "maiz", name: "Maíz", price: 0.75, pieces: 14, size: 5.5 },
  { id: "albahaca", name: "Albahaca", price: 0.5, pieces: 6, size: 12 },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i])) as Record<IngredientId, Ingredient>;

export type SizeId = "personal" | "mediana" | "familiar";
export const SIZES: { id: SizeId; label: string; inches: number; base: number; mult: number; scale: number }[] = [
  { id: "personal", label: "Personal", inches: 8, base: 7, mult: 0.7, scale: 0.76 },
  { id: "mediana", label: "Mediana", inches: 12, base: 10, mult: 1, scale: 0.88 },
  { id: "familiar", label: "Familiar", inches: 16, base: 14, mult: 1.4, scale: 1 },
];

export type CrustId = "clasica" | "delgada" | "queso";
export const CRUSTS: { id: CrustId; label: string; desc: string; extra: number; width: number }[] = [
  { id: "clasica", label: "Clásica", desc: "Suave", extra: 0, width: 8 },
  { id: "delgada", label: "Delgada", desc: "Crujiente", extra: 0, width: 4.5 },
  { id: "queso", label: "Borde de queso", desc: "Rellena", extra: 2.5, width: 9.5 },
];

export type Counts = Partial<Record<IngredientId, number>>;

export function calcPrice(counts: Counts, sizeId: SizeId, crustId: CrustId) {
  const size = SIZES.find((s) => s.id === sizeId)!;
  const crust = CRUSTS.find((c) => c.id === crustId)!;
  const toppings = Object.entries(counts).reduce(
    (sum, [id, qty]) => sum + ING_BY_ID[id as IngredientId].price * (qty ?? 0),
    0
  );
  return size.base + crust.extra + toppings * size.mult;
}

/* ---------- Capas de ingredientes sobre la pizza ---------- */

export type Piece = { id: string; ing: IngredientId; x: number; y: number; rot: number; scale: number; size: number; delay: number };
export type Layer = { uid: string; ing: IngredientId; pieces: Piece[] };

let seq = 0;
const uid = () => `${Date.now().toString(36)}-${seq++}`;

/** Genera una porción de un ingrediente con piezas repartidas al azar sobre el disco de la pizza. */
export function createLayer(ing: IngredientId): Layer {
  const def = ING_BY_ID[ing];
  const pieces: Piece[] = Array.from({ length: def.pieces }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const r = 33 * Math.sqrt(Math.random());
    return {
      id: uid(),
      ing,
      x: 50 + Math.cos(angle) * r,
      y: 50 + Math.sin(angle) * r,
      rot: Math.random() * 360,
      scale: 0.85 + Math.random() * 0.3,
      size: def.size,
      delay: i * 0.035,
    };
  });
  return { uid: uid(), ing, pieces };
}

/* ---------- Menú de pizzas prearmadas ---------- */

export type Preset = { id: string; name: string; desc: string; ingredients: Counts };
export const PRESETS: Preset[] = [
  {
    id: "pepperoni",
    name: "Pepperoni Clásica",
    desc: "La favorita de siempre: doble pepperoni y aceitunas.",
    ingredients: { pepperoni: 2, aceituna: 1 },
  },
  {
    id: "hawaiana",
    name: "Hawaiana",
    desc: "Jamón y piña, dulce y salada.",
    ingredients: { jamon: 2, pina: 2 },
  },
  {
    id: "vegetariana",
    name: "Huerta",
    desc: "Champiñón, pimiento, cebolla, tomate y albahaca.",
    ingredients: { champinon: 1, pimiento: 1, cebolla: 1, tomate: 1, albahaca: 1 },
  },
  {
    id: "carnivora",
    name: "Carnívora",
    desc: "Pepperoni, jamón y tocino sin piedad.",
    ingredients: { pepperoni: 1, jamon: 1, tocino: 2 },
  },
];

/* ---------- Carrito ---------- */

export type CartItem = {
  uid: string;
  name: string;
  size: SizeId;
  crust: CrustId;
  ingredients: Counts;
  price: number;
};

export function describeItem(item: CartItem) {
  const size = SIZES.find((s) => s.id === item.size)!;
  const crust = CRUSTS.find((c) => c.id === item.crust)!;
  const tops = Object.entries(item.ingredients)
    .filter(([, q]) => (q ?? 0) > 0)
    .map(([id, q]) => `${ING_BY_ID[id as IngredientId].name}${(q ?? 0) > 1 ? ` x${q}` : ""}`)
    .join(", ");
  return { size: size.label, crust: crust.label, tops: tops || "Solo queso" };
}

export type Delivery = "recoger" | "domicilio";

export function buildWhatsAppUrl(
  items: CartItem[],
  total: number,
  fmt: (n: number) => string,
  delivery: Delivery = "recoger"
) {
  const lines = items.map((it, i) => {
    const d = describeItem(it);
    return `${i + 1}. ${it.name} (${d.size}, masa ${d.crust.toLowerCase()})\n   ${d.tops} — ${fmt(it.price)}`;
  });
  const entrega = delivery === "domicilio" ? `A domicilio (+${fmt(SHOP.deliveryFee)})` : "Recoger en tienda";
  const text = `Hola ${SHOP.name}, quiero hacer este pedido:\n\n${lines.join("\n")}\n\nEntrega: ${entrega}\nTotal: ${fmt(total)}`;
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
}
