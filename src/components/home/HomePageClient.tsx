"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Package,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingCategories } from "@/lib/categories";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";

const floatingObjects = [
  {
    src: "/images/floating/mint-cup.webp",
    className: "left-[7%] top-[26%] h-24 w-24 rounded-full",
    imageClassName: "object-contain p-1",
    rotate: [0, -5, 0],
    y: [0, -12, 0],
    duration: 4.8,
    visibilityClass: "lg:block",
  },
  {
    src: "/images/floating/brass-button.webp",
    className: "right-[9%] top-[20%] h-24 w-24 rounded-[1.6rem]",
    imageClassName: "object-cover",
    rotate: [3, 8, 3],
    y: [0, 10, 0],
    duration: 5.5,
    visibilityClass: "lg:block",
  },
  {
    src: "/images/floating/teapot-lid.webp",
    className: "left-[13%] bottom-[23%] h-20 w-36 rounded-[1.6rem]",
    imageClassName: "object-cover",
    rotate: [-4, 1, -4],
    y: [0, 9, 0],
    duration: 5.2,
    visibilityClass: "lg:block",
  },
  {
    src: "/images/floating/blue-chair.webp",
    className: "right-[15%] bottom-[21%] h-28 w-28 rounded-[1.7rem]",
    imageClassName: "object-contain p-2",
    rotate: [7, 2, 7],
    y: [0, -13, 0],
    duration: 5.8,
    visibilityClass: "lg:block",
  },
  {
    src: "/images/floating/brass-compass.webp",
    className: "left-[2%] bottom-[36%] h-24 w-28 rounded-[1.6rem]",
    imageClassName: "object-cover",
    rotate: [4, -1, 4],
    y: [0, -9, 0],
    duration: 6.1,
    visibilityClass: "xl:block",
  },
  {
    src: "/images/floating/watch-gear.webp",
    className: "right-[2%] bottom-[37%] h-24 w-28 rounded-[1.6rem]",
    imageClassName: "object-cover",
    rotate: [-3, 3, -3],
    y: [0, 11, 0],
    duration: 5.9,
    visibilityClass: "xl:block",
  },
];

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
  { title: "List", text: "Describe the item or missing piece.", icon: Package },
  { title: "Match", text: "Remnant compares details and location.", icon: CheckCircle2 },
  { title: "Alert", text: "Get notified when a likely pair appears.", icon: BellRing },
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
    <div className="min-h-screen overflow-hidden bg-[var(--paper)] text-foreground">
      <section className="cosmic-hero relative mx-auto flex max-w-[96rem] flex-col items-stretch justify-center overflow-hidden px-5 pb-14 pt-12 text-left md:min-h-[720px] md:items-center md:rounded-[2.75rem] md:px-8 md:py-[92px] md:text-center">
        <div className="cosmic-grain absolute inset-0" aria-hidden="true" />
        <span className="absolute left-[12%] top-[18%] h-1 w-1 rounded-full bg-[var(--starlight)]/70" aria-hidden="true" />
        <span className="absolute right-[16%] top-[29%] h-1.5 w-1.5 rounded-full bg-[var(--mineral-blue)]/65" aria-hidden="true" />
        <span className="absolute bottom-[23%] left-[22%] h-1 w-1 rounded-full bg-[var(--brass)]/60" aria-hidden="true" />

        <div className="home-entry relative z-10 max-w-4xl">
          <p className="eyebrow mb-5 text-[var(--brand-light)] md:justify-center">Nigeria&apos;s circular marketplace</p>
          <h1 className="max-w-[21rem] text-balance text-[2.7rem] font-bold leading-[0.96] text-[var(--starlight)] sm:max-w-xl sm:text-5xl md:mx-auto md:max-w-4xl md:text-[5.5rem] md:leading-[0.92]">
            Everything incomplete is still full of <span className="font-serif italic font-normal text-[var(--brand-light)]">possibility.</span>
          </h1>
          <p className="mt-6 max-w-[35rem] text-[0.98rem] font-medium leading-7 text-[var(--starlight)]/70 md:mx-auto md:mt-8 md:text-lg md:leading-8">
            Find the missing half of a pair—or pass a useful piece forward through selling, trading, donating, repair, or recycling.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="home-entry home-entry-delay-1 relative z-10 mt-8 w-full max-w-3xl md:mt-12"
        >
          <div className="cosmic-search flex items-center gap-1 rounded-[1.2rem] p-1.5 md:gap-3 md:rounded-full md:p-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)] md:left-5"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a missing piece..."
                className="h-12 rounded-full border-0 bg-transparent pl-11 pr-1 text-base font-medium shadow-none focus-visible:ring-0 md:h-14 md:pl-14 md:pr-4"
              />
            </div>
            <Button
              type="submit"
              aria-label="Find a match"
              className="h-12 shrink-0 rounded-[0.9rem] bg-[var(--brand)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-dark)] md:h-14 md:rounded-full md:px-8 md:text-base"
            >
              <span className="hidden xs:inline">Find a match</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </form>

        <div className="home-entry home-entry-delay-2 relative z-10 mt-5 flex items-center gap-5 text-sm font-semibold text-[var(--starlight)]/75">
          <Link href="/marketplace" className="inline-flex items-center gap-2 hover:text-white">
            Browse the market <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <span className="h-1 w-1 rounded-full bg-[var(--brand-light)]" aria-hidden="true" />
          <Link href="/sell-item" className="hover:text-white">List a piece</Link>
        </div>

        <img src="/images/floating/brass-compass.webp" alt="" className="floating-object cosmic-object pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rotate-12 rounded-full object-cover opacity-55 md:hidden" aria-hidden="true" />

        {floatingObjects.map((item) => (
          <div
            key={item.src}
            style={{
              "--float-duration": `${item.duration}s`,
              "--float-y": `${item.y[1]}px`,
              "--float-rotate": `${item.rotate[1]}deg`,
              "--float-base-rotate": `${item.rotate[0]}deg`,
            } as React.CSSProperties}
            className={`floating-object cosmic-object pointer-events-none absolute hidden overflow-hidden ${item.visibilityClass} ${item.className}`}
            aria-hidden="true"
          >
            <img src={item.src} alt="" loading="lazy" decoding="async" draggable={false} className={`h-full w-full ${item.imageClassName}`} />
          </div>
        ))}
      </section>

      <section className="relative z-10 -mt-7 px-4 pb-12 md:-mt-12 md:px-8 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/94 p-3 shadow-[0_28px_70px_-45px_rgba(0,62,48,0.75)] backdrop-blur-xl md:rounded-[2rem] md:p-5">
            <div className="relative grid grid-cols-1 gap-1 sm:grid-cols-3 md:gap-3">
              {howItWorks.map((step) => {
                const Icon = step.icon;
                return (
                <div
                  key={step.title}
                  className="flex min-w-0 items-center gap-3 rounded-[1.1rem] px-2 py-3 md:p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--brand)]/15 bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[var(--foreground)]">{step.title}</span>
                    <span className="mt-0.5 block text-xs font-medium leading-5 text-[var(--ink-soft)]">{step.text}</span>
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--paper)] px-4 pb-16 pt-2 md:px-8 md:py-[88px]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-row items-end justify-between gap-3 md:mb-10">
            <div>
              <p className="section-kicker mb-2">In orbit now</p>
              <h2 className="text-[2rem] font-bold text-[var(--foreground)] md:text-5xl">Pieces seeking purpose</h2>
              <p className="mt-2 hidden max-w-xl text-base font-medium text-[var(--ink-soft)] md:block">Browse what your neighbours are selling, sharing, trading, or trying to complete.</p>
            </div>
            <Button asChild variant="outline" className="h-11 shrink-0 rounded-full border-[var(--hairline)] bg-transparent px-4 text-sm font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)] md:px-6">
              <Link href="/marketplace">
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mb-7 flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:hidden" aria-label="Browse categories">
            {listingCategories.map((category) => (
              <Link
                key={category.label}
                href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                className="relative flex min-h-[150px] w-[142px] shrink-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[var(--cosmos)] p-4 text-left shadow-[0_20px_50px_-36px_rgba(0,42,33,0.9)]"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute -bottom-1 right-0 h-20 w-20 object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.2)]"
                  draggable={false}
                />
                <span className="relative z-10 flex h-full flex-col justify-between">
                  <span>
                    <span className="block max-w-[6.5rem] text-[0.84rem] font-semibold leading-tight text-[var(--starlight)]">{category.label}</span>
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[var(--brand-light)]">
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="editorial-rule mb-7 flex gap-5 overflow-x-auto pb-3 pt-4 md:mb-10 md:gap-7">
            {marketplaceActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex min-h-10 shrink-0 items-center text-sm font-semibold text-[var(--ink-soft)] transition-colors hover:text-[var(--brand)] md:min-h-11"
              >
                {action.label}
              </Link>
            ))}
          </div>

          {initialFeaturedListings.length > 0 ? (
            <div className="home-listing-rail pb-2">
              {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="surface-card rounded-[1.35rem] p-6 text-center md:rounded-[2rem] md:p-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <Package size={30} aria-hidden="true" />
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
