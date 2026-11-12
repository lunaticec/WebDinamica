"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Layers, Loader2, PizzaIcon, Plus, RotateCcw, Ruler, Save, Settings, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { Topping } from "@/components/pizza/Topping";
import { describePromo, localDay } from "@/lib/promo";
import { SHAPES, SHAPE_BY_ID, type Catalog, type Crust, type Ingredient, type Preset, type Promotion, type PromoType, type ShapeId, type Size } from "@/lib/pizza";
import { cn, formatPrice } from "@/lib/utils";

/* ---------------------------- utilidades ---------------------------- */

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7)}`;

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
const patchAt = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((x, k) => (k === i ? { ...x, ...patch } : x));
const removeAt = <T,>(list: T[], i: number) => list.filter((_, k) => k !== i);

/* ---------------------------- piezas de UI ---------------------------- */

const inputCls =
  "h-10 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-400 [&>option]:text-black";

function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-white/30">{hint}</span>}
    </label>
  );
}

function Text({ value, onChange, placeholder, max }: { value: string; onChange: (v: string) => void; placeholder?: string; max?: number }) {
  return <input className={inputCls} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function Num({ value, onChange, step = 1, min = 0, max, prefix, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; prefix?: string; suffix?: string }) {
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        className={cn(inputCls, prefix && "pl-7", suffix && "pr-10")}
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">{suffix}</span>}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-sm text-white/70">
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-emerald-500" : "bg-white/15")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", active ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/15 text-white/50 hover:text-white")}>
      {children}
    </button>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5", className)}>{children}</div>;
}

function RowTools({ i, n, onMove, onDelete, disableDelete }: { i: number; n: number; onMove: (d: -1 | 1) => void; onDelete: () => void; disableDelete?: boolean }) {
  const b = "grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-25";
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" aria-label="Subir" className={b} disabled={i === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></button>
      <button type="button" aria-label="Bajar" className={b} disabled={i === n - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></button>
      <button type="button" aria-label="Eliminar" disabled={disableDelete} className={cn(b, "hover:!bg-red-500/20 hover:!text-red-300")} onClick={onDelete}><Trash2 size={14} /></button>
    </div>
  );
}

function SectionTitle({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {desc && <p className="mt-1 max-w-2xl text-sm text-white/45">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-400">
      <Plus size={15} /> {children}
    </button>
  );
}

/* ---------------------------- editor ---------------------------- */

type Sec = "tamanos" | "ingredientes" | "menu" | "promos" | "negocio";

export function CatalogEditor({ onUnauth }: { onUnauth: () => void }) {
  const live = useCatalog();
  const router = useRouter();
  const [draft, setDraft] = useState<Catalog>(live);
  const [base, setBase] = useState(() => JSON.stringify(live));
  const [sec, setSec] = useState<Sec>("tamanos");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(0);

  const dirty = useMemo(() => JSON.stringify(draft) !== base, [draft, base]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(0), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const set = (patch: Partial<Catalog>) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/catalog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    if (res.status === 401) return onUnauth();
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "No se pudo guardar.");
    setDraft(data.catalog);
    setBase(JSON.stringify(data.catalog));
    setSavedAt(Date.now());
    router.refresh(); // la web pública toma los cambios al instante
  };

  const reset = async () => {
    if (!confirm("¿Restablecer TODO el menú, precios y promociones a los valores iniciales? Se perderán tus cambios.")) return;
    const res = await fetch("/api/admin/catalog", { method: "DELETE" });
    if (res.status === 401) return onUnauth();
    const data = await res.json();
    setDraft(data.catalog);
    setBase(JSON.stringify(data.catalog));
    router.refresh();
  };

  const SECS: { id: Sec; label: string; icon: ReactNode }[] = [
    { id: "tamanos", label: "Tamaños y masas", icon: <Ruler size={16} /> },
    { id: "ingredientes", label: "Ingredientes", icon: <Layers size={16} /> },
    { id: "menu", label: "Menú", icon: <PizzaIcon size={16} /> },
    { id: "promos", label: "Promociones", icon: <Tag size={16} /> },
    { id: "negocio", label: "Negocio y reglas", icon: <Settings size={16} /> },
  ];

  return (
    <div className="pb-28">
      <div className="mb-6 flex flex-wrap gap-2">
        {SECS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSec(s.id)}
            className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition", sec === s.id ? "border-orange-400 bg-orange-500/15 text-orange-100" : "border-white/10 text-white/55 hover:text-white")}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {sec === "tamanos" && <SizesCrusts draft={draft} set={set} />}
      {sec === "ingredientes" && <Ingredients draft={draft} set={set} />}
      {sec === "menu" && <Menu draft={draft} set={set} />}
      {sec === "promos" && <Promos draft={draft} set={set} />}
      {sec === "negocio" && <Business draft={draft} set={set} onReset={reset} />}

      {/* Barra de guardado */}
      <AnimatePresence>
        {(dirty || savedAt > 0 || error) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full border border-white/15 bg-ink-900/95 py-2 pl-6 pr-2 shadow-2xl backdrop-blur-xl"
          >
            <p className={cn("text-sm", error ? "text-red-300" : savedAt ? "text-emerald-300" : "text-white/70")}>
              {error || (savedAt && !dirty ? "✔ Guardado. Ya está en la web." : "Tienes cambios sin guardar")}
            </p>
            <div className="flex items-center gap-2">
              {dirty && (
                <button onClick={() => (setDraft(JSON.parse(base)), setError(""))} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-white/60 hover:text-white">
                  <RotateCcw size={15} /> Descartar
                </button>
              )}
              <button onClick={save} disabled={busy || !dirty} className="inline-flex h-11 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-bold text-white transition hover:bg-orange-400 disabled:opacity-40">
                {busy ? <Loader2 size={16} className="animate-spin" /> : savedAt && !dirty ? <Check size={16} /> : <Save size={16} />} Guardar cambios
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type SecProps = { draft: Catalog; set: (p: Partial<Catalog>) => void };

/* ---------------------------- Tamaños y masas ---------------------------- */

function SizesCrusts({ draft, set }: SecProps) {
  const THICK = [
    { v: 4.5, l: "Delgada" },
    { v: 8, l: "Normal" },
    { v: 10, l: "Gruesa" },
  ];
  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          title="Tamaños"
          desc="El precio base es la pizza sin ingredientes. El multiplicador ajusta lo que cuestan los ingredientes en ese tamaño (1 = precio de lista; 1.4 = 40% más caro; 0.7 = 30% más barato). El orden es el de la web; el tamaño del medio se usa como referencia en el menú."
          action={<AddButton onClick={() => set({ sizes: [...draft.sizes, { id: rid("t"), label: "Nuevo tamaño", inches: 12, base: 10, mult: 1, scale: 1 } as Size] })}>Agregar tamaño</AddButton>}
        />
        <div className="space-y-3">
          {draft.sizes.map((s, i) => (
            <Card key={s.id} className="flex flex-wrap items-end gap-3">
              <Field label="Nombre" className="min-w-[10rem] flex-1"><Text value={s.label} onChange={(v) => set({ sizes: patchAt(draft.sizes, i, { label: v }) })} max={24} /></Field>
              <Field label="Pulgadas" className="w-24"><Num value={s.inches} onChange={(v) => set({ sizes: patchAt(draft.sizes, i, { inches: v }) })} min={4} max={40} suffix="″" /></Field>
              <Field label="Precio base" className="w-32"><Num value={s.base} step={0.25} onChange={(v) => set({ sizes: patchAt(draft.sizes, i, { base: v }) })} prefix="$" /></Field>
              <Field label="Mult. ingredientes" className="w-36"><Num value={s.mult} step={0.05} min={0.1} max={5} onChange={(v) => set({ sizes: patchAt(draft.sizes, i, { mult: v }) })} suffix="×" /></Field>
              <RowTools i={i} n={draft.sizes.length} disableDelete={draft.sizes.length <= 1} onMove={(d) => set({ sizes: move(draft.sizes, i, d) })} onDelete={() => set({ sizes: removeAt(draft.sizes, i) })} />
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          title="Tipos de masa"
          desc="El extra se suma al precio de la pizza. 'Borde relleno' dibuja el borde con queso en la pizza de la web."
          action={<AddButton onClick={() => set({ crusts: [...draft.crusts, { id: rid("m"), label: "Nueva masa", desc: "", extra: 0, width: 8, stuffed: false } as Crust] })}>Agregar masa</AddButton>}
        />
        <div className="space-y-3">
          {draft.crusts.map((c, i) => (
            <Card key={c.id} className="flex flex-wrap items-end gap-3">
              <Field label="Nombre" className="min-w-[10rem] flex-1"><Text value={c.label} onChange={(v) => set({ crusts: patchAt(draft.crusts, i, { label: v }) })} max={30} /></Field>
              <Field label="Descripción corta" className="w-36"><Text value={c.desc} onChange={(v) => set({ crusts: patchAt(draft.crusts, i, { desc: v }) })} max={20} placeholder="Crujiente" /></Field>
              <Field label="Extra" className="w-28"><Num value={c.extra} step={0.25} onChange={(v) => set({ crusts: patchAt(draft.crusts, i, { extra: v }) })} prefix="$" /></Field>
              <Field label="Grosor" className="w-32">
                <select className={inputCls} value={THICK.reduce((a, t) => (Math.abs(t.v - c.width) < Math.abs(a - c.width) ? t.v : a), 8)} onChange={(e) => set({ crusts: patchAt(draft.crusts, i, { width: Number(e.target.value) }) })}>
                  {THICK.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </Field>
              <div className="pb-2"><Toggle checked={c.stuffed} onChange={(v) => set({ crusts: patchAt(draft.crusts, i, { stuffed: v }) })} label="Borde relleno" /></div>
              <RowTools i={i} n={draft.crusts.length} disableDelete={draft.crusts.length <= 1} onMove={(d) => set({ crusts: move(draft.crusts, i, d) })} onDelete={() => set({ crusts: removeAt(draft.crusts, i) })} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- Ingredientes ---------------------------- */

function Ingredients({ draft, set }: SecProps) {
  return (
    <section>
      <SectionTitle
        title="Ingredientes"
        desc="El precio es por porción en un tamaño con multiplicador 1. Desactiva 'Disponible' cuando se agote: seguirá en tu lista pero los clientes lo verán como 'Agotado'."
        action={<AddButton onClick={() => set({ ingredients: [...draft.ingredients, { id: rid("i"), name: "Nuevo ingrediente", price: 1, shape: "pepperoni", pieces: 8, size: 14, available: true } as Ingredient] })}>Agregar ingrediente</AddButton>}
      />
      <div className="space-y-3">
        {draft.ingredients.map((g, i) => (
          <Card key={g.id} className={cn("flex flex-wrap items-end gap-3", !g.available && "opacity-60")}>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white p-1.5"><Topping shape={g.shape} className="h-full w-full" /></div>
            <Field label="Nombre" className="min-w-[9rem] flex-1"><Text value={g.name} onChange={(v) => set({ ingredients: patchAt(draft.ingredients, i, { name: v }) })} max={30} /></Field>
            <Field label="Precio" className="w-28"><Num value={g.price} step={0.05} onChange={(v) => set({ ingredients: patchAt(draft.ingredients, i, { price: v }) })} prefix="$" /></Field>
            <Field label="Se dibuja como" className="w-52">
              <select
                className={inputCls}
                value={g.shape}
                onChange={(e) => {
                  const shape = e.target.value as ShapeId;
                  set({ ingredients: patchAt(draft.ingredients, i, { shape, pieces: SHAPE_BY_ID[shape].pieces, size: SHAPE_BY_ID[shape].size }) });
                }}
              >
                {SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Piezas" className="w-20"><Num value={g.pieces} min={1} max={20} onChange={(v) => set({ ingredients: patchAt(draft.ingredients, i, { pieces: Math.round(v) }) })} /></Field>
            <div className="pb-2"><Toggle checked={g.available} onChange={(v) => set({ ingredients: patchAt(draft.ingredients, i, { available: v }) })} label="Disponible" /></div>
            <RowTools i={i} n={draft.ingredients.length} disableDelete={draft.ingredients.length <= 1} onMove={(d) => set({ ingredients: move(draft.ingredients, i, d) })} onDelete={() => set({ ingredients: removeAt(draft.ingredients, i) })} />
            <p className="basis-full font-mono text-[11px] text-white/35">
              Cada porción cuesta: {draft.sizes.map((s) => `${s.label} ${formatPrice(g.price * s.mult)}`).join(" · ")}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- Menú (pizzas prearmadas) ---------------------------- */

function Menu({ draft, set }: SecProps) {
  const mid = draft.sizes[Math.floor((draft.sizes.length - 1) / 2)];
  const priceOf = (p: Preset) => {
    const tops = Object.entries(p.ingredients).reduce((sum, [id, q]) => sum + (draft.ingredients.find((x) => x.id === id)?.price ?? 0) * q, 0);
    return mid.base + tops * mid.mult;
  };
  return (
    <section>
      <SectionTitle
        title="Menú de pizzas"
        desc="Pizzas listas que el cliente puede elegir y luego personalizar. El precio se calcula solo con los ingredientes y el tamaño del medio."
        action={<AddButton onClick={() => set({ presets: [...draft.presets, { id: rid("p"), name: "Nueva pizza", desc: "", active: true, ingredients: {} } as Preset] })}>Agregar pizza</AddButton>}
      />
      <div className="space-y-3">
        {draft.presets.map((p, i) => (
          <Card key={p.id} className={cn("space-y-4", !p.active && "opacity-60")}>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Nombre" className="min-w-[10rem] flex-1"><Text value={p.name} onChange={(v) => set({ presets: patchAt(draft.presets, i, { name: v }) })} max={40} /></Field>
              <Field label="Descripción" className="min-w-[14rem] flex-[2]"><Text value={p.desc} onChange={(v) => set({ presets: patchAt(draft.presets, i, { desc: v }) })} max={120} /></Field>
              <div className="pb-2"><Toggle checked={p.active} onChange={(v) => set({ presets: patchAt(draft.presets, i, { active: v }) })} label="Visible" /></div>
              <RowTools i={i} n={draft.presets.length} onMove={(d) => set({ presets: move(draft.presets, i, d) })} onDelete={() => set({ presets: removeAt(draft.presets, i) })} />
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
                Ingredientes · precio {mid.label.toLowerCase()}: <span className="text-orange-300">{formatPrice(priceOf(p))}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {draft.ingredients.map((g) => {
                  const q = p.ingredients[g.id] ?? 0;
                  const upd = (n: number) => {
                    const next = { ...p.ingredients };
                    if (n <= 0) delete next[g.id];
                    else next[g.id] = Math.min(n, draft.policy.maxPerIngredient);
                    set({ presets: patchAt(draft.presets, i, { ingredients: next }) });
                  };
                  return (
                    <div key={g.id} className={cn("flex items-center gap-1.5 rounded-full border py-1 pl-2 pr-1", q > 0 ? "border-orange-400/60 bg-orange-500/10" : "border-white/10")}>
                      <Topping shape={g.shape} className="h-5 w-5" />
                      <span className="text-xs text-white/70">{g.name}</span>
                      <button type="button" aria-label={`Quitar ${g.name}`} className="grid h-6 w-6 place-items-center rounded-full text-white/50 hover:bg-white/10" onClick={() => upd(q - 1)}>−</button>
                      <b className="w-3 text-center font-mono text-xs">{q}</b>
                      <button type="button" aria-label={`Agregar ${g.name}`} className="grid h-6 w-6 place-items-center rounded-full bg-orange-500 text-white hover:bg-orange-400" onClick={() => upd(q + 1)}>+</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
        {draft.presets.length === 0 && <p className="py-8 text-center text-white/35">No hay pizzas en el menú. Agrega la primera.</p>}
      </div>
    </section>
  );
}

/* ---------------------------- Promociones ---------------------------- */

const PROMO_TYPES: { v: PromoType; l: string }[] = [
  { v: "percent", l: "Porcentaje de descuento (%)" },
  { v: "amount", l: "Monto fijo de descuento ($)" },
  { v: "two_for_one", l: "2x1 (la más barata gratis)" },
  { v: "free_delivery", l: "Envío gratis" },
];
const WEEK = [
  { d: 1, l: "L" }, { d: 2, l: "M" }, { d: 3, l: "X" }, { d: 4, l: "J" }, { d: 5, l: "V" }, { d: 6, l: "S" }, { d: 0, l: "D" },
];

function promoState(p: Promotion, tz: string): { label: string; tone: string } {
  if (!p.active) return { label: "Pausada", tone: "bg-white/10 text-white/50" };
  const { date, dow } = localDay(tz, new Date());
  if (p.endsAt && date > p.endsAt) return { label: "Vencida", tone: "bg-red-500/20 text-red-300" };
  if (p.startsAt && date < p.startsAt) return { label: "Programada", tone: "bg-sky-500/20 text-sky-300" };
  if (p.days.length && !p.days.includes(dow)) return { label: "Activa · hoy no toca", tone: "bg-amber-500/20 text-amber-300" };
  return { label: p.code ? "Activa · con código" : "Activa ahora", tone: "bg-emerald-500/20 text-emerald-300" };
}

function Promos({ draft, set }: SecProps) {
  return (
    <section>
      <SectionTitle
        title="Promociones"
        desc="Sin código = se aplica sola cuando el pedido cumple las condiciones. Con código = el cliente lo escribe en el ticket. Si varias aplican, se usa solo la que más descuenta (no se suman)."
        action={
          <AddButton
            onClick={() =>
              set({ promotions: [...draft.promotions, { id: rid("o"), name: "Nueva promoción", description: "", active: false, type: "percent", value: 10, code: "", minSubtotal: 0, sizes: [], startsAt: "", endsAt: "", days: [] } as Promotion] })
            }
          >
            Agregar promoción
          </AddButton>
        }
      />
      <div className="space-y-3">
        {draft.promotions.map((p, i) => {
          const upd = (patch: Partial<Promotion>) => set({ promotions: patchAt(draft.promotions, i, patch) });
          const st = promoState(p, draft.shop.timezone);
          return (
            <Card key={p.id} className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Nombre (se ve en el ticket)" className="min-w-[12rem] flex-1"><Text value={p.name} onChange={(v) => upd({ name: v })} max={50} /></Field>
                <Field label="Tipo" className="w-64">
                  <select className={inputCls} value={p.type} onChange={(e) => upd({ type: e.target.value as PromoType })}>
                    {PROMO_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </select>
                </Field>
                {(p.type === "percent" || p.type === "amount") && (
                  <Field label={p.type === "percent" ? "Descuento" : "Monto"} className="w-28">
                    <Num value={p.value} step={p.type === "percent" ? 1 : 0.5} max={p.type === "percent" ? 100 : 500} prefix={p.type === "amount" ? "$" : undefined} suffix={p.type === "percent" ? "%" : undefined} onChange={(v) => upd({ value: v })} />
                  </Field>
                )}
                <div className="pb-2"><Toggle checked={p.active} onChange={(v) => upd({ active: v })} label="Activa" /></div>
                <RowTools i={i} n={draft.promotions.length} onMove={(d) => set({ promotions: move(draft.promotions, i, d) })} onDelete={() => confirm(`¿Eliminar "${p.name}"?`) && set({ promotions: removeAt(draft.promotions, i) })} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Código (opcional)" hint="Vacío = automática. Ej: PIZZA10"><Text value={p.code} onChange={(v) => upd({ code: v.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} max={20} placeholder="SIN CÓDIGO" /></Field>
                <Field label="Compra mínima" hint="Subtotal de pizzas"><Num value={p.minSubtotal} step={1} prefix="$" onChange={(v) => upd({ minSubtotal: v })} /></Field>
                <Field label="Desde"><input type="date" className={inputCls} value={p.startsAt} onChange={(e) => upd({ startsAt: e.target.value })} /></Field>
                <Field label="Hasta"><input type="date" className={inputCls} value={p.endsAt} onChange={(e) => upd({ endsAt: e.target.value })} /></Field>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">Días (ninguno = todos)</p>
                  <div className="flex gap-1.5">
                    {WEEK.map((w) => (
                      <Chip key={w.d} active={p.days.includes(w.d)} onClick={() => upd({ days: p.days.includes(w.d) ? p.days.filter((x) => x !== w.d) : [...p.days, w.d].sort() })}>{w.l}</Chip>
                    ))}
                  </div>
                </div>
                {p.type !== "free_delivery" && (
                  <div>
                    <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">Solo en estos tamaños (ninguno = todos)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.sizes.map((s) => (
                        <Chip key={s.id} active={p.sizes.includes(s.id)} onClick={() => upd({ sizes: p.sizes.includes(s.id) ? p.sizes.filter((x) => x !== s.id) : [...p.sizes, s.id] })}>{s.label}</Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                <span className={cn("rounded-full px-3 py-1 font-mono text-[11px] font-bold", st.tone)}>{st.label}</span>
                <p className="text-sm text-white/55">{describePromo(p, draft)}</p>
              </div>
            </Card>
          );
        })}
        {draft.promotions.length === 0 && <p className="py-8 text-center text-white/35">Aún no hay promociones.</p>}
      </div>
    </section>
  );
}

/* ---------------------------- Negocio y reglas ---------------------------- */

const ZONES = [
  "America/Guayaquil", "America/Bogota", "America/Lima", "America/Mexico_City", "America/Santiago",
  "America/Argentina/Buenos_Aires", "America/Caracas", "America/Panama", "America/Costa_Rica", "America/New_York", "Europe/Madrid",
];

function Business({ draft, set, onReset }: SecProps & { onReset: () => void }) {
  const shop = draft.shop;
  const pol = draft.policy;
  const setShop = (p: Partial<typeof shop>) => set({ shop: { ...shop, ...p } });
  const setPol = (p: Partial<typeof pol>) => set({ policy: { ...pol, ...p } });
  return (
    <div className="space-y-10">
      <section>
        <SectionTitle title="Datos del negocio" desc="Se muestran en la web, el ticket y el comprobante por correo." />
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre"><Text value={shop.name} onChange={(v) => setShop({ name: v })} max={30} /></Field>
          <Field label="Eslogan"><Text value={shop.tagline} onChange={(v) => setShop({ tagline: v })} max={40} /></Field>
          <Field label="Horario"><Text value={shop.hours} onChange={(v) => setShop({ hours: v })} max={60} /></Field>
          <Field label="Teléfono"><Text value={shop.phone} onChange={(v) => setShop({ phone: v })} max={30} /></Field>
          <Field label="Dirección" className="sm:col-span-2"><Text value={shop.address} onChange={(v) => setShop({ address: v })} max={100} /></Field>
          <Field label="Costo de envío a domicilio"><Num value={shop.deliveryFee} step={0.25} prefix="$" onChange={(v) => setShop({ deliveryFee: v })} /></Field>
          <Field label="Zona horaria" hint="Define qué día y fecha cuentan las promociones.">
            <select className={inputCls} value={shop.timezone} onChange={(e) => setShop({ timezone: e.target.value })}>
              {(ZONES.includes(shop.timezone) ? ZONES : [shop.timezone, ...ZONES]).map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </Field>
        </Card>
      </section>

      <section>
        <SectionTitle title="Reglas de pedidos" desc="Controlan el pago en el local y los límites del constructor." />
        <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Máx. porciones por ingrediente"><Num value={pol.maxPerIngredient} min={1} max={5} onChange={(v) => setPol({ maxPerIngredient: Math.round(v) })} /></Field>
          <Field label="IVA incluido en precios" hint="Se usa para separar el impuesto al cobrar con PayPhone."><Num value={Math.round(pol.iva * 1000) / 10} step={1} max={30} suffix="%" onChange={(v) => setPol({ iva: v / 100 })} /></Field>
          <Field label="Tope pago en el local" hint="Pedidos mayores deben pagarse en línea."><Num value={pol.localMaxTotal} prefix="$" onChange={(v) => setPol({ localMaxTotal: v })} /></Field>
          <Field label="Reserva pago en local" hint="Minutos antes de que expire y cuente como plantón."><Num value={pol.localHoldMinutes} min={5} max={240} suffix="min" onChange={(v) => setPol({ localHoldMinutes: Math.round(v) })} /></Field>
          <Field label="Tiempo para pagar en línea"><Num value={pol.onlineHoldMinutes} min={5} max={240} suffix="min" onChange={(v) => setPol({ onlineHoldMinutes: Math.round(v) })} /></Field>
          <Field label="Plantones para bloquear" hint="Tras este número, el celular solo puede pagar en línea."><Num value={pol.maxStrikes} min={1} max={10} onChange={(v) => setPol({ maxStrikes: Math.round(v) })} /></Field>
        </Card>
      </section>

      <section>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10">
          <RotateCcw size={15} /> Restablecer menú, precios y promociones a los valores iniciales
        </button>
      </section>
    </div>
  );
}
