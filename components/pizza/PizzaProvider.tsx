"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  MAX_PER_INGREDIENT,
  PRESETS,
  calcPrice,
  createLayer,
  type CartItem,
  type Counts,
  type CrustId,
  type IngredientId,
  type Layer,
  type SizeId,
} from "@/lib/pizza";

type PizzaCtx = {
  layers: Layer[];
  counts: Counts;
  size: SizeId;
  crust: CrustId;
  price: number;
  presetName: string | null;
  cart: CartItem[];
  cartTotal: number;
  /** El usuario está arrastrando un ingrediente sobre la pizza */
  over: boolean;
  pizzaRef: RefObject<HTMLDivElement | null>;
  setOver: (v: boolean) => void;
  setSize: (s: SizeId) => void;
  setCrust: (c: CrustId) => void;
  addIngredient: (id: IngredientId) => void;
  removeIngredient: (id: IngredientId) => void;
  clearPizza: () => void;
  loadPreset: (id: string) => void;
  addToCart: () => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
};

const Ctx = createContext<PizzaCtx | null>(null);

export function usePizza() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePizza debe usarse dentro de <PizzaProvider>");
  return ctx;
}

export function PizzaProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [size, setSize] = useState<SizeId>("mediana");
  const [crust, setCrust] = useState<CrustId>("clasica");
  const [presetName, setPresetName] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [over, setOver] = useState(false);
  const pizzaRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const c: Counts = {};
    for (const l of layers) c[l.ing] = (c[l.ing] ?? 0) + 1;
    return c;
  }, [layers]);

  const price = useMemo(() => calcPrice(counts, size, crust), [counts, size, crust]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price, 0), [cart]);

  const addIngredient = useCallback((id: IngredientId) => {
    setLayers((prev) =>
      prev.filter((l) => l.ing === id).length >= MAX_PER_INGREDIENT ? prev : [...prev, createLayer(id)]
    );
    setPresetName(null);
  }, []);

  const removeIngredient = useCallback((id: IngredientId) => {
    setLayers((prev) => {
      const idx = prev.map((l) => l.ing).lastIndexOf(id);
      return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
    });
    setPresetName(null);
  }, []);

  const clearPizza = useCallback(() => {
    setLayers([]);
    setPresetName(null);
  }, []);

  const loadPreset = useCallback((id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const next: Layer[] = [];
    for (const [ing, qty] of Object.entries(preset.ingredients)) {
      for (let i = 0; i < (qty ?? 0); i++) next.push(createLayer(ing as IngredientId));
    }
    setLayers(next);
    setPresetName(preset.name);
  }, []);

  const addToCart = useCallback(() => {
    setCart((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${prev.length}`,
        name: presetName ?? "Pizza personalizada",
        size,
        crust,
        ingredients: counts,
        price,
      },
    ]);
    setLayers([]);
    setPresetName(null);
  }, [presetName, size, crust, counts, price]);

  const removeFromCart = useCallback((uid: string) => setCart((p) => p.filter((i) => i.uid !== uid)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const value: PizzaCtx = {
    layers,
    counts,
    size,
    crust,
    price,
    presetName,
    cart,
    cartTotal,
    over,
    pizzaRef,
    setOver,
    setSize,
    setCrust,
    addIngredient,
    removeIngredient,
    clearPizza,
    loadPreset,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
