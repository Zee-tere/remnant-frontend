"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ListingGridSkeleton } from "@/components/feedback/LoadingState";
import { listingCategories } from "@/lib/categories";
import { nigerianStates } from "@/lib/nigeria-locations";
import { useAuthStore } from "@/lib/auth";

const intentOptions = [
  { value: "", label: "All intents" },
  { value: "SELL", label: "For sale" },
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
  initialPage: number;
}

export default function FindPageClient({
  initialListings,
  initialSearch,
  initialCategory,
  initialCity,
  initialIntent,
  initialPage,
}: FindPageClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [listings] = useState<ListingCardItem[]>(initialListings);
  const [loading, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [intent, setIntent] = useState(initialIntent);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const alertPath = "/user/dashboard?section=pair-alerts&create=1";

  const navigate = (page = 1) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (intent) params.set('intent', intent);
    if (page > 1) params.set('page', String(page));
    startTransition(() => router.push(`/find-a-pair${params.size ? `?${params.toString()}` : ''}`));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(1);
  };

  const resetFilters = () => {
    setCategory("");
    setCity("");
    setIntent("");
  };

  const hasFilters = Boolean(category || city || intent);

  return (
    <main className="mx-auto min-h-screen max-w-7xl bg-white px-4 pb-10 pt-4 sm:px-5 md:px-8 md:pb-20 md:pt-7">
      <section className="mb-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--line-soft)] px-0.5 pb-3 md:mb-5 md:pb-4" aria-label="Pair alerts">
        <span className="flex h-9 w-9 items-center justify-center text-[var(--amber)]"><BellRing size={17} aria-hidden="true" /></span>
        <p className="min-w-0 truncate text-sm font-bold text-[var(--foreground)]">Can’t find the exact piece?</p>
        <Link href={isAuthenticated ? alertPath : `/login?redirect=${encodeURIComponent(alertPath)}`} className="inline-flex h-8 items-center border-b border-transparent px-1 text-xs font-bold text-[var(--brand)] hover:border-[var(--brand)] md:text-sm">
          Set alert
        </Link>
      </section>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative h-13 min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--border)]/75 bg-white transition-colors focus-within:border-[var(--brand)]">
          <Input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search listings"
            placeholder="Try: iPhone 13 case, left AirPod"
            className="h-13 border-0 bg-transparent pl-4 pr-14 text-base font-medium shadow-none focus-visible:ring-0"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center bg-white text-[var(--aqua)] transition-[color,transform] hover:text-[var(--brand)] active:scale-[0.97]"
            aria-label="Search"
          >
            <Search className="search-glyph" size={17} strokeWidth={2.15} aria-hidden="true" />
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
            <Button type="button" variant="ghost" onClick={() => { navigate(1); setShowFilters(false); }} className="ink-underline flex-1 bg-transparent font-bold text-[var(--brand)] hover:bg-transparent md:flex-none">Apply filters</Button>
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
        <section className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 xl:grid-cols-4">
          {listings.map((item, index) => <ListingCard key={item.id} item={item} eager={index === 0} />)}
        </section>
      ) : (
        <section className="border-y border-[var(--line-soft)] py-16 text-center">
          <Search className="search-glyph mx-auto text-[var(--aqua)]" size={42} aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">No pieces found yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-[var(--muted-foreground)]">Check the spelling, try a shorter item name, or search without filters.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {(hasFilters || searchTerm) && <Button type="button" variant="outline" onClick={() => { setSearchTerm(''); setCategory(''); setCity(''); setIntent(''); startTransition(() => router.push('/find-a-pair')); }}>Clear search</Button>}
            <Button asChild variant="outline"><Link href={isAuthenticated ? alertPath : `/login?redirect=${encodeURIComponent(alertPath)}`}>Set a pair alert</Link></Button>
          </div>
        </section>
      )}

      {!loading && listings.length > 0 && (initialPage > 1 || listings.length === 24) && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Search result pages">
          <Button type="button" variant="outline" disabled={initialPage <= 1} onClick={() => navigate(initialPage - 1)}>Previous</Button>
          <span className="text-sm font-semibold text-[var(--muted-foreground)]">Page {initialPage}</span>
          <Button type="button" variant="outline" disabled={listings.length < 24} onClick={() => navigate(initialPage + 1)}>Next</Button>
        </nav>
      )}
    </main>
  );
}
