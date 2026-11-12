import "server-only";
import { getCatalog } from "./catalog";
import { receiptHtml } from "./receipt";
import type { Order } from "./types";

const isProd = process.env.NODE_ENV === "production";

export const whatsappConfigured = () => !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_ID;
export const emailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.MAIL_FROM;

/**
 * Envía el código de verificación por WhatsApp (Meta Cloud API, plantilla de autenticación).
 * Sin credenciales: en desarrollo lo imprime en la consola del servidor y lo devuelve (`dev`);
 * en producción falla para no dejar pasar verificaciones falsas.
 */
export async function sendOtp(phone: string, code: string): Promise<{ dev?: string }> {
  if (!whatsappConfigured()) {
    if (isProd) throw new Error("La verificación por WhatsApp no está configurada");
    console.log(`[DEV] Código de verificación para ${phone}: ${code}`);
    return { dev: code };
  }
  const res = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone.replace("+", ""),
      type: "template",
      template: {
        name: process.env.WHATSAPP_OTP_TEMPLATE || "codigo_verificacion",
        language: { code: process.env.WHATSAPP_OTP_LANG || "es" },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp respondió ${res.status}`);
  return {};
}

/** Envía el comprobante con el ticket al correo del cliente (Resend). */
export async function sendReceipt(order: Order, origin: string) {
  const to = order.customer.email;
  if (!to) return;
  if (!emailConfigured()) {
    if (!isProd) console.log(`[DEV] Comprobante de ${order.code} → ${to} (configura RESEND_API_KEY para enviarlo)`);
    return;
  }
  const cat = await getCatalog();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to,
      subject: `Tu comprobante ${order.code} · ${cat.shop.name}`,
      html: receiptHtml(order, `${origin}/pedido/${order.id}`, cat),
    }),
  });
  if (!res.ok) console.error("No se pudo enviar el comprobante:", res.status);
}
