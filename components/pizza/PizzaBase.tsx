/**
 * Base de la pizza en SVG (viewBox 100×100): masa con borde irregular, burbujas y harina,
 * salsa de tomate con orégano y brillos de aceite, y trozos de mozzarella.
 * Todo el "azar" usa una semilla fija: el dibujo es idéntico en servidor y cliente.
 */

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(2);
// sin/cos redondeados: Node y el navegador pueden diferir en la última cifra y eso rompe la hidratación.
const cos = (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6;
const sin = (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6;

/** Contorno orgánico cerrado (Catmull-Rom → Bézier) alrededor de (cx, cy). */
function blobPath(cx: number, cy: number, rad: number, pts: number, rnd: () => number) {
  const P = Array.from({ length: pts }, (_, i) => {
    const a = (i / pts) * Math.PI * 2 + (rnd() - 0.5) * 0.35;
    const r = rad * (0.68 + rnd() * 0.5);
    return [cx + cos(a) * r, cy + sin(a) * r];
  });
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < pts; i++) {
    const p0 = P[(i - 1 + pts) % pts];
    const p1 = P[i];
    const p2 = P[(i + 1) % pts];
    const p3 = P[(i + 2) % pts];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

const r1 = rng(11);
/**
 * Trozos de mozzarella repartidos con "mejor candidato" (sin amontonarse ni dejar huecos),
 * cada uno con tamaño y forma propios.
 */
const CHEESE = (() => {
  const out: { d: string; cx: number; cy: number; rad: number }[] = [];
  const spots: { x: number; y: number; rad: number }[] = [];
  for (let i = 0; i < 17; i++) {
    const rad = 4.6 + r1() * 3.4;
    let best = { x: 50, y: 50, score: -Infinity };
    for (let k = 0; k < 40; k++) {
      const a = r1() * Math.PI * 2;
      const rr = Math.sqrt(r1()) * 33;
      const x = 50 + cos(a) * rr;
      const y = 50 + sin(a) * rr;
      const score = spots.reduce((m, s) => Math.min(m, Math.hypot(s.x - x, s.y - y) - (s.rad + rad)), Infinity);
      if (score > best.score) best = { x, y, score };
    }
    spots.push({ x: best.x, y: best.y, rad });
    out.push({ d: blobPath(best.x, best.y, rad, 9, r1), cx: best.x, cy: best.y, rad });
  }
  return out;
})();

const r2 = rng(23);
/** Burbujas y manchas doradas del borde (posición relativa al grosor del borde). */
const BLISTERS = Array.from({ length: 30 }, () => ({ a: r2() * Math.PI * 2, t: 0.2 + r2() * 0.6, s: 0.7 + r2() * 1.3, dark: r2() > 0.45 }));
const FLOUR = Array.from({ length: 70 }, () => ({ a: r2() * Math.PI * 2, t: r2(), s: 0.15 + r2() * 0.45 }));
const OREGANO = Array.from({ length: 70 }, () => {
  const a = r2() * Math.PI * 2;
  const rr = Math.sqrt(r2()) * 40;
  return { x: 50 + cos(a) * rr, y: 50 + sin(a) * rr, rot: r2() * 180, s: 0.5 + r2() * 0.9, shade: r2() };
});
const OIL = Array.from({ length: 10 }, () => {
  const a = r2() * Math.PI * 2;
  const rr = Math.sqrt(r2()) * 36;
  return { x: 50 + cos(a) * rr, y: 50 + sin(a) * rr, rx: 1.4 + r2() * 2.4, ry: 0.7 + r2() * 1, rot: r2() * 180 };
});
const SCALLOPS = Array.from({ length: 28 }, (_, i) => (i / 28) * Math.PI * 2);
/** Espiral de la salsa (el cucharón al extenderla). */
const SPIRAL = (() => {
  let d = "";
  for (let i = 0; i <= 150; i++) {
    const t = i / 150;
    const a = t * Math.PI * 2 * 3.2;
    const r = 3 + t * 34;
    d += `${i === 0 ? "M" : "L"}${f(50 + cos(a) * r)} ${f(50 + sin(a) * r)}`;
  }
  return d;
})();

export function PizzaBase({ crustWidth, stuffed }: { crustWidth: number; stuffed: boolean }) {
  const outer = 49.2;
  const inner = 50 - crustWidth; // radio de la salsa
  const mid = (outer + inner) / 2;
  const thick = outer - inner;

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <filter id="pb-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
        <filter id="pb-rough-s" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="8" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
        <filter id="pb-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="2" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 1.6 -0.55" />
        </filter>
        <filter id="pb-sauce-tex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="6" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 1.4 -0.45" />
        </filter>
        <filter id="pb-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <filter id="pb-cheese-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.3" dy="0.7" stdDeviation="0.7" floodColor="#5a1a08" floodOpacity="0.45" />
        </filter>

        <radialGradient id="pb-dough" cx="38%" cy="32%" r="80%">
          <stop offset="0" stopColor="#f6e2b6" />
          <stop offset="0.5" stopColor="#e3bd7c" />
          <stop offset="1" stopColor="#bf8a45" />
        </radialGradient>
        <linearGradient id="pb-rim" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor="#fff9e6" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#8a5a22" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="pb-sauce" cx="45%" cy="42%" r="62%">
          <stop offset="0" stopColor="#e0502f" />
          <stop offset="0.65" stopColor="#c23820" />
          <stop offset="1" stopColor="#8e200f" />
        </radialGradient>
        <radialGradient id="pb-cheese" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.55" stopColor="#fbf0d6" />
          <stop offset="1" stopColor="#ecd7a8" />
        </radialGradient>
        <radialGradient id="pb-sheen" cx="30%" cy="24%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#3a1500" stopOpacity="0.22" />
        </radialGradient>
        <clipPath id="pb-disc">
          <circle cx="50" cy="50" r={outer} />
        </clipPath>
        <clipPath id="pb-sauce-clip">
          <circle cx="50" cy="50" r={inner} />
        </clipPath>
      </defs>

      {/* Masa */}
      <g filter="url(#pb-rough)">
        <circle cx="50" cy="50" r={outer} fill="url(#pb-dough)" />
      </g>
      <g clipPath="url(#pb-disc)">
        <rect width="100" height="100" filter="url(#pb-grain)" opacity="0.8" />
        {/* volumen del borde (luz arriba-izquierda, sombra abajo-derecha) */}
        <circle cx="50" cy="50" r={mid} fill="none" stroke="url(#pb-rim)" strokeWidth={thick * 0.95} />
        {stuffed &&
          SCALLOPS.map((a, i) => (
            <ellipse
              key={i}
              cx={50 + cos(a) * (mid + thick * 0.08)}
              cy={50 + sin(a) * (mid + thick * 0.08)}
              rx={thick * 0.34}
              ry={thick * 0.5}
              transform={`rotate(${(a * 180) / Math.PI} ${50 + cos(a) * (mid + thick * 0.08)} ${50 + sin(a) * (mid + thick * 0.08)})`}
              fill="#fff3c6"
              opacity="0.5"
            />
          ))}
        {/* burbujas doradas */}
        {BLISTERS.map((b, i) => {
          const r = inner + thick * b.t;
          return (
            <ellipse
              key={i}
              cx={50 + cos(b.a) * r}
              cy={50 + sin(b.a) * r}
              rx={b.s * (thick / 7)}
              ry={b.s * 0.7 * (thick / 7)}
              transform={`rotate(${(b.a * 180) / Math.PI + 90} ${50 + cos(b.a) * r} ${50 + sin(b.a) * r})`}
              fill={b.dark ? "#c08a45" : "#f8e6bd"}
              opacity={b.dark ? 0.5 : 0.7}
              filter="url(#pb-soft)"
            />
          );
        })}
        {/* harina */}
        {FLOUR.map((fl, i) => {
          const r = inner + thick * fl.t;
          return <circle key={i} cx={50 + cos(fl.a) * r} cy={50 + sin(fl.a) * r} r={fl.s} fill="#fffdf5" opacity="0.7" />;
        })}
      </g>

      {/* Salsa */}
      <g filter="url(#pb-rough-s)">
        <circle cx="50" cy="50" r={inner} fill="url(#pb-sauce)" />
      </g>
      <g clipPath="url(#pb-sauce-clip)">
        <rect width="100" height="100" filter="url(#pb-sauce-tex)" opacity="0.5" />
        <path d={SPIRAL} fill="none" stroke="#ff8a5c" strokeWidth="2.2" opacity="0.16" strokeLinecap="round" filter="url(#pb-soft)" />
        {OIL.map((o, i) => (
          <ellipse key={i} cx={o.x} cy={o.y} rx={o.rx} ry={o.ry} transform={`rotate(${o.rot} ${o.x} ${o.y})`} fill="#ffd9a0" opacity="0.28" />
        ))}
        {OREGANO.map((o, i) => (
          <ellipse key={i} cx={o.x} cy={o.y} rx={o.s} ry={o.s * 0.45} transform={`rotate(${o.rot} ${o.x} ${o.y})`} fill={o.shade > 0.5 ? "#3d5a1f" : "#6b7a2c"} opacity="0.75" />
        ))}
        {/* borde donde la salsa toca la masa */}
        <circle cx="50" cy="50" r={inner} fill="none" stroke="#6e1708" strokeWidth="1.6" opacity="0.35" />
      </g>

      {/* Mozzarella */}
      <g filter="url(#pb-cheese-shadow)">
        {CHEESE.map((c, i) => (
          <g key={i}>
            <path d={c.d} fill="url(#pb-cheese)" stroke="#d9bf8a" strokeWidth="0.35" />
            <ellipse cx={c.cx - c.rad * 0.28} cy={c.cy - c.rad * 0.32} rx={c.rad * 0.34} ry={c.rad * 0.18} transform={`rotate(-30 ${c.cx} ${c.cy})`} fill="#fff" opacity="0.55" filter="url(#pb-soft)" />
          </g>
        ))}
      </g>

      {/* Luz general */}
      <circle cx="50" cy="50" r={outer} fill="url(#pb-sheen)" pointerEvents="none" />
    </svg>
  );
}
