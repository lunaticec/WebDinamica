# Fuoco — Pizzería con constructor de pizzas interactivo

Web de una pizzería donde el cliente **arma su pizza como un juego**: elige tamaño y masa, arrastra (o toca) ingredientes sobre la pizza y ve cómo el **precio cambia en tiempo real**. Al final envía el pedido por WhatsApp.

Stack: Next.js 15 (App Router) · React 19 · Tailwind CSS · Framer Motion · Lenis (smooth scroll) · Lucide React.

```bash
npm install
npm run dev     # http://localhost:3000
```

## Configurar el menú sin tocar código: `/admin`

Entra a `/admin` (contraseña `ADMIN_PASSWORD`) → pestaña **Menú, precios y promociones**. Todo se guarda al pulsar **Guardar cambios** y la web pública lo muestra al instante:

| Sección | Qué puedes hacer |
| --- | --- |
| **Tamaños y masas** | Nombre, pulgadas, precio base y multiplicador de ingredientes por tamaño; masas con extra y borde relleno. Reordenar, agregar y eliminar. |
| **Ingredientes** | Precio, forma con la que se dibuja (15 formas), piezas, y **Disponible / Agotado** con un interruptor. |
| **Menú** | Pizzas prearmadas: nombre, descripción, ingredientes por porciones, visible u oculta. El precio se calcula solo. |
| **Promociones** | Porcentaje, monto fijo, **2x1** o **envío gratis**; automáticas o con **código**; compra mínima, tamaños, días de la semana y rango de fechas. Se aplica solo la que más descuenta. |
| **Negocio y reglas** | Nombre, horario, dirección, teléfono, costo de envío, IVA, zona horaria, tope y reserva del pago en local, plantones permitidos. |

Notas: los precios y promociones los **recalcula el servidor** en cada pedido; el comprobante guarda los nombres del momento del pedido (si luego renombras algo, los comprobantes viejos no cambian); eliminar un ingrediente lo quita también de las pizzas del menú. Los valores iniciales están en `lib/catalog.ts` (`DEFAULT_CATALOG`).

## Cómo funciona

- **Precio** = base del tamaño + extra de masa + Σ(precio ingrediente × cantidad) × multiplicador del tamaño (`calcPrice` en `lib/pizza.ts`).
- Cada porción de ingrediente genera piezas en posiciones aleatorias que caen sobre la pizza con física de resorte; quitar una porción las retira con animación.
- Máximo 3 porciones por ingrediente. Arrastrar funciona con ratón; en táctil se usan toque y botones +/−.
- El menú permite cargar una pizza prearmada en el constructor y personalizarla.
- El ticket suma varias pizzas y se paga desde el botón "Continuar al pago".

## Estructura

```
app/                   layout, página y estilos
components/pizza/      PizzaProvider (estado), PizzaCanvas, IngredientTray, PriceBar, OptionPicker, Topping…
components/sections/   Navbar, Hero, Menu, Cart, Footer
components/ui/         GlowCard, MagneticButton, Reveal, SplitText, SectionHeading, Logo
components/background/ fondo con gradientes y partículas que reaccionan al ratón
components/cursor/     cursor personalizado
lib/                   catalog.ts (valores iniciales y validación), pizza.ts (tipos y precios), promo.ts (promociones), server/ (pedidos, pagos)
```
