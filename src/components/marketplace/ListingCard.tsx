import type { ElementType } from 'react';
import Link from 'next/link';
import { HandHeart, MapPin, Package, Puzzle, Recycle, RefreshCw, Wrench } from 'lucide-react';
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
  pairingKeyword?: string | null;
  compatibilityAttributes?: Record<string, unknown> | null;
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
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function getListingValue(item: ListingCardItem) {
  if (item.intentionTag === 'SELL') {
    return item.price ? formatCurrency(Number(item.price)) : 'Price on request';
  }
  if (item.intentionTag === 'TRADE') return 'Open to trade';
  if (item.intentionTag === 'DONATE') return 'Free';
  if (item.intentionTag === 'FIX') return 'Needs repair';
  if (item.intentionTag === 'RECYCLE') return 'Ready to recycle';
  return 'View item';
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
  const needsPair = item.compatibilityAttributes?.needsPair === true && Boolean(item.pairingKeyword);

  return (
    <Link href={`/marketplace/${item.slug || item.id}`} className={`group block min-w-0 ${className}`}>
      <article className="surface-card h-full overflow-hidden rounded-lg">
        <div className="relative aspect-[5/3] overflow-hidden bg-[var(--sand)] md:aspect-[5/4]">
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
              <Package size={24} className="md:h-[30px] md:w-[30px]" aria-hidden="true" />
            </div>
          )}
          <span className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-bold md:left-3 md:top-3 md:px-2.5 md:text-xs ${intent.className}`}>
            <IntentIcon size={11} className="md:h-3.5 md:w-3.5" aria-hidden="true" />
            {intent.label}
          </span>
          {needsPair && (
            <span className="absolute right-1.5 top-1.5 inline-flex max-w-[55%] items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[0.62rem] font-bold text-[var(--brand)] shadow-sm md:right-3 md:top-3 md:text-xs">
              <Puzzle size={10} className="shrink-0" aria-hidden="true" />
              <span className="truncate">Needs {item.pairingKeyword}</span>
            </span>
          )}
        </div>

        <div className="p-2 md:p-4">
          <h3 className="line-clamp-1 text-[0.78rem] font-bold leading-4 text-[var(--foreground)] md:text-base md:leading-tight">
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-[0.72rem] font-bold leading-4 text-[var(--brand)] md:mt-1 md:text-lg md:leading-5">
            {getListingValue(item)}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-1 text-[0.63rem] font-semibold text-[var(--muted-foreground)] md:mt-1.5 md:text-xs">
            <MapPin size={11} className="shrink-0 md:h-3 md:w-3" aria-hidden="true" />
            <span className="truncate">{item.city || 'Location not set'}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">Listed {formatListedDate(item.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
