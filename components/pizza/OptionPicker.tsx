"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option<T extends string> = { id: T; label: string; sub: string };

/** Selector segmentado con indicador animado (layoutId). */
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
    <div role="radiogroup" className="grid auto-cols-fr grid-flow-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1.5">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className="relative rounded-xl px-2 py-3 text-center"
          >
            {active && (
              <motion.span
                layoutId={`pick-${name}`}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-[0_6px_24px_-6px_rgba(255,90,30,0.7)]"
              />
            )}
            <span className={cn("relative block text-sm font-semibold", active ? "text-white" : "text-white/75")}>{o.label}</span>
            <span className={cn("relative block font-mono text-[10px] uppercase tracking-wider", active ? "text-white/85" : "text-white/35")}>
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
