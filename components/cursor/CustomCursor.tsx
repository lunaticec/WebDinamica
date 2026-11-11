"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, MoveHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Estados del cursor. Cualquier elemento puede declarar el suyo con:
 *   data-cursor="link" | "view" | "text" | "drag" | "hide"
 *   data-cursor-label="Texto opcional"
 * Los <a> y <button> sin atributo usan "link" automáticamente.
 */
export type CursorVariant = "default" | "link" | "view" | "text" | "drag" | "hide";

const SIZES: Record<CursorVariant, number> = {
  default: 36,
  link: 64,
  view: 96,
  text: 4,
  drag: 84,
  hide: 0,
};

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // El anillo sigue con retardo elástico; el punto es instantáneo
  const ringX = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, input, textarea"
      );
      if (!target) {
        setVariant("default");
        setLabel(null);
        return;
      }
      const declared = target.dataset.cursor as CursorVariant | undefined;
      const tag = target.tagName;
      const fallback: CursorVariant = tag === "INPUT" || tag === "TEXTAREA" ? "text" : "link";
      setVariant(declared ?? fallback);
      setLabel(target.dataset.cursorLabel ?? null);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = SIZES[variant] * (pressed ? 0.8 : 1);
  const filled = variant === "view" || variant === "drag";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Anillo / burbuja */}
      <motion.div
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: variant === "text" ? 3 : size,
          height: variant === "text" ? 34 : size,
          opacity: visible && variant !== "hide" ? 1 : 0,
          borderRadius: variant === "text" ? 2 : 999,
          backgroundColor: filled
            ? "rgba(255,255,255,0.95)"
            : variant === "link"
              ? "rgba(255,120,40,0.2)"
              : variant === "text"
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0)",
          borderColor: variant === "link" ? "rgba(255,150,70,0.9)" : "rgba(255,255,255,0.45)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute left-0 top-0 flex items-center justify-center border"
      >
        <AnimatePresence mode="wait">
          {filled && (
            <motion.span
              key={variant + (label ?? "")}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-widest text-black"
            >
              {variant === "drag" ? <MoveHorizontal size={14} /> : null}
              {label ?? (variant === "view" ? "Ver" : "")}
              {variant === "view" ? <ArrowUpRight size={12} /> : null}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Punto central */}
      <motion.div
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: variant === "default" ? 1 : 0,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white"
      />
    </div>
  );
}
