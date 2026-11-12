import { json, publicOrder } from "@/lib/server/http";
import { withDb } from "@/lib/server/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await withDb((db) => db.orders[id]);
  if (!order) return json({ error: "Pedido no encontrado" }, 404);
  return json(publicOrder(order));
}
