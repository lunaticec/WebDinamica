/** Datos del negocio. Edita aquí nombre, moneda y número de WhatsApp. */
export const SHOP = {
  name: "Fuoco",
  tagline: "Pizzería artesanal",
  /** Número con código de país, sin + ni espacios. Los pedidos se envían a este WhatsApp. */
  whatsapp: "5215555555555",
  currency: "USD",
  locale: "es",
  hours: "Todos los días · 12:00 – 23:00",
  address: "Calle Principal 123, Tu Ciudad",
  phone: "+52 55 5555 5555",
};

export const NAV_LINKS = [
  { label: "Arma tu pizza", href: "#arma" },
  { label: "Menú", href: "#menu" },
  { label: "Mi pedido", href: "#pedido" },
] as const;
