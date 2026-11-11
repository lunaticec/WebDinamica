"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
};

const LINK_DIST = 130;
const MOUSE_RADIUS = 180;

/**
 * Campo de partículas ligero en canvas 2D:
 * - Las partículas derivan lentamente y se conectan con líneas cuando están cerca.
 * - El ratón las repele suavemente y "enciende" las conexiones a su alrededor.
 * - Se pausa cuando la pestaña no está visible y respeta prefers-reduced-motion.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Densidad adaptada al tamaño de pantalla (menos partículas en móvil)
      const count = Math.min(140, Math.floor((width * height) / 11000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
        hue: Math.random() < 0.5 ? 22 : 42,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Repulsión del ratón
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (mouse.active && dist < MOUSE_RADIUS && dist > 0.01) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Fricción + deriva mínima
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // Conexiones
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const d = Math.sqrt(d2);
          const mid = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y);
          const glow = mouse.active ? Math.max(0, 1 - mid / (MOUSE_RADIUS * 1.4)) : 0;
          const alpha = (1 - d / LINK_DIST) * (0.08 + glow * 0.45);
          ctx.strokeStyle = `hsla(${glow > 0.1 ? 38 : 20}, 90%, 75%, ${alpha})`;
          ctx.lineWidth = 0.6 + glow * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Puntos
      for (const p of particles) {
        const near = mouse.active ? Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / MOUSE_RADIUS) : 0;
        ctx.fillStyle = `hsla(${p.hue}, 95%, ${70 + near * 20}%, ${0.45 + near * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + near * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(step);
    };

    resize();
    raf = requestAnimationFrame(step);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />;
}
