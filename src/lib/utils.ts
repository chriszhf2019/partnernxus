import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'CNY' | 'USD' | 'JPY' = 'CNY') {
  const n = Math.round(amount);
  const withCommas = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (currency === 'USD') return `$${withCommas}`;
  return `¥${withCommas}`;
}
