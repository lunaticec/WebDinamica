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

## Pagos, comprobante y anti-plantón

Al pulsar **Continuar al pago** el cliente deja sus datos y elige:

- **Pagar en línea (PayPhone):** paga con tarjeta o la app PayPhone. El servidor confirma el pago con PayPhone (no se confía en la URL de retorno ni en el navegador), valida el monto, marca el pedido como *pagado*, lo manda a cocina y envía el **comprobante con el ticket por correo**. También queda en `/pedido/<id>`, con botón para imprimir o guardar en PDF.
- **Pagar en el local:** protegido contra pedidos falsos:
  1. **Código por WhatsApp** al celular (válido 5 min, 5 intentos, reenvío cada 45 s, 3 códigos/hora por celular).
  2. **Un pedido pendiente por celular** y tope de monto (`POLICY.localMaxTotal`).
  3. El pedido queda **reservado 40 min** y **no entra a cocina** hasta que el cliente toque *Ya voy / Ya llegué* (o tú lo inicies en el panel).
  4. Si vence o lo marcas *No se presentó* → **plantón**. Con 2 plantones el celular queda **bloqueado** para pagar en el local (sólo en línea). Cancelar a tiempo no penaliza.

Los precios se **recalculan en el servidor**: el navegador nunca decide cuánto cuesta el pedido.

### Panel del local: `/admin`

Entra con `ADMIN_PASSWORD`. Columnas: *Por cocinar* · *Esperando al cliente* · *En cocina* · *Listos*, con botones A cocina / Listo / Entregado y cobrado / No se presentó, más la lista de celulares con plantones (bloquear/desbloquear). Se actualiza solo cada 5 s.

### Puesta en marcha

1. Copia `.env.local.example` a `.env.local` y completa las claves (ver el archivo).
2. Sin claves, en **desarrollo** (`npm run dev`) todo funciona en modo prueba: el código de verificación sale en la consola, el pago es una pasarela simulada (`/pago-simulado`) y el panel usa la contraseña `admin`. **En producción (`npm start`) no hay modo prueba:** sin claves, el pago en local, el panel y el pago en línea se niegan a funcionar.
3. Los pedidos se guardan en `.data/db.json` (un solo servidor). En Vercel u otro hosting serverless el disco no persiste: reemplaza `withDb` en `lib/server/store.ts` por una base de datos (Postgres, Supabase, Upstash…).

Reglas editables en `lib/config.ts` (`POLICY`): minutos de reserva, plantones permitidos, tope de monto en local, IVA.

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
lib/                   config.ts, pizza.ts, utils.ts
```
