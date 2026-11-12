import { isAdmin, json } from "@/lib/server/http";
import { withDb } from "@/lib/server/store";

export async function GET() {
  if (!(await isAdmin())) return json({ error: "No autorizado" }, 401);
  const data = await withDb((db) => ({
    orders: Object.values(db.orders)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 200),
    phones: Object.values(db.phones).filter((p) => p.strikes > 0 || p.blocked),
  }));
  return json(data);
}
