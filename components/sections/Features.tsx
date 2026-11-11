import { ArrowUpRight } from "lucide-react";
import { FEATURES } from "@/lib/content";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/GlowCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Features() {
  return (
    <section id="features" className="section py-32 sm:py-40">
      <SectionHeading
        eyebrow="Capacidades"
        title="Todo lo que necesitas para destacar."
        description="Combinamos diseño, ingeniería y motion para crear productos digitales que la gente recuerda."
      />

      <RevealGroup className="mt-16 grid auto-rows-[minmax(240px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <RevealItem key={f.title} className={cn(f.className)}>
              <GlowCard glow={f.glow} className="h-full p-7 sm:p-8">
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <div
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                      style={{ boxShadow: `0 0 30px -6px rgba(${f.glow},0.6)` }}
                    >
                      <Icon size={22} style={{ color: `rgb(${f.glow})` }} />
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-white/20 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                    />
                  </div>

                  {f.stat && (
                    <div className="mt-auto pt-12">
                      <div className="font-display text-7xl font-semibold tracking-tighter text-white sm:text-8xl">
                        {f.stat.value}
                      </div>
                      <div className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                        {f.stat.label}
                      </div>
                    </div>
                  )}

                  <div className={cn(f.stat ? "mt-8" : "mt-auto pt-10")}>
                    <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">{f.title}</h3>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/50">{f.description}</p>
                  </div>
                </div>
              </GlowCard>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
