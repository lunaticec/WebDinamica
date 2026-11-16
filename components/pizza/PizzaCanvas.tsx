"use client";

import { AnimatePresence, motion } from "framer-motion";
import { crustOf, sizeOf } from "@/lib/pizza";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { PizzaBase } from "./PizzaBase";
import { Topping } from "./Topping";
import { usePizza } from "./PizzaProvider";

/** La pizza dentro de su caja de cartón, sobre papel de horno. Cada ingrediente cae con física de resorte. */
export function PizzaCanvas() {
  const cat = useCatalog();
  const { layers, size, crust, over, pizzaRef } = usePizza();
  const scale = sizeOf(cat, size).scale;
  const crustDef = crustOf(cat, crust);
  const crustW = crustDef.width;
  // Los ingredientes se reparten por TODA la salsa: con masa delgada se abren más, con masa gruesa se recogen.
  const k = Math.max(24, 50 - crustW - 8) / 31;

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[600px]">
        {/* Caja de cartón */}
        <div
          className="absolute inset-0 rounded-[1.4rem]"
          style={{
            background: "linear-gradient(150deg,#dcbb8a,#b98d52)",
            boxShadow:
              "0 40px 60px -28px rgba(40,20,0,.75), inset 0 0 0 5px rgba(255,255,255,.14), inset 0 -14px 28px rgba(60,30,0,.25)",
          }}
        />
        <div
          className="absolute inset-[3.5%] rounded-2xl"
          style={{ background: "linear-gradient(160deg,#c9a56f,#a77b44)", boxShadow: "inset 0 6px 14px rgba(0,0,0,.3)" }}
        />
        {/* Papel de horno */}
        <div
          className="absolute inset-[6%] rounded-lg bg-[#f7f3ea]"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,.25), inset 0 0 40px rgba(180,150,100,.2)", transform: "rotate(-0.8deg)" }}
        />

        {/* Pizza */}
        <div className="absolute inset-[11%]">
          <motion.div
            ref={pizzaRef}
            animate={{ scale, rotate: over ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-[2%] translate-y-2 rounded-full bg-black/30 blur-lg" />

            <PizzaBase crustWidth={crustW} stuffed={crustDef.stuffed} />

            {/* Zona de soltado */}
            <motion.div
              aria-hidden
              animate={{ opacity: over ? 1 : 0 }}
              className="absolute inset-[4%] rounded-full border-2 border-dashed border-red-600/80 bg-red-600/10"
            />

            {/* Ingredientes */}
            <div className="absolute inset-0">
              <AnimatePresence>
                {layers.flatMap((layer) =>
                  layer.pieces.map((p) => (
                    <div
                      key={p.id}
                      className="absolute"
                      style={{
                        left: `${50 + (p.x - 50) * k}%`,
                        top: `${50 + (p.y - 50) * k}%`,
                        width: `${p.size}%`,
                        aspectRatio: "1",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <motion.div
                        initial={{ y: -340, opacity: 0, scale: 1.9, rotate: p.rot + 140 }}
                        animate={{ y: 0, opacity: 1, scale: p.scale, rotate: p.rot }}
                        exit={{ opacity: 0, scale: 0.2, y: -40 }}
                        transition={{ type: "spring", stiffness: 240, damping: 17, delay: p.delay }}
                        className="h-full w-full"
                        style={{ filter: `brightness(${(0.9 + p.tone * 0.2).toFixed(2)}) saturate(${(0.88 + p.tone * 0.24).toFixed(2)}) drop-shadow(0 1.5px 1.2px rgba(40,10,0,0.5))` }}
                      >
                        <Topping shape={p.shape} className="h-full w-full" flip={p.flip} />
                      </motion.div>
                    </div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <p className="mx-auto mt-5 w-fit rounded-full border border-black/10 bg-white/75 px-5 py-2 text-center text-xs text-stone-600 shadow-sm backdrop-blur">
        Arrastra los ingredientes sobre la pizza · o tócalos
      </p>
    </div>
  );
}
