"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Trash2 } from "lucide-react";
import { buildWhatsAppUrl, describeItem } from "@/lib/pizza";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedPrice } from "@/components/pizza/AnimatedPrice";
import { usePizza } from "@/components/pizza/PizzaProvider";

export function Cart() {
  const { cart, cartTotal, removeFromCart, clearCart } = usePizza();

  return (
    <section id="pedido" className="section pb-24 pt-8 sm:pb-32">
      <SectionHeading eyebrow="Tu pedido" title="Listo para hornear." />

      <div className="glass mt-12 rounded-3xl p-5 sm:p-8">
        {cart.length === 0 ? (
          <p className="py-10 text-center text-white/45">
            Aún no hay pizzas en tu pedido. Arma una arriba y pulsa <b className="text-white/80">Agregar al pedido</b>.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-white/[0.07]">
              <AnimatePresence initial={false}>
                {cart.map((it) => {
                  const d = describeItem(it);
                  return (
                    <motion.li
                      key={it.uid}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4 py-5">
                        <div>
                          <p className="font-display text-xl font-semibold text-white">{it.name}</p>
                          <p className="mt-1 text-sm text-white/50">
                            {d.size} · masa {d.crust.toLowerCase()}
                          </p>
                          <p className="mt-1 text-sm text-white/35">{d.tops}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="font-display text-xl text-orange-300">{formatPrice(it.price)}</span>
                          <button
                            type="button"
                            aria-label="Quitar del pedido"
                            onClick={() => removeFromCart(it.uid)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div className="mt-4 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Total</p>
                <AnimatedPrice value={cartTotal} className="font-display text-5xl font-semibold text-white" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-full px-4 py-3 text-sm text-white/50 transition hover:text-white"
                >
                  Vaciar
                </button>
                <a
                  href={buildWhatsAppUrl(cart, cartTotal, formatPrice)}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="link"
                  className="inline-flex h-14 items-center gap-2 rounded-full bg-[#25d366] px-7 font-semibold text-black transition hover:brightness-110"
                >
                  <MessageCircle size={18} /> Enviar pedido por WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
