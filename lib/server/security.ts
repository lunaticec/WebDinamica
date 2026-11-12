import "server-only";
import { createHmac, randomBytes, randomInt, timingSafeEqual, createHash } from "crypto";

export function secret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Falta SESSION_SECRET en producción");
  return "dev-secret-no-usar-en-produccion";
}

export const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export const newId = () => randomBytes(12).toString("base64url");
export const newOtp = () => String(randomInt(0, 1_000_000)).padStart(6, "0");
export const hashOtp = (code: string, phone: string) =>
  createHash("sha256").update(`${code}:${phone}:${secret()}`).digest("hex");

/** Token firmado que prueba que `phone` verificó su código (válido 20 min). */
export function issuePhoneToken(phone: string) {
  const exp = Date.now() + 20 * 60_000;
  const body = `${phone}|${exp}`;
  return `${Buffer.from(body).toString("base64url")}.${sign(body)}`;
}

export function checkPhoneToken(token: unknown, phone: string) {
  if (typeof token !== "string") return false;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return false;
  const body = Buffer.from(b64, "base64url").toString();
  if (!safeEqual(sig, sign(body))) return false;
  const [p, exp] = body.split("|");
  return p === phone && Number(exp) > Date.now();
}

/* ---- Sesión de administrador (cookie firmada) ---- */
export const ADMIN_COOKIE = "fuoco_admin";

export function adminPassword() {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  return process.env.NODE_ENV === "production" ? null : "admin"; // sólo desarrollo
}

export const issueAdminToken = () => {
  const exp = Date.now() + 12 * 3600_000;
  return `${exp}.${sign(`admin|${exp}`)}`;
};

export function checkAdminToken(token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  return !!exp && !!sig && Number(exp) > Date.now() && safeEqual(sig, sign(`admin|${exp}`));
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

/** Celular de Ecuador → +5939XXXXXXXX, o null si no es válido. */
export function normalizeEcPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const d = raw.replace(/[^\d]/g, "");
  let national: string | null = null;
  if (/^09\d{8}$/.test(d)) national = d.slice(1);
  else if (/^9\d{8}$/.test(d)) national = d;
  else if (/^5939\d{8}$/.test(d)) national = d.slice(3);
  return national ? `+593${national}` : null;
}

export const maskPhone = (p: string) => `${p.slice(0, 6)}••••${p.slice(-2)}`;
