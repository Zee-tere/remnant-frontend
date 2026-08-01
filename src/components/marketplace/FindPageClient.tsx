"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, Filter, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ListingGridSkeleton } from "@/components/feedback/LoadingState";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { nigerianStates } from "@/lib/nigeria-locations";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/lib/auth";
import { ActionArtwork } from "@/components/brand/ActionArtwork";

const intentOptions = [
  { value: "", label: "All intents" },
  { value: "SELL", label: "Buy" },
  { value: "TRADE", label: "Trade" },
  { value: "DONATE", label: "Donate" },
  { value: "FIX", label: "Repair" },
  { value: "RECYCLE", label: "Recycle" },
];

interface FindPageClientProps {
  initialListings: ListingCardItem[];
  initialSearch: string;
  initialCategory: string;
  initialCity: string;
  initialIntent: string;
}

export default function FindPageClient({
  initialListings,
  initialSearch,
  initialCategory,
  initialCity,
  initialIntent,
}: FindPageClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [listings, setListings] = useState<ListingCardItem[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [intent, setIntent] = useState(initialIntent);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const alertPath = "/user/dashboard?section=pair-alerts&create=1";

  const loadListings = async (search = searchTerm) => {
    setLoading(true);
    const params: Record<string, string> = { limit: "24" };
    if (search.trim()) params.q = search.trim();
    if (category) params.category = category;
    if (city) params.city = city;
    if (intent) params.intent = intent;

    try {
      const data = await listingsApi.searchListings(params);
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      setListings([]);
      toast.error(getApiErrorMessage(error, "Search could not be completed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    void loadListings(searchTerm);
  };

  const resetFilters = () => {
    setCategory("");
    setCity("");
    setIntent("");
  };

  const hasFilters = Boolean(category || city || intent);

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-[var(--background)] px-4 pb-10 pt-7 sm:px-5 md:px-8 md:pb-20 md:pt-12">
      <header className="mb-7 grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4 md:mb-11 md:grid-cols-[minmax(0,1fr)_11rem] md:gap-10">
        <div>
          <p className="section-kicker mb-3">Search by the detail that matters</p>
          <h1 className="max-w-3xl text-4xl font-bold text-[var(--foreground)] md:text-6xl">Find the piece that fits.</h1>
          <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[var(--ink-soft)]">
            Try the object, brand, model, colour, size, or the exact missing part.
          </p>
        </div>
        <ActionArtwork name="find" priority className="h-16 w-16 md:h-44 md:w-44" />
      </header>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative h-13 min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--border)]/75 bg-white transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand)]/10">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search the market"
            className="h-13 border-0 bg-transparent pl-4 pr-14 text-base font-medium shadow-none focus-visible:ring-0"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand)] text-white transition-[background-color,transform] hover:bg-[var(--brand-dark)] active:scale-[0.97]"
            aria-label="Search"
          >
            <Search size={16} strokeWidth={2.15} aria-hidden="true" />
          </button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters((current) => !current)}
          className="h-13 shrink-0 border-[var(--border)] bg-white px-3 text-sm font-bold shadow-none md:px-4"
        >
          {showFilters ? <X size={15} /> : <Filter size={15} />}
          Filter
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
        </Button>
      </form>

      <section className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--line-soft)] px-0.5 py-3 md:mt-5 md:py-4" aria-label="Pair alerts">
        <span className="icon-frame icon-frame--amber h-9 w-9" data-preserve-icon-frame><BellRing size={16} aria-hidden="true" /></span>
        <p className="min-w-0 truncate text-xs font-semibold text-[var(--ink-soft)] md:text-sm">
          <span className="md:hidden">Missing a piece?</span>
          <span className="hidden md:inline">Looking for one missing piece?</span>
        </p>
        <Link href={isAuthenticated ? alertPath : `/login?redirect=${encodeURIComponent(alertPath)}`} className="inline-flex h-8 items-center border-b border-transparent px-1 text-xs font-bold text-[var(--brand)] hover:border-[var(--brand)] md:px-2">
          <span className="md:hidden">Set alert</span>
          <span className="hidden md:inline">Set a private alert</span>
        </Link>
      </section>

      {showFilters && (
        <div className="fixed inset-0 z-[70] md:static md:z-auto">
          <div className="absolute inset-0 bg-black/35 md:hidden" onClick={() => setShowFilters(false)} />
          <section className="mobile-filter-entry absolute inset-x-0 bottom-0 max-h-[84dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[calc(1rem+var(--safe-area-bottom))] pt-3 md:static md:mt-4 md:grid md:max-h-none md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:gap-3 md:overflow-visible md:rounded-none md:border-y md:border-[var(--line-soft)] md:bg-transparent md:px-1 md:py-4 md:[animation:none]" aria-label="Search filters">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--line-soft)] pb-3 md:hidden">
            <div>
              <span className="mb-2 block h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden="true" />
              <h2 className="text-xl font-bold">Refine the search</h2>
            </div>
            <button type="button" onClick={() => setShowFilters(false)} className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--ink-soft)] hover:bg-[var(--brand-soft)]" aria-label="Close filters">
              <X size={19} aria-hidden="true" />
            </button>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">State</span>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-base">
              <option value="">All states</option>
              {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-base">
              <option value="">All categories</option>
              {listingCategories.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">Intent</span>
            <select value={intent} onChange={(event) => setIntent(event.target.value)} className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-base">
              {intentOptions.map((item) => <option key={item.value || "all"} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <div className="mt-4 flex gap-2 md:mt-0">
            {hasFilters && <Button type="button" variant="outline" onClick={resetFilters}>Reset</Button>}
            <Button type="button" onClick={() => { void loadListings(); setShowFilters(false); }} className="flex-1 font-bold text-white md:flex-none">Apply filters</Button>
          </div>
          </section>
        </div>
      )}

      <div className="mb-3 mt-4 flex items-center justify-between md:mb-5 md:mt-6">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] md:text-sm">{listings.length} item{listings.length === 1 ? "" : "s"}</p>
      </div>

      {loading ? (
        <ListingGridSkeleton />
      ) : listings.length > 0 ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {listings.map((item, index) => <ListingCard key={item.id} item={item} eager={index === 0} />)}
        </section>
      ) : (
        <section className="border-y border-[var(--line-soft)] py-16 text-center">
          <ActionArtwork name="find" className="mx-auto h-[4.5rem] w-[4.5rem] md:h-24 md:w-24" />
          <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">No pieces found yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-[var(--muted-foreground)]">Try another detail, remove a filter, or save a private alert for later.</p>
          <Button asChild variant="outline" className="mt-5">
            <Link href={isAuthenticated ? alertPath : `/login?redirect=${encodeURIComponent(alertPath)}`}>Set a pair alert</Link>
          </Button>
        </section>
      )}
    </main>
  );
}
