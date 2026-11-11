"use client";

import { motion, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  strength?: number;
  className?: string;
  onClick?: () => void;
};

/** Botón que se "imanta" hacia el cursor; el contenido se desplaza un poco más (efecto parallax interno). */
export function MagneticButton({
  children,
  href,
  variant = "primary",
  strength = 0.35,
  className,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const ix = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const iy = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    ix.set(dx * strength * 0.5);
    iy.set(dy * strength * 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
  };

  const classes = cn(
    "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-4 text-sm font-medium tracking-tight transition-colors duration-300",
    variant === "primary"
      ? "bg-white text-ink-950 shadow-[0_0_40px_-8px_rgba(255,100,30,0.7)] hover:shadow-[0_0_60px_-6px_rgba(255,190,50,0.8)]"
      : "border border-white/15 bg-white/[0.03] text-white backdrop-blur hover:border-white/40 hover:bg-white/[0.07]",
    className
  );

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 transition-transform duration-500 ease-out group-hover:translate-y-0"
        />
      )}
      <motion.span style={{ x: ix, y: iy }} className="relative z-10 inline-flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
        {children}
      </motion.span>
    </>
  );

  const Comp = href ? motion.a : motion.button;

  return (
    <Comp
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.95 }}
      data-cursor="link"
      className={cn("group", classes)}
    >
      {inner}
    </Comp>
  );
}
