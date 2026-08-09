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
      <article className="h-full">
        <div className="relative h-32 overflow-hidden bg-white sm:h-40 md:h-auto md:aspect-[5/4] md:rounded-card md:bg-[#f3f3f3]">
          {item.images?.[0] ? (
            <Image
              src={item.images[0]}
              alt={`${item.title} listing`}
              fill
              priority={eager}
              sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
              quality={68}
              className="h-full w-full object-contain p-2.5 transition-transform duration-200 motion-safe:group-hover:scale-[1.025] md:object-cover md:p-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black/30">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white" data-preserve-icon-frame>
                <PackageOpen size={21} aria-hidden="true" />
              </span>
            </div>
          )}
          <IntentBadge intent={item.intentionTag} compact className="absolute left-1.5 top-1.5 md:left-3 md:top-3" />
          {needsPair && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white text-black md:right-3 md:top-3 md:h-auto md:w-auto md:max-w-[54%] md:gap-1 md:px-2.5 md:py-1.5 md:text-xs" aria-label={`Needs ${item.pairingKeyword}`}>
              <Puzzle size={12} className="shrink-0" aria-hidden="true" />
              <span className="hidden truncate md:inline">Needs {item.pairingKeyword}</span>
            </span>
          )}
        </div>

        <div className="pt-2 md:pt-4">
          <h3 className="line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-[#111] md:min-h-0 md:text-base md:font-bold md:leading-snug">
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-sm font-bold leading-5 text-[#111] md:mt-1 md:text-lg md:leading-6">
            {getListingValue(item)}
          </p>
          <div className="mt-1.5 hidden min-w-0 items-center gap-1 text-xs font-semibold leading-4 text-black/45 md:mt-2 md:flex">
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
