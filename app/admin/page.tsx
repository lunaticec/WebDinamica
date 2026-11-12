"use client";

import { LogOut, Settings2, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CatalogEditor } from "@/components/admin/CatalogEditor";
import { OrdersView } from "@/components/admin/OrdersView";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"pedidos" | "config">("pedidos");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" }).then((r) => setAuthed(r.ok));
  }, []);
  const onUnauth = useCallback(() => setAuthed(false), []);

  const login = async () => {
    setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error ?? "Error");
    setPw("");
    setAuthed(true);
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

  return (
    <main className="section py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
          {(
            [
              { id: "pedidos", label: "Pedidos", icon: <Store size={16} /> },
              { id: "config", label: "Menú, precios y promociones", icon: <Settings2 size={16} /> },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition", tab === t.id ? "bg-orange-500 text-white" : "text-white/60 hover:text-white")}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">Ver la web ↗</a>
          <button
            onClick={async () => (await fetch("/api/admin/login", { method: "DELETE" }), setAuthed(false))}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut size={15} /> Salir
          </button>
        </div>
      </div>

      {tab === "pedidos" ? <OrdersView onUnauth={onUnauth} /> : <CatalogEditor onUnauth={onUnauth} />}
    </main>
  );
}
