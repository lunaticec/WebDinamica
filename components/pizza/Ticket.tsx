"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Flame, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SHOP } from "@/lib/config";
import { CRUSTS, INGREDIENTS, SIZES, describeItem } from "@/lib/pizza";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { cn, formatPrice } from "@/lib/utils";
import { AnimatedPrice } from "./AnimatedPrice";
import { usePizza } from "./PizzaProvider";

function Row({ label, amount, muted, onRemove }: { label: string; amount: string; muted?: boolean; onRemove?: () => void }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0, x: -12 }}
      animate={{ opacity: 1, height: "auto", x: 0 }}
      exit={{ opacity: 0, height: 0, x: 12 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className={cn("flex items-baseline gap-2 py-[3px]", muted && "text-stone-500")}>
        {onRemove && (
          <button type="button" aria-label="Quitar" onClick={onRemove} className="-ml-1 text-stone-400 transition hover:text-red-600">
            <X size={13} />
          </button>
        )}
        <span>{label}</span>
        <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-stone-300" />
        <span className="tabular-nums">{amount}</span>
      </div>
    </motion.li>
  );
}

/** Ticket de compra: se "imprime" en vivo con la pizza que estás armando. */
export function Ticket() {
  const {
    size, crust, counts, layers, cart, removeFromCart, addToCart, clearPizza,
    delivery, setDelivery, deliveryFee, orderItems, orderTotal, presetName,
  } = usePizza();

  const [stamp, setStamp] = useState("");
  const [checkout, setCheckout] = useState(false);
  useEffect(() => {
    setStamp(new Date().toLocaleString(SHOP.locale, { dateStyle: "medium", timeStyle: "short" }));
  }, []);

  // Burbuja con la diferencia de precio al cambiar el total
  const [delta, setDelta] = useState<{ v: number; k: number } | null>(null);
  const prev = useRef(orderTotal);
  useEffect(() => {
    const d = orderTotal - prev.current;
    prev.current = orderTotal;
    if (Math.abs(d) < 0.001) return;
    setDelta({ v: d, k: Date.now() });
    const t = setTimeout(() => setDelta(null), 1100);
    return () => clearTimeout(t);
  }, [orderTotal]);

  const s = SIZES.find((x) => x.id === size)!;
  const c = CRUSTS.find((x) => x.id === crust)!;
  const tops = INGREDIENTS.filter((i) => counts[i.id]);
  const showCurrent = layers.length > 0 || cart.length === 0;

  return (
    <motion.div
      initial={{ y: -40, opacity: 0, rotate: -1.5 }}
      whileInView={{ y: 0, opacity: 1, rotate: 0.6 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
      className="relative mx-auto w-full max-w-[380px] drop-shadow-[0_30px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="bg-[#fbfaf6] px-6 pb-5 pt-7 font-mono text-[13px] leading-snug text-stone-800">
        {/* Cabecera */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-red-700">
            <Flame size={20} />
            <span className="font-display text-3xl font-extrabold uppercase tracking-tight">{SHOP.name}</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">{SHOP.tagline}</p>
          <p className="mt-2 text-[11px] text-stone-400">{stamp || " "}</p>
        </div>

        <hr className="my-4 border-dashed border-stone-300" />

        {/* Pedidos anteriores */}
        <ul>
          <AnimatePresence initial={false}>
            {cart.map((it) => {
              const d = describeItem(it);
              return (
                <Row
                  key={it.uid}
                  label={`${it.name} · ${d.size}`}
                  amount={formatPrice(it.price)}
                  muted
                  onRemove={() => removeFromCart(it.uid)}
                />
              );
            })}
          </AnimatePresence>
        </ul>
        {cart.length > 0 && showCurrent && <hr className="my-3 border-dashed border-stone-300" />}

        {/* Pizza actual */}
        {showCurrent && (
          <>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-stone-500">
              {presetName ?? "Tu obra maestra"}
            </p>
            <ul>
              <AnimatePresence initial={false}>
                <Row key="size" label={`Pizza ${s.label} ${s.inches}″`} amount={formatPrice(s.base)} />
                {c.extra > 0 && <Row key="crust" label={`Masa ${c.label.toLowerCase()}`} amount={formatPrice(c.extra)} />}
                {tops.map((i) => {
                  const q = counts[i.id] ?? 0;
                  return (
                    <Row
                      key={i.id}
                      label={`${i.name}${q > 1 ? ` ×${q}` : ""}`}
                      amount={formatPrice(i.price * q * s.mult)}
                    />
                  );
                })}
              </AnimatePresence>
            </ul>
            {tops.length === 0 && (
              <p className="py-1 text-xs italic text-stone-400">Solo salsa y mozzarella. Agrega ingredientes…</p>
            )}
            <div className="mt-2 flex gap-3 text-[11px]">
              <button
                type="button"
                onClick={addToCart}
                className="inline-flex items-center gap-1 font-bold text-red-700 underline-offset-2 hover:underline"
              >
                <Plus size={12} /> Agregar otra pizza
              </button>
              {layers.length > 0 && (
                <button type="button" onClick={clearPizza} className="text-stone-400 underline-offset-2 hover:text-stone-700 hover:underline">
                  Vaciar
                </button>
              )}
            </div>
          </>
        )}

        <hr className="my-4 border-dashed border-stone-300" />

        {/* Entrega */}
        <div role="radiogroup" aria-label="Tipo de entrega" className="space-y-1.5">
          {(
            [
              { id: "recoger", label: "Recoger en tienda", fee: "Gratis" },
              { id: "domicilio", label: "A domicilio", fee: `+${formatPrice(SHOP.deliveryFee)}` },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={delivery === o.id}
              onClick={() => setDelivery(o.id)}
              className="flex w-full items-center gap-2.5 text-left"
            >
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full border-2 transition-colors",
                  delivery === o.id ? "border-red-600" : "border-stone-400"
                )}
              >
                <motion.span
                  animate={{ scale: delivery === o.id ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="h-2 w-2 rounded-full bg-red-600"
                />
              </span>
              <span className="flex-1">{o.label}</span>
              <span className="text-stone-500">{o.fee}</span>
            </button>
          ))}
        </div>
        {deliveryFee > 0 && (
          <ul className="mt-2">
            <Row label="Envío" amount={formatPrice(deliveryFee)} muted />
          </ul>
        )}

        <hr className="my-4 border-dashed border-stone-300" />

        {/* Total */}
        <div className="relative flex items-end justify-between">
          <span className="text-lg font-bold uppercase tracking-wide">Total</span>
          <div className="relative">
            <AnimatedPrice value={orderTotal} className="font-display text-4xl font-extrabold tracking-tight text-stone-900" />
            <AnimatePresence>
              {delta && (
                <motion.span
                  key={delta.k}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: -22 }}
                  exit={{ opacity: 0, y: -38 }}
                  className={cn(
                    "pointer-events-none absolute right-0 top-0 whitespace-nowrap text-sm font-bold",
                    delta.v > 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {delta.v > 0 ? "+" : "−"}
                  {formatPrice(Math.abs(delta.v))}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Botón */}
        <button
          type="button"
          onClick={() => setCheckout(true)}
          data-cursor="link"
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-md bg-red-700 text-base font-bold uppercase tracking-wide text-white shadow-[0_8px_0_-4px_#7f1d1d] transition hover:bg-red-600 active:translate-y-0.5"
        >
          <CreditCard size={18} /> Continuar al pago
        </button>
        <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />

        {/* Código de barras */}
        <div
          aria-hidden
          className="mt-6 h-12 w-full opacity-80"
          style={{
            background:
              "repeating-linear-gradient(90deg,#1c1917 0 2px,transparent 2px 4px,#1c1917 4px 5px,transparent 5px 8px,#1c1917 8px 11px,transparent 11px 13px,#1c1917 13px 14px,transparent 14px 17px)",
          }}
        />
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.25em] text-stone-400">Gracias · {SHOP.hours}</p>
      </div>
      <div className="ticket-edge" />
    </motion.div>
  );
}
