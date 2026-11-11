"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  /** Desplazamiento total en px a lo largo del recorrido del elemento por el viewport. Negativo = sube más rápido. */
  offset?: number;
  className?: string;
};

/** Capa parallax: se desplaza en Y a distinta velocidad que el scroll. */
export function Parallax({ children, offset = 80, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
