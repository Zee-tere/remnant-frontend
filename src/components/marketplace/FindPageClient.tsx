"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, Filter, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { nigerianStates } from "@/lib/nigeria-locations";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/lib/auth";

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
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-3 pb-8 pt-2 md:px-8 md:pb-20 md:pt-8">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative h-12 min-w-0 flex-1 overflow-hidden rounded-lg border border-[var(--border)]/70 bg-white md:rounded-full">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search the market"
            className="h-12 rounded-lg border-0 bg-transparent pl-4 pr-12 text-base font-medium shadow-none focus-visible:ring-0 md:rounded-full"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center bg-[var(--brand)] text-white transition-colors hover:bg-[var(--brand-dark)] md:rounded-full"
            aria-label="Search"
          >
            <Search size={16} strokeWidth={2.15} aria-hidden="true" />
          </button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters((current) => !current)}
          className="h-12 shrink-0 rounded-lg border-[var(--border)]/70 bg-white px-3 text-sm font-bold md:rounded-full md:px-5"
        >
          {showFilters ? <X size={15} /> : <Filter size={15} />}
          Filter
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
        </Button>
      </form>

      <section className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-[var(--border)]/70 px-0.5 py-2.5 md:mt-4 md:py-3" aria-label="Pair alerts">
        <BellRing size={16} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
        <p className="min-w-0 truncate text-xs font-semibold text-[var(--ink-soft)] md:text-sm">
          <span className="md:hidden">Missing a piece?</span>
          <span className="hidden md:inline">Looking for one missing piece?</span>
        </p>
        <Link href={isAuthenticated ? alertPath : `/login?redirect=${encodeURIComponent(alertPath)}`} className="inline-flex h-8 items-center rounded-full px-2 text-xs font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)] md:px-3">
          <span className="md:hidden">Set alert</span>
          <span className="hidden md:inline">Set a private alert</span>
        </Link>
      </section>

      {showFilters && (
        <section className="mt-3 grid gap-3 rounded-lg border border-[var(--border)] bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:p-4">
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
          <div className="flex gap-2">
            {hasFilters && <Button type="button" variant="outline" onClick={resetFilters} className="rounded-full">Reset</Button>}
            <Button type="button" onClick={() => { void loadListings(); setShowFilters(false); }} className="rounded-full bg-[var(--brand)] font-bold text-white">Apply</Button>
          </div>
        </section>
      )}

      <div className="mb-3 mt-4 flex items-center justify-between md:mb-5 md:mt-6">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] md:text-sm">{listings.length} item{listings.length === 1 ? "" : "s"}</p>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
        </div>
      ) : listings.length > 0 ? (
        <section className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {listings.map((item, index) => <ListingCard key={item.id} item={item} eager={index === 0} />)}
        </section>
      ) : (
        <section className="border-t border-[var(--border)] py-16 text-center">
          <h1 className="text-lg font-bold text-[var(--foreground)]">No items found</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Try another search or remove a filter.</p>
        </section>
      )}
    </main>
  );
}
