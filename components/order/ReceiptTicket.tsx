"use client";

import { SHOP } from "@/lib/config";
import { describeItem, type CartItem } from "@/lib/pizza";
import { cn, formatPrice } from "@/lib/utils";
import { Flame } from "lucide-react";

export type PublicOrder = {
  id: string;
  code: string;
  status: string;
  payMethod: "online" | "local";
  paid: boolean;
  paidAt?: number;
  createdAt: number;
  expiresAt?: number;
  delivery: "recoger" | "domicilio";
  address?: string;
  customerName: string;
  phone: string;
  email?: string;
  items: CartItem[];
  deliveryFeeCents: number;
  totalCents: number;
  authCode?: string;
  timeline: { at: number; status: string; note?: string }[];
};

/** Comprobante en formato ticket (mismo estilo que el ticket del constructor). */
export function ReceiptTicket({ order }: { order: PublicOrder }) {
  return (
    <div id="receipt" className="relative mx-auto w-full max-w-[400px] drop-shadow-[0_30px_30px_rgba(0,0,0,0.35)] print:drop-shadow-none">
      <div className="bg-[#fbfaf6] px-6 pb-6 pt-7 font-mono text-[13px] leading-snug text-stone-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-red-700">
            <Flame size={20} />
            <span className="font-display text-3xl font-extrabold uppercase tracking-tight">{SHOP.name}</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">{SHOP.tagline}</p>
          <p className="mt-3 text-[11px] text-stone-400">
            Comprobante {order.code} · {new Date(order.createdAt).toLocaleString(SHOP.locale, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <hr className="my-4 border-dashed border-stone-300" />

        <ul className="space-y-3">
          {order.items.map((it) => {
            const d = describeItem(it);
            return (
              <li key={it.uid}>
                <div className="flex items-baseline justify-between gap-3 font-bold">
                  <span>{it.name} · {d.size}</span>
                  <span className="tabular-nums">{formatPrice(it.price)}</span>
                </div>
                <p className="text-[11px] text-stone-500">Masa {d.crust.toLowerCase()} · {d.tops}</p>
              </li>
            );
          })}
          {order.deliveryFeeCents > 0 && (
            <li className="flex justify-between text-stone-500">
              <span>Envío a domicilio</span>
              <span className="tabular-nums">{formatPrice(order.deliveryFeeCents / 100)}</span>
            </li>
          )}
        </ul>

        <hr className="my-4 border-dashed border-stone-300" />

        <div className="flex items-end justify-between">
          <span className="text-lg font-bold uppercase">Total</span>
          <span className="font-display text-4xl font-extrabold tracking-tight text-stone-900">{formatPrice(order.totalCents / 100)}</span>
        </div>
        <p className="text-right text-[10px] text-stone-400">IVA incluido</p>

        <div
          className={cn(
            "mt-4 rounded-md border-2 border-dashed py-2 text-center text-sm font-bold uppercase tracking-widest",
            order.paid ? "border-emerald-600 text-emerald-700" : "border-amber-600 text-amber-700"
          )}
        >
          {order.paid ? `✔ Pagado${order.authCode ? ` · Aut. ${order.authCode}` : ""}` : order.payMethod === "local" ? "Pago en el local" : "Pago pendiente"}
        </div>

        <hr className="my-4 border-dashed border-stone-300" />

        <p>Cliente: {order.customerName}</p>
        <p>{order.delivery === "domicilio" ? `Entrega: ${order.address}` : "Retiro en tienda"}</p>
        <div className="mt-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Código de retiro</p>
          <p className="font-display text-4xl font-extrabold tracking-widest text-stone-900">{order.code}</p>
        </div>

        <div
          aria-hidden
          className="mt-5 h-12 w-full opacity-80"
          style={{
            background:
              "repeating-linear-gradient(90deg,#1c1917 0 2px,transparent 2px 4px,#1c1917 4px 5px,transparent 5px 8px,#1c1917 8px 11px,transparent 11px 13px,#1c1917 13px 14px,transparent 14px 17px)",
          }}
        />
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.25em] text-stone-400">{SHOP.hours}</p>
      </div>
      <div className="ticket-edge" />
    </div>
  );
}
