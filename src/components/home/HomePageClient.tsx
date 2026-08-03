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

const mobileHeroSlides: Array<{
  eyebrow: string;
  title: string;
  text: string;
  image: string;
}> = [
  {
    eyebrow: "Missing one piece?",
    title: "Find the exact bit that makes it whole.",
    text: "Search by model, size, side, or the detail only you know.",
    image: "/images/hero/find-a-pair.webp",
  },
  {
    eyebrow: "Still useful?",
    title: "Sell it or swap it for what fits now.",
    text: "A clear next step for the things you have outgrown.",
    image: "/images/hero/sell-or-trade.webp",
  },
  {
    eyebrow: "Let it travel",
    title: "Give useful things a useful next place.",
    text: "Donate locally and let someone else continue the story.",
    image: "/images/hero/donate-forward.webp",
  },
  {
    eyebrow: "Not finished yet",
    title: "Repair, recycle, and keep value moving.",
    text: "Choose the route that wastes less and makes more sense.",
    image: "/images/hero/repair-recycle.webp",
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
      () => setActiveSlide((current) => (current + 1) % mobileHeroSlides.length),
      4800,
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
        <p className="px-4 pb-1 text-[0.7rem] font-bold text-[var(--ink-soft)]">Choose what happens next</p>
        <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-hide">
          {marketplaceActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex w-[4.35rem] shrink-0 snap-start flex-col items-center gap-0.5 py-1 text-center text-[0.66rem] font-bold text-[var(--ink-soft)] active:scale-[0.98]"
            >
              <ActionArtwork name={action.artwork} className="h-[2.65rem] w-[2.65rem]" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative h-[clamp(9.5rem,20dvh,11.5rem)] w-full overflow-hidden border-y border-[var(--line-soft)] bg-white md:hidden" aria-roledescription="carousel" aria-label="What you can do on Remnant">
        {mobileHeroSlides.map((slide, index) => (
          <article
            key={slide.title}
            className={`absolute inset-0 overflow-hidden px-4 py-3 transition-[opacity,transform] duration-500 ${
              activeSlide === index ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
            }`}
            aria-hidden={activeSlide !== index}
          >
            <img
              src={slide.image}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="relative z-10 max-w-[68%]">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.13em] text-[var(--aqua)]">{slide.eyebrow}</p>
              <h1 className="mt-1 text-[1.22rem] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--foreground)]">{slide.title}</h1>
              <p className="mt-1.5 max-w-[16rem] text-[0.72rem] font-medium leading-[1.35] text-[var(--ink-soft)]">{slide.text}</p>
            </div>
          </article>
        ))}
        <div className="absolute bottom-0.5 left-2.5 z-20 flex gap-0" aria-label={`Slide ${activeSlide + 1} of ${mobileHeroSlides.length}`}>
          {mobileHeroSlides.map((slide, index) => (
            <button key={slide.title} type="button" onClick={() => setActiveSlide(index)} className="flex h-4 w-4 items-center justify-center" aria-label={`Show slide ${index + 1}`}>
              <span className={`h-0.5 rounded-full transition-[width,background-color] ${activeSlide === index ? "w-2.5 bg-[var(--aqua)]" : "w-1 bg-[var(--border)]"}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto hidden max-w-7xl px-4 pb-3 pt-7 sm:px-5 md:block md:px-8 md:pb-24 md:pt-14">
        <div className="grid items-center md:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.72fr)] md:gap-14">
          <div className="md:order-1">
            <h1 className="max-w-[24rem] text-balance text-[2.65rem] font-bold leading-[0.98] tracking-[-0.052em] text-[var(--foreground)] sm:max-w-2xl sm:text-6xl md:max-w-3xl md:text-[4.8rem]">
              Give lonely pieces a{" "}
              <span className="hero-flourish relative inline-block pb-1 text-[var(--brand)]">
                next place
                <svg className="hero-flourish__line" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7.5 C36 2.5 92 11 148 4.5" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-5 max-w-[36rem] text-base font-medium leading-7 text-[var(--ink-soft)] md:mt-7 md:text-lg md:leading-8">
              Find the missing half, or move a useful object forward through selling, trade, donation, repair, or recycling.
            </p>

            <form onSubmit={handleSearch} className="relative z-10 mt-5 w-full max-w-2xl md:mt-10">
              <div className="flex items-center gap-1 rounded-xl border border-[var(--border)]/70 bg-white p-1 md:gap-3 md:rounded-2xl md:p-2 md:soft-shadow">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[var(--aqua)] md:left-5 md:h-5 md:w-5" aria-hidden="true" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try: teapot lid, right earbud..."
                    className="h-10 border-0 bg-transparent pl-10 pr-2 text-[0.92rem] font-semibold shadow-none focus-visible:ring-0 md:h-14 md:pl-14 md:text-base"
                  />
                </div>
                <Button type="submit" aria-label="Find a pair" variant="ghost" className="h-10 w-10 border-0 bg-white px-0 text-[var(--aqua)] hover:bg-white hover:text-[var(--brand)] md:h-14 md:w-auto md:bg-[var(--brand)] md:px-8 md:text-base md:text-white md:hover:bg-[var(--brand-dark)] md:hover:text-white">
                  <span className="hidden md:inline">Find a pair</span>
                  <Search size={18} aria-hidden="true" />
                </Button>
              </div>
            </form>

            <div className="relative z-10 mt-4 flex w-full max-w-2xl items-center gap-5 text-sm">
              <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 font-bold text-[var(--brand)] hover:text-[var(--brand-dark)]">
                Browse the market <ArrowRight size={15} aria-hidden="true" />
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
                className={`group relative flex min-h-[84px] w-[86px] shrink-0 snap-start overflow-hidden p-1 text-left transition-transform active:scale-[0.98] md:min-h-[138px] md:w-[146px] md:rounded-2xl md:border md:border-white/80 md:p-3 md:transition-[border-color,transform] md:hover:border-[var(--brand)]/20 ${categoryTones[index % categoryTones.length]}`}
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
                    <span className="block max-w-[5rem] text-[0.68rem] font-black leading-tight text-[var(--foreground)] md:max-w-[6.4rem] md:text-xs">{category.label}</span>
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
                className="group flex min-h-[5.8rem] shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-white px-1 py-1.5 text-center text-[0.7rem] font-bold text-[var(--ink-soft)] transition-[color,transform] hover:text-[var(--brand)] active:scale-[0.98] md:min-h-[8rem] md:gap-1.5 md:px-2 md:py-2 md:text-sm"
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
