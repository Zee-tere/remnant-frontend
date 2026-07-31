"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
} from "lucide-react";
import { FaBell, FaBox, FaCircleCheck } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingCategories } from "@/lib/categories";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";

const marketplaceActions = [
  { label: "Find a pair", href: "/find-a-pair" },
  { label: "Buy", href: "/marketplace" },
  { label: "Sell", href: "/sell-item?intent=SELL" },
  { label: "Trade", href: "/sell-item?intent=TRADE" },
  { label: "Donate", href: "/sell-item?intent=DONATE" },
  { label: "Repair", href: "/sell-item?intent=FIX" },
  { label: "Recycle", href: "/sell-item?intent=RECYCLE" },
];

const howItWorks = [
  { title: "List", text: "Describe the item or missing piece.", icon: FaBox },
  { title: "Match", text: "Remnant compares details and location.", icon: FaCircleCheck },
  { title: "Alert", text: "Get notified when a likely pair appears.", icon: FaBell },
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
    <div className="min-h-screen overflow-hidden bg-white text-foreground">
      <section className="relative mx-auto flex max-w-7xl flex-col items-stretch justify-center px-4 pb-0 pt-0 text-left md:min-h-[560px] md:items-center md:px-8 md:py-14 md:text-center">
        <div className="max-w-4xl">
          <h1 className="max-w-[18rem] text-balance text-[1.38rem] font-bold leading-[1.04] text-[var(--foreground)] sm:max-w-none sm:text-5xl md:mx-auto md:text-7xl md:leading-[1.06]">
            Give your lonely pieces a{" "}
            <span className="hero-flourish relative inline-block pb-1 text-[var(--brand)]">
              second chance
              <svg className="hero-flourish__line" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 7.5 C36 2.5 92 11 148 4.5" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-1 max-w-[32rem] text-xs font-medium leading-[1.15rem] text-[var(--ink-soft)] md:mx-auto md:mt-6 md:text-lg md:leading-8">
            Find the missing half of a pair, or sell, trade, donate, repair, and recycle useful pieces
            with people nearby.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="relative z-10 mt-5 hidden w-full max-w-3xl md:mt-12 md:block"
        >
          <div className="flex flex-col gap-2 rounded-xl bg-white p-1.5 ring-1 ring-[var(--border)]/20 md:flex-row md:items-center md:gap-3 md:border md:border-[var(--border)]/55 md:p-2 md:ring-0">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)] md:left-5"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="I'm looking for a lid for a teapot..."
                className="h-11 rounded-lg border-0 bg-transparent pl-12 pr-4 text-base font-semibold shadow-none focus-visible:ring-0 md:h-14 md:pl-14"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-lg bg-[var(--brand)] px-6 text-sm font-bold text-white hover:bg-[var(--brand-dark)] md:h-14 md:px-8 md:text-base"
            >
              Find a Pair
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </form>

        <div className="relative z-10 mt-0.5 flex w-full max-w-sm items-center gap-5 md:hidden">
          <Button asChild variant="link" className="hero-action-entry hero-action-entry--primary h-9 px-0 text-xs font-black text-[var(--brand)] no-underline">
            <Link href="/find-a-pair" className="group">
              Find a pair
              <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="link" className="hero-action-entry hero-action-entry--secondary h-9 px-0 text-xs font-bold text-[var(--foreground)] no-underline">
            <Link href="/marketplace" className="group">
              Browse
              <Search size={13} className="transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-white px-4 pb-3 pt-0 md:px-8 md:pb-12 md:pt-0">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden bg-white py-1 md:p-5">
            <div className="relative grid grid-cols-3 md:gap-4">
              {howItWorks.map((step) => {
                const Icon = step.icon;
                return (
                <div
                  key={step.title}
                  className="flex min-w-0 items-center justify-center gap-1.5 bg-white px-1 py-1 md:aspect-auto md:justify-start md:gap-3 md:p-4"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--brand)] md:h-9 md:w-9">
                    <Icon size={13} className="md:h-[19px] md:w-[19px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black text-[var(--foreground)] md:text-sm">{step.title}</span>
                    <span className="mt-1 hidden text-xs font-semibold leading-5 text-[var(--ink-soft)] md:block">{step.text}</span>
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] px-4 pb-8 pt-3 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-row items-center justify-between gap-3 md:mb-8 md:flex-row md:items-end">
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">Marketplace</h2>
            <Button asChild variant="outline" className="h-10 rounded-lg border-[var(--border)] bg-white px-4 text-xs font-bold text-[var(--brand)] hover:bg-[var(--sand)] md:h-11 md:px-6 md:text-sm">
              <Link href="/marketplace">
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mb-3 flex snap-x snap-proximity gap-3 overflow-x-auto py-1 scrollbar-hide md:hidden" aria-label="Browse categories">
            {listingCategories.map((category) => (
              <Link
                key={category.label}
                href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                className="relative flex min-h-[94px] w-[96px] shrink-0 snap-start overflow-hidden bg-white p-1 text-left"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-1 right-1 h-12 w-12 object-contain"
                  draggable={false}
                />
                <span className="relative z-10 flex h-full flex-col justify-between">
                  <span>
                    <span className="block max-w-[5.2rem] text-[0.7rem] font-black leading-tight text-[var(--foreground)]">{category.label}</span>
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center text-[var(--brand)]">
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 md:mb-8">
            {marketplaceActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex min-h-10 shrink-0 items-center border-b border-transparent px-2 text-sm font-bold text-[var(--ink-soft)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] md:min-h-11"
              >
                {action.label}
              </Link>
            ))}
          </div>

          {initialFeaturedListings.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5 md:gap-4 lg:grid-cols-4">
              {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="border-t border-[#f1f0ec] px-4 py-8 text-center md:py-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center text-[var(--brand)]">
                <FaBox size={30} aria-hidden="true" />
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
