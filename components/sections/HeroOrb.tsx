"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

/** Orbe 3D en CSS que gira según la posición del ratón (anillos en perspectiva + núcleo luminoso). */
export function HeroOrb() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-25, 25]);
  const rotateX = useTransform(sy, [-1, 1], [20, -20]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const rings = [
    { size: "100%", rx: 75, dur: 22, color: "rgba(139,92,246,0.55)" },
    { size: "82%", rx: 65, ry: 40, dur: 16, color: "rgba(34,211,238,0.5)" },
    { size: "64%", rx: 80, ry: -35, dur: 12, color: "rgba(244,114,182,0.45)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1200 }}
      className="relative h-[min(80vw,640px)] w-[min(80vw,640px)] translate-x-[18%] opacity-70 md:translate-x-[30%]"
    >
      {/* Núcleo */}
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#c4b5fd_12%,#7c3aed_35%,#0e7490_70%,transparent_72%)] blur-[2px] shadow-[0_0_120px_40px_rgba(139,92,246,0.35)]" />
      <div className="absolute inset-[34%] animate-spin-slow rounded-full bg-[conic-gradient(from_90deg,transparent,rgba(255,255,255,0.35),transparent_40%)] mix-blend-overlay" />

      {rings.map((r, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: r.size,
            height: r.size,
            transform: `translate(-50%, -50%) rotateX(${r.rx}deg) rotateY(${r.ry ?? 0}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: r.dur, repeat: Infinity, ease: "linear" }}
            className="h-full w-full rounded-full border"
            style={{ borderColor: r.color, boxShadow: `0 0 30px ${r.color}, inset 0 0 30px ${r.color}` }}
          >
            <span
              className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white"
              style={{ boxShadow: `0 0 16px 4px ${r.color}` }}
            />
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
