"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = {
  children: ReactNode;
  className?: string;
  /** Color del foco de luz (rgb sin "rgb()"), p. ej. "139,92,246" */
  glow?: string;
  /** Inclinación máxima en grados */
  tilt?: number;
  cursor?: "link" | "view" | "drag";
  cursorLabel?: string;
};

/**
 * Tarjeta glassmorphism con:
 * - Foco de luz radial que sigue al puntero (relleno + borde).
 * - Inclinación 3D suave con resortes.
 */
export function GlowCard({
  children,
  className,
  glow = "139,92,246",
  tilt = 8,
  cursor,
  cursorLabel,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const opacity = useSpring(0, { stiffness: 200, damping: 30 });

  const fill = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(${glow},0.18), transparent 45%)`;
  const border = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(${glow},0.9), transparent 55%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    ry.set(((x / rect.width) - 0.5) * tilt);
    rx.set((0.5 - y / rect.height) * tilt);
  };

  return (
    <motion.div
      ref={ref}
      data-cursor={cursor}
      data-cursor-label={cursorLabel}
      onPointerMove={onMove}
      onPointerEnter={() => opacity.set(1)}
      onPointerLeave={() => {
        opacity.set(0);
        rx.set(0);
        ry.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl",
        "transition-colors duration-500 hover:bg-white/[0.04]",
        className
      )}
    >
      {/* Borde iluminado (máscara que deja ver sólo 1px de contorno) */}
      <motion.div
        aria-hidden
        style={{ background: border, opacity }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [-webkit-mask-composite:xor]"
      />
      {/* Luz interior */}
      <motion.div
        aria-hidden
        style={{ background: fill, opacity }}
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
