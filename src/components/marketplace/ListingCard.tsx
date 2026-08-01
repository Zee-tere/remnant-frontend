import Link from 'next/link';
import {
  HandHeart,
  MapPin,
  PackageOpen,
  Puzzle,
  Recycle,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
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

const intentionMeta: Record<string, { icon: LucideIcon | typeof NairaIcon; label: string; className: string }> = {
  SELL: { icon: NairaIcon, label: 'For sale', className: 'bg-[var(--brand)] text-white' },
  TRADE: { icon: RefreshCw, label: 'Trade', className: 'bg-[var(--secondary-blue)] text-white' },
  DONATE: { icon: HandHeart, label: 'Free', className: 'bg-[var(--tertiary-gold)] text-white' },
  FIX: { icon: Wrench, label: 'Repair', className: 'bg-[#9a4d13] text-white' },
  RECYCLE: { icon: Recycle, label: 'Recycle', className: 'bg-[#13705e] text-white' },
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
    <Link href={`/marketplace/${item.slug || item.id}`} className={`group block min-w-0 touch-manipulation ${className}`}>
      <article className="surface-card h-full overflow-hidden rounded-lg transition-[border-color,transform] duration-200 md:rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--sand)] md:aspect-[5/4]">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={`${item.title} listing`}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
              <span className="icon-frame h-11 w-11" data-preserve-icon-frame>
                <PackageOpen size={21} aria-hidden="true" />
              </span>
            </div>
          )}
          <span className={`absolute left-1 top-1 inline-flex items-center gap-0.5 rounded px-1.5 py-1 text-[0.52rem] font-bold leading-none md:left-3 md:top-3 md:gap-1 md:rounded-md md:px-2.5 md:py-1.5 md:text-xs ${intent.className}`}>
            <IntentIcon size={9} className="md:h-3.5 md:w-3.5" aria-hidden="true" />
            {intent.label}
          </span>
          {needsPair && (
            <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded bg-white text-[var(--brand)] md:right-3 md:top-3 md:h-auto md:w-auto md:max-w-[54%] md:gap-1 md:rounded-md md:border md:border-[var(--border)]/80 md:px-2.5 md:py-1.5 md:text-xs">
              <Puzzle size={10} className="shrink-0 md:h-3 md:w-3" aria-hidden="true" />
              <span className="hidden truncate md:inline">Needs {item.pairingKeyword}</span>
            </span>
          )}
        </div>

        <div className="p-2 md:p-4">
          <h3 className="line-clamp-2 min-h-8 text-[0.7rem] font-bold leading-4 text-[var(--foreground)] md:min-h-0 md:text-base md:leading-snug">
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-[0.75rem] font-bold leading-4 text-[var(--brand)] md:mt-1 md:text-lg md:leading-6">
            {getListingValue(item)}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-0.5 text-[0.6rem] font-semibold leading-3 text-[var(--muted-foreground)] md:mt-2 md:gap-1 md:text-xs md:leading-4">
            <MapPin size={9} className="shrink-0 md:h-3 md:w-3" aria-hidden="true" />
            <span className="truncate">{item.city || 'Location not set'}</span>
            <span className="hidden md:inline" aria-hidden="true">·</span>
            <span className="hidden shrink-0 md:inline">Listed {formatListedDate(item.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
