'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MapPin, PackageOpen, Puzzle } from 'lucide-react';
import { IntentBadge, listingIntentMeta, normalizeListingIntent } from '@/components/ui/intent-badge';
import { conditionLabels } from '@/lib/listing-conditions';
import { formatCurrency } from '@/lib/utils';
import { isListingTombstoned, isListingTombstoneStorageEvent } from '@/lib/listing-tombstones';

export interface ListingCardItem {
  id: string;
  slug?: string;
  title: string;
  price: string | null;
  images: string[];
  intentionTag: string;
  condition?: string;
  city: string | null;
  createdAt?: string;
  pairingKeyword?: string | null;
  compatibilityAttributes?: Record<string, unknown> | null;
}

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
  return listingIntentMeta[normalizeListingIntent(item.intentionTag)].valueLabel;
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
  const needsPair = item.compatibilityAttributes?.needsPair === true && Boolean(item.pairingKeyword);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const sync = () => setRemoved(isListingTombstoned(item.id));
    const onDeleted = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id === item.id) setRemoved(true);
    };
    const onStorage = (event: StorageEvent) => {
      if (isListingTombstoneStorageEvent(event)) sync();
    };
    sync();
    window.addEventListener('remnant:listing-deleted', onDeleted);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('remnant:listing-deleted', onDeleted);
      window.removeEventListener('storage', onStorage);
    };
  }, [item.id]);

  if (removed) return null;

  return (
    <Link href={`/marketplace/${item.slug || item.id}`} className={`group block min-w-0 touch-manipulation ${className}`}>
      <article className="surface-card h-full overflow-hidden rounded-card transition-[border-color,transform] duration-200">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--sand)] md:aspect-[5/4]">
          {item.images?.[0] ? (
            <Image
              src={item.images[0]}
              alt={`${item.title} listing`}
              fill
              priority={eager}
              sizes="(max-width: 767px) 33vw, (max-width: 1279px) 30vw, 22vw"
              quality={68}
              className="h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
              <span className="icon-frame h-11 w-11" data-preserve-icon-frame>
                <PackageOpen size={21} aria-hidden="true" />
              </span>
            </div>
          )}
          <IntentBadge intent={item.intentionTag} compact className="absolute left-1.5 top-1.5 md:left-3 md:top-3" />
          {needsPair && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-pill border border-[var(--border)]/80 bg-white text-[var(--brand)] md:right-3 md:top-3 md:h-auto md:w-auto md:max-w-[54%] md:gap-1 md:px-2.5 md:py-1.5 md:text-xs" aria-label={`Needs ${item.pairingKeyword}`}>
              <Puzzle size={12} className="shrink-0" aria-hidden="true" />
              <span className="hidden truncate md:inline">Needs {item.pairingKeyword}</span>
            </span>
          )}
        </div>

        <div className="p-1.5 md:p-4">
          <h3 className="line-clamp-2 min-h-8 text-xs font-bold leading-4 text-[var(--foreground)] md:min-h-0 md:text-base md:leading-snug">
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-xs font-bold leading-4 text-[var(--brand)] md:mt-1 md:text-lg md:leading-6">
            {getListingValue(item)}
          </p>
          <div className="mt-1 hidden min-w-0 items-center gap-1 text-xs font-semibold leading-4 text-[var(--muted-foreground)] md:mt-2 md:flex">
            <MapPin size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{item.city || 'Location not set'}</span>
            <span className="hidden md:inline" aria-hidden="true">·</span>
            {item.condition && <span className="hidden shrink-0 md:inline">{conditionLabels[item.condition] || item.condition}</span>}
            {item.condition && <span className="hidden md:inline" aria-hidden="true">·</span>}
            <span className="hidden shrink-0 md:inline">Listed {formatListedDate(item.createdAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
