import type { Catalog, Delivery, Promotion } from "./pizza";

export const cents = (n: number) => Math.round(n * 100);

/** Fecha (AAAA-MM-DD) y día de la semana en la zona horaria del negocio. */
export function localDay(timezone: string, now: Date) {
  let tz = timezone;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
  } catch {
    tz = "America/Guayaquil";
  }
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(now);
  return { date, dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd) };
}

export type QuoteItem = { size: string; price: number };

export type Quote = {
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
  promo: { id: string; name: string; code?: string } | null;
  /** Resultado del código escrito por el cliente */
  codeStatus: "none" | "ok" | "invalid" | "not_applicable";
};

function discountFor(p: Promotion, items: QuoteItem[], subtotal: number, feeCents: number, delivery: Delivery): number {
  if (subtotal < cents(p.minSubtotal)) return 0;
  const eligible = p.sizes.length ? items.filter((i) => p.sizes.includes(i.size)) : items;
  const eligibleCents = eligible.reduce((s, i) => s + cents(i.price), 0);
  switch (p.type) {
    case "percent":
      return Math.round((eligibleCents * Math.min(100, Math.max(0, p.value))) / 100);
    case "amount":
      return Math.min(cents(p.value), eligibleCents);
    case "free_delivery":
      return delivery === "domicilio" ? feeCents : 0;
    case "two_for_one": {
      // De cada par de pizzas elegibles, la más barata es gratis.
      const prices = eligible.map((i) => cents(i.price)).sort((a, b) => b - a);
      return prices.reduce((s, price, idx) => (idx % 2 === 1 ? s + price : s), 0);
    }
  }
}

function isLive(p: Promotion, date: string, dow: number) {
  if (!p.active) return false;
  if (p.startsAt && date < p.startsAt) return false;
  if (p.endsAt && date > p.endsAt) return false;
  if (p.days.length && !p.days.includes(dow)) return false;
  return true;
}

/**
 * Calcula subtotal, envío, descuento y total. Se usa igual en el navegador (para mostrar el ticket)
 * y en el servidor (que es quien manda). Se aplica UNA sola promoción: la que más descuenta.
 */
export function quote(cat: Catalog, items: QuoteItem[], delivery: Delivery, code: string | undefined, now: Date): Quote {
  const subtotalCents = items.reduce((s, i) => s + cents(i.price), 0);
  const deliveryFeeCents = delivery === "domicilio" ? cents(cat.shop.deliveryFee) : 0;
  const { date, dow } = localDay(cat.shop.timezone, now);
  const typed = (code ?? "").trim().toUpperCase();

  let best: { p: Promotion; d: number } | null = null;
  let codeStatus: Quote["codeStatus"] = typed ? "invalid" : "none";

  for (const p of cat.promotions) {
    const isCodePromo = !!p.code;
    if (isCodePromo && p.code !== typed) continue;
    if (isCodePromo) codeStatus = "not_applicable";
    if (!isLive(p, date, dow)) continue;
    const d = discountFor(p, items, subtotalCents, deliveryFeeCents, delivery);
    if (d <= 0) continue;
    if (isCodePromo) codeStatus = "ok";
    if (!best || d > best.d) best = { p, d };
  }

  const discountCents = Math.min(best?.d ?? 0, subtotalCents + deliveryFeeCents);
  return {
    subtotalCents,
    deliveryFeeCents,
    discountCents,
    totalCents: subtotalCents + deliveryFeeCents - discountCents,
    promo: best ? { id: best.p.id, name: best.p.name, code: best.p.code || undefined } : null,
    codeStatus,
  };
}

const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

/** Resumen legible de una promoción, para el panel. */
export function describePromo(p: Promotion, cat: Catalog) {
  const what =
    p.type === "percent"
      ? `${p.value}% de descuento`
      : p.type === "amount"
        ? `$${p.value} de descuento`
        : p.type === "free_delivery"
          ? "Envío gratis"
          : "2x1 (la más barata gratis)";
  const sizes = p.sizes.length ? ` en ${p.sizes.map((id) => cat.sizes.find((s) => s.id === id)?.label ?? id).join(", ")}` : "";
  const min = p.minSubtotal > 0 ? ` desde $${p.minSubtotal}` : "";
  const days = p.days.length ? ` · ${p.days.map((d) => DAYS[d]).join(", ")}` : "";
  const dates = p.startsAt || p.endsAt ? ` · ${p.startsAt || "…"} → ${p.endsAt || "…"}` : "";
  const how = p.code ? ` · con código ${p.code}` : " · automática";
  return `${what}${sizes}${min}${days}${dates}${how}`;
}
