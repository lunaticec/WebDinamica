import { isAdmin, json } from "@/lib/server/http";

export async function GET() {
  return (await isAdmin()) ? json({ ok: true }) : json({ error: "No autorizado" }, 401);
}
