"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Flame } from "lucide-react";
import { useRef } from "react";
import { CRUSTS, SIZES } from "@/lib/pizza";
import { SHOP } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IngredientTray } from "./IngredientTray";
import { OptionPicker } from "./OptionPicker";
import { PizzaCanvas } from "./PizzaCanvas";
import { PriceBar } from "./PriceBar";
import { Ticket } from "./Ticket";
import { usePizza } from "./PizzaProvider";

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">{children}</p>;
}

export function PizzaBuilder() {
  const { size, setSize, crust, setCrust } = usePizza();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.1 });

  return (
    <section ref={ref} id="arma" className="section py-24 sm:py-32">
      <SectionHeading
        eyebrow="Constructor"
        title="Arma tu pizza a tu gusto."
        description="Elige tamaño y masa, arrastra los ingredientes a la pizza y mira tu ticket crecer."
      />

      {/* Mesa de trabajo */}
      <div className="flour relative isolate mt-12 overflow-hidden rounded-[2rem] p-4 text-stone-900 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] sm:p-6 lg:p-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-red-700">
            <Flame size={22} />
            <span className="font-display text-2xl font-extrabold uppercase tracking-tight">{SHOP.name}</span>
          </div>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-stone-500 sm:block">
            Hecha a mano · Horneada al momento
          </p>
          <a
            href="#ticket"
            className="rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-800 backdrop-blur transition hover:bg-white"
          >
            Mi ticket ↗
          </a>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          {/* Ingredientes */}
          <div className="relative z-30 order-2 lg:order-1">
            <h3 className="font-display text-3xl font-extrabold tracking-tight text-stone-900">Hazla tuya.</h3>
            <p className="mb-5 mt-1 text-sm text-stone-600">Arrastra o toca para agregar.</p>
            <IngredientTray />
          </div>

          {/* Pizza + opciones */}
          <div className="relative z-10 order-1 space-y-7 lg:order-2">
            <PizzaCanvas />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Tamaño</Label>
                <OptionPicker
                  name="size"
                  value={size}
                  onChange={setSize}
                  options={SIZES.map((s) => ({ id: s.id, label: s.label, sub: `${s.inches}″` }))}
                />
              </div>
              <div>
                <Label>Masa</Label>
                <OptionPicker
                  name="crust"
                  value={crust}
                  onChange={setCrust}
                  options={CRUSTS.map((c) => ({ id: c.id, label: c.label.replace("Borde de queso", "Queso"), sub: c.extra ? `+${formatPrice(c.extra)}` : c.desc }))}
                />
              </div>
            </div>
          </div>

          {/* Ticket */}
          <div id="ticket" className="relative z-20 order-3 scroll-mt-24 lg:sticky lg:top-24">
            <Ticket />
          </div>
        </div>
      </div>

      {/* Barra inferior en móvil */}
      <AnimatePresence>
        {inView && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
          >
            <PriceBar />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
