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
  /** Costo de envío a domicilio */
  deliveryFee: 2.5,
};

export const NAV_LINKS = [
  { label: "Arma tu pizza", href: "#arma" },
  { label: "Menú", href: "#menu" },
  { label: "Mi ticket", href: "#ticket" },
] as const;

/** Reglas de negocio de pedidos y pagos (se aplican en el servidor). */
export const POLICY = {
  /** Minutos que se reserva un pedido "pago en el local" esperando al cliente */
  localHoldMinutes: 40,
  /** Minutos para completar un pago en línea antes de que expire el pedido */
  onlineHoldMinutes: 30,
  /** Plantones permitidos antes de bloquear el pago en el local para ese celular */
  maxStrikes: 2,
  /** Total máximo permitido para pagar en el local (reduce el daño de un plantón) */
  localMaxTotal: 40,
  /** IVA de Ecuador. Los precios del menú se consideran con IVA incluido. */
  iva: 0.15,
};
