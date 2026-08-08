"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  PackagePlus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ActionArtwork, type ActionArtworkName } from "@/components/brand/ActionArtwork";

const marketplaceActions: Array<{ label: string; href: string; artwork: ActionArtworkName }> = [
  { label: "Find an item", href: "/find-a-pair", artwork: "find" },
  { label: "For sale", href: "/marketplace", artwork: "marketplace" },
  { label: "Sell", href: "/sell-item?intent=SELL", artwork: "sell" },
  { label: "Trade", href: "/sell-item?intent=TRADE", artwork: "trade" },
  { label: "Donate", href: "/sell-item?intent=DONATE", artwork: "donate" },
  { label: "Repair", href: "/sell-item?intent=FIX", artwork: "repair" },
  { label: "Recycle", href: "/sell-item?intent=RECYCLE", artwork: "recycle" },
];

const mobileHeroSlides: Array<{
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  tone: "pair" | "list" | "connect";
}> = [
  {
    eyebrow: "Find the missing piece",
    title: "Search for the exact part you need.",
    text: "Try the model, side, size or one useful detail.",
    image: "/images/hero/find-a-pair.webp",
    tone: "pair",
  },
  {
    eyebrow: "Pass on what still works",
    title: "List it for someone already looking.",
    text: "Sell, swap or give it away—your choice is clear from the start.",
    image: "/images/hero/sell-or-trade.webp",
    tone: "list",
  },
  {
    eyebrow: "Connect directly",
    title: "Talk, agree and make the exchange.",
    text: "Remnant helps you find each other. You decide the next step together.",
    image: "/images/hero/donate-forward.webp",
    tone: "connect",
  },
];

