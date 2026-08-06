"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingCategories } from "@/lib/categories";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ActionArtwork, type ActionArtworkName } from "@/components/brand/ActionArtwork";

const marketplaceActions: Array<{ label: string; href: string; artwork: ActionArtworkName }> = [
  { label: "Find a pair", href: "/find-a-pair", artwork: "find" },
  { label: "Buy", href: "/marketplace", artwork: "marketplace" },
  { label: "Sell", href: "/sell-item?intent=SELL", artwork: "sell" },
  { label: "Trade", href: "/sell-item?intent=TRADE", artwork: "trade" },
  { label: "Donate", href: "/sell-item?intent=DONATE", artwork: "donate" },
  { label: "Repair", href: "/sell-item?intent=FIX", artwork: "repair" },
  { label: "Recycle", href: "/sell-item?intent=RECYCLE", artwork: "recycle" },
];

const heroSlides: Array<{
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  href: string;
  cta: string;
}> = [
  {
    eyebrow: "Find the missing piece",
    title: "The exact lid, charger or single earbud you need.",
    text: "Search by model, size and the small details that make it fit.",
    image: "/images/hero/find-a-pair-photo-v2.webp",
    href: "/find-a-pair",
    cta: "Find a match",
  },
  {
    eyebrow: "Clearing some space?",
    title: "List the useful things you no longer reach for.",
    text: "Sell them, swap them, and deal directly with someone nearby.",
    image: "/images/hero/sell-or-trade-photo-v2.webp",
    href: "/sell-item",
    cta: "List an item",
  },
  {
    eyebrow: "Still useful",
    title: "Pass it on, not into the bin.",
    text: "Donate good books, clothes and homeware to someone who can use them.",
    image: "/images/hero/donate-forward-photo-v2.webp",
    href: "/sell-item?intent=DONATE",
    cta: "Donate an item",
  },
  {
    eyebrow: "Repair before replace",
    title: "A small fix can keep it working.",
    text: "Find repair help, useful spare parts, or a responsible recycling route.",
    image: "/images/hero/repair-recycle-photo-v2.webp",
    href: "/repair",
    cta: "Explore repair",
  },
];

const howItWorks = [
  { number: "01", title: "List", text: "Describe the useful piece and what should happen next.", artwork: "sell" as const },
  { number: "02", title: "Match", text: "Search the detail, model, size, or missing half that matters.", artwork: "find" as const },
  { number: "03", title: "Alert", text: "Save the search and hear when a likely match appears.", artwork: "alert" as const },
];

const categoryTones = ["md:bg-white", "md:bg-[var(--mint-soft)]", "md:bg-[var(--lavender-soft)]", "md:bg-[var(--sky-soft)]", "md:bg-[var(--amber-soft)]"];

