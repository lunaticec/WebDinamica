import { POLICY } from "@/lib/config";
import { json } from "@/lib/server/http";
import { sendOtp } from "@/lib/server/notify";
import { clientIp, hashOtp, newOtp, normalizeEcPhone } from "@/lib/server/security";
import { hit, isBlocked, withDb } from "@/lib/server/store";

/** Envía un código de 6 dígitos por WhatsApp para verificar el celular (pago en el local). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizeEcPhone(body.phone);
  if (!phone) return json({ error: "Ingresa un celular válido de Ecuador (09XXXXXXXX)." }, 400);
  const ip = clientIp(req);

  const result = await withDb(async (db) => {
    if (isBlocked(db, phone)) return { status: 403, error: "blocked" as const };
    const prev = db.otps[phone];
    if (prev && Date.now() - prev.sentAt < 45_000) return { status: 429, error: "wait" as const };
    if (!hit(db, `otp:ip:${ip}`, 3600_000, 10) || !hit(db, `otp:phone:${phone}`, 3600_000, 3))
      return { status: 429, error: "limit" as const };

    const code = newOtp();
    db.otps[phone] = { hash: hashOtp(code, phone), expiresAt: Date.now() + 5 * 60_000, attempts: 0, sentAt: Date.now() };
    return { status: 200, code };
  });

  if (!("code" in result)) {
    const key = result.error as "blocked" | "limit" | "wait";
    const msg = {
      blocked: `Este celular no puede pagar en el local por pedidos anteriores sin retirar. Paga en línea para continuar.`,
      limit: "Demasiados intentos. Prueba de nuevo en una hora.",
      wait: "Espera unos segundos antes de pedir otro código.",
    }[key];
    return json({ error: key, message: msg }, result.status);
  }

  try {
    const sent = await sendOtp(phone, (result as { code: string }).code);
    return json({ ok: true, devCode: sent.dev, holdMinutes: POLICY.localHoldMinutes });
  } catch (e) {
    console.error(e);
    return json({ error: "send", message: "No pudimos enviar el código por WhatsApp. Intenta de nuevo o paga en línea." }, 502);
  }
}
