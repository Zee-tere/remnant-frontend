"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  Filter,
  HandHeart,
  Loader2,
  MapPin,
  Package,
  Recycle,
  RefreshCw,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingsApi } from "@/lib/api";
import { listingCategories } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  intentionTag: string;
  price: string | null;
  images: string[];
  city: string | null;
  slug: string;
  user?: { id: string; name: string; avatarUrl: string | null; trustTier: string };
}

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  SELL: { icon: DollarSign, label: "For Sale", color: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]" },
  TRADE: { icon: RefreshCw, label: "Trade", color: "text-[var(--secondary-blue)]", bg: "bg-[#e2f7ff]" },
  DONATE: { icon: HandHeart, label: "Free", color: "text-[var(--tertiary-gold)]", bg: "bg-[#fff6cf]" },
  FIX: { icon: Wrench, label: "Needs Fix", color: "text-orange-700", bg: "bg-orange-50" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-700", bg: "bg-teal-50" },
};

const conditionLabels: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [intentionTag, setIntentionTag] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: page.toString(), limit: "12" };
      if (submittedSearch) params.search = submittedSearch;
      if (category) params.category = category;
      if (intentionTag) params.intentionTag = intentionTag;

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
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    const initialCategory = params.get("category") || "";
    const initialIntent = params.get("intentionTag") || "";
    setSearchTerm(initialSearch);
    setSubmittedSearch(initialSearch);
    if (initialCategory) setCategory(initialCategory);
    if (initialIntent) setIntentionTag(initialIntent);
  }, []);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, intentionTag, submittedSearch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(searchTerm.trim());
  };

  const clearFilters = () => {
    setCategory("");
    setIntentionTag("");
    setSearchTerm("");
    setSubmittedSearch("");
    setPage(1);
  };

  const hasActiveFilters = category || intentionTag || submittedSearch;

  const FilterPanel = () => (
    <div className="surface-card rounded-[2rem] p-6">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Filters</h2>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-sm font-bold text-[var(--brand)] hover:underline">
            Reset
          </button>
        )}
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Category</h3>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="h-12 w-full rounded-full border border-[var(--border)]/70 bg-white px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
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
          <h3 className="mb-4 text-sm font-bold uppercase text-[var(--muted-foreground)]">Intent</h3>
          <div className="space-y-3">
            {Object.entries(intentionMeta).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-full p-1.5 transition-colors hover:bg-[var(--sand)]">
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
        <header className="mb-8 md:mb-12">
          <div className="mb-4 inline-flex items-center rounded-full bg-[var(--brand-soft)] px-4 py-2 text-xs font-bold text-[var(--brand)] md:mb-5 md:text-sm">
            Explore Remnant
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_480px] lg:items-end">
            <div>
              <h1 className="text-[1.8rem] font-bold text-[var(--foreground)] md:text-6xl">Explore useful pieces</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[var(--ink-soft)] md:mt-4 md:text-lg md:leading-8">
                Browse single items, useful parts, and pieces ready for a second life.
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-[var(--border)]/55 bg-white p-1.5 soft-shadow md:p-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Search
                  className="ml-2 shrink-0 text-[var(--muted-foreground)] md:ml-3"
                  size={19}
                  aria-hidden="true"
                />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Find a piece..."
                  className="h-10 min-w-0 rounded-full border-0 bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:ring-0 md:h-12 md:text-base"
                />
              </div>
              <Button
                type="submit"
                className="h-10 shrink-0 rounded-full bg-[var(--brand)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-dark)] md:h-12 md:px-6"
              >
                Search
              </Button>
            </form>
          </div>
        </header>

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
                    <button type="button" onClick={() => { setSubmittedSearch(""); setSearchTerm(""); }}>
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
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Loader2 size={30} className="animate-spin text-[var(--brand)]" />
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {listings.map((item, index) => {
                    const intent = intentionMeta[item.intentionTag] || intentionMeta.SELL;
                    const IntentIcon = intent.icon;
                    const featured = index === 0 || index === 4;

                    return (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={featured ? "md:col-span-2" : ""}
                      >
                        <Link href={`/marketplace/${item.id}`} className="group block h-full">
                          <div className={`surface-card lift-card flex h-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] ${featured ? "flex-col sm:flex-row" : "flex-col"}`}>
                            <div className={`${featured ? "sm:w-1/2" : "w-full"} relative aspect-[4/3] overflow-hidden bg-[var(--sand)]`}>
                              {item.images?.[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
                                  <Package size={44} aria-hidden="true" />
                                </div>
                              )}
                              <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${intent.bg} ${intent.color}`}>
                                <IntentIcon size={14} aria-hidden="true" />
                                {intent.label}
                              </span>
                              {item.condition && (
                                <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[var(--ink-soft)] shadow-sm">
                                  {conditionLabels[item.condition] || item.condition}
                                </span>
                              )}
                            </div>

                            <div className={`${featured ? "sm:w-1/2" : "w-full"} flex flex-1 flex-col p-4 md:p-6`}>
                              <div>
                                <h3 className="line-clamp-2 text-lg font-bold leading-tight text-[var(--foreground)] md:text-2xl">
                                  {item.title}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[var(--ink-soft)] md:mt-3 md:line-clamp-3 md:text-base md:leading-7">
                                  {item.description}
                                </p>
                              </div>
                              <div className="mt-auto flex items-end justify-between gap-4 pt-4 md:pt-6">
                                <div>
                                  <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Asking Price</p>
                                  <p className="mt-1 text-lg font-bold text-[var(--brand)] md:text-2xl">
                                    {item.price ? formatCurrency(Number(item.price)) : "Free"}
                                  </p>
                                </div>
                                {item.city && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-bold text-[var(--ink-soft)]">
                                    <MapPin size={13} aria-hidden="true" />
                                    {item.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
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
                <p className="mx-auto mt-3 max-w-md font-medium text-[var(--ink-soft)]">
                  {hasActiveFilters
                    ? "Try changing the search or clearing filters to reveal more pieces."
                    : "The marketplace is empty. Be the first person to list a useful piece."}
                </p>
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
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[2rem] bg-white"
          >
            <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-5">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sand)] text-[var(--ink-soft)]"
                aria-label="Close filters"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
              <FilterPanel />
            </div>
            <div className="shrink-0 border-t border-[var(--border)]/55 bg-white/95 px-5 pb-[calc(1rem+var(--safe-area-bottom))] pt-3 backdrop-blur">
              <Button
                className="h-12 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
