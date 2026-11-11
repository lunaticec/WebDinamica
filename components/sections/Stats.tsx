import { STATS } from "@/lib/content";
import { Counter } from "@/components/ui/Counter";
import { GlowCard } from "@/components/ui/GlowCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

export function Stats() {
  return (
    <section aria-label="Cifras" className="section pb-32 sm:pb-40">
      <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <RevealItem key={s.label}>
            <GlowCard glow={["139,92,246", "34,211,238", "244,114,182", "163,230,53"][i % 4]} className="p-6 sm:p-8">
              <div className="font-display text-5xl font-semibold tracking-tighter text-white sm:text-6xl">
                <Counter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{s.label}</div>
            </GlowCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
