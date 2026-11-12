"use client";

import { ReceiptText } from "lucide-react";
import { AnimatedPrice } from "./AnimatedPrice";
import { usePizza } from "./PizzaProvider";

/** Barra inferior fija en móvil: total en vivo + acceso rápido al ticket. */
export function PriceBar() {
  const { orderTotal } = usePizza();
  return (
    <div className="glass flex items-center justify-between gap-4 rounded-full bg-ink-900/90 py-2 pl-6 pr-2 shadow-[0_10px_40px_-8px_rgba(0,0,0,0.9)]">
      <AnimatedPrice value={orderTotal} className="font-display text-3xl font-semibold tracking-tight text-white" />
      <a
        href="#ticket"
        className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-5 text-sm font-semibold text-white"
      >
        <ReceiptText size={17} /> Ver ticket
      </a>
    </div>
  );
}
