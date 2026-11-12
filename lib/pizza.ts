/* ============================================================
 * Tipos y utilidades del catálogo. Los DATOS (precios, tamaños,
 * ingredientes, promociones…) viven en el catálogo editable desde
 * /admin; aquí sólo hay tipos y funciones puras que lo reciben.
 * ============================================================ */

export type ShapeId =
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
  | "albahaca"
  | "pollo"
  | "salchicha"
  | "jalapeno"
  | "queso";

/** Formas disponibles para dibujar un ingrediente, con sus valores por defecto. */
export const SHAPES: { id: ShapeId; label: string; pieces: number; size: number }[] = [
  { id: "pepperoni", label: "Rodaja roja (pepperoni)", pieces: 8, size: 14 },
  { id: "jamon", label: "Jamón", pieces: 7, size: 15 },
  { id: "tocino", label: "Tocino", pieces: 7, size: 15 },
  { id: "champinon", label: "Champiñón", pieces: 7, size: 13 },
  { id: "pimiento", label: "Pimiento / tira verde", pieces: 8, size: 13 },
  { id: "cebolla", label: "Aro de cebolla", pieces: 8, size: 12 },
  { id: "aceituna", label: "Aceituna", pieces: 10, size: 8 },
  { id: "tomate", label: "Tomate", pieces: 6, size: 14 },
  { id: "pina", label: "Piña", pieces: 7, size: 13 },
  { id: "maiz", label: "Maíz", pieces: 14, size: 5.5 },
  { id: "albahaca", label: "Albahaca / hoja", pieces: 6, size: 12 },
  { id: "pollo", label: "Pollo", pieces: 7, size: 12 },
  { id: "salchicha", label: "Salchicha / chorizo", pieces: 8, size: 12 },
  { id: "jalapeno", label: "Jalapeño", pieces: 9, size: 9 },
  { id: "queso", label: "Queso extra", pieces: 8, size: 13 },
];
export const SHAPE_BY_ID = Object.fromEntries(SHAPES.map((s) => [s.id, s])) as Record<ShapeId, (typeof SHAPES)[number]>;

export type IngredientId = string;
export type SizeId = string;
export type CrustId = string;
export type Delivery = "recoger" | "domicilio";
export type Counts = Record<string, number>;

export type Ingredient = {
  id: IngredientId;
  name: string;
  /** Precio por porción en el tamaño con multiplicador 1 */
  price: number;
  shape: ShapeId;
  /** Piezas dibujadas por cada porción */
  pieces: number;
  /** Tamaño de cada pieza (% del ancho de la pizza) */
  size: number;
  available: boolean;
};

export type Size = { id: SizeId; label: string; inches: number; base: number; mult: number; scale: number };
export type Crust = { id: CrustId; label: string; desc: string; extra: number; width: number; stuffed: boolean };
export type Preset = { id: string; name: string; desc: string; active: boolean; ingredients: Counts };

export type PromoType = "percent" | "amount" | "free_delivery" | "two_for_one";
export type Promotion = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  type: PromoType;
  /** percent: 0-100 · amount: dólares · otros: ignorado */
  value: number;
  /** Si tiene código, sólo aplica cuando el cliente lo escribe. Sin código = automática. */
  code: string;
  /** Subtotal mínimo de pizzas */
  minSubtotal: number;
  /** Si no está vacío, sólo cuentan las pizzas de estos tamaños */
  sizes: SizeId[];
  /** AAAA-MM-DD (vacío = sin límite) */
  startsAt: string;
  endsAt: string;
  /** Días de la semana (0=domingo … 6=sábado). Vacío = todos */
  days: number[];
};

export type ShopInfo = {
  name: string;
  tagline: string;
  hours: string;
  address: string;
  phone: string;
  deliveryFee: number;
  /** Zona horaria IANA para fechas de promociones */
  timezone: string;
};

export type PolicyCfg = {
  localHoldMinutes: number;
  onlineHoldMinutes: number;
  maxStrikes: number;
  localMaxTotal: number;
  /** Fracción, ej. 0.15 = 15% (los precios ya incluyen IVA) */
  iva: number;
  maxPerIngredient: number;
};

export type Catalog = {
  version: number;
  shop: ShopInfo;
  policy: PolicyCfg;
  sizes: Size[];
  crusts: Crust[];
  ingredients: Ingredient[];
  presets: Preset[];
  promotions: Promotion[];
};

/* ---------- Búsquedas con respaldo (el catálogo puede cambiar mientras alguien arma su pizza) ---------- */

export const ingOf = (cat: Catalog, id: string) => cat.ingredients.find((i) => i.id === id);
export const sizeOf = (cat: Catalog, id: string) =>
  cat.sizes.find((s) => s.id === id) ?? cat.sizes[Math.floor((cat.sizes.length - 1) / 2)];
export const crustOf = (cat: Catalog, id: string) => cat.crusts.find((c) => c.id === id) ?? cat.crusts[0];
/** Tamaño "de referencia" para mostrar precios en el menú (el del medio). */
export const midSize = (cat: Catalog) => cat.sizes[Math.floor((cat.sizes.length - 1) / 2)];

export function calcPrice(cat: Catalog, counts: Counts, sizeId: SizeId, crustId: CrustId) {
  const size = sizeOf(cat, sizeId);
  const crust = crustOf(cat, crustId);
  const toppings = Object.entries(counts).reduce((sum, [id, qty]) => sum + (ingOf(cat, id)?.price ?? 0) * (qty ?? 0), 0);
  return size.base + crust.extra + toppings * size.mult;
}

/* ---------- Capas de ingredientes sobre la pizza ---------- */

export type Piece = { id: string; ing: IngredientId; shape: ShapeId; x: number; y: number; rot: number; scale: number; size: number; delay: number };
export type Layer = { uid: string; ing: IngredientId; pieces: Piece[] };

let seq = 0;
const uid = () => `${Date.now().toString(36)}-${seq++}`;

/** Genera una porción de un ingrediente con piezas repartidas al azar sobre el disco de la pizza. */
export function createLayer(cat: Catalog, ing: IngredientId): Layer {
  const def = ingOf(cat, ing);
  if (!def) return { uid: uid(), ing, pieces: [] };
  const pieces: Piece[] = Array.from({ length: def.pieces }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const r = 33 * Math.sqrt(Math.random());
    return {
      id: uid(),
      ing,
      shape: def.shape,
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

/* ---------- Carrito / líneas de pedido ---------- */

export type CartItem = {
  uid: string;
  name: string;
  size: SizeId;
  crust: CrustId;
  ingredients: Counts;
  price: number;
  /** Copia de los nombres al momento del pedido: el comprobante no cambia si luego editas el menú. */
  snap?: { size: string; crust: string; tops: string };
};

export function describeItem(cat: Catalog, item: CartItem) {
  if (item.snap) return item.snap;
  const size = sizeOf(cat, item.size);
  const crust = crustOf(cat, item.crust);
  const tops = Object.entries(item.ingredients)
    .filter(([, q]) => (q ?? 0) > 0)
    .map(([id, q]) => `${ingOf(cat, id)?.name ?? id}${(q ?? 0) > 1 ? ` x${q}` : ""}`)
    .join(", ");
  return { size: size.label, crust: crust.label, tops: tops || "Solo queso" };
}
