/**
 * Configuración técnica fija (moneda e idioma). Todo lo que el dueño puede cambiar
 * (nombre, precios, horario, envío, promociones…) vive en el catálogo editable en /admin.
 */
export const SHOP = {
  currency: "USD",
  locale: "es",
};

export const NAV_LINKS = [
  { label: "Arma tu pizza", href: "#arma" },
  { label: "Menú", href: "#menu" },
  { label: "Mi ticket", href: "#ticket" },
] as const;
