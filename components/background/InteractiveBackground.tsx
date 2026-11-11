"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { ParticleField } from "./ParticleField";

/**
 * Fondo fijo de la página: gradientes mesh que siguen al ratón con inercia
 * + campo de partículas en canvas que reacciona al puntero.
 */
export function InteractiveBackground() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 40, damping: 20, mass: 1 });
  const sy = useSpring(my, { stiffness: 40, damping: 20, mass: 1 });

  // Cada blob se mueve con una intensidad y dirección distintas → efecto de profundidad
  const ax = useTransform(sx, (v) => `${(v - 0.5) * 30}vw`);
  const ay = useTransform(sy, (v) => `${(v - 0.5) * 30}vh`);
  const bx = useTransform(sx, (v) => `${(0.5 - v) * 22}vw`);
  const by = useTransform(sy, (v) => `${(0.5 - v) * 18}vh`);
  const cx = useTransform(sx, (v) => `${(v - 0.5) * 12}vw`);
  const cy = useTransform(sy, (v) => `${(0.5 - v) * 26}vh`);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Mesh gradient */}
      <motion.div
        style={{ x: ax, y: ay }}
        className="absolute left-[10%] top-[-10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.35),transparent_60%)] blur-3xl"
      />
      <motion.div
        style={{ x: bx, y: by }}
        className="absolute right-[-15%] top-[20%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.22),transparent_60%)] blur-3xl"
      />
      <motion.div
        style={{ x: cx, y: cy }}
        className="absolute bottom-[-25%] left-[25%] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.16),transparent_60%)] blur-3xl"
      />

      <ParticleField />

      {/* Rejilla en perspectiva + viñeta */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#05060a_100%)]" />
    </div>
  );
}
