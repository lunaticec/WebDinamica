import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkAdminToken, maskPhone } from "./security";
import type { Order } from "./types";

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Origen público del sitio (PUBLIC_BASE_URL en producción; el de la petición en desarrollo). */
export function originOf(req: Request) {
  return process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
}

export async function isAdmin() {
  return checkAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Vista pública del pedido: sin teléfono completo ni datos internos. */
export function publicOrder(o: Order) {
  return {
    id: o.id,
    code: o.code,
    status: o.status,
    payMethod: o.payMethod,
    paid: o.paid,
    paidAt: o.paidAt,
    createdAt: o.createdAt,
    expiresAt: o.expiresAt,
    delivery: o.delivery,
    address: o.address,
    customerName: o.customer.name,
    phone: maskPhone(o.customer.phone),
    email: o.customer.email ? o.customer.email.replace(/^(.).*(@.*)$/, "$1•••$2") : undefined,
    items: o.items,
    deliveryFeeCents: o.deliveryFeeCents,
    discountCents: o.discountCents ?? 0,
    promoName: o.promo?.name,
    totalCents: o.totalCents,
    authCode: o.payphone?.authCode,
    timeline: o.timeline,
  };
}
