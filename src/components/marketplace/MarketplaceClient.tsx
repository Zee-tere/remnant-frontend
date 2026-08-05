"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Filter,
  HandHeart,
  Package,
  Recycle,
  RefreshCw,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { NairaIcon } from "@/components/ui/naira-icon";
import { nigerianStates } from "@/lib/nigeria-locations";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ListingGridSkeleton } from "@/components/feedback/LoadingState";
import type { PublicListingPage } from "@/lib/public-listings";

type Listing = ListingCardItem;

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  SELL: { icon: NairaIcon, label: "For sale", color: "text-intent-sell" },
  TRADE: { icon: RefreshCw, label: "Trade", color: "text-intent-trade" },
  DONATE: { icon: HandHeart, label: "Free", color: "text-intent-donate" },
  FIX: { icon: Wrench, label: "Repair", color: "text-intent-repair" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-intent-recycle" },
};

interface MarketplaceFilters {
  search: string;
  category: string;
  intentionTag: string;
  city: string;
}

export default function MarketplaceClient({
  initialData,
  initialFilters,
}: {
  initialData: PublicListingPage;
  initialFilters: MarketplaceFilters;
}) {
  const [submittedSearch, setSubmittedSearch] = useState(initialFilters.search);
  const [category, setCategory] = useState(initialFilters.category);
  const [intentionTag, setIntentionTag] = useState(initialFilters.intentionTag);
  const [city, setCity] = useState(initialFilters.city);
  const [listings, setListings] = useState<Listing[]>(initialData.listings);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);
  const [hasMore, setHasMore] = useState(Boolean(initialData.hasMore));
  const [nextCursor, setNextCursor] = useState<string | null>(initialData.nextCursor ?? null);
  const [showFilters, setShowFilters] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const isInitialRender = useRef(true);

  const fetchListings = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      if (submittedSearch) {
        const searchParams: Record<string, string> = { q: submittedSearch, limit: "24" };
        if (category) searchParams.category = category;
        if (intentionTag) searchParams.intent = intentionTag;
        if (city) searchParams.city = city;
        const items = await listingsApi.searchListings(searchParams);
        const rows = Array.isArray(items) ? items : [];
        setListings(rows);
        setTotal(rows.length);
        setHasMore(false);
        setNextCursor(null);
        return;
      }
      const params: Record<string, string> = { pagination: "cursor", limit: "12" };
      if (cursor) params.cursor = cursor;
      if (category) params.category = category;
      if (intentionTag) params.intentionTag = intentionTag;
      if (city) params.city = city;

      const data = await listingsApi.getListings(params);
      setListings(data.listings || []);
      setTotal(typeof data.total === "number" ? data.total : (data.listings || []).length);
      setHasMore(Boolean(data.hasMore));
      setNextCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
    } catch {
      setListings([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    void fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, category, intentionTag, city, submittedSearch]);

  const resetPagination = () => {
    setPage(1);
    setCursor(null);
    setCursorHistory([]);
  };

  const clearFilters = () => {
    setCategory("");
    setIntentionTag("");
    setCity("");
    setSubmittedSearch("");
    resetPagination();
  };

  const hasActiveFilters = category || intentionTag || city || submittedSearch;

  const FilterPanel = ({ embedded = false }: { embedded?: boolean } = {}) => (
    <div className={embedded ? "" : "surface-card rounded-card p-6"}>
      {!embedded && (
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Filters</h2>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-sm font-bold text-[var(--brand)] hover:underline">
            Reset
          </button>
        )}
      </div>
      )}

      <div className={embedded ? "divide-y divide-[#f1f0ec]" : "space-y-8"}>
        <div className={embedded ? "pb-4" : ""}>
          <h3 className={`${embedded ? "mb-2 text-xs" : "mb-4 text-sm"} font-bold uppercase text-[var(--muted-foreground)]`}>State</h3>
          <Select
            value={city}
            onChange={(event) => { setCity(event.target.value); resetPagination(); }}
            className="font-semibold"
          >
            <option value="">All states</option>
            {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
          </Select>
        </div>

        <div className={embedded ? "py-4" : ""}>
          <h3 className={`${embedded ? "mb-2 text-xs" : "mb-4 text-sm"} font-bold uppercase text-[var(--muted-foreground)]`}>Category</h3>
          <Select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              resetPagination();
            }}
            className="font-semibold"
          >
            <option value="">All pieces</option>
            {listingCategories.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className={embedded ? "py-4" : ""}>
          <h3 className={`${embedded ? "mb-2 text-xs" : "mb-4 text-sm"} font-bold uppercase text-[var(--muted-foreground)]`}>Intent</h3>
          <div className={embedded ? "divide-y divide-[#f4f3ef]" : "space-y-3"}>
            {Object.entries(intentionMeta).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <label key={key} className={`flex cursor-pointer items-center gap-3 transition-colors hover:text-[var(--brand)] ${embedded ? "min-h-11 px-1" : "p-1.5"}`}>
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--border)]">
                    <input
                      type="radio"
                      name="intention"
                      value={key}
                      checked={intentionTag === key}
                      onChange={(event) => {
                        setIntentionTag(event.target.value);
                        resetPagination();
                      }}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 scale-0 rounded-full bg-[var(--brand)] transition-transform peer-checked:scale-100" />
                  </span>
                  <Icon size={16} className={meta.color} aria-hidden="true" />
                  <span className="text-sm font-bold text-[var(--ink-soft)]">{meta.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={embedded ? "pt-4" : "border-t border-[var(--border)]/45 pt-5"}>
          <p className="text-sm font-semibold text-[var(--ink-soft)]">
            Showing <span className="text-2xl font-bold text-[var(--brand)]">{total}</span> item{total !== 1 && "s"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-5 md:px-8 md:pt-7">
        <section className="-mx-1 mb-3 border-b border-[var(--line-soft)] pb-2 md:mb-6" aria-label="Browse market categories">
          <div className="flex items-center justify-end px-1">
            {category && (
              <button type="button" onClick={() => { setCategory(""); resetPagination(); }} className="min-h-11 px-1 text-xs font-bold text-[var(--brand)]">
                Show all
              </button>
            )}
          </div>
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide md:gap-5">
            {listingCategories.map((item) => {
              const active = category === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => { setCategory(active ? "" : item.label); resetPagination(); }}
                  className={`relative flex min-h-[4.65rem] w-[4.7rem] shrink-0 snap-start flex-col items-start justify-between overflow-hidden border-b-2 px-1 py-1 text-left transition-[border-color,color,transform] active:scale-[0.98] md:min-h-[5.2rem] md:w-[5.6rem] ${active ? "border-[var(--aqua)] text-[var(--foreground)]" : "border-transparent text-[var(--ink-soft)] hover:text-[var(--foreground)]"}`}
                  aria-pressed={active}
                >
                  <span className="relative z-10 max-w-[4.4rem] text-xs font-black leading-[1.15]">{item.label}</span>
                  <img src={item.image} alt="" loading="lazy" decoding="async" className="absolute bottom-0 right-0 h-9 w-9 object-contain md:h-11 md:w-11" />
                  {active && <ArrowRight size={11} className="relative z-10 text-[var(--aqua)]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--line-soft)] scrollbar-hide lg:hidden" aria-label="Filter by intent">
          {[{ key: '', label: 'All' }, ...Object.entries(intentionMeta).map(([key, meta]) => ({ key, label: key === 'SELL' ? 'Buy' : meta.label }))].map((item) => (
            <button
              key={item.key || 'all'}
              type="button"
              onClick={() => { setIntentionTag(item.key); resetPagination(); }}
              className={`relative min-h-10 shrink-0 border-b-2 px-3 text-xs font-bold transition-colors ${
                intentionTag === item.key
                  ? 'border-[var(--aqua)] bg-white text-[var(--foreground)]'
                  : 'border-transparent bg-white text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="hidden w-72 shrink-0 lg:block lg:sticky lg:top-28">
            <FilterPanel />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <p className="text-sm font-semibold text-[var(--ink-soft)]">
                Showing <span className="font-bold text-[var(--foreground)]">{total}</span> item{total !== 1 && "s"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="border-0 bg-transparent px-1 font-bold shadow-none hover:bg-transparent hover:text-[var(--brand)]"
              >
                <Filter size={15} aria-hidden="true" />
                Filters
                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />}
              </Button>
            </div>

            {hasActiveFilters && (
              <div className="mb-5 flex flex-wrap gap-2">
                {submittedSearch && (
                  <span className="inline-flex items-center gap-2 px-1 py-1 text-sm font-bold text-[var(--brand)]">
                    {submittedSearch}
                    <button type="button" onClick={() => { setSubmittedSearch(""); resetPagination(); }}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-2 px-1 py-1 text-sm font-bold text-[var(--ink-soft)]">
                    {category}
                    <button type="button" onClick={() => { setCategory(""); resetPagination(); }}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {intentionTag && (
                  <span className="inline-flex items-center gap-2 px-1 py-1 text-sm font-bold text-[var(--ink-soft)]">
                    {intentionMeta[intentionTag]?.label}
                    <button type="button" onClick={() => { setIntentionTag(""); resetPagination(); }}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-2 px-1 py-1 text-sm font-bold text-[var(--ink-soft)]">
                    {city}
                    <button type="button" onClick={() => { setCity(""); resetPagination(); }} aria-label="Clear state filter">
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <ListingGridSkeleton count={12} />
            ) : loadError ? (
              <div className="border-y border-[var(--line-soft)] px-5 py-16 text-center" role="alert">
                <span className="icon-frame mx-auto h-12 w-12" data-preserve-icon-frame>
                  <Package size={22} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">The market did not load</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-[var(--ink-soft)]">Check your connection and try again.</p>
                <Button type="button" variant="outline" onClick={() => void fetchListings()} className="mt-5">Try again</Button>
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid auto-rows-fr grid-cols-3 gap-2 md:gap-4 xl:grid-cols-4">
                  {listings.map((item, index) => <ListingCard key={item.id} item={item} eager={index === 0} />)}
                </div>

                {(page > 1 || hasMore) && (
                  <div className="mt-12 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => {
                        const history = [...cursorHistory];
                        const previous = history.pop() ?? null;
                        setCursorHistory(history);
                        setCursor(previous);
                        setPage((current) => Math.max(1, current - 1));
                      }}
                      className="rounded-full border-[var(--border)] bg-white font-bold"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm font-bold text-[var(--ink-soft)]">
                      Page {page}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!hasMore || !nextCursor}
                      onClick={() => {
                        if (!nextCursor) return;
                        setCursorHistory((current) => [...current, cursor]);
                        setCursor(nextCursor);
                        setPage((current) => current + 1);
                      }}
                      className="rounded-full border-[var(--border)] bg-white font-bold"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="border-t border-[#f1f0ec] px-6 py-16 text-center">
                <Package className="mx-auto mb-5 text-[var(--lavender)]" size={42} aria-hidden="true" />
                <h3 className="text-2xl font-bold text-[var(--foreground)]">No items found</h3>
                <p className="mx-auto mt-3 max-w-md font-medium text-[var(--ink-soft)]">No items match these filters.</p>
                <Button asChild className="mt-7 rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
                  <Link href="/sell-item">List the first item</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/35" onClick={() => setShowFilters(false)} />
          <div
            className="mobile-filter-entry absolute bottom-0 left-0 right-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketplace-filter-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/55 px-4 py-3">
              <div>
                <span className="mb-2 block h-1 w-10 rounded-full bg-[var(--border)] lg:hidden" aria-hidden="true" />
                <h2 id="marketplace-filter-title" className="text-xl font-bold text-[var(--foreground)]">Filters</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Narrow the market</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--ink-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                aria-label="Close filters"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <FilterPanel embedded />
            </div>
            <div className="shrink-0 border-t border-[var(--border)]/55 bg-white px-4 pb-[calc(0.75rem+var(--safe-area-bottom))] pt-3">
              <Button
                className="h-12 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