export default function HomePageClient({
  initialFeaturedListings,
}: {
  initialFeaturedListings: ListingCardItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroSlides.length),
      6200,
    );

    return () => window.clearInterval(timer);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const search = query.trim();
    router.push(`/find-a-pair${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--background)] text-foreground">
      <section className="bg-white pb-1 pt-1 md:hidden" aria-label="Choose what happens next">
        <p className="px-4 pb-1 text-xs font-bold text-[var(--ink-soft)]">Choose what happens next</p>
        <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-hide">
          {marketplaceActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
            className="flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-0.5 py-1 text-center text-xs font-bold text-[var(--ink-soft)] active:scale-[0.98]"
            >
              <ActionArtwork name={action.artwork} className="h-[2.65rem] w-[2.65rem]" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white md:px-8 md:pb-5 md:pt-8" aria-label="Featured ways to use Remnant">
        <div
          className="relative mx-auto h-[clamp(14rem,29dvh,17rem)] w-full max-w-7xl overflow-hidden border-y border-[var(--line-soft)] bg-[var(--sand)] md:h-[min(31rem,52vw)] md:max-h-[31rem] md:rounded-feature md:border"
          aria-roledescription="carousel"
          aria-label="Ways to use Remnant"
        >
          {heroSlides.map((slide, index) => (
            <article
              key={slide.title}
              className={`absolute inset-0 overflow-hidden transition-[opacity,transform] duration-700 ${
                activeSlide === index ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
              }`}
              aria-hidden={activeSlide !== index}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 767px) 100vw, 1280px"
                className="object-cover object-[58%_center] md:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/94 to-white/5 md:via-white/88 md:to-transparent" aria-hidden="true" />
              <div className="relative z-10 flex h-full max-w-[68%] flex-col items-start justify-center px-4 pb-7 pt-4 sm:max-w-[62%] sm:px-6 md:max-w-[53%] md:px-12 lg:px-16">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand)] md:text-sm">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-1.5 text-[1.48rem] font-bold leading-[1.02] tracking-[-0.04em] text-[var(--foreground)] sm:text-3xl md:mt-3 md:text-[clamp(2.6rem,4vw,3.8rem)] md:leading-[0.98]">
                  {slide.title}
                </h1>
                <p className="mt-2 max-w-md text-xs font-medium leading-5 text-[var(--ink-soft)] sm:text-sm md:mt-5 md:text-lg md:leading-8">
                  {slide.text}
                </p>
                <Button asChild size="sm" className="mt-3 h-9 bg-[var(--brand)] px-3 text-xs font-bold text-white hover:bg-[var(--brand-dark)] md:mt-7 md:h-12 md:px-6 md:text-sm">
                  <Link href={slide.href}>
                    {slide.cta}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}

          <div className="absolute bottom-1.5 left-2.5 z-20 flex gap-0.5 md:bottom-5 md:left-12 lg:left-16" aria-label={`Slide ${activeSlide + 1} of ${heroSlides.length}`}>
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                className="flex h-6 w-6 items-center justify-center"
                aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
              >
                <span className={`h-1 rounded-pill transition-[width,background-color] ${activeSlide === index ? "w-4 bg-[var(--brand)]" : "w-1.5 bg-[var(--border)]"}`} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="absolute bottom-4 right-5 z-20 hidden gap-2 md:flex">
            <button type="button" onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)} className="flex h-11 w-11 items-center justify-center rounded-control border border-white/80 bg-white/90 text-[var(--foreground)] backdrop-blur-sm hover:bg-white" aria-label="Previous slide">
              <ChevronLeft size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)} className="flex h-11 w-11 items-center justify-center rounded-control border border-white/80 bg-white/90 text-[var(--foreground)] backdrop-blur-sm hover:bg-white" aria-label="Next slide">
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mx-auto flex max-w-4xl items-center gap-2 border-b border-[var(--line-soft)] bg-white px-4 py-3 md:-mt-7 md:relative md:z-30 md:rounded-card md:border md:p-2" role="search">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[var(--aqua)] md:left-4 md:h-5 md:w-5" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Find a missing or matching item"
              placeholder="Try: teapot lid, right earbud"
              className="h-12 border-0 bg-[var(--sand)] pl-10 pr-3 text-base shadow-none focus-visible:ring-0 md:h-14 md:pl-12"
            />
          </div>
          <Button type="submit" aria-label="Search" className="h-12 bg-[var(--brand)] px-4 text-white hover:bg-[var(--brand-dark)] md:h-14 md:px-7">
            <span className="hidden sm:inline">Search Remnant</span>
            <Search size={18} aria-hidden="true" />
          </Button>
        </form>
      </section>

      <section className="hidden bg-white px-4 pb-3 pt-3 sm:px-5 md:block md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 text-3xl font-bold text-[var(--foreground)] md:mb-8 md:text-4xl">How it works</h2>
          <div className="grid grid-cols-3 gap-2 border-y border-[var(--line-soft)] py-4 md:gap-10 md:py-10">
            {howItWorks.map((step) => (
              <article key={step.title} className="flex min-w-0 flex-col items-center text-center md:items-start md:text-left">
                <ActionArtwork name={step.artwork} className="h-11 w-11 md:h-28 md:w-28" />
                <div className="mt-1 md:mt-5">
                  <span className="hidden text-xs font-black tabular-nums text-[var(--lavender)] md:inline">{step.number}</span>
                  <h2 className="text-sm font-bold text-[var(--foreground)] md:mt-1 md:text-2xl">{step.title}</h2>
                  <p className="mt-2 hidden text-sm font-medium leading-6 text-[var(--ink-soft)] md:block md:text-base">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-3 pb-12 pt-3 sm:px-5 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 flex flex-row items-center justify-end gap-3 md:mb-8 md:justify-between md:items-end">
            <div className="hidden md:block">
              <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-5xl">Marketplace</h2>
            </div>
            <Button asChild variant="ghost" className="h-9 rounded-lg px-1 text-xs font-bold text-[var(--brand)] hover:bg-white hover:text-[var(--brand-dark)] md:h-11 md:border md:border-[var(--border)] md:px-6 md:text-sm">
              <Link href="/marketplace">
                View more
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mb-5 hidden snap-x snap-proximity gap-2 overflow-x-auto py-1 scrollbar-hide md:flex md:mb-10 md:gap-3" aria-label="Browse categories">
            {listingCategories.map((category, index) => (
              <Link
                key={category.label}
                href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                className={`group relative flex min-h-[84px] w-[86px] shrink-0 snap-start overflow-hidden p-1 text-left transition-transform active:scale-[0.98] md:min-h-[138px] md:w-[146px] md:rounded-card md:border md:border-white/80 md:p-3 md:transition-[border-color,transform] md:hover:border-[var(--brand)]/20 ${categoryTones[index % categoryTones.length]}`}
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-1 right-1 h-11 w-11 object-contain transition-transform duration-200 motion-safe:group-hover:scale-105 md:bottom-2 md:right-2 md:h-16 md:w-16"
                  draggable={false}
                />
                <span className="relative z-10 flex h-full flex-col justify-between">
                  <span>
                    <span className="block max-w-[5rem] text-xs font-black leading-tight text-[var(--foreground)] md:max-w-[6.4rem]">{category.label}</span>
                  </span>
                  <span className="hidden h-6 w-6 items-center justify-center text-[var(--brand)] md:flex">
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mb-5 hidden md:block md:mb-12">
            <p className="mb-2 text-xs font-bold text-[var(--ink-soft)] md:mb-4 md:text-sm">Choose what happens next</p>
            <div className="grid auto-cols-[4.8rem] grid-flow-col gap-2 overflow-x-auto pb-2 scrollbar-hide lg:grid-flow-row lg:grid-cols-7 lg:overflow-visible">
            {marketplaceActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-h-[5.8rem] shrink-0 flex-col items-center justify-center gap-1 rounded-card bg-white px-1 py-1.5 text-center text-xs font-bold text-[var(--ink-soft)] transition-[color,transform] hover:text-[var(--brand)] active:scale-[0.98] md:min-h-[8rem] md:gap-1.5 md:px-2 md:py-2 md:text-sm"
              >
                <ActionArtwork name={action.artwork} className="h-[3.35rem] w-[3.35rem] md:h-[5.2rem] md:w-[5.2rem]" imageClassName="transition-transform duration-200 motion-safe:group-hover:scale-105" />
                <span>{action.label}</span>
              </Link>
            ))}
            </div>
          </div>

          {initialFeaturedListings.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 md:gap-4 lg:grid-cols-4">
              {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="border-t border-[#f1f0ec] px-4 py-8 text-center md:py-10">
              <ActionArtwork name="sell" className="mx-auto mb-5 h-[4.5rem] w-[4.5rem] md:h-24 md:w-24" />
              <h3 className="text-2xl font-bold">No listings yet</h3>
              <Button asChild className="mt-7 bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]">
                <Link href="/sell-item">List an item</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
