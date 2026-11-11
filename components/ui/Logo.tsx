export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#ff5a1e,#ffc83d,#e11d2e,#ff5a1e)] blur-[6px] opacity-70" />
      <span className="absolute inset-[2px] rounded-full bg-ink-950" />
      <span className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.6)]" />
    </span>
  );
}
