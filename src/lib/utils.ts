import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mobile detection utility
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}

// Format currency for Nigeria
export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getSafeCheckoutUrl(value: string | null | undefined) {
  if (!value) return null;

  if (value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) {
    return { href: value, external: false };
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const trustedPaystackHost = hostname === 'checkout.paystack.com' || hostname.endsWith('.paystack.com');
    if (url.protocol !== 'https:' || url.username || url.password || !trustedPaystackHost) return null;
    return { href: url.toString(), external: true };
  } catch {
    return null;
  }
}
