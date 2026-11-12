import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CATALOG } from "@/lib/catalog";
import type { Catalog, PolicyCfg } from "@/lib/pizza";
import type { DB, Order, OrderStatus, PhoneRecord } from "./types";

/**
 * Almacenamiento en un archivo JSON (.data/db.json) con escritura serializada.
 * Sirve para un solo servidor (VPS, local). En Vercel/serverless el disco no persiste:
 * reemplaza `withDb` por Postgres/Supabase/Upstash manteniendo la misma firma.
 */
const FILE = path.join(process.cwd(), ".data", "db.json");
const empty = (): DB => ({ orders: {}, phones: {}, otps: {}, hits: {} });

let chain: Promise<unknown> = Promise.resolve();

async function load(): Promise<DB> {
  try {
    return { ...empty(), ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch {
    return empty();
  }
}

async function save(db: DB) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, FILE);
}

/** Ejecuta `fn` con la base cargada; las llamadas se encolan para evitar carreras. */
export function withDb<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const db = await load();
    sweep(db);
    const result = await fn(db);
    await save(db);
    return result;
  });
  chain = run.catch(() => undefined);
  return run;
}

export const policyOf = (db: DB): PolicyCfg => (db.catalog ?? DEFAULT_CATALOG).policy;
export const catalogOf = (db: DB): Catalog => db.catalog ?? DEFAULT_CATALOG;

/** Lectura sin escribir en disco (para renderizar páginas). */
export async function peek<T>(fn: (db: DB) => T): Promise<T> {
  return fn(await load());
}

export function setStatus(order: Order, status: OrderStatus, note?: string) {
  const now = Date.now();
  order.status = status;
  order.updatedAt = now;
  order.timeline.push({ at: now, status, note });
}

export function addStrike(db: DB, phone: string, reason: string) {
  const rec: PhoneRecord = db.phones[phone] ?? { phone, strikes: 0, blocked: false, updatedAt: 0 };
  rec.strikes += 1;
  rec.updatedAt = Date.now();
  if (rec.strikes >= policyOf(db).maxStrikes) {
    rec.blocked = true;
    rec.note = reason;
  }
  db.phones[phone] = rec;
}

export function isBlocked(db: DB, phone: string) {
  const r = db.phones[phone];
  return !!r && (r.blocked || r.strikes >= policyOf(db).maxStrikes);
}

/** Expira pedidos vencidos. Un "pago en local" que nunca avisó cuenta como plantón. */
function sweep(db: DB) {
  const now = Date.now();
  for (const o of Object.values(db.orders)) {
    if (!o.expiresAt || o.expiresAt > now) continue;
    if (o.status === "verificado") {
      setStatus(o, "expirado", "No se presentó a tiempo");
      addStrike(db, o.customer.phone, "Pedido en local sin presentarse");
    } else if (o.status === "pendiente_pago") {
      setStatus(o, "expirado", "Pago no completado");
    }
  }
  // Limpieza de contadores antiguos
  for (const [k, hits] of Object.entries(db.hits)) {
    const fresh = hits.filter((t) => now - t < 3600_000);
    if (fresh.length) db.hits[k] = fresh;
    else delete db.hits[k];
  }
}

/** Límite de frecuencia: devuelve false si se superó `max` en `windowMs`. */
export function hit(db: DB, key: string, windowMs: number, max: number) {
  const now = Date.now();
  const list = (db.hits[key] ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    db.hits[key] = list;
    return false;
  }
  list.push(now);
  db.hits[key] = list;
  return true;
}
