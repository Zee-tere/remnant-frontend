import type { ElementType } from 'react';
import Link from 'next/link';
import { HandHeart, MapPin, Package, Recycle, RefreshCw, Wrench } from 'lucide-react';
import { NairaIcon } from '@/components/ui/naira-icon';
import { formatCurrency } from '@/lib/utils';

export interface ListingCardItem {
  id: string;
  slug?: string;
  title: string;
  price: string | null;
  images: string[];
  intentionTag: string;
  city: string | null;
  createdAt?: string;
}

const intentionMeta: Record<string, { icon: ElementType; label: string; className: string }> = {
  SELL: { icon: NairaIcon, label: 'For sale', className: 'bg-[var(--brand-soft)] text-[var(--brand)]' },
  TRADE: { icon: RefreshCw, label: 'Trade', className: 'bg-[#e2f7ff] text-[var(--secondary-blue)]' },
  DONATE: { icon: HandHeart, label: 'Free', className: 'bg-[#fff6cf] text-[var(--tertiary-gold)]' },
  FIX: { icon: Wrench, label: 'Repair', className: 'bg-orange-50 text-orange-700' },
  RECYCLE: { icon: Recycle, label: 'Recycle', className: 'bg-teal-50 text-teal-700' },
};

function formatListedDate(value?: string) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ListingCard({
  item,
  className = '',
  eager = false,
}: {
  item: ListingCardItem;
  className?: string;
  eager?: boolean;
}) {
  const intent = intentionMeta[item.intentionTag] ?? intentionMeta.SELL;
  const IntentIcon = intent.icon;

  return (
    <Link href={`/marketplace/${item.slug || item.id}`} className={`group block min-w-0 ${className}`}>
      <article className="surface-card h-full overflow-hidden rounded-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--sand)] md:aspect-[5/4]">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
              <Package size={30} aria-hidden="true" />
            </div>
          )}
          <span className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-bold md:left-3 md:top-3 md:px-2.5 md:text-xs ${intent.className}`}>
            <IntentIcon size={11} className="md:h-3.5 md:w-3.5" aria-hidden="true" />
            {intent.label}
          </span>
        </div>

        <div className="p-2.5 md:p-4">
          <h3 className="line-clamp-2 min-h-8 text-[0.82rem] font-bold leading-4 text-[var(--foreground)] md:line-clamp-1 md:min-h-0 md:text-base md:leading-tight">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-sm font-bold leading-5 text-[var(--brand)] md:text-lg">
            {item.price ? formatCurrency(Number(item.price)) : 'Free'}
          </p>
          <div className="mt-1.5 flex min-w-0 items-center gap-1 text-[0.7rem] font-semibold text-[var(--muted-foreground)] md:text-xs">
            <MapPin size={11} className="shrink-0 md:h-3 md:w-3" aria-hidden="true" />
            <span className="truncate">{item.city || 'Location not set'}</span>
          </div>
          <p className="mt-1.5 truncate text-[0.67rem] font-medium leading-4 text-[var(--muted-foreground)] md:text-[0.7rem]">
            Listed on: {formatListedDate(item.createdAt)}
          </p>
        </div>
      </article>
    </Link>
  );
}
