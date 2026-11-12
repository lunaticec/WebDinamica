import type { CartItem, Delivery } from "@/lib/pizza";

export type OrderStatus =
  | "pendiente_pago" // pago en línea iniciado, aún sin confirmar
  | "pagado" //          pago en línea confirmado → pasa a cocina
  | "verificado" //      pago en local: celular verificado, esperando al cliente
  | "confirmado" //      pago en local: el cliente avisó "ya voy / ya llegué"
  | "en_cocina"
  | "listo"
  | "entregado"
  | "cancelado"
  | "expirado"
  | "no_show";

export type Order = {
  id: string;
  /** Código corto que el cliente muestra al retirar, ej. FU-4821 */
  code: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  status: OrderStatus;
  payMethod: "online" | "local";
  paid: boolean;
  paidAt?: number;
  delivery: Delivery;
  address?: string;
  customer: { name: string; phone: string; email?: string };
  items: CartItem[];
  deliveryFeeCents: number;
  totalCents: number;
  payphone?: { paymentId?: number; transactionId?: string; authCode?: string };
  timeline: { at: number; status: OrderStatus; note?: string }[];
};

export type PhoneRecord = {
  phone: string;
  strikes: number;
  blocked: boolean;
  note?: string;
  updatedAt: number;
};

export type OtpRecord = { hash: string; expiresAt: number; attempts: number; sentAt: number };

export type DB = {
  orders: Record<string, Order>;
  phones: Record<string, PhoneRecord>;
  otps: Record<string, OtpRecord>;
  hits: Record<string, number[]>;
};

/** Estados en los que un pedido "pago en local" sigue reservando cupo para ese celular. */
export const ACTIVE_LOCAL: OrderStatus[] = ["verificado", "confirmado", "en_cocina", "listo"];
