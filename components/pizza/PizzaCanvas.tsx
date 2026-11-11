"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CRUSTS, SIZES } from "@/lib/pizza";
import { Topping } from "./Topping";
import { usePizza } from "./PizzaProvider";

/** La pizza: base, salsa, queso y cada ingrediente cayendo con física de resorte. */
export function PizzaCanvas() {
  const { layers, size, crust, over, pizzaRef } = usePizza();
  const scale = SIZES.find((s) => s.id === size)!.scale;
  const crustW = CRUSTS.find((c) => c.id === crust)!.width;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      {/* Resplandor que se intensifica al arrastrar encima */}
      <motion.div
        aria-hidden
        animate={{ opacity: over ? 0.9 : 0.35, scale: over ? 1.08 : 1 }}
        className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle,rgba(255,120,40,0.55),transparent_70%)] blur-2xl"
      />

      <motion.div
        ref={pizzaRef}
        animate={{ scale, rotate: over ? 5 : 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-full w-full"
        >
          {/* Sombra */}
          <div className="absolute inset-[2%] translate-y-5 rounded-full bg-black/70 blur-2xl" />

          {/* Masa */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 28%, #f3c987, #d6963f 58%, #b57226)",
              boxShadow: "inset 0 -8px 20px rgba(0,0,0,.28), inset 0 8px 16px rgba(255,255,255,.28)",
            }}
          />
          {/* Borde relleno de queso */}
          <div
            aria-hidden
            className="absolute inset-[2.2%] rounded-full border-[3px] border-dashed border-[#ffe6a0]/70 transition-opacity duration-500"
            style={{ opacity: crust === "queso" ? 1 : 0 }}
          />
          {/* Salsa */}
          <div
            className="absolute rounded-full transition-all duration-500"
            style={{
              inset: `${crustW}%`,
              background: "radial-gradient(circle, #d8452d 0%, #b52c19 100%)",
              boxShadow: "inset 0 0 18px rgba(80,10,0,.5)",
            }}
          />
          {/* Queso */}
          <div
            className="absolute rounded-full transition-all duration-500"
            style={{
              inset: `${crustW + 2.4}%`,
              background:
                "radial-gradient(circle at 38% 32%, #ffe69a, #f8c94c 62%, #eaa92e), radial-gradient(circle at 70% 70%, rgba(255,255,255,.35), transparent 30%)",
              boxShadow: "inset 0 0 14px rgba(190,110,0,.45)",
            }}
          />

          {/* Zona de soltado */}
          <motion.div
            aria-hidden
            animate={{ opacity: over ? 1 : 0 }}
            className="absolute inset-[6%] rounded-full border-2 border-dashed border-white/80"
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
                      left: `${p.x}%`,
                      top: `${p.y}%`,
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
                      className="h-full w-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]"
                    >
                      <Topping id={p.ing} className="h-full w-full" />
                    </motion.div>
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Pista cuando está vacía */}
      <AnimatePresence>
        {layers.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-10 text-center font-display text-xl font-semibold text-black/55"
          >
            Arrastra o toca un ingrediente
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
