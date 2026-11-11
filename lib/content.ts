import {
  Boxes,
  Cpu,
  Fingerprint,
  Gauge,
  Layers,
  Orbit,
  Sparkles,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Producto", href: "#features" },
  { label: "Proyectos", href: "#showcase" },
  { label: "Proceso", href: "#process" },
  { label: "Contacto", href: "#cta" },
] as const;

export const MARQUEE_ITEMS = [
  "Motion design",
  "WebGL",
  "Design systems",
  "Edge rendering",
  "Microinteracciones",
  "Accesibilidad",
  "Realtime",
  "IA generativa",
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  glow: string;
  className?: string;
  stat?: { value: string; label: string };
};

export const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Interfaces que respiran",
    description:
      "Cada píxel responde al usuario. Animaciones físicas, transiciones fluidas y estados que comunican intención.",
    glow: "139,92,246",
    className: "md:col-span-2 md:row-span-2",
    stat: { value: "60fps", label: "Animación constante" },
  },
  {
    icon: Gauge,
    title: "Rendimiento extremo",
    description: "Render en el edge y bundles mínimos. Carga instantánea en cualquier dispositivo.",
    glow: "34,211,238",
  },
  {
    icon: Fingerprint,
    title: "Identidad única",
    description: "Sistemas de diseño a medida que hacen tu marca inconfundible.",
    glow: "244,114,182",
  },
  {
    icon: Layers,
    title: "Arquitectura modular",
    description: "Componentes limpios y reutilizables que escalan con tu equipo.",
    glow: "163,230,53",
  },
  {
    icon: Cpu,
    title: "IA integrada",
    description: "Experiencias personalizadas impulsadas por modelos en tiempo real.",
    glow: "139,92,246",
  },
];

export type Project = {
  title: string;
  category: string;
  year: string;
  gradient: string;
  icon: LucideIcon;
};

export const PROJECTS: Project[] = [
  {
    title: "Nova Finance",
    category: "Fintech · Dashboard",
    year: "2026",
    gradient: "from-violet-600/60 via-fuchsia-500/30 to-transparent",
    icon: Orbit,
  },
  {
    title: "Helix Labs",
    category: "Biotech · Web 3D",
    year: "2026",
    gradient: "from-cyan-500/60 via-sky-500/30 to-transparent",
    icon: Waypoints,
  },
  {
    title: "Mono Studio",
    category: "Branding · E‑commerce",
    year: "2025",
    gradient: "from-pink-500/60 via-rose-500/30 to-transparent",
    icon: Boxes,
  },
  {
    title: "Pulse OS",
    category: "SaaS · Producto",
    year: "2025",
    gradient: "from-lime-400/50 via-emerald-500/30 to-transparent",
    icon: Cpu,
  },
];

export const PROCESS_STEPS = [
  {
    n: "01",
    title: "Descubrir",
    text: "Investigamos a tus usuarios, tu mercado y tus objetivos para definir una dirección clara.",
  },
  {
    n: "02",
    title: "Diseñar",
    text: "Prototipos interactivos de alta fidelidad con motion desde el primer día.",
  },
  {
    n: "03",
    title: "Construir",
    text: "Código tipado, accesible y optimizado. Componentes que tu equipo puede mantener.",
  },
  {
    n: "04",
    title: "Evolucionar",
    text: "Medimos, iteramos y mejoramos de forma continua tras el lanzamiento.",
  },
];

export const STATS = [
  { value: 120, suffix: "+", label: "Productos lanzados" },
  { value: 98, suffix: "%", label: "Clientes satisfechos" },
  { value: 2.4, suffix: "s", label: "Tiempo medio de carga", decimals: 1, prefix: "<" },
  { value: 14, suffix: "", label: "Premios de diseño" },
];
