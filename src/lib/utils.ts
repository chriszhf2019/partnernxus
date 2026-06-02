import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'CNY' | 'USD' | 'JPY' = 'CNY') {
  const localeMap: Record<string, string> = {
    CNY: 'zh-CN',
    USD: 'en-US',
    JPY: 'ja-JP',
  };
  const symbolMap: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    JPY: '¥',
  };

  const locale = localeMap[currency] || 'zh-CN';

  // For JPY, no decimal places; for others, show 2 decimal places
  const minDigits = currency === 'JPY' ? 0 : 2;
  const maxDigits = currency === 'JPY' ? 0 : 2;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(amount);
  } catch {
    // Fallback for environments where Intl doesn't support the currency
    const n = amount.toFixed(maxDigits);
    const parts = n.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.join('.');
    return `${symbolMap[currency] || '¥'}${formatted}`;
  }
}
