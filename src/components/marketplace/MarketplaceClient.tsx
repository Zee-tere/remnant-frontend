"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Filter, Package, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { nigerianStates } from "@/lib/nigeria-locations";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ListingGridSkeleton } from "@/components/feedback/LoadingState";
import type { PublicListingPage } from "@/lib/public-listings";

type Listing = ListingCardItem;

const intentions = [
  { value: "", label: "All" },
  { value: "SELL", label: "For sale" },
  { value: "TRADE", label: "Trade" },
  { value: "DONATE", label: "Free" },
  { value: "FIX", label: "Repair" },
  { value: "RECYCLE", label: "Recycle" },
];

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
  const [draftSearch, setDraftSearch] = useState(initialFilters.search);
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

  const selectCategory = (value: string) => {
    setCategory(value);
    resetPagination();
  };

  const selectIntent = (value: string) => {
    setIntentionTag(value);
    resetPagination();
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedSearch(draftSearch.trim());
    resetPagination();
  };

  const clearFilters = () => {
    setDraftSearch("");
    setSubmittedSearch("");
    setCategory("");
    setIntentionTag("");
    setCity("");
    resetPagination();
  };

  const hasActiveFilters = Boolean(category || intentionTag || city || submittedSearch);

  const CategoryList = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? "grid grid-cols-2 gap-x-5" : "space-y-0.5"} aria-label="Marketplace categories">
      <button
        type="button"
        onClick={() => selectCategory("")}
        className={`flex min-h-10 w-full items-center justify-between text-left text-sm transition-colors ${
          category === "" ? "font-bold text-black" : "font-semibold text-black/55 hover:text-black"
        }`}
        aria-pressed={category === ""}
      >
        <span>All categories</span>
        {category === "" && <span className="h-1.5 w-1.5 rounded-full bg-black" aria-hidden="true" />}
      </button>
      {listingCategories.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => selectCategory(item.label)}
          className={`flex min-h-10 w-full items-center justify-between gap-3 text-left text-sm transition-colors ${
            category === item.label ? "font-bold text-black" : "font-semibold text-black/55 hover:text-black"
          }`}
          aria-pressed={category === item.label}
        >
          <span>{item.label}</span>
          {category === item.label && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pt-8 lg:px-8">
        <form onSubmit={submitSearch} className="max-w-3xl" role="search">
          <div className="flex h-11 items-center rounded-full border border-black bg-white p-1 focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.07)]">
            <button type="submit" className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center text-black/50" aria-label="Search">
              <Search className="search-glyph" size={17} strokeWidth={2.1} aria-hidden="true" />
            </button>
            <Input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search an item, model, size or missing piece"
              aria-label="Search marketplace listings"
              className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </form>

        <div className="mt-5 flex gap-2 overflow-x-auto border-b border-black/10 pb-5 scrollbar-hide" aria-label="Filter by listing type">
          {intentions.map((intent) => (
            <button
              key={intent.value || "all"}
              type="button"
              onClick={() => selectIntent(intent.value)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors ${
                intentionTag === intent.value
                  ? "border-black bg-black text-white"
                  : "border-black/15 bg-white text-black/65 hover:border-black hover:text-black"
              }`}
              aria-pressed={intentionTag === intent.value}
            >
              {intent.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <aside className="sticky top-28 hidden border-r border-black/10 pr-7 lg:block">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Browse categories</h2>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="text-xs font-bold text-black/55 underline underline-offset-4 hover:text-black">
                  Reset
                </button>
              )}
            </div>
            <div className="mt-4">
              <CategoryList />
            </div>
            <div className="mt-7 border-t border-black/10 pt-6">
              <label htmlFor="marketplace-state" className="mb-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/40">
                Location
              </label>
              <Select
                id="marketplace-state"
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  resetPagination();
                }}
                className="border-black/20 bg-white font-semibold"
              >
                <option value="">All states</option>
                {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
              </Select>
            </div>
          </aside>

          <section className="min-w-0" aria-label="Marketplace listings">
            <div className="mb-7 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-black/55">
                <span className="font-bold text-black">{total}</span> item{total !== 1 && "s"}
                {submittedSearch ? <> for <span className="font-bold text-black">“{submittedSearch}”</span></> : null}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="border-black/20 bg-white font-bold text-black lg:hidden"
              >
                <Filter size={15} aria-hidden="true" />
                Categories & location
                {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-black" aria-hidden="true" />}
              </Button>
            </div>

            {hasActiveFilters && (
              <div className="mb-7 flex flex-wrap items-center gap-2">
                {submittedSearch && (
                  <button type="button" onClick={() => { setDraftSearch(""); setSubmittedSearch(""); resetPagination(); }} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#f3f3f3] px-3 text-xs font-bold text-black">
                    {submittedSearch}<X size={13} aria-hidden="true" />
                  </button>
                )}
                {category && (
                  <button type="button" onClick={() => selectCategory("")} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#f3f3f3] px-3 text-xs font-bold text-black">
                    {category}<X size={13} aria-hidden="true" />
                  </button>
                )}
                {city && (
                  <button type="button" onClick={() => { setCity(""); resetPagination(); }} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#f3f3f3] px-3 text-xs font-bold text-black">
                    {city}<X size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <ListingGridSkeleton count={9} />
            ) : loadError ? (
              <div className="border-y border-black/10 px-5 py-20 text-center" role="alert">
                <Package className="mx-auto text-black/25" size={38} aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold">The marketplace did not load</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-black/50">Check your connection and try again.</p>
                <Button type="button" variant="outline" onClick={() => void fetchListings()} className="mt-6 border-black/20 bg-white font-bold text-black">Try again</Button>
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid auto-rows-fr grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-11">
                  {listings.map((item, index) => <ListingCard key={item.id} item={item} eager={index === 0} />)}
                </div>

                {(page > 1 || hasMore) && (
                  <div className="mt-16 flex justify-center gap-3">
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
                      className="border-black/20 bg-white font-bold text-black"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm font-bold text-black/55">Page {page}</span>
                    <Button
                      variant="outline"
                      disabled={!hasMore || !nextCursor}
                      onClick={() => {
                        if (!nextCursor) return;
                        setCursorHistory((current) => [...current, cursor]);
                        setCursor(nextCursor);
                        setPage((current) => current + 1);
                      }}
                      className="border-black/20 bg-white font-bold text-black"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="border-t border-black/10 px-6 py-20 text-center">
                <Package className="mx-auto text-black/25" size={42} aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold">No items found</h2>
                <p className="mx-auto mt-3 max-w-md font-medium text-black/50">Try a wider search, clear a filter, or list the first useful item in this category.</p>
                <Button asChild className="mt-7 bg-black px-6 font-bold text-white hover:bg-black/85">
                  <Link href="/sell-item">List an item</Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      {showFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/35" onClick={() => setShowFilters(false)} aria-label="Close filters" />
          <div className="mobile-filter-entry absolute bottom-0 left-0 right-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[1.5rem] bg-white" role="dialog" aria-modal="true" aria-labelledby="marketplace-filter-title">
            <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-4">
              <div>
                <span className="mb-3 block h-1 w-10 rounded-full bg-black/15" aria-hidden="true" />
                <h2 id="marketplace-filter-title" className="text-xl font-bold">Browse</h2>
                <p className="mt-0.5 text-xs font-medium text-black/45">Choose a category and location</p>
              </div>
              <button type="button" onClick={() => setShowFilters(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-black hover:bg-black/5" aria-label="Close filters">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Categories</h3>
              <div className="mt-3"><CategoryList mobile /></div>
              <div className="mt-6 border-t border-black/10 pt-6">
                <label htmlFor="mobile-marketplace-state" className="mb-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/40">Location</label>
                <Select
                  id="mobile-marketplace-state"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    resetPagination();
                  }}
                  className="border-black/20 bg-white font-semibold"
                >
                  <option value="">All states</option>
                  {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                </Select>
              </div>
            </div>
            <div className="flex shrink-0 gap-3 border-t border-black/10 bg-white px-5 pb-[calc(1rem+var(--safe-area-bottom))] pt-4">
              {hasActiveFilters && (
                <Button type="button" variant="outline" className="h-12 flex-1 border-black/20 bg-white font-bold text-black" onClick={clearFilters}>Reset</Button>
              )}
              <Button type="button" className="h-12 flex-1 bg-black font-bold text-white hover:bg-black/85" onClick={() => setShowFilters(false)}>See {total} items</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
