import { getCatalog } from "@/lib/server/catalog";
import { json, originOf } from "@/lib/server/http";
import { preparePayment } from "@/lib/server/payphone";
import { priceCart } from "@/lib/server/pricing";
import { checkPhoneToken, clientIp, newId, normalizeEcPhone } from "@/lib/server/security";
import { hit, isBlocked, setStatus, withDb } from "@/lib/server/store";
import { ACTIVE_LOCAL, type Order } from "@/lib/server/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Crea un pedido. El precio SIEMPRE se recalcula aquí; el cliente no lo decide. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return json({ error: "Pedido inválido." }, 400);

  const name = typeof b.customer?.name === "string" ? b.customer.name.trim().slice(0, 60) : "";
  const phone = normalizeEcPhone(b.customer?.phone);
  const email = typeof b.customer?.email === "string" && b.customer.email.trim() ? b.customer.email.trim().slice(0, 120) : undefined;
  const delivery = b.delivery === "domicilio" ? "domicilio" : "recoger";
  const address = typeof b.address === "string" ? b.address.trim().slice(0, 200) : undefined;
  const payMethod = b.payMethod === "local" ? "local" : "online";

  if (name.length < 2) return json({ error: "Escribe tu nombre." }, 400);
  if (!phone) return json({ error: "Ingresa un celular válido de Ecuador (09XXXXXXXX)." }, 400);
  if (email && !EMAIL.test(email)) return json({ error: "El correo no es válido." }, 400);
  if (payMethod === "online" && !email) return json({ error: "Necesitamos tu correo para enviarte el comprobante." }, 400);
  if (delivery === "domicilio" && (!address || address.length < 8)) return json({ error: "Escribe tu dirección completa." }, 400);

  const cat = await getCatalog();
  const POLICY = cat.policy;
  const promoCode = typeof b.promoCode === "string" ? b.promoCode.trim().slice(0, 20) : undefined;
  const priced = priceCart(cat, b.items, delivery, promoCode);
  if ("error" in priced) return json({ error: priced.error }, 400);

  const ip = clientIp(req);
  const origin = originOf(req);

  const created = await withDb(async (db) => {
    if (!hit(db, `order:ip:${ip}`, 3600_000, 8)) return { status: 429, error: "Demasiados pedidos desde esta conexión. Intenta más tarde." };

    if (payMethod === "local") {
      if (isBlocked(db, phone))
        return { status: 403, error: "Este celular no puede pagar en el local por pedidos anteriores sin retirar. Paga en línea para continuar." };
      if (!checkPhoneToken(b.token, phone)) return { status: 401, error: "Verifica tu celular con el código de WhatsApp." };
      if (priced.quote.totalCents > POLICY.localMaxTotal * 100)
        return { status: 400, error: `El pago en el local está limitado a pedidos de hasta $${POLICY.localMaxTotal}. Paga en línea.` };
      const pending = Object.values(db.orders).find(
        (o) => o.payMethod === "local" && !o.paid && o.customer.phone === phone && ACTIVE_LOCAL.includes(o.status)
      );
      if (pending) return { status: 409, error: `Ya tienes un pedido pendiente (${pending.code}). Retíralo o cancélalo antes de hacer otro.`, existing: pending.id };
    }

    let code = "";
    do code = `FU-${Math.floor(1000 + Math.random() * 9000)}`;
    while (Object.values(db.orders).some((o) => o.code === code));

    const now = Date.now();
    const order: Order = {
      id: newId(),
      code,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + (payMethod === "local" ? POLICY.localHoldMinutes : POLICY.onlineHoldMinutes) * 60_000,
      status: "pendiente_pago",
      payMethod,
      paid: false,
      delivery,
      address: delivery === "domicilio" ? address : undefined,
      customer: { name, phone, email },
      items: priced.items,
      deliveryFeeCents: priced.quote.deliveryFeeCents,
      discountCents: priced.quote.discountCents,
      promo: priced.quote.promo ?? undefined,
      totalCents: priced.quote.totalCents,
      timeline: [],
    };
    setStatus(order, payMethod === "local" ? "verificado" : "pendiente_pago", payMethod === "local" ? "Celular verificado" : "Esperando pago");
    db.orders[order.id] = order;

    if (payMethod === "online") {
      try {
        const payUrls = await preparePayment(order, origin);
        return { status: 201, id: order.id, payUrls };
      } catch (e) {
        console.error(e);
        setStatus(order, "cancelado", "No se pudo iniciar el pago");
        return { status: 502, error: "No pudimos iniciar el pago en línea. Intenta de nuevo en un momento." };
      }
    }
    return { status: 201, id: order.id };
  });

  const { status, ...rest } = created;
  return json(rest, status);
}
