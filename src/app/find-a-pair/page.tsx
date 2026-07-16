"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  HandHeart,
  Loader2,
  MapPin,
  Package,
  Recycle,
  RefreshCw,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { NairaIcon } from "@/components/ui/naira-icon";

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
  pairingKeyword: string | null;
}

const intentionMeta: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  SELL: { icon: NairaIcon, label: "For Sale", color: "text-[var(--brand)]", bg: "bg-[var(--brand-soft)]" },
  TRADE: { icon: RefreshCw, label: "Trade", color: "text-[var(--secondary-blue)]", bg: "bg-[#e2f7ff]" },
  DONATE: { icon: HandHeart, label: "Free", color: "text-[var(--tertiary-gold)]", bg: "bg-[#fff6cf]" },
  FIX: { icon: Wrench, label: "Needs Fix", color: "text-orange-700", bg: "bg-orange-50" },
  RECYCLE: { icon: Recycle, label: "Recycle", color: "text-teal-700", bg: "bg-teal-50" },
};

export default function FindAPairPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = (search = "") => {
    setLoading(true);
    const params: Record<string, string> = { limit: "20" };
    if (search) params.search = search;
    listingsApi
      .getListings(params)
      .then((data: { listings: Listing[] }) => setListings(data.listings || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search")?.trim() || "";
    setSearchTerm(initialSearch);
    setSubmittedSearch(initialSearch);
    loadListings(initialSearch);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = searchTerm.trim();
    setSubmittedSearch(value);
    loadListings(value);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
        <section className="mx-auto mb-8 max-w-4xl text-center md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-4 py-2 text-xs font-bold text-[var(--brand)] md:mb-5 md:text-sm">
            <Sparkles size={16} aria-hidden="true" />
            Pairing
          </div>
          <h1 className="text-[1.8rem] font-bold leading-tight text-[var(--foreground)] md:text-6xl">Find the other half</h1>
        </section>

        <form onSubmit={handleSearch} className="mx-auto mb-10 max-w-3xl rounded-full border border-[var(--border)]/55 bg-white p-1.5 soft-shadow md:mb-14 md:p-2">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} aria-hidden="true" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Missing lid, left shoe, AirPod case..."
              className="h-12 rounded-full border-0 bg-transparent pl-12 pr-20 font-semibold shadow-none focus-visible:ring-0 md:h-14 md:pl-14 md:pr-28"
            />
            <Button type="submit" className="absolute right-1.5 top-1.5 h-9 rounded-full bg-[var(--brand)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-dark)] md:h-11 md:px-6">
              Find
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[var(--brand)]" />
          </div>
        ) : listings.length > 0 ? (
          <section className="space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
                  {submittedSearch ? `Matches for "${submittedSearch}"` : "Available matches"}
                </h2>
                <p className="mt-2 font-medium text-[var(--muted-foreground)]">{listings.length} item{listings.length !== 1 && "s"} found</p>
              </div>
              <Button asChild variant="outline" className="rounded-full border-[var(--border)] bg-white font-bold">
                <Link href="/marketplace">
                  Open marketplace
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:gap-6 lg:grid-cols-3">
              {listings.map((item, index) => {
                const intent = intentionMeta[item.intentionTag] || intentionMeta.SELL;
                const IntentIcon = intent.icon;
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link href={`/marketplace/${item.id}`} className="group block h-full">
                      <div className="surface-card lift-card h-full overflow-hidden rounded-lg md:rounded-[2rem]">
                        <div className="relative aspect-square overflow-hidden bg-[var(--sand)] md:aspect-[4/3]">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
                              <Package size={44} aria-hidden="true" />
                            </div>
                          )}
                          <span className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-[0.58rem] font-bold md:left-4 md:top-4 md:gap-1.5 md:px-3 md:text-xs ${intent.bg} ${intent.color}`}>
                            <IntentIcon size={11} className="md:h-3.5 md:w-3.5" aria-hidden="true" />
                            {intent.label}
                          </span>
                        </div>
                        <div className="p-2.5 md:p-6">
                          <h3 className="line-clamp-1 text-[0.78rem] font-bold text-[var(--foreground)] md:text-2xl">{item.title}</h3>
                          <p className="mt-3 hidden line-clamp-2 text-base font-medium leading-7 text-[var(--ink-soft)] md:block">{item.description}</p>
                          {item.pairingKeyword && (
                            <p className="mt-1.5 line-clamp-1 text-[0.58rem] font-bold text-[var(--brand)] md:mt-4 md:inline-flex md:rounded-full md:bg-[var(--brand-soft)] md:px-3 md:py-1 md:text-sm">
                              Pairs with: {item.pairingKeyword}
                            </p>
                          )}
                          <div className="mt-2.5 flex min-w-0 items-center justify-between gap-1 md:mt-5 md:gap-3">
                            <span className="truncate text-[0.78rem] font-bold text-[var(--brand)] md:text-xl">
                              {item.price ? formatCurrency(Number(item.price)) : "Free"}
                            </span>
                            {item.city && (
                              <span className="inline-flex min-w-0 max-w-[52%] items-center gap-0.5 text-[0.58rem] font-bold text-[var(--muted-foreground)] md:gap-1 md:text-sm">
                                <MapPin size={10} className="shrink-0 md:h-3.5 md:w-3.5" aria-hidden="true" />
                                <span className="truncate">{item.city}</span>
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
          </section>
        ) : (
          <section className="surface-card mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <Sparkles size={30} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">No matches yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-[var(--ink-soft)] md:text-base md:leading-7">
              Try another search or list the item you want to match.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
                <Link href="/sell-item">List an item</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-[var(--border)] bg-white font-bold">
                <Link href="/marketplace">Browse marketplace</Link>
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
