"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { PROCESS_STEPS } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Parallax } from "@/components/ui/Parallax";

export function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="process" className="section grid gap-16 py-32 sm:py-40 lg:grid-cols-[1fr_1.2fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <SectionHeading
          eyebrow="Proceso"
          title="De la idea al impacto, sin fricción."
          description="Un método iterativo y transparente. Colaboramos contigo en cada fase para que el resultado supere las expectativas."
        />
        <Parallax offset={40} className="mt-12 hidden lg:block">
          <div className="font-display text-[11rem] font-semibold leading-none tracking-tighter text-white/[0.04]">
            ∞
          </div>
        </Parallax>
      </div>

      <ol ref={listRef} className="relative space-y-6 pl-10">
        {/* Línea de progreso */}
        <div className="absolute bottom-2 left-[11px] top-2 w-px bg-white/10" />
        <motion.div
          style={{ scaleY }}
          className="absolute bottom-2 left-[11px] top-2 w-px origin-top bg-gradient-to-b from-neon-violet via-neon-cyan to-neon-pink"
        />

        {PROCESS_STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 0.05} className="relative">
            <span className="absolute -left-10 top-8 grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-ink-950">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <div className="glass group rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] sm:p-9">
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-sm text-neon-cyan">{s.n}</span>
                <h3 className="font-display text-3xl font-semibold text-white sm:text-4xl">{s.title}</h3>
              </div>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/50 sm:pl-11">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
