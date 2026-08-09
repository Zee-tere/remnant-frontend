export const directContactMethods = ['WHATSAPP', 'EMAIL', 'TELEGRAM'] as const;

export type DirectContactMethod = (typeof directContactMethods)[number];

export interface DirectContact {
  method: DirectContactMethod;
  value: string;
}

export const directContactLabels: Record<DirectContactMethod, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  TELEGRAM: 'Telegram',
};

export const directContactPlaceholders: Record<DirectContactMethod, string> = {
  WHATSAPP: '+234 801 234 5678',
  EMAIL: 'you@example.com',
  TELEGRAM: '@yourusername',
};

export function getDirectContactHref(contact: DirectContact, message?: string) {
  if (contact.method === 'EMAIL') {
    const query = message ? `?body=${encodeURIComponent(message)}` : '';
    return `mailto:${contact.value}${query}`;
  }
  if (contact.method === 'TELEGRAM') {
    return `https://t.me/${contact.value.replace(/^@/, '')}`;
  }
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${contact.value.replace(/\D/g, '')}${query}`;
}

export function isPlausibleDirectContact(method: DirectContactMethod, rawValue: string) {
  const value = rawValue.trim();
  if (method === 'EMAIL') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (method === 'TELEGRAM') {
    const username = value
      .replace(/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//i, '')
      .replace(/^@/, '')
      .replace(/\/$/, '');
    return /^[A-Za-z0-9_]{5,32}$/.test(username);
  }
  const phone = value.replace(/\D/g, '');
  return phone.length >= 10 && phone.length <= 15;
}
