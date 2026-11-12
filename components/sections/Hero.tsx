"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { useRef } from "react";
import type { ShapeId } from "@/lib/pizza";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SplitText } from "@/components/ui/SplitText";
import { Topping } from "@/components/pizza/Topping";

// Ingredientes flotantes decorativos: posición (%), tamaño (px), rotación y velocidad
const FLOATERS = [
  { id: "pepperoni", x: 8, y: 22, s: 84, r: 20, d: 6 },
  { id: "albahaca", x: 84, y: 18, s: 70, r: -25, d: 7 },
  { id: "tomate", x: 90, y: 62, s: 92, r: 10, d: 8 },
  { id: "champinon", x: 5, y: 70, s: 76, r: -15, d: 7.5 },
  { id: "aceituna", x: 70, y: 82, s: 52, r: 0, d: 5.5 },
  { id: "pimiento", x: 22, y: 86, s: 68, r: 35, d: 6.5 },
  { id: "pina", x: 76, y: 38, s: 60, r: -10, d: 9 },
] as const;

export function Hero() {
  const cat = useCatalog();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const farY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const nearY = useTransform(scrollYProgress, [0, 1], ["0%", "130%"]);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      {/* Ingredientes flotando con parallax a dos velocidades */}
      {FLOATERS.map((f, i) => (
        <motion.div
          key={f.id}
          style={{ left: `${f.x}%`, top: `${f.y}%`, y: i % 2 ? farY : nearY }}
          className="pointer-events-none absolute hidden opacity-60 sm:block"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: f.r - 90 }}
            animate={{ opacity: 1, scale: 1, rotate: [f.r, f.r + 12, f.r], y: [0, -16, 0] }}
            transition={{
              opacity: { delay: 0.6 + i * 0.1 },
              scale: { delay: 0.6 + i * 0.1, type: "spring" },
              rotate: { duration: f.d, repeat: Infinity, ease: "easeInOut" },
              y: { duration: f.d, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ width: f.s, height: f.s }}
            className="blur-[0.5px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            <Topping shape={f.id as ShapeId} className="h-full w-full" />
          </motion.div>
        </motion.div>
      ))}

      <motion.div style={{ y: textY, opacity: textOpacity }} className="section relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="eyebrow"
        >
          <Flame size={13} className="text-orange-400" />
          {cat.shop.name} · {cat.shop.tagline}
        </motion.div>

        <h1 className="mx-auto mt-8 max-w-5xl font-display text-display-xl font-semibold text-white" data-cursor="text">
          <SplitText text="Tu pizza." delay={0.2} />
          <br />
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-gradient inline-block italic"
            >
              Tus reglas.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl"
        >
          Elige el tamaño, la masa y suma ingredientes como en un juego. Mira tu pizza armarse y el precio cambiar en
          tiempo real.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton href="#arma">
            Armar mi pizza <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton href="#menu" variant="ghost">
            Ver el menú
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
