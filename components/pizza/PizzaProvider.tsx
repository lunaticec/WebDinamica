"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { quote as makeQuote, type Quote } from "@/lib/promo";
import {
  createLayer,
  fixedPrice,
  itemPrice,
  matchPreset,
  crustOf,
  ingOf,
  sizeOf,
  type CartItem,
  type Counts,
  type CrustId,
  type Delivery,
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
  /** Precio fijo del menú aplicado a esta pizza (sin extra de masa), o null si se calcula por ingredientes */
  fixedBase: number | null;
  cart: CartItem[];
  cartTotal: number;
  delivery: Delivery;
  /** Costo de envío (antes de promociones), en dólares */
  deliveryFee: number;
  /** Pizza que se está armando ahora, como línea de ticket */
  current: CartItem;
  /** Pizzas del carrito + la actual (si tiene algo o el carrito está vacío) */
  orderItems: CartItem[];
  /** Total final con envío y promoción, en dólares */
  orderTotal: number;
  quote: Quote;
  promoCode: string;
  setPromoCode: (c: string) => void;
  /** El usuario está arrastrando un ingrediente sobre la pizza */
  over: boolean;
  pizzaRef: RefObject<HTMLDivElement | null>;
  setOver: (v: boolean) => void;
  setDelivery: (d: Delivery) => void;
  setSize: (s: SizeId) => void;
  setCrust: (c: CrustId) => void;
  addIngredient: (id: IngredientId) => void;
  removeIngredient: (id: IngredientId) => void;
  clearPizza: () => void;
  loadPreset: (id: string) => void;
  addToCart: () => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
  /** Vacía pizza y pedido (después de confirmar un pedido) */
  resetAll: () => void;
};

const Ctx = createContext<PizzaCtx | null>(null);

export function usePizza() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePizza debe usarse dentro de <PizzaProvider>");
  return ctx;
}

export function PizzaProvider({ children }: { children: ReactNode }) {
  const cat = useCatalog();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [sizeId, setSize] = useState<SizeId>(() => cat.sizes[Math.floor((cat.sizes.length - 1) / 2)].id);
  const [crustId, setCrust] = useState<CrustId>(() => cat.crusts[0].id);
  const [presetId, setPresetId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [over, setOver] = useState(false);
  const [delivery, setDelivery] = useState<Delivery>("recoger");
  const [promoCode, setPromoCode] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const pizzaRef = useRef<HTMLDivElement>(null);

  // Reloj del cliente para promociones por fecha/día (se evita en el primer render para no desajustar la hidratación)
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Si el dueño borra el tamaño/masa elegido, se cae al más cercano disponible.
  const size = sizeOf(cat, sizeId).id;
  const crust = crustOf(cat, crustId).id;
  const maxPer = cat.policy.maxPerIngredient;

  // Ingredientes que ya no existen o se agotaron salen de la pizza automáticamente.
  const liveLayers = useMemo(() => layers.filter((l) => ingOf(cat, l.ing)?.available), [layers, cat]);

  const counts = useMemo(() => {
    const c: Counts = {};
    for (const l of liveLayers) c[l.ing] = (c[l.ing] ?? 0) + 1;
    return c;
  }, [liveLayers]);

  // La pizza sigue siendo "la del menú" sólo mientras sus ingredientes coincidan exactamente.
  const preset = useMemo(() => matchPreset(cat, presetId, counts), [cat, presetId, counts]);
  const presetName = preset?.name ?? null;
  const fixedBase = preset ? fixedPrice(preset, size) : null;
  const price = useMemo(() => itemPrice(cat, counts, size, crust, preset), [cat, counts, size, crust, preset]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price, 0), [cart]);

  const current = useMemo<CartItem>(
    () => ({ uid: "current", name: presetName ?? "Pizza personalizada", presetId: preset?.id, size, crust, ingredients: counts, price }),
    [presetName, preset, size, crust, counts, price]
  );
  const orderItems = useMemo(
    () => (liveLayers.length > 0 || cart.length === 0 ? [...cart, current] : cart),
    [liveLayers.length, cart, current]
  );
  const quote = useMemo(
    () => makeQuote(cat, orderItems.map((i) => ({ size: i.size, price: i.price })), delivery, promoCode, now ?? new Date(0)),
    [cat, orderItems, delivery, promoCode, now]
  );

  const addIngredient = useCallback(
    (id: IngredientId) => {
      if (!ingOf(cat, id)?.available) return;
      setLayers((prev) =>
        prev.filter((l) => l.ing === id).length >= maxPer ? prev : [...prev, createLayer(cat, id, prev.flatMap((l) => l.pieces))]
      );
      setPresetId(null);
    },
    [cat, maxPer]
  );

  const removeIngredient = useCallback((id: IngredientId) => {
    setLayers((prev) => {
      const idx = prev.map((l) => l.ing).lastIndexOf(id);
      return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
    });
    setPresetId(null);
  }, []);

  const clearPizza = useCallback(() => {
    setLayers([]);
    setPresetId(null);
  }, []);

  const loadPreset = useCallback(
    (id: string) => {
      const chosen = cat.presets.find((p) => p.id === id);
      if (!chosen) return;
      const next: Layer[] = [];
      for (const [ing, qty] of Object.entries(chosen.ingredients)) {
        if (!ingOf(cat, ing)?.available) continue;
        for (let i = 0; i < Math.min(qty ?? 0, maxPer); i++) next.push(createLayer(cat, ing, next.flatMap((l) => l.pieces)));
      }
      setLayers(next);
      setPresetId(chosen.id);
    },
    [cat, maxPer]
  );

  const addToCart = useCallback(() => {
    setCart((prev) => [...prev, { ...current, uid: `${Date.now()}-${prev.length}` }]);
    setLayers([]);
    setPresetId(null);
  }, [current]);

  const removeFromCart = useCallback((uid: string) => setCart((p) => p.filter((i) => i.uid !== uid)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const resetAll = useCallback(() => {
    setLayers([]);
    setCart([]);
    setPresetId(null);
    setPromoCode("");
  }, []);

  const value: PizzaCtx = {
    layers: liveLayers,
    counts,
    size,
    crust,
    price,
    presetName,
    fixedBase,
    cart,
    cartTotal,
    delivery,
    deliveryFee: quote.deliveryFeeCents / 100,
    current,
    orderItems,
    orderTotal: quote.totalCents / 100,
    quote,
    promoCode,
    setPromoCode,
    over,
    pizzaRef,
    setOver,
    setDelivery,
    setSize,
    setCrust,
    addIngredient,
    removeIngredient,
    clearPizza,
    loadPreset,
    addToCart,
    removeFromCart,
    clearCart,
    resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
