# Aether — Landing page dinámica

Landing page futurista, oscura e interactiva construida con **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **Framer Motion**, **Lenis** (smooth scroll) y **Lucide React**.

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Características

| Requisito | Implementación |
| --- | --- |
| Fondo interactivo | `components/background/` — gradientes *mesh* que siguen al ratón con resortes + campo de partículas en canvas 2D con repulsión y conexiones que se iluminan cerca del cursor. |
| Smooth scroll | `components/providers/SmoothScroll.tsx` — Lenis global + desplazamiento suave para enlaces `#ancla`. |
| Parallax | `components/ui/Parallax.tsx`, salida del Hero, marquee con desplazamiento horizontal ligado al scroll, galería de proyectos con scroll horizontal fijado (`Showcase`). |
| Reveal animations | `components/ui/Reveal.tsx` (`Reveal`, `RevealGroup`, `RevealItem`) y `SplitText` (palabras con máscara). |
| Glassmorphism / glow | `components/ui/GlowCard.tsx` — foco de luz radial que sigue al puntero en relleno y borde + inclinación 3D. |
| Cursor personalizado | `components/cursor/CustomCursor.tsx` — estados `default`, `link`, `view`, `text`, `drag`, `hide`. Sólo se activa en dispositivos con puntero fino. |
| Microinteracciones | `MagneticButton`, contadores animados (`Counter`), navbar que se oculta al bajar, barra de progreso de scroll, formulario con feedback animado. |

### Cursor: cómo usarlo en cualquier elemento

```tsx
<div data-cursor="view" data-cursor-label="Abrir">…</div>
```

Los `<a>` y `<button>` usan el estado `link` automáticamente; `<input>`/`<textarea>`, el estado `text`.

## Estructura

```
app/
  layout.tsx        # fuentes, providers, fondo y cursor globales
  page.tsx          # composición de secciones
  globals.css
components/
  background/       # InteractiveBackground, ParticleField
  cursor/           # CustomCursor
  providers/        # SmoothScroll (Lenis)
  sections/         # Navbar, Hero, HeroOrb, Marquee, Features, Showcase, ProjectCard, Process, Stats, CTA, Footer
  ui/               # GlowCard, MagneticButton, Reveal, SplitText, Parallax, Counter, SectionHeading, Logo
lib/
  content.ts        # textos y datos (editar aquí el contenido)
  utils.ts          # cn(), lerp()
```

## Accesibilidad y rendimiento

- Respeta `prefers-reduced-motion` (desactiva Lenis, congela partículas y acorta animaciones CSS).
- El canvas limita el DPR a 2, ajusta el nº de partículas al tamaño de pantalla y se pausa con la pestaña oculta.
- El cursor nativo sólo se oculta en dispositivos con ratón; en táctil no se monta el cursor personalizado.
