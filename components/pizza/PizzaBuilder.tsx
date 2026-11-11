"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CRUSTS, SIZES } from "@/lib/pizza";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IngredientTray } from "./IngredientTray";
import { OptionPicker } from "./OptionPicker";
import { PizzaCanvas } from "./PizzaCanvas";
import { PriceBar } from "./PriceBar";
import { usePizza } from "./PizzaProvider";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Reveal y={24}>
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-500 font-mono text-xs font-bold text-white">{n}</span>
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      </div>
      {children}
    </Reveal>
  );
}

export function PizzaBuilder() {
  const { size, setSize, crust, setCrust } = usePizza();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.15 });

  return (
    <section ref={ref} id="arma" className="section py-24 sm:py-32">
      <SectionHeading
        eyebrow="Constructor"
        title="Arma tu pizza a tu gusto."
        description="Elige tamaño y masa, luego arrastra los ingredientes sobre la pizza (o tócalos). El precio cambia en cada paso."
      />

      <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
        {/* Pizza + total (fija en escritorio) */}
        <div className="relative z-10 lg:sticky lg:top-28">
          <PizzaCanvas />
          <div className="mt-8 hidden lg:block">
            <PriceBar />
          </div>
        </div>

        {/* Pasos */}
        <div className="relative z-20 space-y-9">
          <Step n={1} title="Tamaño">
            <OptionPicker
              name="size"
              value={size}
              onChange={setSize}
              options={SIZES.map((s) => ({ id: s.id, label: s.label, sub: `${s.inches}″ · ${formatPrice(s.base)}` }))}
            />
          </Step>
          <Step n={2} title="Masa">
            <OptionPicker
              name="crust"
              value={crust}
              onChange={setCrust}
              options={CRUSTS.map((c) => ({
                id: c.id,
                label: c.label,
                sub: c.extra ? `+${formatPrice(c.extra)}` : c.desc,
              }))}
            />
          </Step>
          <Step n={3} title="Ingredientes">
            <IngredientTray />
            <p className="mt-3 text-sm text-white/40">Hasta 3 porciones por ingrediente. Incluye salsa de tomate y mozzarella.</p>
          </Step>
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
            <PriceBar compact />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
