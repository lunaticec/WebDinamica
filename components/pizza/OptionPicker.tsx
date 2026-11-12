"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option<T extends string> = { id: T; label: string; sub: string };

/** Selector segmentado (tema claro) con indicador animado (layoutId). */
export function OptionPicker<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" className="grid auto-cols-fr grid-flow-col gap-1.5 rounded-2xl border border-black/10 bg-white/60 p-1.5 backdrop-blur">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className="relative rounded-xl px-2 py-2.5 text-center"
          >
            {active && (
              <motion.span
                layoutId={`pick-${name}`}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-[0_6px_18px_-6px_rgba(185,28,28,0.8)]"
              />
            )}
            <span className={cn("relative block text-sm font-semibold", active ? "text-white" : "text-stone-700")}>{o.label}</span>
            <span className={cn("relative block font-mono text-[10px] uppercase tracking-wider", active ? "text-white/85" : "text-stone-400")}>
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
