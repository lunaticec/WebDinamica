import { notFound } from "next/navigation";

/** Pasarela de pago SIMULADA. Sólo existe en desarrollo y sin credenciales de PayPhone. */
export default async function MockPay({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  if (process.env.NODE_ENV === "production" || process.env.PAYPHONE_TOKEN) notFound();
  const { o = "" } = await searchParams;
  return (
    <main className="section grid min-h-[80svh] place-items-center py-20">
      <div className="w-full max-w-md rounded-3xl bg-[#fbfaf6] p-8 text-center text-stone-900 shadow-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber-700">Simulación · sin cobro real</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold">PayPhone (modo prueba)</h1>
        <p className="mt-2 text-sm text-stone-500">Así se vería la pasarela. Configura PAYPHONE_TOKEN y PAYPHONE_STORE_ID para cobrar de verdad.</p>
        <a href={`/api/payphone/return?id=0&clientTransactionId=${encodeURIComponent(o)}&mock=1`} className="mt-8 flex h-14 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500">
          Simular pago aprobado
        </a>
        <a href={`/pedido/${encodeURIComponent(o)}?cancelado=1`} className="mt-3 flex h-12 items-center justify-center rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100">
          Cancelar
        </a>
      </div>
    </main>
  );
}
