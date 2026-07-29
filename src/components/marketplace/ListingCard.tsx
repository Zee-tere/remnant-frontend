import type { ElementType } from 'react';
import Link from 'next/link';
import { ArrowUpRight, HandHeart, MapPin, Package, Puzzle, Recycle, RefreshCw, Wrench } from 'lucide-react';
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
      <article className="surface-card h-full overflow-hidden rounded-[1.4rem] transition-transform duration-300 ease-out group-active:scale-[0.985] md:group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--sand)]">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
              <Package size={24} className="md:h-[30px] md:w-[30px]" aria-hidden="true" />
            </div>
          )}
          <span className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.68rem] font-bold shadow-sm backdrop-blur-md md:left-3 md:top-3 md:text-xs ${intent.className}`}>
            <IntentIcon size={12} className="md:h-3.5 md:w-3.5" aria-hidden="true" />
            {intent.label}
          </span>
          {needsPair && (
            <span className="absolute right-2.5 top-2.5 inline-flex max-w-[58%] items-center gap-1 rounded-full bg-white/92 px-2.5 py-1.5 text-[0.65rem] font-semibold text-[var(--brand)] shadow-sm backdrop-blur-md md:right-3 md:top-3 md:text-xs">
              <Puzzle size={10} className="shrink-0" aria-hidden="true" />
              <span className="truncate">Needs {item.pairingKeyword}</span>
            </span>
          )}
        </div>

        <div className="p-3.5 md:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[1.02rem] font-semibold leading-[1.2] tracking-[-0.015em] text-[var(--foreground)] md:text-lg">
                {item.title}
              </h3>
              <p className="mt-1.5 truncate text-sm font-bold leading-5 text-[var(--brand)] md:text-lg">
                {getListingValue(item)}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white" aria-hidden="true">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="mt-3 flex min-w-0 items-center gap-1.5 border-t border-[var(--hairline)] pt-2.5 text-[0.7rem] font-medium text-[var(--muted-foreground)] md:text-xs">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{item.city || 'Location not set'}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{formatListedDate(item.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
