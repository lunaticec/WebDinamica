import { originOf } from "@/lib/server/http";
import { sendReceipt } from "@/lib/server/notify";
import { confirmPayment, payphoneMock } from "@/lib/server/payphone";
import { setStatus, withDb } from "@/lib/server/store";

/**
 * PayPhone redirige aquí al terminar el pago (?id=…&clientTransactionId=…).
 * No confiamos en la URL: consultamos el resultado a PayPhone y verificamos el monto.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = originOf(req);
  const ppId = url.searchParams.get("id") ?? "";
  const orderId = url.searchParams.get("clientTransactionId") ?? "";
  const back = (q = "") => Response.redirect(`${origin}/pedido/${encodeURIComponent(orderId)}${q}`, 303);

  if (!orderId) return Response.redirect(`${origin}/`, 303);
  const mockOk = payphoneMock() && url.searchParams.get("mock") === "1";

  try {
    const outcome = await withDb(async (db) => {
      const o = db.orders[orderId];
      if (!o) return null;
      if (o.paid) return { order: o, fresh: false };
      if (["cancelado", "expirado"].includes(o.status)) return { order: o, fresh: false, late: true };

      const c = await confirmPayment(mockOk ? "mock" : ppId, orderId);
      const amountOk = c.amountCents === undefined || c.amountCents === o.totalCents;
      if (c.approved && amountOk) {
        o.paid = true;
        o.paidAt = Date.now();
        o.expiresAt = undefined;
        o.payphone = { ...o.payphone, transactionId: c.transactionId, authCode: c.authCode };
        setStatus(o, "pagado", "Pago confirmado con PayPhone");
        return { order: o, fresh: true };
      }
      return { order: o, fresh: false, declined: true };
    });

    if (!outcome) return Response.redirect(`${origin}/`, 303);
    if (outcome.fresh) await sendReceipt(outcome.order, origin).catch((e) => console.error(e));
    return back(outcome.declined ? "?rechazado=1" : "");
  } catch (e) {
    console.error(e);
    return back("?error=1");
  }
}
