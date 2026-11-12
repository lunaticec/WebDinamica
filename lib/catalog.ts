import { SHAPE_BY_ID, SHAPES, type Catalog, type Counts, type Crust, type Ingredient, type Preset, type PromoType, type Promotion, type Size } from "./pizza";

/** Catálogo inicial. El dueño lo edita desde /admin y se guarda en la base de datos. */
export const DEFAULT_CATALOG: Catalog = {
  version: 1,
  shop: {
    name: "Fuoco",
    tagline: "Pizzería artesanal",
    hours: "Todos los días · 12:00 – 23:00",
    address: "Calle Principal 123, Tu Ciudad",
    phone: "+593 99 999 9999",
    deliveryFee: 2.5,
    timezone: "America/Guayaquil",
  },
  policy: { localHoldMinutes: 40, onlineHoldMinutes: 30, maxStrikes: 2, localMaxTotal: 40, iva: 0.15, maxPerIngredient: 3 },
  sizes: [
    { id: "personal", label: "Personal", inches: 8, base: 7, mult: 0.7, scale: 0.76 },
    { id: "mediana", label: "Mediana", inches: 12, base: 10, mult: 1, scale: 0.88 },
    { id: "familiar", label: "Familiar", inches: 16, base: 14, mult: 1.4, scale: 1 },
  ],
  crusts: [
    { id: "clasica", label: "Clásica", desc: "Suave", extra: 0, width: 8, stuffed: false },
    { id: "delgada", label: "Delgada", desc: "Crujiente", extra: 0, width: 4.5, stuffed: false },
    { id: "queso", label: "Borde de queso", desc: "Rellena", extra: 2.5, width: 9.5, stuffed: true },
  ],
  ingredients: [
    { id: "pepperoni", name: "Pepperoni", price: 1.5, shape: "pepperoni", pieces: 8, size: 14, available: true },
    { id: "jamon", name: "Jamón", price: 1.25, shape: "jamon", pieces: 7, size: 15, available: true },
    { id: "tocino", name: "Tocino", price: 1.5, shape: "tocino", pieces: 7, size: 15, available: true },
    { id: "champinon", name: "Champiñón", price: 1, shape: "champinon", pieces: 7, size: 13, available: true },
    { id: "pimiento", name: "Pimiento", price: 0.75, shape: "pimiento", pieces: 8, size: 13, available: true },
    { id: "cebolla", name: "Cebolla", price: 0.5, shape: "cebolla", pieces: 8, size: 12, available: true },
    { id: "aceituna", name: "Aceitunas", price: 0.75, shape: "aceituna", pieces: 10, size: 8, available: true },
    { id: "tomate", name: "Tomate", price: 0.75, shape: "tomate", pieces: 6, size: 14, available: true },
    { id: "pina", name: "Piña", price: 1, shape: "pina", pieces: 7, size: 13, available: true },
    { id: "maiz", name: "Maíz", price: 0.75, shape: "maiz", pieces: 14, size: 5.5, available: true },
    { id: "albahaca", name: "Albahaca", price: 0.5, shape: "albahaca", pieces: 6, size: 12, available: true },
  ],
  presets: [
    { id: "pepperoni", name: "Pepperoni Clásica", desc: "La favorita de siempre: doble pepperoni y aceitunas.", active: true, ingredients: { pepperoni: 2, aceituna: 1 } },
    { id: "hawaiana", name: "Hawaiana", desc: "Jamón y piña, dulce y salada.", active: true, ingredients: { jamon: 2, pina: 2 } },
    { id: "vegetariana", name: "Huerta", desc: "Champiñón, pimiento, cebolla, tomate y albahaca.", active: true, ingredients: { champinon: 1, pimiento: 1, cebolla: 1, tomate: 1, albahaca: 1 } },
    { id: "carnivora", name: "Carnívora", desc: "Pepperoni, jamón y tocino sin piedad.", active: true, ingredients: { pepperoni: 1, jamon: 1, tocino: 2 } },
  ],
  promotions: [
    { id: "martes-2x1", name: "Martes 2x1", description: "En pizzas medianas, la segunda es gratis.", active: false, type: "two_for_one", value: 0, code: "", minSubtotal: 0, sizes: ["mediana"], startsAt: "", endsAt: "", days: [2] },
    { id: "bienvenida", name: "Bienvenida 10%", description: "10% de descuento con el código.", active: false, type: "percent", value: 10, code: "BIENVENIDO10", minSubtotal: 0, sizes: [], startsAt: "", endsAt: "", days: [] },
  ],
};

