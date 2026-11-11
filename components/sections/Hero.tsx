"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { useRef } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SplitText } from "@/components/ui/SplitText";
import { HeroOrb } from "./HeroOrb";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Parallax de salida: el texto sube y se desvanece; el orbe baja y escala
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-28">
      <motion.div style={{ y: orbY, scale: orbScale }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <HeroOrb />
      </motion.div>

      <motion.div style={{ y: textY, opacity: textOpacity }} className="section relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="eyebrow"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-lime opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-lime" />
          </span>
          Estudio digital · Disponible 2027
        </motion.div>

        <h1 className="mt-8 font-display text-display-xl font-semibold text-white" data-cursor="text">
          <SplitText text="Interfaces que" delay={0.2} />
          <br />
          <SplitText text="se sienten" delay={0.35} />{" "}
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-gradient inline-block italic"
            >
              vivas.
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-white/55 sm:text-xl"
        >
          Diseñamos y construimos experiencias web inmersivas, rápidas y memorables para marcas que quieren
          ir un paso por delante.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="#cta">
            Iniciar proyecto <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton href="#showcase" variant="ghost">
            <Play size={14} className="fill-current" /> Ver showreel
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.a
        href="#features"
        aria-label="Bajar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 sm:flex"
      >
        Scroll
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="grid h-10 w-6 place-items-center rounded-full border border-white/20"
        >
          <ArrowDown size={12} />
        </motion.span>
      </motion.a>
    </section>
  );
}
