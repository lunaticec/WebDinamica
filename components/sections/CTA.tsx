"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { GlowCard } from "@/components/ui/GlowCard";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

export function CTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <section id="cta" className="section pb-24">
      <GlowCard tilt={2} glow="34,211,238" className="px-6 py-20 text-center sm:px-12 sm:py-28">
        {/* Halo central */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-violet/30 blur-[100px]" />

        <Reveal y={16}>
          <span className="eyebrow">¿Listo para empezar?</span>
        </Reveal>
        <h2 className="mx-auto mt-8 max-w-4xl font-display text-display-lg font-semibold text-white">
          <SplitText text="Construyamos algo" />{" "}
          <span className="text-gradient">
            <SplitText text="extraordinario." delay={0.2} />
          </span>
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/55">
            Cuéntanos tu idea. Respondemos en menos de 24 horas con una propuesta inicial.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <form onSubmit={onSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <label className="glass flex flex-1 items-center gap-3 rounded-full px-5 transition focus-within:border-white/30">
              <Mail size={16} className="text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                aria-label="Correo electrónico"
                className="h-14 w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
              />
            </label>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-7 font-medium text-ink-950"
            >
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.span
                    key="sent"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Check size={16} /> ¡Enviado!
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="inline-flex items-center gap-2"
                  >
                    Enviar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </Reveal>
      </GlowCard>
    </section>
  );
}
