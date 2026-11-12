"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CreditCard, Loader2, MessageCircle, ShieldCheck, Store, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { cn, formatPrice } from "@/lib/utils";
import { usePizza } from "@/components/pizza/PizzaProvider";
import { useLenis } from "@/components/providers/SmoothScroll";

type Step = "datos" | "pago" | "codigo" | "enlaces";
type PayUrls = { card?: string; app?: string };

async function api<T = Record<string, unknown>>(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string };
  return { ok: res.ok, status: res.status, data };
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-red-600 focus:ring-2 focus:ring-red-600/20";

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cat = useCatalog();
  const POLICY = cat.policy;
  const { orderItems, orderTotal, delivery, resetAll, promoCode } = usePizza();
  const lenis = useLenis();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [step, setStep] = useState<Step>("datos");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<"online" | "local">("online");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string>();
  const [blocked, setBlocked] = useState(false);
  const [payUrls, setPayUrls] = useState<PayUrls>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const localAllowed = orderTotal <= POLICY.localMaxTotal && !blocked;

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose]);

  const fail = (msg: string) => {
    setError(msg);
    setBusy(false);
  };

  const goPago = () => {
    setError("");
    if (name.trim().length < 2) return fail("Escribe tu nombre.");
    if (!/^(\+?593|0)?9\d{8}$/.test(phone.replace(/[\s-]/g, ""))) return fail("Ingresa un celular válido de Ecuador (09XXXXXXXX).");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("El correo no es válido.");
    if (delivery === "domicilio" && address.trim().length < 8) return fail("Escribe tu dirección completa.");
    setStep("pago");
  };

  const payload = (token?: string) => ({
    customer: { name, phone, email },
    items: orderItems.map((i) => ({ name: i.name, size: i.size, crust: i.crust, ingredients: i.ingredients })),
    delivery,
    address,
    payMethod: method,
    promoCode,
    token,
  });

  const submit = async () => {
    setError("");
    if (method === "online") {
      if (!email) return fail("Necesitamos tu correo para enviarte el comprobante.");
      setBusy(true);
      const { ok, data } = await api<{ id: string; payUrls: PayUrls }>("/api/orders", payload());
      if (!ok) return fail(data.error ?? "No se pudo crear el pedido.");
      resetAll();
      setPayUrls(data.payUrls);
      setStep("enlaces");
      setBusy(false);
      return;
    }
    // Pago en local: primero verificamos el celular con un código por WhatsApp
    setBusy(true);
    const { ok, data } = await api<{ devCode?: string }>("/api/otp/send", { phone });
    if (!ok) {
      if (data.error === "blocked") setBlocked(true), setMethod("online");
      return fail(data.message ?? "No pudimos enviar el código.");
    }
    setDevCode(data.devCode);
    setStep("codigo");
    setBusy(false);
  };

  const verifyAndReserve = async () => {
    setError("");
    setBusy(true);
    const v = await api<{ token: string }>("/api/otp/verify", { phone, code });
    if (!v.ok) return fail(v.data.message ?? "Código incorrecto.");
    const o = await api<{ id: string; existing?: string }>("/api/orders", payload(v.data.token));
    if (!o.ok) {
      if (o.data.existing) return router.push(`/pedido/${o.data.existing}`);
      return fail(o.data.error ?? "No se pudo reservar el pedido.");
    }
    resetAll();
    router.push(`/pedido/${o.data.id}`);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-end bg-black/70 backdrop-blur-sm sm:place-items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Finalizar pedido"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#fbfaf6] p-6 text-stone-900 shadow-2xl sm:rounded-3xl sm:p-8"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            >
              <X size={18} />
            </button>

            <div className="mb-5 flex items-center gap-3">
              {step !== "datos" && step !== "enlaces" && (
                <button
                  type="button"
                  aria-label="Volver"
                  onClick={() => setStep(step === "codigo" ? "pago" : "datos")}
                  className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">
                  {step === "datos" && "Tus datos"}
                  {step === "pago" && "¿Cómo quieres pagar?"}
                  {step === "codigo" && "Verifica tu celular"}
                  {step === "enlaces" && "Completa tu pago"}
                </h2>
                <p className="font-mono text-xs text-stone-500">
                  {orderItems.length} {orderItems.length === 1 ? "pizza" : "pizzas"} · Total {formatPrice(orderTotal)}
                </p>
              </div>
            </div>

            {step === "datos" && (
              <div className="space-y-4">
                <Field label="Nombre">
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
                </Field>
                <Field label="Celular" hint="Lo usamos para avisarte de tu pedido.">
                  <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXX" inputMode="tel" autoComplete="tel" />
                </Field>
                <Field label="Correo" hint="Te enviamos el comprobante con tu ticket.">
                  <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
                </Field>
                {delivery === "domicilio" && (
                  <Field label="Dirección de entrega">
                    <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, referencia" autoComplete="street-address" />
                  </Field>
                )}
                <Primary onClick={goPago}>Continuar</Primary>
              </div>
            )}

            {step === "pago" && (
              <div className="space-y-3">
                <Option
                  active={method === "online"}
                  onClick={() => setMethod("online")}
                  icon={<CreditCard size={20} />}
                  title="Pagar en línea"
                  badge="Recomendado"
                  desc="Con tarjeta o la app PayPhone. Recibes el comprobante por correo al instante y tu pizza entra directo a cocina."
                />
                <Option
                  active={method === "local"}
                  disabled={!localAllowed}
                  onClick={() => localAllowed && setMethod("local")}
                  icon={<Store size={20} />}
                  title="Pagar en el local"
                  desc={
                    blocked
                      ? "No disponible para este celular por pedidos anteriores sin retirar."
                      : orderTotal > POLICY.localMaxTotal
                        ? `Disponible sólo para pedidos de hasta ${formatPrice(POLICY.localMaxTotal)}.`
                        : `Verificamos tu celular con un código por WhatsApp y reservamos tu pedido ${POLICY.localHoldMinutes} min. Empezamos a prepararlo cuando avisas que vas en camino.`
                  }
                />
                {method === "local" && localAllowed && (
                  <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                    Un pedido por celular a la vez. Si no retiras tu pedido en {POLICY.localHoldMinutes} min, tu celular pierde el pago en el local tras {POLICY.maxStrikes} veces.
                  </p>
                )}
                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <Primary onClick={submit} busy={busy}>
                  {method === "online" ? `Pagar ${formatPrice(orderTotal)}` : "Enviar código por WhatsApp"}
                </Primary>
              </div>
            )}

            {step === "codigo" && (
              <div className="space-y-4">
                <p className="flex items-start gap-2 text-sm text-stone-600">
                  <MessageCircle size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                  Te enviamos un código de 6 dígitos por WhatsApp al <b>{phone}</b>.
                </p>
                {devCode && (
                  <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                    Modo desarrollo (WhatsApp sin configurar): tu código es <b className="font-mono">{devCode}</b>
                  </p>
                )}
                <input
                  className={cn(inputCls, "text-center font-mono text-2xl tracking-[0.5em]")}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="······"
                  autoFocus
                />
                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <Primary onClick={verifyAndReserve} busy={busy} disabled={code.length !== 6}>
                  Verificar y reservar
                </Primary>
                <button type="button" onClick={submit} className="w-full text-center text-sm text-stone-500 underline-offset-2 hover:underline">
                  Reenviar código
                </button>
              </div>
            )}

            {step === "enlaces" && (
              <div className="space-y-3">
                <p className="text-sm text-stone-600">
                  Te llevamos a PayPhone para pagar de forma segura. Al terminar volverás aquí y te enviaremos el comprobante a <b>{email}</b>.
                </p>
                {payUrls.card && (
                  <a href={payUrls.card} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-red-700 font-bold text-white transition hover:bg-red-600">
                    <CreditCard size={18} /> Pagar con tarjeta
                  </a>
                )}
                {payUrls.app && (
                  <a href={payUrls.app} className="flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-stone-300 font-bold text-stone-800 transition hover:bg-stone-100">
                    Pagar con la app PayPhone
                  </a>
                )}
                <p className="text-center text-xs text-stone-400">{cat.shop.name} no guarda los datos de tu tarjeta.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Primary({ children, onClick, busy, disabled }: { children: ReactNode; onClick: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-bold text-white shadow-[0_6px_0_-3px_#7f1d1d] transition hover:bg-red-600 active:translate-y-0.5 disabled:opacity-50"
    >
      {busy && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

function Option({
  active,
  disabled,
  onClick,
  icon,
  title,
  desc,
  badge,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full gap-4 rounded-2xl border-2 p-4 text-left transition",
        active ? "border-red-600 bg-red-50/60" : "border-stone-200 hover:border-stone-300",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full", active ? "bg-red-600 text-white" : "bg-stone-100 text-stone-500")}>{icon}</span>
      <span>
        <span className="flex items-center gap-2 font-bold">
          {title}
          {badge && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-700">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-sm text-stone-500">{desc}</span>
      </span>
    </button>
  );
}
