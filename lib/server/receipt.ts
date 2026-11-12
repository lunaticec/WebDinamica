import { SHOP } from "@/lib/config";
import { describeItem } from "@/lib/pizza";
import { formatPrice } from "@/lib/utils";
import type { Order } from "./types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const money = (cents: number) => formatPrice(cents / 100);

/** HTML del comprobante (compatible con clientes de correo: estilos en línea y tablas). */
export function receiptHtml(order: Order, url: string) {
  const rows = order.items
    .map((it) => {
      const d = describeItem(it);
      return `<tr><td style="padding:6px 0"><b>${esc(it.name)}</b> · ${d.size}<br><span style="color:#78716c;font-size:12px">${esc(d.tops)}</span></td><td align="right" style="padding:6px 0;vertical-align:top">${formatPrice(it.price)}</td></tr>`;
    })
    .join("");
  const fee = order.deliveryFeeCents
    ? `<tr><td style="padding:6px 0;color:#78716c">Envío a domicilio</td><td align="right">${money(order.deliveryFeeCents)}</td></tr>`
    : "";
  const pay = order.paid
    ? `<p style="margin:0;color:#15803d;font-weight:bold">✔ PAGADO${order.payphone?.authCode ? ` · Aut. ${esc(order.payphone.authCode)}` : ""}</p>`
    : `<p style="margin:0;color:#b45309;font-weight:bold">PAGO EN EL LOCAL</p>`;

  return `<!doctype html><html><body style="margin:0;background:#e7e5e4;padding:24px;font-family:'Courier New',monospace;color:#1c1917">
<table role="presentation" width="100%" style="max-width:420px;margin:auto;background:#fbfaf6;padding:24px;border-radius:4px">
<tr><td align="center"><div style="font:800 28px Arial,sans-serif;color:#b91c1c;letter-spacing:-1px">${esc(SHOP.name.toUpperCase())}</div>
<div style="font-size:10px;letter-spacing:3px;color:#78716c">${esc(SHOP.tagline.toUpperCase())}</div>
<p style="font-size:12px;color:#78716c;margin:10px 0 0">Comprobante ${esc(order.code)}<br>${new Date(order.createdAt).toLocaleString(SHOP.locale)}</p></td></tr>
<tr><td><hr style="border:0;border-top:1px dashed #d6d3d1;margin:16px 0"></td></tr>
<tr><td><table role="presentation" width="100%" style="font-size:13px">${rows}${fee}</table></td></tr>
<tr><td><hr style="border:0;border-top:1px dashed #d6d3d1;margin:16px 0"></td></tr>
<tr><td><table role="presentation" width="100%"><tr><td style="font-size:18px;font-weight:bold">TOTAL</td><td align="right" style="font:800 28px Arial,sans-serif">${money(order.totalCents)}</td></tr></table>
<p style="font-size:11px;color:#a8a29e;margin:2px 0 12px">IVA ${Math.round(0.15 * 100)}% incluido</p>${pay}</td></tr>
<tr><td style="padding-top:14px;font-size:13px">Cliente: ${esc(order.customer.name)}<br>${order.delivery === "domicilio" ? `Entrega a: ${esc(order.address ?? "")}` : "Retiro en tienda"}<br>Código de retiro: <b style="font-size:16px">${esc(order.code)}</b></td></tr>
<tr><td align="center" style="padding-top:18px"><a href="${url}" style="background:#b91c1c;color:#fff;text-decoration:none;padding:12px 22px;font:bold 13px Arial,sans-serif;border-radius:4px">Ver mi pedido</a></td></tr>
<tr><td align="center" style="padding-top:16px;font-size:10px;color:#a8a29e;letter-spacing:2px">${esc(SHOP.hours.toUpperCase())}</td></tr>
</table></body></html>`;
}
