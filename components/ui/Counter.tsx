"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

type CounterProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
};

/** Número que cuenta desde 0 hasta `value` al entrar en pantalla. */
export function Counter({ value, decimals = 0, prefix = "", suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, mv, value, duration]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
