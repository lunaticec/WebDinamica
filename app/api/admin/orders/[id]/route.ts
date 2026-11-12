import { isAdmin, json } from "@/lib/server/http";
import { addStrike, setStatus, withDb } from "@/lib/server/store";
import type { OrderStatus } from "@/lib/server/types";

const FROM: Record<string, OrderStatus[]> = {
  iniciar: ["pagado", "confirmado", "verificado"],
  listo: ["en_cocina"],
  entregado: ["listo", "en_cocina", "pagado", "confirmado"],
  no_show: ["verificado", "confirmado", "en_cocina", "listo"],
  cancelar: ["pendiente_pago", "pagado", "verificado", "confirmado", "en_cocina", "listo"],
};

/** Acciones del personal: cocina, entrega, plantón (suma strike) o cancelación. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return json({ error: "No autorizado" }, 401);
  const { id } = await params;
  const { action } = await req.json().catch(() => ({}));

  const result = await withDb((db) => {
    const o = db.orders[id];
    if (!o) return { status: 404, error: "Pedido no encontrado" };
    if (!FROM[action]?.includes(o.status)) return { status: 409, error: `No se puede "${action}" un pedido en estado ${o.status}` };

    switch (action) {
      case "iniciar":
        setStatus(o, "en_cocina", "Enviado a cocina");
        break;
      case "listo":
        setStatus(o, "listo", "Listo para retirar / enviar");
        break;
      case "entregado":
        if (!o.paid) {
          o.paid = true; // cobro en el local
          o.paidAt = Date.now();
        }
        setStatus(o, "entregado", o.payMethod === "local" ? "Entregado y cobrado en el local" : "Entregado");
        break;
      case "no_show":
        setStatus(o, "no_show", "El cliente no retiró el pedido");
        addStrike(db, o.customer.phone, "Plantón en pedido " + o.code);
        break;
      case "cancelar":
        setStatus(o, "cancelado", "Cancelado por el local");
        break;
    }
    return { status: 200, ok: true };
  });

  const { status, ...rest } = result;
  return json(rest, status);
}
