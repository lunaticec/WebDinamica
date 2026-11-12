import { cookies } from "next/headers";
import { json } from "@/lib/server/http";
import { ADMIN_COOKIE, adminPassword, clientIp, issueAdminToken, safeEqual } from "@/lib/server/security";
import { hit, withDb } from "@/lib/server/store";

export async function POST(req: Request) {
  const expected = adminPassword();
  if (!expected) return json({ error: "Define ADMIN_PASSWORD en el servidor para usar el panel." }, 503);

  const ok = await withDb((db) => hit(db, `admin:${clientIp(req)}`, 15 * 60_000, 8));
  if (!ok) return json({ error: "Demasiados intentos. Espera 15 minutos." }, 429);

  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !safeEqual(password, expected)) return json({ error: "Contraseña incorrecta." }, 401);

  (await cookies()).set(ADMIN_COOKIE, issueAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 3600,
  });
  return json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return json({ ok: true });
}
