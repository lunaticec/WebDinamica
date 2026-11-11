import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SHOP } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fmt = new Intl.NumberFormat(SHOP.locale, { style: "currency", currency: SHOP.currency });
export const formatPrice = (n: number) => fmt.format(n);
