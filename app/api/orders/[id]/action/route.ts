import { json, originOf, publicOrder } from "@/lib/server/http";
import { preparePayment } from "@/lib/server/payphone";
import { setStatus, withDb } from "@/lib/server/store";

/** Acciones del cliente sobre su propio pedido: avisar que llega, o cancelarlo (sin penalización). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action } = await req.json().catch(() => ({}));

  const result = await withDb(async (db) => {
    const o = db.orders[id];
    if (!o) return { status: 404, error: "Pedido no encontrado" };

    if (action === "arrive") {
      if (o.payMethod !== "local" || o.status !== "verificado") return { status: 409, error: "Este pedido ya no admite ese aviso." };
      setStatus(o, "confirmado", "El cliente avisó que va en camino / llegó");
      return { status: 200, order: publicOrder(o) };
    }
    if (action === "pay") {
      if (o.payMethod !== "online" || o.status !== "pendiente_pago") return { status: 409, error: "Este pedido no tiene un pago pendiente." };
      try {
        return { status: 200, payUrls: await preparePayment(o, originOf(req)) };
      } catch (e) {
        console.error(e);
        return { status: 502, error: "No pudimos iniciar el pago. Intenta de nuevo." };
      }
    }
    if (action === "cancel") {
      if (!["verificado", "confirmado", "pendiente_pago"].includes(o.status))
        return { status: 409, error: "El pedido ya está en preparación; llama al local para cancelarlo." };
      setStatus(o, "cancelado", "Cancelado por el cliente");
      return { status: 200, order: publicOrder(o) };
    }
    return { status: 400, error: "Acción inválida" };
  });

  const { status, ...rest } = result;
  return json(rest, status);
}
