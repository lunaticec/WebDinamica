"use client";

import { Wand2 } from "lucide-react";
import { ING_BY_ID, PRESETS, calcPrice, type IngredientId } from "@/lib/pizza";
import { formatPrice } from "@/lib/utils";
import { GlowCard } from "@/components/ui/GlowCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Topping } from "@/components/pizza/Topping";
import { usePizza } from "@/components/pizza/PizzaProvider";
import { useLenis } from "@/components/providers/SmoothScroll";

export function Menu() {
  const { loadPreset } = usePizza();
  const lenis = useLenis();

  const pick = (id: string) => {
    loadPreset(id);
    const target = document.querySelector<HTMLElement>("#arma");
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -60 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="menu" className="section py-24 sm:py-32">
      <SectionHeading
        eyebrow="Menú"
        title="¿Sin ganas de decidir? Empieza por una favorita."
        description="Elige una y personalízala: quita, agrega o cambia lo que quieras."
      />

      <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <RevealItem key={p.id}>
            <GlowCard glow="255,120,40" className="h-full p-7" cursor="link" tilt={5}>
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-3xl font-semibold text-white">{p.name}</h3>
                  <span className="shrink-0 font-display text-2xl text-orange-300">
                    {formatPrice(calcPrice(p.ingredients, "mediana", "clasica"))}
                  </span>
                </div>
                <p className="mt-2 text-[15px] text-white/55">{p.desc}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(Object.keys(p.ingredients) as IngredientId[]).map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-3 text-xs text-white/70"
                    >
                      <Topping id={id} className="h-5 w-5" />
                      {ING_BY_ID[id].name}
                      {(p.ingredients[id] ?? 0) > 1 && <b className="text-orange-300">×{p.ingredients[id]}</b>}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => pick(p.id)}
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:border-orange-400/70 hover:bg-orange-500/20"
                >
                  <Wand2 size={16} /> Personalizar esta
                </button>
              </div>
            </GlowCard>
          </RevealItem>
        ))}
      </RevealGroup>
      <p className="mt-4 text-sm text-white/35">Precios en tamaño mediano con masa clásica.</p>
    </section>
  );
}
