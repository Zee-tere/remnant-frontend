"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  HandHeart,
  PackagePlus,
  Recycle,
  RefreshCw,
  ScanSearch,
  Search,
  ShoppingBag,
  Tag,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingCategories } from "@/lib/categories";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";

const marketplaceActions = [
  { label: "Find a pair", href: "/find-a-pair", icon: ScanSearch },
  { label: "Buy", href: "/marketplace", icon: ShoppingBag },
  { label: "Sell", href: "/sell-item?intent=SELL", icon: Tag },
  { label: "Trade", href: "/sell-item?intent=TRADE", icon: RefreshCw },
  { label: "Donate", href: "/sell-item?intent=DONATE", icon: HandHeart },
  { label: "Repair", href: "/sell-item?intent=FIX", icon: Wrench },
  { label: "Recycle", href: "/sell-item?intent=RECYCLE", icon: Recycle },
];

const howItWorks = [
  { number: "01", title: "List", text: "Describe the item or missing piece.", icon: PackagePlus },
  { number: "02", title: "Match", text: "Remnant compares details and location.", icon: ScanSearch },
  { number: "03", title: "Alert", text: "Get notified when a likely pair appears.", icon: BellRing },
];

export default function HomePageClient({
  initialFeaturedListings,
}: {
  initialFeaturedListings: ListingCardItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const search = query.trim();
    router.push(`/find-a-pair${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--background)] text-foreground">
      <section className="relative mx-auto flex min-h-[430px] max-w-7xl flex-col items-stretch justify-center px-4 pb-10 pt-9 text-left sm:px-5 md:min-h-[620px] md:items-center md:px-8 md:py-20 md:text-center">
        <div className="max-w-4xl">
          <p className="section-kicker mb-5 md:justify-center">Useful things belong somewhere</p>
          <h1 className="max-w-[23rem] text-balance text-[2.7rem] font-bold leading-[0.98] tracking-[-0.055em] text-[var(--foreground)] sm:max-w-xl sm:text-6xl md:mx-auto md:max-w-5xl md:text-[5rem] md:leading-[0.98]">
            Give your lonely pieces a{" "}
            <span className="hero-flourish relative inline-block pb-1 text-[var(--brand)]">
              second chance
              <svg className="hero-flourish__line" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 7.5 C36 2.5 92 11 148 4.5" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-5 max-w-[34rem] text-base font-medium leading-7 text-[var(--ink-soft)] md:mx-auto md:mt-7 md:text-lg md:leading-8">
            Find the missing half of a pair, or sell, trade, donate, repair, and recycle useful pieces
            with people nearby.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="relative z-10 mt-8 w-full max-w-3xl md:mt-12"
        >
          <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--border)]/75 bg-white p-1.5 md:gap-3 md:p-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)] md:left-5"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="I'm looking for a lid for a teapot..."
                className="h-12 border-0 bg-transparent pl-11 pr-2 text-base font-semibold shadow-none focus-visible:ring-0 md:h-14 md:pl-14"
              />
            </div>
            <Button
              type="submit"
              aria-label="Find a pair"
              className="h-12 w-12 px-0 text-sm font-bold text-white md:h-14 md:w-auto md:px-8 md:text-base"
            >
              <span className="hidden md:inline">Find a pair</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </form>

        <div className="relative z-10 mt-4 flex w-full max-w-3xl items-center gap-5 text-sm md:justify-center">
          <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--brand)] hover:text-[var(--brand-dark)]">
            Browse the market <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link href="/sell-item" className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--ink-soft)] hover:text-[var(--brand)]">
            List an item <PackagePlus size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-white px-4 py-6 sm:px-5 md:px-8 md:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="relative border-y border-[var(--line-soft)] bg-white py-4 md:py-6">
            <div className="relative grid grid-cols-3 divide-x divide-[var(--line-soft)]">
              {howItWorks.map((step) => {
                const Icon = step.icon;
                return (
                <div
                  key={step.title}
                  className="flex min-w-0 flex-col items-start gap-2 bg-white px-3 py-1 md:flex-row md:gap-4 md:px-6 md:py-3"
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="icon-frame h-8 w-8 md:h-10 md:w-10" data-preserve-icon-frame>
                      <Icon size={16} className="md:h-[19px] md:w-[19px]" aria-hidden="true" />
                    </span>
                    <span className="text-[0.65rem] font-black tabular-nums text-[var(--muted-foreground)] md:hidden">{step.number}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-[var(--foreground)]">{step.title}</span>
                    <span className="mt-1 hidden text-sm font-medium leading-5 text-[var(--ink-soft)] md:block">{step.text}</span>
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] px-4 pb-12 pt-10 sm:px-5 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-row items-center justify-between gap-3 md:mb-8 md:flex-row md:items-end">
            <div>
              <p className="section-kicker mb-3">Freshly listed</p>
              <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-5xl">Marketplace</h2>
            </div>
            <Button asChild variant="outline" className="h-10 rounded-lg border-[var(--border)] bg-white px-4 text-xs font-bold text-[var(--brand)] hover:bg-[var(--sand)] md:h-11 md:px-6 md:text-sm">
              <Link href="/marketplace">
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mb-6 flex snap-x snap-proximity gap-3 overflow-x-auto py-1 scrollbar-hide md:mb-8" aria-label="Browse categories">
            {listingCategories.map((category) => (
              <Link
                key={category.label}
                href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                className="group relative flex min-h-[108px] w-[112px] shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--border)]/65 bg-white p-3 text-left transition-colors hover:border-[var(--brand)]/30 md:min-h-[124px] md:w-[136px]"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-2 right-2 h-14 w-14 object-contain transition-transform duration-200 motion-safe:group-hover:scale-105 md:h-16 md:w-16"
                  draggable={false}
                />
                <span className="relative z-10 flex h-full flex-col justify-between">
                  <span>
                    <span className="block max-w-[6.4rem] text-xs font-black leading-tight text-[var(--foreground)]">{category.label}</span>
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-[var(--brand)]">
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mb-7 flex gap-1 overflow-x-auto border-y border-[var(--line-soft)] py-1 md:mb-10">
            {marketplaceActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[var(--ink-soft)] transition-colors hover:bg-white hover:text-[var(--brand)]"
              >
                <action.icon size={15} aria-hidden="true" />
                {action.label}
              </Link>
            ))}
          </div>

          {initialFeaturedListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="border-t border-[#f1f0ec] px-4 py-8 text-center md:py-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center text-[var(--brand)]">
                <PackagePlus size={30} aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold">No listings yet</h3>
              <Button asChild className="mt-7 rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
                <Link href="/sell-item">List an item</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
