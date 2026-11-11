"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { formatPrice } from "@/lib/utils";

/** Precio que cuenta suavemente hasta su nuevo valor. */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatPrice(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.55, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
