import { json } from "@/lib/server/http";
import { hashOtp, issuePhoneToken, normalizeEcPhone, safeEqual } from "@/lib/server/security";
import { withDb } from "@/lib/server/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizeEcPhone(body.phone);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!phone || !/^\d{6}$/.test(code)) return json({ error: "Código inválido." }, 400);

  const result = await withDb((db) => {
    const rec = db.otps[phone];
    if (!rec || rec.expiresAt < Date.now()) return "expired" as const;
    if (rec.attempts >= 5) return "attempts" as const;
    rec.attempts += 1;
    if (!safeEqual(rec.hash, hashOtp(code, phone))) return "wrong" as const;
    delete db.otps[phone];
    return "ok" as const;
  });

  if (result === "ok") return json({ ok: true, token: issuePhoneToken(phone) });
  const message = {
    expired: "El código venció. Pide uno nuevo.",
    attempts: "Demasiados intentos con este código. Pide uno nuevo.",
    wrong: "Código incorrecto.",
  }[result];
  return json({ error: result, message }, 400);
}
