"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
};

/**
 * Divide el texto en palabras y las anima desde abajo con máscara.
 * El observador de visibilidad va en el contenedor (que no se mueve): si fuera en la palabra
 * desplazada, las palabras muy cortas ("a", "de") quedaban fuera de la máscara y nunca aparecían.
 */
export function SplitText({ text, className, wordClassName, delay = 0, stagger = 0.06 }: SplitTextProps) {
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden>
          <motion.span
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="inline-block overflow-hidden pb-[0.08em] align-bottom"
          >
            <motion.span
              className={cn("inline-block", wordClassName)}
              variants={{
                hidden: { y: "110%", rotate: 4 },
                show: { y: "0%", rotate: 0, transition: { duration: 1, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {word}
            </motion.span>
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
