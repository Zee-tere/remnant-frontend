"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Filter,
  HandHeart,
  Loader2,
  Package,
  Recycle,
  RefreshCw,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { NairaIcon } from "@/components/ui/naira-icon";
import { nigerianStates } from "@/lib/nigeria-locations";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import type { PublicListingPage } from "@/lib/public-listings";

type Listing = ListingCardItem;

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  SELL: { icon: NairaIcon, label: "For Sale", color: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]" },
  TRADE: { icon: RefreshCw, label: "Trade", color: "text-[var(--secondary-blue)]", bg: "bg-[#e2f7ff]" },
  DONATE: { icon: HandHeart, label: "Free", color: "text-[var(--tertiary-gold)]", bg: "bg-[#fff6cf]" },
  FIX: { icon: Wrench, label: "Needs Fix", color: "text-orange-700", bg: "bg-orange-50" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-700", bg: "bg-teal-50" },
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
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [showFilters, setShowFilters] = useState(false);
  const isInitialRender = useRef(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: page.toString(), limit: "12" };
      if (submittedSearch) params.search = submittedSearch;
      if (category) params.category = category;
      if (intentionTag) params.intentionTag = intentionTag;
      if (city) params.city = city;

      const data = await listingsApi.getListings(params);
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setListings([]);
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
  }, [page, category, intentionTag, city, submittedSearch]);

  const clearFilters = () => {
    setCategory("");
    setIntentionTag("");
    setCity("");
    setSubmittedSearch("");
    setPage(1);
  };

  const hasActiveFilters = category || intentionTag || city || submittedSearch;

  const FilterPanel = ({ embedded = false }: { embedded?: boolean } = {}) => (
    <div className={embedded ? "" : "surface-card rounded-[2rem] p-6"}>
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

      <div className={embedded ? "space-y-5" : "space-y-8"}>
        <div>
          <h3 className={`${embedded ? "mb-2 text-xs" : "mb-4 text-sm"} font-bold uppercase text-[var(--muted-foreground)]`}>State</h3>
          <select
            value={city}
            onChange={(event) => { setCity(event.target.value); setPage(1); }}
            className={`h-12 w-full border border-[var(--border)]/70 bg-white px-4 font-semibold text-[var(--foreground)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 ${embedded ? "rounded-lg text-base" : "rounded-full text-sm"}`}
          >
            <option value="">All states</option>
            {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>

        <div>
          <h3 className={`${embedded ? "mb-2 text-xs" : "mb-4 text-sm"} font-bold uppercase text-[var(--muted-foreground)]`}>Category</h3>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className={`h-12 w-full border border-[var(--border)]/70 bg-white px-4 font-semibold text-[var(--foreground)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 ${embedded ? "rounded-lg text-base" : "rounded-full text-sm"}`}
          >
            <option value="">All pieces</option>
            {listingCategories.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className={`${embedded ? "mb-2 text-xs" : "mb-4 text-sm"} font-bold uppercase text-[var(--muted-foreground)]`}>Intent</h3>
          <div className={embedded ? "space-y-0.5" : "space-y-3"}>
            {Object.entries(intentionMeta).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <label key={key} className={`flex cursor-pointer items-center gap-3 transition-colors hover:bg-[var(--sand)] ${embedded ? "min-h-11 rounded-lg px-2" : "rounded-full p-1.5"}`}>
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--border)]">
                    <input
                      type="radio"
                      name="intention"
                      value={key}
                      checked={intentionTag === key}
                      onChange={(event) => {
                        setIntentionTag(event.target.value);
                        setPage(1);
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

        <div className="border-t border-[var(--border)]/45 pt-5">
          <p className="text-sm font-semibold text-[var(--ink-soft)]">
            <span className="text-2xl font-bold text-[var(--brand)]">{total}</span> item{total !== 1 && "s"} found
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-7 md:px-8 md:pt-10">
        <header className="mb-4 md:mb-8">
          <h1 className="page-heading-entry text-xl font-bold text-[var(--foreground)] md:text-4xl">
            Explore the market
          </h1>
        </header>

        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide lg:hidden" aria-label="Filter by intent">
          {[{ key: '', label: 'All' }, ...Object.entries(intentionMeta).map(([key, meta]) => ({ key, label: key === 'SELL' ? 'Buy' : meta.label }))].map((item) => (
            <button
              key={item.key || 'all'}
              type="button"
              onClick={() => { setIntentionTag(item.key); setPage(1); }}
              className={`min-h-11 shrink-0 rounded-full border px-3 text-xs font-bold transition-colors ${
                intentionTag === item.key
                  ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                  : 'border-[var(--border)] bg-white text-[var(--ink-soft)]'
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
                <span className="font-bold text-[var(--foreground)]">{total}</span> item{total !== 1 && "s"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="rounded-full border-[var(--border)] bg-white font-bold"
              >
                <Filter size={15} aria-hidden="true" />
                Filters
                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />}
              </Button>
            </div>

            {hasActiveFilters && (
              <div className="mb-5 flex flex-wrap gap-2">
                {submittedSearch && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-bold text-[var(--brand)]">
                    {submittedSearch}
                    <button type="button" onClick={() => setSubmittedSearch("")}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-[var(--ink-soft)]">
                    {category}
                    <button type="button" onClick={() => setCategory("")}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {intentionTag && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-[var(--ink-soft)]">
                    {intentionMeta[intentionTag]?.label}
                    <button type="button" onClick={() => setIntentionTag("")}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-[var(--ink-soft)]">
                    {city}
                    <button type="button" onClick={() => setCity("")} aria-label="Clear state filter">
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Loader2 size={30} className="animate-spin text-[var(--brand)]" />
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid auto-rows-fr grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
                  {listings.map((item, index) => <ListingCard key={item.id} item={item} eager={index === 0} />)}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="rounded-full border-[var(--border)] bg-white font-bold"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm font-bold text-[var(--ink-soft)]">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="rounded-full border-[var(--border)] bg-white font-bold"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="surface-card rounded-[2rem] px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Package size={30} aria-hidden="true" />
                </div>
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
          <div className="mobile-filter-entry absolute bottom-0 left-0 right-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-xl bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)]/55 px-4 py-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Filters</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Narrow the market</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--sand)] text-[var(--ink-soft)]"
                aria-label="Close filters"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <FilterPanel embedded />
            </div>
            <div className="shrink-0 border-t border-[var(--border)]/55 bg-white/95 px-4 pb-[calc(0.75rem+var(--safe-area-bottom))] pt-3 backdrop-blur">
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
