import type { ShapeId } from "@/lib/pizza";

/** Dibujo vectorial de cada ingrediente (viewBox 40x40). */
export function Topping({ shape, className }: { shape: ShapeId; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {DRAW[shape]}
    </svg>
  );
}

const DRAW: Record<ShapeId, React.ReactNode> = {
  pepperoni: (
    <>
      <circle cx="20" cy="20" r="17" fill="#c23a2b" />
      <circle cx="20" cy="20" r="17" fill="none" stroke="#8f2418" strokeWidth="2" />
      <circle cx="14" cy="15" r="2.4" fill="#9c2a1c" />
      <circle cx="25" cy="14" r="2" fill="#9c2a1c" />
      <circle cx="26" cy="25" r="2.6" fill="#9c2a1c" />
      <circle cx="14" cy="26" r="2" fill="#9c2a1c" />
      <circle cx="20" cy="21" r="1.6" fill="#9c2a1c" />
    </>
  ),
  jamon: (
    <>
      <path d="M5 14 Q8 5 20 6 Q34 6 35 18 Q36 32 22 34 Q8 36 5 24Z" fill="#f4a9a3" />
      <path d="M10 14 Q16 10 22 14 M12 24 Q20 20 30 25" stroke="#e58b86" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  tocino: (
    <>
      <path d="M3 22 Q10 6 20 20 T37 18" stroke="#a8432c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M3 22 Q10 6 20 20 T37 18" stroke="#e8a58f" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  champinon: (
    <>
      <path d="M6 22 Q6 6 20 6 Q34 6 34 22Z" fill="#e9dcc3" />
      <path d="M6 22 Q6 24 8 24 H32 Q34 24 34 22" fill="#d6c5a3" />
      <rect x="15" y="22" width="10" height="13" rx="4" fill="#f3e9d4" />
      <circle cx="14" cy="14" r="2" fill="#d2bf99" />
      <circle cx="26" cy="13" r="1.6" fill="#d2bf99" />
    </>
  ),
  pimiento: (
    <path d="M5 29 Q20 -2 35 29" stroke="#3f9e4a" strokeWidth="7" fill="none" strokeLinecap="round" />
  ),
  cebolla: (
    <>
      <circle cx="20" cy="20" r="14" fill="none" stroke="#e4c8ee" strokeWidth="3" opacity=".85" />
      <circle cx="20" cy="20" r="8.5" fill="none" stroke="#d3aee2" strokeWidth="2.2" opacity=".85" />
    </>
  ),
  aceituna: <circle cx="20" cy="20" r="11" fill="none" stroke="#23232b" strokeWidth="8" />,
  tomate: (
    <>
      <circle cx="20" cy="20" r="16" fill="#e5463a" />
      <circle cx="20" cy="20" r="11.5" fill="#f26b5d" />
      <circle cx="15" cy="17" r="1.6" fill="#ffd9a0" />
      <circle cx="25" cy="17" r="1.6" fill="#ffd9a0" />
      <circle cx="20" cy="25" r="1.6" fill="#ffd9a0" />
    </>
  ),
  pina: (
    <>
      <path d="M3 30 L20 5 L37 30 Q20 39 3 30Z" fill="#f8d548" stroke="#dcae1c" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 24 L20 14 M27 24 L20 14" stroke="#e9bb2a" strokeWidth="1.5" />
    </>
  ),
  maiz: <ellipse cx="20" cy="20" rx="13" ry="17" fill="#ffd23f" stroke="#e5ab12" strokeWidth="3" />,
  pollo: (
    <>
      <path d="M6 16 Q8 5 20 6 Q34 6 35 19 Q35 32 21 34 Q7 33 6 16Z" fill="#f1c97a" stroke="#d9a94a" strokeWidth="2" />
      <path d="M12 16 Q18 12 26 16 M13 24 Q20 21 28 25" stroke="#e0b05a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
  salchicha: (
    <>
      <circle cx="20" cy="20" r="16" fill="#a4452f" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="#7d2f1e" strokeWidth="2" />
      <circle cx="14" cy="15" r="2" fill="#e8a58c" />
      <circle cx="25" cy="17" r="1.6" fill="#e8a58c" />
      <circle cx="19" cy="26" r="2" fill="#e8a58c" />
    </>
  ),
  jalapeno: (
    <>
      <circle cx="20" cy="20" r="14" fill="#5aa83a" />
      <circle cx="20" cy="20" r="9" fill="#cfe8a4" />
      <circle cx="17" cy="19" r="1.4" fill="#f5f9e4" />
      <circle cx="23" cy="21" r="1.4" fill="#f5f9e4" />
      <circle cx="20" cy="24" r="1.4" fill="#f5f9e4" />
    </>
  ),
  queso: (
    <>
      <path d="M5 28 L16 7 L35 22 L33 31 Z" fill="#ffd45a" stroke="#e0a91c" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="18" cy="20" r="2.4" fill="#f0b82a" />
      <circle cx="26" cy="25" r="1.8" fill="#f0b82a" />
      <circle cx="13" cy="26" r="1.5" fill="#f0b82a" />
    </>
  ),
  albahaca: (
    <>
      <path d="M20 37 C3 29 5 10 20 3 C35 10 37 29 20 37Z" fill="#2f8c3e" />
      <path d="M20 36 V9 M20 18 L12 13 M20 24 L28 18" stroke="#58b865" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
};
