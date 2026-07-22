"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Recycle,
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
  { label: "Buy", href: "/marketplace" },
  { label: "Sell", href: "/sell-item?intent=SELL" },
  { label: "Trade", href: "/sell-item?intent=TRADE" },
  { label: "Donate", href: "/sell-item?intent=DONATE" },
  { label: "Repair", href: "/sell-item?intent=FIX" },
  { label: "Recycle", href: "/sell-item?intent=RECYCLE" },
];

const howItWorks = [
  { title: "List", text: "Add photos and choose the purpose.", icon: Package },
  { title: "Match", text: "People search by need, category, or item.", icon: CheckCircle2 },
  { title: "Move", text: "Sell, trade, donate, repair, or recycle.", icon: Recycle },
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
      <section className="relative mx-auto flex max-w-7xl flex-col items-stretch justify-center px-4 pb-4 pt-4 text-left md:min-h-[720px] md:items-center md:px-8 md:py-[72px] md:text-center">
        <div className="home-entry max-w-4xl">
          <h1 className="max-w-[20rem] text-balance text-[1.85rem] font-bold leading-[1.08] text-[var(--foreground)] sm:max-w-none sm:text-5xl md:mx-auto md:text-7xl md:leading-[1.08]">
            Give your lonely pieces a{" "}
            <span className="relative inline-block text-[var(--brand)]">
              second chance
              <svg
                aria-hidden="true"
                className="absolute -bottom-2 left-0 h-4 w-full text-[var(--brand-container)]"
                preserveAspectRatio="none"
                viewBox="0 0 100 10"
              >
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-4 max-w-[34rem] text-sm font-medium leading-6 text-[var(--ink-soft)] md:mx-auto md:mt-7 md:text-lg md:leading-8">
            Nigeria&apos;s marketplace for single items, useful parts, and pre-owned goods. Sell, trade,
            donate, repair, or recycle directly with people nearby.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="home-entry home-entry-delay-1 relative z-10 mt-5 hidden w-full max-w-3xl md:mt-12 md:block"
        >
          <div className="flex flex-col gap-2 rounded-[1.35rem] bg-white p-1.5 shadow-[0_16px_42px_-34px_rgba(0,108,82,0.5)] ring-1 ring-[var(--border)]/20 md:flex-row md:items-center md:gap-3 md:rounded-full md:border md:border-[var(--border)]/55 md:p-2 md:soft-shadow md:ring-0">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)] md:left-5"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="I'm looking for a lid for a teapot..."
                className="h-11 rounded-full border-0 bg-transparent pl-12 pr-4 text-base font-semibold shadow-none focus-visible:ring-0 md:h-14 md:pl-14"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full bg-[var(--secondary-container)] px-6 text-sm font-bold text-[var(--secondary-blue)] hover:bg-[var(--secondary-blue)] hover:text-white md:h-14 md:px-8 md:text-base"
            >
              Find a Pair
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </form>

        <div className="home-entry home-entry-delay-2 relative z-10 mt-6 flex w-full max-w-sm gap-2 md:hidden">
          <Button asChild className="h-12 flex-1 rounded-full bg-[var(--brand)] text-sm font-bold text-white shadow-[0_18px_38px_-25px_rgba(0,108,82,0.7)] hover:bg-[var(--brand-dark)]">
            <Link href="/marketplace">
              Browse
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 flex-1 rounded-full border-[var(--border)] bg-white text-sm font-bold text-[var(--brand)] shadow-[0_14px_34px_-30px_rgba(0,108,82,0.45)]">
            <Link href="/sell-item">
              List
              <Package size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {floatingObjects.map((item) => (
          <div
            key={item.src}
            style={{
              "--float-duration": `${item.duration}s`,
              "--float-y": `${item.y[1]}px`,
              "--float-rotate": `${item.rotate[1]}deg`,
              "--float-base-rotate": `${item.rotate[0]}deg`,
            } as React.CSSProperties}
            className={`floating-object pointer-events-none absolute hidden overflow-hidden border-4 border-white bg-white soft-shadow ${item.visibilityClass} ${item.className}`}
            aria-hidden="true"
          >
            <img src={item.src} alt="" loading="lazy" decoding="async" draggable={false} className={`h-full w-full ${item.imageClassName}`} />
          </div>
        ))}
      </section>

      <section className="bg-white px-4 pb-10 pt-8 md:px-8 md:pb-16 md:pt-0">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden border-y border-[var(--border)] bg-white py-2 md:rounded-[2rem] md:border-0 md:bg-[var(--cream)] md:p-6">
            <div className="relative grid grid-cols-3 gap-2 md:gap-4">
              {howItWorks.map((step) => {
                const Icon = step.icon;
                return (
                <div
                  key={step.title}
                  className="flex min-w-0 items-center justify-center gap-1.5 bg-white px-1 py-1.5 md:aspect-auto md:justify-start md:gap-3 md:rounded-[1.1rem] md:p-4 md:shadow-[0_14px_34px_-32px_rgba(0,108,82,0.45)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] md:h-10 md:w-10">
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

      <section className="bg-[var(--cream)] px-4 pb-8 pt-5 md:px-8 md:py-[72px]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex flex-row items-center justify-between gap-3 md:mb-8 md:flex-row md:items-end">
            <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">Marketplace</h2>
            <Button asChild variant="outline" className="h-11 rounded-full border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)] md:px-6">
              <Link href="/marketplace">
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mb-6 flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:hidden" aria-label="Browse categories">
            {listingCategories.map((category) => (
              <Link
                key={category.label}
                href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                className="relative flex min-h-[132px] w-[128px] shrink-0 overflow-hidden rounded-[1.15rem] bg-white p-3 text-left shadow-[0_14px_34px_-32px_rgba(0,108,82,0.4)]"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-1 right-1 h-16 w-16 object-contain"
                  draggable={false}
                />
                <span className="relative z-10 flex h-full flex-col justify-between">
                  <span>
                    <span className="block max-w-[5.9rem] text-[0.82rem] font-black leading-tight text-[var(--foreground)]">{category.label}</span>
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
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
                className="flex min-h-10 shrink-0 items-center rounded-full bg-white px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[0_12px_30px_-28px_rgba(0,108,82,0.45)] transition-colors hover:text-[var(--brand)] md:min-h-11"
              >
                {action.label}
              </Link>
            ))}
          </div>

          {initialFeaturedListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
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