/* ---------------- Validación / saneamiento (se ejecuta en el servidor al guardar) ---------------- */

const str = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const money = (v: unknown, max: number, fallback = 0) => Math.round(num(v, 0, max, fallback) * 100) / 100;
const arr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Ids estables y únicos: se conservan si son válidos; si no, se generan. */
function uniqueIds<T extends { id: string }>(list: T[], prefix: string): T[] {
  const seen = new Set<string>();
  return list.map((it) => {
    let id = /^[a-z0-9_-]{1,40}$/.test(it.id) ? it.id : `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
    while (seen.has(id)) id = `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
    seen.add(id);
    return { ...it, id };
  });
}

export function sanitizeCatalog(raw: unknown, prevVersion = 0): { catalog: Catalog } | { error: string } {
  const r = rec(raw);
  const D = DEFAULT_CATALOG;

  // Negocio
  const s = rec(r.shop);
  let timezone = str(s.timezone, 60, D.shop.timezone);
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
  } catch {
    timezone = D.shop.timezone;
  }
  const shop = {
    name: str(s.name, 30) || D.shop.name,
    tagline: str(s.tagline, 40),
    hours: str(s.hours, 60),
    address: str(s.address, 100),
    phone: str(s.phone, 30),
    deliveryFee: money(s.deliveryFee, 50, D.shop.deliveryFee),
    timezone,
  };

  const p = rec(r.policy);
  const policy = {
    localHoldMinutes: Math.round(num(p.localHoldMinutes, 5, 240, D.policy.localHoldMinutes)),
    onlineHoldMinutes: Math.round(num(p.onlineHoldMinutes, 5, 240, D.policy.onlineHoldMinutes)),
    maxStrikes: Math.round(num(p.maxStrikes, 1, 10, D.policy.maxStrikes)),
    localMaxTotal: money(p.localMaxTotal, 1000, D.policy.localMaxTotal),
    iva: Math.round(num(p.iva, 0, 0.3, D.policy.iva) * 1000) / 1000,
    maxPerIngredient: Math.round(num(p.maxPerIngredient, 1, 5, D.policy.maxPerIngredient)),
  };

  // Tamaños
  let sizes: Size[] = arr(r.sizes, 6).map((x) => {
    const o = rec(x);
    return { id: str(o.id, 40), label: str(o.label, 24), inches: Math.round(num(o.inches, 4, 40, 12)), base: money(o.base, 500), mult: Math.round(num(o.mult, 0.1, 5, 1) * 100) / 100, scale: 1 };
  });
  if (sizes.length < 1) return { error: "Debe haber al menos un tamaño." };
  if (sizes.some((x) => !x.label)) return { error: "Todos los tamaños necesitan un nombre." };
  sizes = uniqueIds(sizes, "t");
  const minIn = Math.min(...sizes.map((x) => x.inches));
  const maxIn = Math.max(...sizes.map((x) => x.inches));
  sizes = sizes.map((x) => ({ ...x, scale: maxIn === minIn ? 1 : Math.round((0.74 + 0.26 * ((x.inches - minIn) / (maxIn - minIn))) * 100) / 100 }));

  // Masas
  let crusts: Crust[] = arr(r.crusts, 8).map((x) => {
    const o = rec(x);
    return { id: str(o.id, 40), label: str(o.label, 30), desc: str(o.desc, 20), extra: money(o.extra, 100), width: num(o.width, 3, 12, 8), stuffed: o.stuffed === true };
  });
  if (crusts.length < 1) return { error: "Debe haber al menos un tipo de masa." };
  if (crusts.some((x) => !x.label)) return { error: "Todas las masas necesitan un nombre." };
  crusts = uniqueIds(crusts, "m");

  // Ingredientes
  let ingredients: Ingredient[] = arr(r.ingredients, 40).map((x) => {
    const o = rec(x);
    const shape = typeof o.shape === "string" && o.shape in SHAPE_BY_ID ? (o.shape as Ingredient["shape"]) : SHAPES[0].id;
    return {
      id: str(o.id, 40),
      name: str(o.name, 30),
      price: money(o.price, 100),
      shape,
      pieces: Math.round(num(o.pieces, 1, 20, SHAPE_BY_ID[shape].pieces)),
      size: num(o.size, 4, 20, SHAPE_BY_ID[shape].size),
      available: o.available !== false,
    };
  });
  if (ingredients.length < 1) return { error: "Debe haber al menos un ingrediente." };
  if (ingredients.some((x) => !x.name)) return { error: "Todos los ingredientes necesitan un nombre." };
  ingredients = uniqueIds(ingredients, "i");
  const ingIds = new Set(ingredients.map((i) => i.id));

  // Menú (pizzas prearmadas)
  let presets: Preset[] = arr(r.presets, 20).map((x) => {
    const o = rec(x);
    const ing: Counts = {};
    for (const [id, q] of Object.entries(rec(o.ingredients))) {
      const n = Math.round(num(q, 0, policy.maxPerIngredient, 0));
      if (ingIds.has(id) && n > 0) ing[id] = n;
    }
    return { id: str(o.id, 40), name: str(o.name, 40), desc: str(o.desc, 120), active: o.active !== false, ingredients: ing };
  });
  if (presets.some((x) => !x.name)) return { error: "Todas las pizzas del menú necesitan un nombre." };
  presets = uniqueIds(presets, "p");

  // Promociones
  const sizeIds = new Set(sizes.map((x) => x.id));
  const TYPES: PromoType[] = ["percent", "amount", "free_delivery", "two_for_one"];
  let promotions: Promotion[] = arr(r.promotions, 30).map((x) => {
    const o = rec(x);
    const type = TYPES.includes(o.type as PromoType) ? (o.type as PromoType) : "percent";
    const code = str(o.code, 20).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    return {
      id: str(o.id, 40),
      name: str(o.name, 50),
      description: str(o.description, 120),
      active: o.active === true,
      type,
      value: type === "percent" ? Math.round(num(o.value, 0, 100, 0) * 10) / 10 : type === "amount" ? money(o.value, 500) : 0,
      code,
      minSubtotal: money(o.minSubtotal, 1000),
      sizes: arr(o.sizes, 6).filter((v): v is string => typeof v === "string" && sizeIds.has(v)),
      startsAt: typeof o.startsAt === "string" && DATE.test(o.startsAt) ? o.startsAt : "",
      endsAt: typeof o.endsAt === "string" && DATE.test(o.endsAt) ? o.endsAt : "",
      days: [...new Set(arr(o.days, 7).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(),
    };
  });
  if (promotions.some((x) => !x.name)) return { error: "Todas las promociones necesitan un nombre." };
  if (promotions.some((x) => x.code && x.code.length < 3)) return { error: "Los códigos de promoción deben tener al menos 3 caracteres (letras o números)." };
  const codes = promotions.filter((x) => x.code).map((x) => x.code);
  if (new Set(codes).size !== codes.length) return { error: "Hay dos promociones con el mismo código." };
  promotions = uniqueIds(promotions, "o");

  return { catalog: { version: prevVersion + 1, shop, policy, sizes, crusts, ingredients, presets, promotions } };
}
