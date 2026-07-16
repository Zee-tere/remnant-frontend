"use client";

import { useEffect, useState } from "react";
import { Filter, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { nigerianStates } from "@/lib/nigeria-locations";

interface Listing extends ListingCardItem {
  description: string;
  category: string;
  condition: string;
  pairingKeyword: string | null;
}

const intentOptions = [
  { value: "", label: "All intents" },
  { value: "SELL", label: "Buy" },
  { value: "TRADE", label: "Trade" },
  { value: "DONATE", label: "Donate" },
  { value: "FIX", label: "Repair" },
  { value: "RECYCLE", label: "Recycle" },
];

export default function FindAPairPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [intent, setIntent] = useState("");

  const loadListings = (search = searchTerm) => {
    setLoading(true);
    const params: Record<string, string> = { limit: "24" };
    if (search.trim()) params.q = search.trim();
    if (category) params.category = category;
    if (city) params.city = city;
    if (intent) params.intent = intent;

    listingsApi
      .searchListings(params)
      .then((data: Listing[]) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search")?.trim() || "";
    setSearchTerm(initialSearch);

    const requestParams: Record<string, string> = { limit: "24" };
    if (initialSearch) requestParams.q = initialSearch;
    listingsApi
      .searchListings(requestParams)
      .then((data: Listing[]) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadListings(searchTerm);
  };

  const resetFilters = () => {
    setCategory("");
    setCity("");
    setIntent("");
  };

  const hasFilters = Boolean(category || city || intent);

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-3 pb-20 pt-3 md:px-8 md:pt-8">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} aria-hidden="true" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search the market"
            className="h-11 rounded-full border-0 bg-transparent pl-11 pr-16 text-sm font-semibold shadow-none focus-visible:ring-0 md:h-12 md:text-base"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white md:right-1.5 md:top-1.5"
            aria-label="Search"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters((current) => !current)}
          className="h-11 shrink-0 rounded-full border-[var(--border)] bg-white px-3 text-xs font-bold md:h-12 md:px-5 md:text-sm"
        >
          {showFilters ? <X size={16} /> : <Filter size={16} />}
          Filter
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
        </Button>
      </form>

      {showFilters && (
        <section className="mt-3 grid gap-2 rounded-lg border border-[var(--border)] bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:p-4">
          <label className="space-y-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">State</span>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm">
              <option value="">All states</option>
              {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm">
              <option value="">All categories</option>
              {listingCategories.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-[var(--muted-foreground)]">Intent</span>
            <select value={intent} onChange={(event) => setIntent(event.target.value)} className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm">
              {intentOptions.map((item) => <option key={item.value || "all"} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            {hasFilters && <Button type="button" variant="outline" onClick={resetFilters} className="rounded-full">Reset</Button>}
            <Button type="button" onClick={() => { loadListings(); setShowFilters(false); }} className="rounded-full bg-[var(--brand)] font-bold text-white">Apply</Button>
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
        <section className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {listings.map((item) => <ListingCard key={item.id} item={item} />)}
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
