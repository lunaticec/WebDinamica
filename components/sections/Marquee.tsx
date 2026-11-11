"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Asterisk } from "lucide-react";
import { MARQUEE_ITEMS } from "@/lib/content";

/** Cinta infinita que además se desplaza lateralmente con el scroll (parallax horizontal). */
export function Marquee() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section aria-label="Especialidades" className="relative -rotate-2 border-y border-white/[0.06] bg-white/[0.015] py-6 backdrop-blur-sm">
      <motion.div style={{ x }}>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-3xl font-medium text-white/30 sm:text-5xl">
              <span className="transition-colors duration-300 hover:text-white">{item}</span>
              <Asterisk className="text-neon-violet" size={28} />
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