const howItWorks = [
  { number: "01", title: "List it", text: "Show what you have and choose sell, trade, donate, repair or recycle.", artwork: "sell" as const },
  { number: "02", title: "Find a match", text: "Search by item, model, size, side or the small detail that matters.", artwork: "find" as const },
  { number: "03", title: "Agree directly", text: "Message the other person and arrange the exchange yourselves.", artwork: "alert" as const },
];

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
      () => setActiveSlide((current) => (current + 1) % mobileHeroSlides.length),
      5200,
    );

    return () => window.clearInterval(timer);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const search = query.trim();
    router.push(`/find-a-pair${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-foreground">
      <div className="home-ambient-field" aria-hidden="true">
        <span className="ambient-dot ambient-dot--page-one" />
        <span className="ambient-dot ambient-dot--page-two" />
        <span className="ambient-dot ambient-dot--page-three" />
        <span className="ambient-dot ambient-dot--page-four" />
        <span className="ambient-dot ambient-dot--page-five" />
      </div>
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

      <section
        className="relative mx-3 h-[14.5rem] overflow-hidden rounded-card border border-[var(--line-soft)] bg-white md:hidden"
        aria-roledescription="carousel"
        aria-label="Ways to use Remnant"
      >
        {mobileHeroSlides.map((slide, index) => (
          <article
            key={slide.title}
            className={`mobile-home-hero mobile-home-hero--${slide.tone} absolute inset-0 overflow-hidden px-4 py-5 transition-[opacity,transform] duration-500 ${
              activeSlide === index ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
            }`}
            aria-hidden={activeSlide !== index}
          >
            <span className="ambient-dot ambient-dot--hero-one" aria-hidden="true" />
            <span className="ambient-dot ambient-dot--hero-two" aria-hidden="true" />
            <div className="mobile-home-hero__image" aria-hidden="true">
              <img
                src={slide.image}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-contain object-center mix-blend-multiply"
              />
            </div>
            <div className="relative z-10 max-w-[58%]">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--aqua)]">
                {slide.eyebrow}
              </p>
              <h1 className="mt-2 text-[1.36rem] font-bold leading-[1.04] tracking-[-0.04em] text-[var(--foreground)]">
                {slide.title}
              </h1>
              <p className="mt-2 max-w-[14rem] text-xs font-semibold leading-[1.4] text-[var(--ink-soft)]">
                {slide.text}
              </p>
            </div>
          </article>
        ))}
        <div
          className="absolute bottom-2.5 left-3 z-20 flex gap-0.5"
          aria-label={`Slide ${activeSlide + 1} of ${mobileHeroSlides.length}`}
        >
          {mobileHeroSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              className="flex h-5 w-5 items-center justify-center"
              aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
            >
              <span
                className={`h-1 rounded-pill transition-[width,background-color] ${
                  activeSlide === index ? "w-4 bg-[var(--aqua)]" : "w-1 bg-[var(--border)]"
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="border-b border-[var(--line-soft)] bg-white px-4 py-3 md:hidden" aria-label="Search Remnant">
        <form onSubmit={handleSearch} className="flex items-center gap-2" role="search">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[var(--aqua)]" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Find a missing or matching item"
              placeholder="Try: teapot lid, right earbud"
              className="h-12 pl-10 pr-3 text-base"
            />
          </div>
          <Button type="submit" size="icon" variant="ghost" aria-label="Search" className="bg-white text-[var(--aqua)] hover:bg-white hover:text-[var(--brand)]">
            <Search size={18} aria-hidden="true" />
          </Button>
        </form>
      </section>

      <section className="relative mx-auto hidden max-w-7xl overflow-hidden px-4 pb-3 pt-7 sm:px-5 md:block md:px-8 md:pb-24 md:pt-14">
        <div className="home-motion-field" aria-hidden="true">
          <span className="home-motion-dot home-motion-dot--one" />
          <span className="home-motion-dot home-motion-dot--two" />
          <span className="home-motion-dot home-motion-dot--three" />
          <span className="home-motion-orbit" />
        </div>
        <div className="grid items-center md:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.72fr)] md:gap-14">
          <div className="md:order-1">
            <h1 className="max-w-[24rem] text-balance text-[2.65rem] font-bold leading-[0.98] tracking-[-0.052em] text-[var(--foreground)] sm:max-w-2xl sm:text-6xl md:max-w-3xl md:text-[4.8rem]">
              Find the missing piece. Pass on{" "}
              <span className="hero-flourish relative inline-block pb-1 text-[var(--brand)]">
                what still works
                <svg className="hero-flourish__line" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7.5 C36 2.5 92 11 148 4.5" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-5 max-w-[36rem] text-base font-medium leading-7 text-[var(--ink-soft)] md:mt-7 md:text-lg md:leading-8">
              Remnant connects useful things with people looking for them. List, search and arrange the exchange directly.
            </p>

            <form onSubmit={handleSearch} className="relative z-10 mt-5 w-full max-w-2xl md:mt-10">
              <div className="flex items-center gap-1 rounded-xl border border-[var(--border)]/70 bg-white p-1 md:gap-3 md:rounded-2xl md:p-2 md:soft-shadow">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[var(--aqua)] md:left-5 md:h-5 md:w-5" aria-hidden="true" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search listings"
                    placeholder="Try: teapot lid, right earbud"
                    className="h-10 border-0 bg-transparent pl-10 pr-2 text-[0.92rem] font-semibold shadow-none focus-visible:ring-0 md:h-14 md:pl-14 md:text-base"
                  />
                </div>
                <Button type="submit" aria-label="Search listings" variant="ghost" className="ink-underline h-10 w-10 border-0 bg-white px-0 text-[var(--aqua)] hover:bg-white hover:text-[var(--brand)] md:h-14 md:w-auto md:px-5 md:text-base">
                  <span className="hidden md:inline">Search</span>
                  <Search size={18} aria-hidden="true" />
                </Button>
              </div>
            </form>

            <div className="relative z-10 mt-4 flex w-full max-w-2xl items-center gap-5 text-sm">
              <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--brand)] hover:text-[var(--brand-dark)]">
                Browse the marketplace <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/sell-item" className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--ink-soft)] hover:text-[var(--brand)]">
                List an item <PackagePlus size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="hidden md:order-2 md:mx-auto md:flex md:min-h-[420px] md:w-full md:max-w-[27rem] md:items-center md:justify-center">
            <ActionArtwork name="marketplace" priority className="h-[150px] w-[150px] md:h-[390px] md:w-[390px]" imageClassName="transition-transform duration-300 motion-safe:hover:scale-[1.025]" />
          </div>
        </div>
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
              <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-5xl">Useful things, ready for someone else</h2>
            </div>
            <Button asChild variant="ghost" className="h-9 rounded-lg px-1 text-xs font-bold text-[var(--brand)] hover:bg-white hover:text-[var(--brand-dark)] md:h-11 md:border md:border-[var(--border)] md:px-6 md:text-sm">
              <Link href="/marketplace">
                View more
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
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
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 lg:grid-cols-4">
              {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="border-t border-[#f1f0ec] px-4 py-8 text-center md:py-10">
              <ActionArtwork name="sell" className="mx-auto mb-5 h-[4.5rem] w-[4.5rem] md:h-24 md:w-24" />
              <h3 className="text-2xl font-bold">No listings yet</h3>
              <Button asChild variant="ghost" className="ink-underline mt-7 bg-transparent px-2 font-bold text-[var(--brand)] hover:bg-transparent">
                <Link href="/sell-item">List an item</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
