# Fuoco — Pizzería con constructor de pizzas interactivo

Web de una pizzería donde el cliente **arma su pizza como un juego**: elige tamaño y masa, arrastra (o toca) ingredientes sobre la pizza y ve cómo el **precio cambia en tiempo real**. Al final envía el pedido por WhatsApp.

Stack: Next.js 15 (App Router) · React 19 · Tailwind CSS · Framer Motion · Lenis (smooth scroll) · Lucide React.

```bash
npm install
npm run dev     # http://localhost:3000
```

## Personalizar tu negocio

| Qué | Dónde |
| --- | --- |
| Nombre, WhatsApp, moneda, horario, dirección | `lib/config.ts` |
| Ingredientes, precios, tamaños, masas y pizzas del menú | `lib/pizza.ts` |

El número de WhatsApp debe ir con código de país y sin `+` (ej. `5215512345678`). La moneda se cambia con `currency` (`USD`, `MXN`, `COP`, `EUR`…).

## Cómo funciona

- **Precio** = base del tamaño + extra de masa + Σ(precio ingrediente × cantidad) × multiplicador del tamaño (`calcPrice` en `lib/pizza.ts`).
- Cada porción de ingrediente genera piezas en posiciones aleatorias que caen sobre la pizza con física de resorte; quitar una porción las retira con animación.
- Máximo 3 porciones por ingrediente. Arrastrar funciona con ratón; en táctil se usan toque y botones +/−.
- El menú permite cargar una pizza prearmada en el constructor y personalizarla.
- El pedido (carrito) se envía como mensaje de WhatsApp prellenado.

## Estructura

```
app/                   layout, página y estilos
components/pizza/      PizzaProvider (estado), PizzaCanvas, IngredientTray, PriceBar, OptionPicker, Topping…
components/sections/   Navbar, Hero, Menu, Cart, Footer
components/ui/         GlowCard, MagneticButton, Reveal, SplitText, SectionHeading, Logo
components/background/ fondo con gradientes y partículas que reaccionan al ratón
components/cursor/     cursor personalizado
lib/                   config.ts, pizza.ts, utils.ts
```
