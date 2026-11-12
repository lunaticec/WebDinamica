"use client";

import { Ban, ChefHat, Check, Clock, LogOut, PackageCheck, Play, UserX, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { describeItem } from "@/lib/pizza";
import { cn, formatPrice } from "@/lib/utils";
import type { Order, PhoneRecord } from "@/lib/server/types";

type Data = { orders: Order[]; phones: PhoneRecord[] };

const minutes = (ms: number) => Math.max(0, Math.round(ms / 60000));

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (res.status === 401) return setAuthed(false);
    setData(await res.json());
    setAuthed(true);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const login = async () => {
    setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error ?? "Error");
    setPw("");
    load();
  };

  const act = async (id: string, action: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    if (!res.ok) alert((await res.json().catch(() => ({}))).error ?? "No se pudo");
    load();
  };

  const phoneAct = async (phone: string, action: "block" | "unblock") => {
    await fetch("/api/admin/phones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, action }) });
    load();
  };

  if (authed === null) return <main className="section py-24 text-white/50">Cargando…</main>;

  if (!authed)
    return (
      <main className="section grid min-h-[80svh] place-items-center">
        <form onSubmit={(e) => (e.preventDefault(), login())} className="glass w-full max-w-sm space-y-4 rounded-3xl p-8">
          <h1 className="font-display text-3xl font-semibold">Panel del local</h1>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Contraseña" className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-orange-400" autoFocus />
          {err && <p className="text-sm text-red-300">{err}</p>}
          <button className="h-12 w-full rounded-xl bg-orange-500 font-bold text-white hover:bg-orange-400">Entrar</button>
        </form>
      </main>
    );

  const orders = data?.orders ?? [];
  const by = (...s: string[]) => orders.filter((o) => s.includes(o.status));
  const columns: { title: string; icon: React.ReactNode; list: Order[]; hint?: string }[] = [
    { title: "Por cocinar", icon: <ChefHat size={18} />, list: by("pagado", "confirmado"), hint: "Pagados en línea o clientes que avisaron que van en camino" },
    { title: "Esperando al cliente", icon: <Clock size={18} />, list: by("verificado"), hint: "Pago en local, celular verificado. No cocines hasta que avisen." },
    { title: "En cocina", icon: <Play size={18} />, list: by("en_cocina") },
    { title: "Listos", icon: <PackageCheck size={18} />, list: by("listo") },
  ];
  const history = orders.filter((o) => ["entregado", "cancelado", "expirado", "no_show"].includes(o.status)).slice(0, 15);

  return (
    <main className="section py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-semibold">Pedidos</h1>
        <button onClick={async () => (await fetch("/api/admin/login", { method: "DELETE" }), setAuthed(false))} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
          <LogOut size={15} /> Salir
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {columns.map((c) => (
          <section key={c.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              {c.icon} {c.title} <span className="ml-auto rounded-full bg-white/10 px-2.5 font-mono text-sm">{c.list.length}</span>
            </h2>
            {c.hint && <p className="mb-3 mt-1 text-xs text-white/40">{c.hint}</p>}
            <div className="mt-3 space-y-3">
              {c.list.length === 0 && <p className="py-6 text-center text-sm text-white/30">Sin pedidos</p>}
              {c.list.map((o) => (
                <OrderCard key={o.id} o={o} now={now} act={act} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-3 font-display text-xl font-semibold">Historial reciente</h2>
          <ul className="divide-y divide-white/10 text-sm">
            {history.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <span><b>{o.code}</b> · {o.customer.name}</span>
                <span className="flex items-center gap-3 text-white/50">
                  {formatPrice(o.totalCents / 100)}
                  <span className={cn("rounded-full px-2 py-0.5 text-xs", o.status === "entregado" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300")}>{o.status}</span>
                </span>
              </li>
            ))}
            {history.length === 0 && <li className="py-4 text-white/30">Aún no hay historial.</li>}
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold"><UserX size={18} /> Celulares con plantones</h2>
          <p className="mb-3 text-xs text-white/40">Bloqueados = no pueden pagar en el local, sólo en línea.</p>
          <ul className="divide-y divide-white/10 text-sm">
            {(data?.phones ?? []).map((p) => (
              <li key={p.phone} className="flex items-center justify-between gap-3 py-2">
                <span className="font-mono">{p.phone}</span>
                <span className="flex items-center gap-3">
                  <span className="text-white/50">{p.strikes} plantón(es)</span>
                  {p.blocked ? (
                    <button onClick={() => phoneAct(p.phone, "unblock")} className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">Desbloquear</button>
                  ) : (
                    <button onClick={() => phoneAct(p.phone, "block")} className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">Bloquear</button>
                  )}
                </span>
              </li>
            ))}
            {(data?.phones ?? []).length === 0 && <li className="py-4 text-white/30">Ninguno. 🎉</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}

function OrderCard({ o, now, act }: { o: Order; now: number; act: (id: string, a: string) => void }) {
  const waiting = o.status === "verificado";
  return (
    <article className="rounded-2xl bg-white/[0.05] p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-lg font-bold text-orange-300">{o.code}</p>
          <p className="text-sm">{o.customer.name} · <span className="text-white/50">{o.customer.phone}</span></p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] uppercase", o.paid ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
          {o.paid ? "Pagado" : "Cobrar en local"}
        </span>
      </header>
      <ul className="mt-2 space-y-1 text-sm text-white/70">
        {o.items.map((it) => {
          const d = describeItem(it);
          return <li key={it.uid}>🍕 {d.size} · {d.tops}</li>;
        })}
      </ul>
      <p className="mt-2 text-xs text-white/40">
        {o.delivery === "domicilio" ? `A domicilio: ${o.address}` : "Retiro en tienda"} · <b className="text-white/70">{formatPrice(o.totalCents / 100)}</b>
      </p>
      {waiting && o.expiresAt && <p className="mt-1 text-xs text-amber-300">Vence en {minutes(o.expiresAt - now)} min</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {["pagado", "confirmado", "verificado"].includes(o.status) && (
          <Btn onClick={() => act(o.id, "iniciar")} tone="orange"><Play size={14} /> {waiting ? "Cocinar igual" : "A cocina"}</Btn>
        )}
        {o.status === "en_cocina" && <Btn onClick={() => act(o.id, "listo")} tone="orange"><Check size={14} /> Listo</Btn>}
        {["listo", "en_cocina"].includes(o.status) && (
          <Btn onClick={() => act(o.id, "entregado")} tone="green"><PackageCheck size={14} /> Entregado{!o.paid && " y cobrado"}</Btn>
        )}
        {o.payMethod === "local" && ["verificado", "confirmado", "en_cocina", "listo"].includes(o.status) && (
          <Btn onClick={() => confirm("¿No se presentó? Se le sumará un plantón al celular.") && act(o.id, "no_show")} tone="red"><Ban size={14} /> No se presentó</Btn>
        )}
        <Btn onClick={() => confirm("¿Cancelar este pedido?") && act(o.id, "cancelar")} tone="ghost"><X size={14} /></Btn>
      </div>
    </article>
  );
}

function Btn({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone: "orange" | "green" | "red" | "ghost" }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition", tone === "orange" && "bg-orange-500 text-white hover:bg-orange-400", tone === "green" && "bg-emerald-600 text-white hover:bg-emerald-500", tone === "red" && "bg-red-500/20 text-red-300 hover:bg-red-500/30", tone === "ghost" && "border border-white/15 text-white/60 hover:bg-white/10")}>
      {children}
    </button>
  );
}
