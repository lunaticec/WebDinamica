import "server-only";
import { splitTax } from "./pricing";
import { getCatalog } from "./catalog";
import type { Order } from "./types";

/**
 * Integración con PayPhone (Ecuador) — Botón de pagos por redirección:
 *   1) Prepare: crea la transacción y devuelve los enlaces de pago.
 *   2) El cliente paga en PayPhone y vuelve a `responseUrl?id=…&clientTransactionId=…`.
 *   3) Confirm: el servidor consulta el resultado real (nunca se confía en la URL de retorno).
 *
 * Las URLs son configurables (PAYPHONE_API_BASE / *_PATH) por si PayPhone cambia versión.
 */
const BASE = () => process.env.PAYPHONE_API_BASE || "https://pay.payphonetodoesposible.com";
const PREPARE_PATH = () => process.env.PAYPHONE_PREPARE_PATH || "/api/button/Prepare";
const CONFIRM_PATH = () => process.env.PAYPHONE_CONFIRM_PATH || "/api/button/V2/Confirm";

export const payphoneConfigured = () => !!process.env.PAYPHONE_TOKEN && !!process.env.PAYPHONE_STORE_ID;
/** Sin credenciales y fuera de producción se usa una pasarela simulada para probar el flujo. */
export const payphoneMock = () => !payphoneConfigured() && process.env.NODE_ENV !== "production";

const headers = () => ({ Authorization: `Bearer ${process.env.PAYPHONE_TOKEN}`, "Content-Type": "application/json" });

export type PayUrls = { card?: string; app?: string };

export async function preparePayment(order: Order, origin: string): Promise<PayUrls> {
  if (payphoneMock()) return { card: `${origin}/pago-simulado?o=${order.id}` };
  if (!payphoneConfigured()) throw new Error("PayPhone no está configurado");

  const { amountWithTax, tax } = splitTax(order.totalCents, (await getCatalog()).policy.iva);
  const res = await fetch(`${BASE()}${PREPARE_PATH()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      amount: order.totalCents,
      amountWithoutTax: 0,
      amountWithTax,
      tax,
      service: 0,
      tip: 0,
      currency: "USD",
      storeId: process.env.PAYPHONE_STORE_ID,
      reference: `Pedido ${order.code}`.slice(0, 100),
      clientTransactionId: order.id,
      responseUrl: `${origin}/api/payphone/return`,
      cancellationUrl: `${origin}/pedido/${order.id}?cancelado=1`,
      email: order.customer.email,
    }),
  });
  if (!res.ok) throw new Error(`PayPhone Prepare respondió ${res.status}`);
  const data = await res.json();
  const urls: PayUrls = { card: data.payWithCard, app: data.payWithPayPhone };
  if (!urls.card && !urls.app) throw new Error("PayPhone no devolvió enlaces de pago");
  if (data.paymentId) order.payphone = { ...order.payphone, paymentId: Number(data.paymentId) };
  return urls;
}

export type Confirmation = { approved: boolean; transactionId?: string; authCode?: string; amountCents?: number };

export async function confirmPayment(id: string, clientTxId: string): Promise<Confirmation> {
  if (payphoneMock()) return { approved: id === "mock", transactionId: "MOCK", authCode: "SIM-0000" };
  const res = await fetch(`${BASE()}${CONFIRM_PATH()}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ id: Number(id), clientTxId }),
  });
  if (!res.ok) throw new Error(`PayPhone Confirm respondió ${res.status}`);
  const d = await res.json();
  return {
    approved: d.statusCode === 3 || d.transactionStatus === "Approved",
    transactionId: d.transactionId != null ? String(d.transactionId) : undefined,
    authCode: d.authorizationCode,
    amountCents: typeof d.amount === "number" ? d.amount : undefined,
  };
}
