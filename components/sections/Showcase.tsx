"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

/**
 * Scroll horizontal "pegajoso": mientras la sección está fijada, el scroll vertical
 * desplaza la pista de proyectos en horizontal.
 */
export function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="section flex items-end justify-between gap-8">
          <SectionHeading eyebrow="Proyectos seleccionados" title="Trabajo que deja huella." />
          <div className="hidden w-48 shrink-0 pb-3 md:block">
            <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              <span>Progreso</span>
              <span>{String(PROJECTS.length).padStart(2, "0")}</span>
            </div>
            <div className="h-px w-full bg-white/10">
              <motion.div style={{ width: progress }} className="h-px bg-white" />
            </div>
          </div>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-14 flex w-max gap-6 pl-5 pr-[10vw] sm:pl-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
