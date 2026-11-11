"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/GlowCard";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Icon = project.icon;
  return (
    <GlowCard
      cursor="view"
      cursorLabel="Ver"
      tilt={5}
      className="h-[min(62vh,520px)] w-[82vw] shrink-0 sm:w-[60vw] lg:w-[44vw]"
    >
      <div className="relative flex h-full flex-col justify-between p-7 sm:p-9">
        {/* Visual abstracto */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-700 group-hover:opacity-100", project.gradient)} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.08),transparent_50%)]" />
        <motion.div
          className="absolute right-[-10%] top-1/2 -translate-y-1/2 text-white/[0.07] transition-all duration-700 group-hover:scale-110 group-hover:text-white/[0.15]"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <Icon size={420} strokeWidth={0.6} />
        </motion.div>

        <div className="relative flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-white/60">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">{project.category}</p>
          <h3 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white transition-transform duration-500 group-hover:translate-x-2 sm:text-6xl">
            {project.title}
          </h3>
        </div>
      </div>
    </GlowCard>
  );
}
