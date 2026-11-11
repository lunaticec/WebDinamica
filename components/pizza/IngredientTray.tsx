"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { INGREDIENTS, MAX_PER_INGREDIENT, type Ingredient } from "@/lib/pizza";
import { cn, formatPrice } from "@/lib/utils";
import { Topping } from "./Topping";
import { usePizza } from "./PizzaProvider";

function Tile({ ing, canDrag }: { ing: Ingredient; canDrag: boolean }) {
  const { counts, addIngredient, removeIngredient, pizzaRef, setOver, size } = usePizza();
  const qty = counts[ing.id] ?? 0;
  const full = qty >= MAX_PER_INGREDIENT;

  const isOverPizza = (pt: { x: number; y: number }) => {
    const r = pizzaRef.current?.getBoundingClientRect();
    if (!r) return false;
    const x = pt.x - window.scrollX;
    const y = pt.y - window.scrollY;
    return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < (r.width / 2) * 0.98;
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white/[0.03] p-2 transition-colors duration-300",
        qty > 0 ? "border-orange-400/60 bg-orange-400/[0.07]" : "border-white/[0.08] hover:border-white/20"
      )}
    >
      {qty > 0 && (
        <motion.span
          key={qty}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          className="absolute -right-1.5 -top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-orange-500 font-mono text-xs font-bold text-white shadow-lg"
        >
          {qty}
        </motion.span>
      )}

      {/* Parte arrastrable */}
      <motion.div
        drag={canDrag && !full}
        dragSnapToOrigin
        dragMomentum={false}
        dragElastic={0.15}
        whileDrag={{ scale: 1.25, zIndex: 60, rotate: 8 }}
        whileTap={{ scale: 0.94 }}
        onDrag={(_, info) => setOver(isOverPizza(info.point))}
        onDragEnd={(_, info) => {
          setOver(false);
          if (isOverPizza(info.point)) addIngredient(ing.id);
        }}
        onTap={() => !full && addIngredient(ing.id)}
        data-cursor="drag"
        data-cursor-label={full ? "Máx." : "Arrastra"}
        className="relative flex select-none flex-col items-center gap-1 rounded-xl px-1 pb-1 pt-2"
      >
        <Topping id={ing.id} className="pointer-events-none h-12 w-12 drop-shadow-lg sm:h-14 sm:w-14" />
        <span className="pointer-events-none text-[13px] font-medium text-white">{ing.name}</span>
        <span className="pointer-events-none font-mono text-[11px] text-orange-300/90">
          +{formatPrice(ing.price * (size === "personal" ? 0.7 : size === "familiar" ? 1.4 : 1))}
        </span>
      </motion.div>

      {/* Controles */}
      <div className="mt-1 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Quitar ${ing.name}`}
          disabled={qty === 0}
          onClick={() => removeIngredient(ing.id)}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/10 disabled:opacity-25"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          aria-label={`Agregar ${ing.name}`}
          disabled={full}
          onClick={() => addIngredient(ing.id)}
          className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-white transition hover:bg-orange-400 disabled:opacity-25"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function IngredientTray() {
  const [canDrag, setCanDrag] = useState(false);
  useEffect(() => {
    // Arrastrar sólo con ratón; en táctil se usa toque / botones para no bloquear el scroll
    setCanDrag(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
      {INGREDIENTS.map((ing) => (
        <Tile key={ing.id} ing={ing} canDrag={canDrag} />
      ))}
    </div>
  );
}
