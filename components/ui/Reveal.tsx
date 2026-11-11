"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "p";
} & Omit<HTMLMotionProps<"div">, "children">;

/** Aparece al entrar en el viewport: fade + desplazamiento + desenfoque opcional. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  blur = true,
  once = true,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Contenedor que escalona la entrada de sus hijos <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
