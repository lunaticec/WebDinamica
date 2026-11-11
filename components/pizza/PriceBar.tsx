"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Eraser, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { AnimatedPrice } from "./AnimatedPrice";
import { usePizza } from "./PizzaProvider";

/** Total en vivo + botón de agregar al pedido. `compact` = versión de barra inferior en móvil. */
export function PriceBar({ compact = false }: { compact?: boolean }) {
  const { price, addToCart, clearPizza, layers, presetName } = usePizza();
  const [delta, setDelta] = useState<{ v: number; k: number } | null>(null);
  const [added, setAdded] = useState(false);
  const prev = useRef(price);

  useEffect(() => {
    const d = price - prev.current;
    prev.current = price;
    if (Math.abs(d) < 0.001) return;
    setDelta({ v: d, k: Date.now() });
    const t = setTimeout(() => setDelta(null), 1100);
    return () => clearTimeout(t);
  }, [price]);

  const onAdd = () => {
    addToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        compact
          ? "glass rounded-full bg-ink-900/90 py-2 pl-6 pr-2 shadow-[0_10px_40px_-8px_rgba(0,0,0,0.9)]"
          : "rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6"
      )}
    >
      <div className="relative">
        {!compact && (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            {presetName ?? "Tu pizza"} · {layers.length} {layers.length === 1 ? "porción" : "porciones"} extra
          </p>
        )}
        <div className="relative">
          <AnimatedPrice
            value={price}
            className={cn("font-display font-semibold tracking-tight text-white", compact ? "text-3xl" : "text-5xl sm:text-6xl")}
          />
          <AnimatePresence>
            {delta && (
              <motion.span
                key={delta.k}
                initial={{ opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: -18, scale: 1 }}
                exit={{ opacity: 0, y: -34 }}
                className={cn(
                  "pointer-events-none absolute -top-1 left-full ml-2 whitespace-nowrap font-mono text-sm font-bold",
                  delta.v > 0 ? "text-lime-300" : "text-rose-300"
                )}
              >
                {delta.v > 0 ? "+" : "−"}
                {formatPrice(Math.abs(delta.v))}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!compact && layers.length > 0 && (
          <button
            type="button"
            onClick={clearPizza}
            aria-label="Vaciar pizza"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Eraser size={18} />
          </button>
        )}
        <motion.button
          type="button"
          onClick={onAdd}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-colors",
            added ? "bg-lime-500" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400",
            compact ? "h-12 px-5 text-sm" : "h-14 px-7"
          )}
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {added ? "¡Agregada!" : compact ? "Agregar" : "Agregar al pedido"}
        </motion.button>
      </div>
    </div>
  );
}
