"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, Clock, CreditCard, Loader2, Printer, Store } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { cn } from "@/lib/utils";
import { ReceiptTicket, type PublicOrder } from "@/components/order/ReceiptTicket";

const STEPS = [
  { key: "recibido", label: "Recibido" },
  { key: "en_cocina", label: "En cocina" },
  { key: "listo", label: "Listo" },
  { key: "entregado", label: "Entregado" },
];
const stepIndex = (s: string) => ({ en_cocina: 1, listo: 2, entregado: 3 })[s] ?? 0;
const FINAL = ["entregado", "cancelado", "expirado", "no_show"];

function useCountdown(until?: number) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!until) return setLeft(null);
    const tick = () => setLeft(Math.max(0, until - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [until]);
  if (left === null) return null;
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function OrderPage() {
  const cat = useCatalog();
  const SHOP = cat.shop;
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [missing, setMissing] = useState(false);
  const [flags, setFlags] = useState({ rechazado: false, error: false });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
    if (res.status === 404) return setMissing(true);
    if (res.ok) setOrder(await res.json());
  }, [id]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setFlags({ rechazado: q.has("rechazado"), error: q.has("error") });
    load();
  }, [load]);

  useEffect(() => {
    if (!order || FINAL.includes(order.status)) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [order, load]);

  const countdown = useCountdown(order && ["verificado", "pendiente_pago"].includes(order.status) ? order.expiresAt : undefined);

  const act = async (action: "arrive" | "cancel" | "pay") => {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/orders/${id}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg(data.error ?? "No se pudo completar la acción.");
    if (action === "pay") {
      const url = data.payUrls?.card ?? data.payUrls?.app;
      if (url) window.location.href = url;
      return;
    }
    load();
  };

  if (missing)
    return (
      <Shell name={SHOP.name}>
        <p className="py-20 text-center text-white/60">No encontramos este pedido.</p>
      </Shell>
    );
  if (!order)
    return (
      <Shell name={SHOP.name}>
        <Loader2 className="mx-auto mt-24 animate-spin text-white/50" />
      </Shell>
    );

  const idx = stepIndex(order.status);
  const dead = ["cancelado", "expirado", "no_show"].includes(order.status);

  return (
    <Shell name={SHOP.name}>
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Banner order={order} countdown={countdown} flags={flags} policy={cat.policy} />

          {!dead && order.status !== "pendiente_pago" && (
            <ol className="flex items-center gap-2 print:hidden">
              {STEPS.map((s, i) => (
                <li key={s.key} className="flex flex-1 items-center gap-2">
                  <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors", i <= idx ? "border-orange-500 bg-orange-500 text-white" : "border-white/15 text-white/40")}>
                    {i < idx ? <Check size={14} /> : i + 1}
                  </span>
                  <span className={cn("hidden text-sm sm:block", i <= idx ? "text-white" : "text-white/40")}>{s.label}</span>
                  {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1 rounded", i < idx ? "bg-orange-500" : "bg-white/10")} />}
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-wrap gap-3 print:hidden">
            {order.status === "verificado" && (
              <>
                <button disabled={busy} onClick={() => act("arrive")} className="inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-8 text-lg font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60">
                  <Store size={20} /> Ya voy / Ya llegué
                </button>
                <button disabled={busy} onClick={() => act("cancel")} className="h-14 rounded-full border border-white/15 px-6 text-white/70 transition hover:bg-white/10">
                  Cancelar pedido
                </button>
              </>
            )}
            {order.status === "confirmado" && (
              <button disabled={busy} onClick={() => act("cancel")} className="h-12 rounded-full border border-white/15 px-6 text-white/70 transition hover:bg-white/10">
                Cancelar pedido
              </button>
            )}
            {order.status === "pendiente_pago" && (
              <>
                <button disabled={busy} onClick={() => act("pay")} className="inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-8 font-bold text-white disabled:opacity-60">
                  <CreditCard size={18} /> {flags.rechazado || flags.error ? "Reintentar pago" : "Ir a pagar"}
                </button>
                <button disabled={busy} onClick={() => act("cancel")} className="h-14 rounded-full border border-white/15 px-6 text-white/70 transition hover:bg-white/10">
                  Cancelar
                </button>
              </>
            )}
            <button onClick={() => window.print()} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm text-white/70 transition hover:bg-white/10">
              <Printer size={16} /> Imprimir / guardar PDF
            </button>
          </div>
          {msg && <p className="text-sm text-red-300">{msg}</p>}

          <p className="text-sm text-white/40 print:hidden">
            ¿Dudas? Llámanos al {SHOP.phone}. {SHOP.hours}.
          </p>
        </div>

        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 90, damping: 16 }}>
          <ReceiptTicket order={order} />
        </motion.div>
      </div>
    </Shell>
  );
}

function Shell({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <main className="section py-10 sm:py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white print:hidden">
        <ArrowLeft size={16} /> Volver a {name}
      </Link>
      {children}
    </main>
  );
}

function Banner({ order, countdown, flags, policy: POLICY }: { order: PublicOrder; countdown: string | null; flags: { rechazado: boolean; error: boolean }; policy: { localHoldMinutes: number; maxStrikes: number } }) {
  let tone: "ok" | "warn" | "bad" = "ok";
  let title = "";
  let text = "";

  switch (order.status) {
    case "pagado":
    case "en_cocina":
    case "listo":
    case "entregado":
      title = order.paid ? "¡Pago confirmado!" : "Pedido recibido";
      text = order.email ? `Te enviamos el comprobante con tu ticket a ${order.email}. Tu código de retiro es ${order.code}.` : `Tu código de retiro es ${order.code}.`;
      if (order.status === "listo") (title = "¡Tu pizza está lista!"), (text = `Muestra el código ${order.code} para retirarla.`);
      if (order.status === "entregado") (title = "Pedido entregado"), (text = "¡Buen provecho! Gracias por elegirnos.");
      break;
    case "pendiente_pago":
      tone = "warn";
      title = flags.rechazado ? "El pago no fue aprobado" : flags.error ? "No pudimos confirmar tu pago" : "Falta completar el pago";
      text = `Tu pedido se reserva ${countdown ? `por ${countdown} min` : "unos minutos"}. Si ya pagaste y ves este aviso, espera un momento y recarga.`;
      break;
    case "verificado":
      tone = "warn";
      title = `Pedido reservado · ${countdown ?? ""}`;
      text = `Tu pizza se empieza a preparar cuando toques “Ya voy / Ya llegué”. Si no retiras en ${POLICY.localHoldMinutes} min, la reserva se cancela y, tras ${POLICY.maxStrikes} veces, pierdes el pago en el local.`;
      break;
    case "confirmado":
      title = "¡Te esperamos!";
      text = `Ya avisaste tu llegada: pronto empezamos tu pizza. Paga ${order.code} en el local al retirarla.`;
      break;
    case "expirado":
      tone = "bad";
      title = "La reserva venció";
      text = "No se completó a tiempo. Puedes hacer un nuevo pedido; pagar en línea evita este límite.";
      break;
    case "cancelado":
      tone = "bad";
      title = "Pedido cancelado";
      text = "Este pedido fue cancelado.";
      break;
    case "no_show":
      tone = "bad";
      title = "Pedido no retirado";
      text = "Registramos que no pasaste a retirarlo.";
      break;
  }
  const Icon = tone === "ok" ? Check : tone === "warn" ? Clock : AlertTriangle;
  return (
    <div className={cn("flex gap-4 rounded-3xl border p-6 print:hidden", tone === "ok" && "border-emerald-400/30 bg-emerald-400/10", tone === "warn" && "border-amber-400/30 bg-amber-400/10", tone === "bad" && "border-red-400/30 bg-red-400/10")}>
      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", tone === "ok" && "bg-emerald-500", tone === "warn" && "bg-amber-500", tone === "bad" && "bg-red-500")}>
        <Icon size={22} className="text-white" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
        <p className="mt-1 text-white/65">{text}</p>
      </div>
    </div>
  );
}
