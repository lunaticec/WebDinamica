import type { ShapeId } from "@/lib/pizza";

/** Dibujo vectorial de cada ingrediente (viewBox 40×40) con volumen, brillos y detalles. */
export function Topping({ shape, className, flip }: { shape: ShapeId; className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      {DRAW[shape]}
    </svg>
  );
}

const DRAW: Record<ShapeId, React.ReactNode> = {
  /* ---------- Pepperoni: borde ligeramente curvado, grasa y brillo ---------- */
  pepperoni: (
    <>
      <defs>
        <radialGradient id="tp-pep" cx="40%" cy="36%" r="72%">
          <stop offset="0" stopColor="#e2583f" />
          <stop offset="0.6" stopColor="#bb3322" />
          <stop offset="1" stopColor="#85190f" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="20" rx="17.200" ry="16.600" fill="url(#tp-pep)" />
      <ellipse cx="20" cy="20" rx="17.200" ry="16.600" fill="none" stroke="#7a160c" strokeWidth="1" opacity="0.7" />
      <ellipse cx="20" cy="20" rx="14.800" ry="14.200" fill="none" stroke="#f08a52" strokeWidth="1.200" opacity="0.5" />
      <g fill="#eaa795" opacity="0.6">
        <ellipse cx="13" cy="14" rx="2.4" ry="1.6" />
        <ellipse cx="25.5" cy="12.5" rx="1.8" ry="1.2" />
        <ellipse cx="27" cy="24" rx="2.5" ry="1.7" />
        <ellipse cx="14" cy="27" rx="1.7" ry="1.2" />
        <ellipse cx="21" cy="20" rx="1.4" ry="1" />
      </g>
      <g fill="#6d120a" opacity="0.55">
        <circle cx="18" cy="11" r="0.9" />
        <circle cx="29" cy="18" r="0.8" />
        <circle cx="20" cy="29" r="1" />
        <circle cx="10" cy="21" r="0.8" />
      </g>
      <ellipse cx="14.5" cy="11.5" rx="7" ry="3" transform="rotate(-32 14.5 11.5)" fill="#fff" opacity="0.2" />
    </>
  ),

  /* ---------- Jamón: lámina rosada doblada ---------- */
  jamon: (
    <>
      <defs>
        <linearGradient id="tp-ham" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fbc7bd" />
          <stop offset="0.55" stopColor="#f0a39b" />
          <stop offset="1" stopColor="#dc8079" />
        </linearGradient>
      </defs>
      <path d="M5.5 15C6.8 7.2 13 4.6 20.5 5.3c8 .8 14.4 3.4 14.7 11.5.3 7.6-2.4 14.2-9.8 16.8-8.4 3-17.6 1.4-19.6-7.4-.6-2.6-.5-5.5.2-8.2z" fill="url(#tp-ham)" />
      <path d="M5.5 15C6.8 7.2 13 4.6 20.5 5.3c8 .8 14.4 3.4 14.7 11.5.3 7.6-2.4 14.2-9.8 16.8-8.4 3-17.6 1.4-19.6-7.4-.6-2.6-.5-5.5.2-8.2z" fill="none" stroke="#fbd9d2" strokeWidth="1.3" opacity="0.7" />
      <path d="M9 17c5-3.6 10.5-3.8 16 0" fill="none" stroke="#c96f69" strokeWidth="1.2" opacity="0.45" strokeLinecap="round" />
      <path d="M11 25c6 3 12 2.4 18-2" fill="none" stroke="#c96f69" strokeWidth="1.1" opacity="0.4" strokeLinecap="round" />
      <path d="M12 12c4-2 9-2 13 .5" fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.35" strokeLinecap="round" />
    </>
  ),

  /* ---------- Tocino: veta de grasa y carne, borde crujiente ---------- */
  tocino: (
    <>
      <path d="M8.500 21.500C11 9 15.500 8 20 19s9 4.500 11.500-4" fill="none" stroke="#7a2e18" strokeWidth="10.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.500 21.500C11 9 15.500 8 20 19s9 4.500 11.500-4" fill="none" stroke="#bf5a3b" strokeWidth="8.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.500 21.500C11 9 15.500 8 20 19s9 4.500 11.500-4" fill="none" stroke="#f3d3bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.500 21.500C11 9 15.500 8 20 19s9 4.500 11.500-4" fill="none" stroke="#fff3ea" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <path d="M9 19.500C11 8.500 15 7.500 19 16" fill="none" stroke="#e08a63" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </>
  ),

  /* ---------- Champiñón: corte transversal con laminillas ---------- */
  champinon: (
    <>
      <defs>
        <linearGradient id="tp-mcap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c3a0" />
          <stop offset="0.5" stopColor="#f4eadb" />
          <stop offset="1" stopColor="#e6d6b8" />
        </linearGradient>
        <linearGradient id="tp-mstem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8c6a3" />
          <stop offset="0.45" stopColor="#f7eedd" />
          <stop offset="1" stopColor="#dccaa8" />
        </linearGradient>
      </defs>
      <path d="M14.5 23c-.6 5-.2 9.2 1.4 12.4 1.2 1.6 6.8 1.6 8.2 0 1.6-3.2 2-7.4 1.4-12.4z" fill="url(#tp-mstem)" stroke="#b79a6a" strokeWidth="0.7" />
      <path d="M3.4 22.5C3.4 11.5 10.6 4 20 4s16.6 7.5 16.6 18.5c0 1.4-3 2.4-6.4 2.6-3.4.2-6.6-.8-10.2-.8s-6.8 1-10.2.8c-3.4-.2-6.4-1.2-6.4-2.6z" fill="url(#tp-mcap)" stroke="#b79a6a" strokeWidth="0.8" />
      <path d="M5 21c1.6-8 7-13.4 15-13.4S33.4 13 35 21" fill="none" stroke="#c9ad7e" strokeWidth="1.8" opacity="0.55" strokeLinecap="round" />
      <path d="M9 24c3 1.2 6 .2 11 .2s8 1 11-.2" fill="none" stroke="#9c7d4c" strokeWidth="1" opacity="0.6" />
      <g stroke="#b8975f" strokeWidth="0.6" opacity="0.5">
        <path d="M10 24.5l-.4 2M14 24.8l-.2 2M26 24.8l.2 2M30 24.5l.4 2" />
      </g>
      <ellipse cx="14" cy="10" rx="6" ry="2.2" transform="rotate(-24 14 10)" fill="#fff" opacity="0.4" />
    </>
  ),

  /* ---------- Pimiento: tira curvada con interior claro ---------- */
  pimiento: (
    <>
      <path d="M4.5 30C8 8 32 8 35.5 30" fill="none" stroke="#1f6e2c" strokeWidth="8.2" strokeLinecap="round" />
      <path d="M4.5 30C8 8 32 8 35.5 30" fill="none" stroke="#3fa443" strokeWidth="6.2" strokeLinecap="round" />
      <path d="M4.5 30C8 8 32 8 35.5 30" fill="none" stroke="#9fdc86" strokeWidth="1.8" strokeLinecap="round" transform="translate(0 1.6)" opacity="0.85" />
      <path d="M7 24C11 12 21 9 29 13" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </>
  ),

  /* ---------- Cebolla: aros translúcidos concéntricos ---------- */
  cebolla: (
    <>
      <circle cx="20" cy="20" r="14.6" fill="none" stroke="#c9a1d6" strokeWidth="3.4" opacity="0.55" />
      <circle cx="20" cy="20" r="14.6" fill="none" stroke="#f6ecf8" strokeWidth="1.8" opacity="0.95" strokeDasharray="38 7" strokeLinecap="round" />
      <circle cx="20" cy="20" r="9.8" fill="none" stroke="#c9a1d6" strokeWidth="2.6" opacity="0.5" />
      <circle cx="20" cy="20" r="9.8" fill="none" stroke="#f2e4f5" strokeWidth="1.3" opacity="0.9" strokeDasharray="24 6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="5.2" fill="none" stroke="#e5cbed" strokeWidth="1.6" opacity="0.85" />
      <path d="M9 14a12 12 0 0 1 9-6" fill="none" stroke="#fff" strokeWidth="1.1" opacity="0.7" strokeLinecap="round" />
    </>
  ),

  /* ---------- Aceituna negra: rodaja con hueco ---------- */
  aceituna: (
    <>
      <defs>
        <radialGradient id="tp-olive" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#4a4a52" />
          <stop offset="0.5" stopColor="#25252c" />
          <stop offset="1" stopColor="#0d0d11" />
        </radialGradient>
      </defs>
      <path fillRule="evenodd" d="M20 5.6c8 0 14.4 6.4 14.4 14.4S28 34.4 20 34.4 5.6 28 5.6 20 12 5.6 20 5.6zm0 9.6a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6z" fill="url(#tp-olive)" />
      <circle cx="20" cy="20" r="5.4" fill="none" stroke="#5b4f3e" strokeWidth="0.9" opacity="0.7" />
      <path d="M9 14.5a12 12 0 0 1 8-7" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <path d="M31 27a12 12 0 0 1-6 6" fill="none" stroke="#6a6a72" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    </>
  ),

  /* ---------- Tomate: rodaja con gajos y semillas ---------- */
  tomate: (
    <>
      <defs>
        <radialGradient id="tp-tom" cx="50%" cy="48%" r="60%">
          <stop offset="0" stopColor="#f88c7c" />
          <stop offset="0.7" stopColor="#ec5645" />
          <stop offset="1" stopColor="#d23a2b" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="16.6" fill="#b92b1d" />
      <circle cx="20" cy="20" r="15" fill="url(#tp-tom)" />
      <g fill="#fbd6c6" opacity="0.8">
        <path d="M20 20L20 8.4a11.6 11.6 0 0 1 8.2 3.4z" opacity="0.5" />
        <path d="M20 20L31.6 20a11.6 11.6 0 0 1-3.4 8.2z" opacity="0.5" />
        <path d="M20 20L20 31.6a11.6 11.6 0 0 1-8.2-3.4z" opacity="0.5" />
        <path d="M20 20L8.4 20a11.6 11.6 0 0 1 3.4-8.2z" opacity="0.5" />
      </g>
      <g stroke="#f9ddd0" strokeWidth="1.1" opacity="0.9">
        <path d="M20 20V8.6M20 20h11.4M20 20v11.4M20 20H8.6" />
      </g>
      <g fill="#f7e29a">
        <ellipse cx="24.4" cy="14.4" rx="1.3" ry="0.8" transform="rotate(40 24.4 14.4)" />
        <ellipse cx="26" cy="25" rx="1.3" ry="0.8" transform="rotate(-30 26 25)" />
        <ellipse cx="15.6" cy="26" rx="1.3" ry="0.8" transform="rotate(35 15.6 26)" />
        <ellipse cx="14" cy="15" rx="1.3" ry="0.8" transform="rotate(-35 14 15)" />
      </g>
      <circle cx="20" cy="20" r="2.4" fill="#fdeee3" />
      <path d="M8 13a14 14 0 0 1 10-7" fill="none" stroke="#fff" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
    </>
  ),

  /* ---------- Piña: trozo con marcas de plancha ---------- */
  pina: (
    <>
      <defs>
        <linearGradient id="tp-pine" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fdeb86" />
          <stop offset="0.6" stopColor="#f6cf45" />
          <stop offset="1" stopColor="#e0a824" />
        </linearGradient>
      </defs>
      <path d="M3.4 30.4 18.6 5.4c.7-1 2.1-1 2.8 0L36.6 30.4c1 3.2-2 5.6-5.4 5.4-6.8-.5-15.6-.5-22.4 0-3.4.2-6.4-2.2-5.4-5.4z" fill="url(#tp-pine)" stroke="#d29a1c" strokeWidth="1.2" strokeLinejoin="round" />
      <g stroke="#a8641a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
        <path d="M12 28l8-13M18 30.5l8-13" />
      </g>
      <g stroke="#e8b72c" strokeWidth="0.9" opacity="0.8">
        <path d="M14 20l4 9M20 14l5 11M26 22l3 6" />
      </g>
      <path d="M8 29c4-8 8-15 11-20" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    </>
  ),

  /* ---------- Maíz: grano brillante ---------- */
  maiz: (
    <>
      <defs>
        <radialGradient id="tp-corn" cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff0a0" />
          <stop offset="0.55" stopColor="#fbcf2c" />
          <stop offset="1" stopColor="#d99a0b" />
        </radialGradient>
      </defs>
      <path d="M20 3.5c7 0 12.4 6.6 12.4 14.4 0 6.4-3 11.4-5.4 14.6-1.4 1.8-2.6 3.4-7 3.4s-5.6-1.6-7-3.4C10.6 29.300 7.6 24.300 7.600 17.900 7.600 10.100 13 3.500 20 3.500z" fill="url(#tp-corn)" stroke="#c98d0a" strokeWidth="1.2" />
      <path d="M14 32.500c1.800 1.600 10.200 1.600 12 0" fill="none" stroke="#a96f08" strokeWidth="1.800" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="15.500" cy="11.500" rx="3.200" ry="5" transform="rotate(18 15.500 11.500)" fill="#fff" opacity="0.55" />
    </>
  ),

  /* ---------- Albahaca: hoja con nervaduras ---------- */
  albahaca: (
    <>
      <defs>
        <linearGradient id="tp-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4aa84f" />
          <stop offset="0.6" stopColor="#2d8638" />
          <stop offset="1" stopColor="#1b5e27" />
        </linearGradient>
      </defs>
      <path d="M20 37.500C5 31 3.500 14 20 2.800c16.500 11.200 15 28.200 0 34.700z" fill="url(#tp-leaf)" stroke="#17501f" strokeWidth="0.8" />
      <path d="M20 36V6" stroke="#9bd88f" strokeWidth="1.500" strokeLinecap="round" />
      <g stroke="#7fc277" strokeWidth="1" strokeLinecap="round" opacity="0.9">
        <path d="M20 14l-7-4M20 14l7-4M20 21l-9-4.500M20 21l9-4.500M20 28l-7-3.500M20 28l7-3.500" />
      </g>
      <path d="M11 22C10 15 13 9 19 5.500" fill="none" stroke="#fff" strokeWidth="1.100" opacity="0.28" strokeLinecap="round" />
    </>
  ),

  /* ---------- Pollo: trozo a la plancha ---------- */
  pollo: (
    <>
      <defs>
        <linearGradient id="tp-chick" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#fbe3b2" />
          <stop offset="0.55" stopColor="#efc47e" />
          <stop offset="1" stopColor="#d49a4a" />
        </linearGradient>
      </defs>
      <path d="M6 15.500C7 8 13 5 20.500 5.500 29 6 35 9.500 35.200 18c.2 8-3.200 14.200-11 15.800C15.500 35.500 6.800 31 6 22.500c-.2-2.500 0-5 0-7z" fill="url(#tp-chick)" stroke="#bf8638" strokeWidth="1" />
      <g stroke="#8c5a1d" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M12 14l8 4M13 22l9 4.500M22 11l7 3" />
      </g>
      <g stroke="#fff3da" strokeWidth="0.800" opacity="0.7" strokeLinecap="round">
        <path d="M10 18c4 1 8 0 12-2M12 27c5 1 10 0 14-3" />
      </g>
      <ellipse cx="14" cy="10.500" rx="5" ry="2.200" transform="rotate(-25 14 10.500)" fill="#fff" opacity="0.35" />
    </>
  ),

  /* ---------- Salchicha / chorizo: rodaja con grasa ---------- */
  salchicha: (
    <>
      <defs>
        <radialGradient id="tp-sau" cx="40%" cy="36%" r="72%">
          <stop offset="0" stopColor="#c8603f" />
          <stop offset="0.65" stopColor="#9c3a24" />
          <stop offset="1" stopColor="#6c2314" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="16.600" fill="url(#tp-sau)" />
      <circle cx="20" cy="20" r="16.600" fill="none" stroke="#c9795a" strokeWidth="1.300" opacity="0.6" />
      <g fill="#f0c4a8" opacity="0.8">
        <circle cx="13.500" cy="14" r="1.700" />
        <circle cx="25" cy="13" r="1.300" />
        <circle cx="27.500" cy="22.500" r="1.800" />
        <circle cx="19" cy="27" r="1.500" />
        <circle cx="12.500" cy="24" r="1.100" />
        <circle cx="21" cy="19" r="1.200" />
      </g>
      <ellipse cx="14.500" cy="11" rx="6.500" ry="2.600" transform="rotate(-30 14.500 11)" fill="#fff" opacity="0.22" />
    </>
  ),

  /* ---------- Jalapeño: rodaja con semillas ---------- */
  jalapeno: (
    <>
      <defs>
        <radialGradient id="tp-jal" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#82cf55" />
          <stop offset="1" stopColor="#3a8426" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="15.400" fill="url(#tp-jal)" stroke="#2c6a1c" strokeWidth="1" />
      <circle cx="20" cy="20" r="10.800" fill="#e3f1bb" />
      <circle cx="20" cy="20" r="10.800" fill="none" stroke="#a9d173" strokeWidth="1.200" />
      <g stroke="#bcdc8c" strokeWidth="1">
        <path d="M20 20V9.500M20 20l9 5.300M20 20l-9 5.300" />
      </g>
      <g fill="#fffbd6">
        <ellipse cx="16" cy="16" rx="1.600" ry="1" transform="rotate(30 16 16)" />
        <ellipse cx="24.500" cy="16.500" rx="1.600" ry="1" transform="rotate(-30 24.500 16.500)" />
        <ellipse cx="20" cy="26" rx="1.600" ry="1" />
        <ellipse cx="14" cy="22.500" rx="1.400" ry="0.900" transform="rotate(-20 14 22.500)" />
        <ellipse cx="26.500" cy="23" rx="1.400" ry="0.900" transform="rotate(20 26.500 23)" />
      </g>
      <path d="M8 14a13 13 0 0 1 9-7" fill="none" stroke="#fff" strokeWidth="1.300" opacity="0.4" strokeLinecap="round" />
    </>
  ),

  /* ---------- Queso extra: virutas de mozzarella / cheddar ---------- */
  queso: (
    <>
      <defs>
        <linearGradient id="tp-ch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="1" stopColor="#f3cf63" />
        </linearGradient>
      </defs>
      <g fill="url(#tp-ch)" stroke="#d8ad3a" strokeWidth="0.700">
        <rect x="4" y="9" width="17" height="5.200" rx="2.600" transform="rotate(-18 12.500 11.600)" />
        <rect x="18" y="6" width="17" height="5.200" rx="2.600" transform="rotate(24 26.500 8.600)" />
        <rect x="6" y="19" width="19" height="5.600" rx="2.800" transform="rotate(12 15.500 21.800)" />
        <rect x="19" y="23" width="16" height="5.200" rx="2.600" transform="rotate(-22 27 25.600)" />
        <rect x="9" y="29" width="15" height="4.800" rx="2.400" transform="rotate(8 16.500 31.400)" />
      </g>
      <g stroke="#fff" strokeWidth="1" opacity="0.65" strokeLinecap="round">
        <path d="M6 11.500l10-3M22 8.800l9 3.500M8 21l12 2M22 25l8-3" />
      </g>
    </>
  ),
};
