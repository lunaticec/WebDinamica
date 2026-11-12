import { isAdmin, json } from "@/lib/server/http";
import { normalizeEcPhone } from "@/lib/server/security";
import { withDb } from "@/lib/server/store";

/** Bloquear / desbloquear un celular para el pago en el local. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return json({ error: "No autorizado" }, 401);
  const body = await req.json().catch(() => ({}));
  const phone = normalizeEcPhone(body.phone);
  if (!phone) return json({ error: "Celular inválido" }, 400);

  await withDb((db) => {
    const rec = db.phones[phone] ?? { phone, strikes: 0, blocked: false, updatedAt: 0 };
    if (body.action === "block") {
      rec.blocked = true;
      rec.note = "Bloqueado manualmente";
    } else if (body.action === "unblock") {
      rec.blocked = false;
      rec.strikes = 0;
      rec.note = undefined;
    }
    rec.updatedAt = Date.now();
    db.phones[phone] = rec;
  });
  return json({ ok: true });
}
