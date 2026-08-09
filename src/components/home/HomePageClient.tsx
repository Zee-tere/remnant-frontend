"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, PackagePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingCard, type ListingCardItem } from "@/components/marketplace/ListingCard";
import { ActionArtwork, type ActionArtworkName } from "@/components/brand/ActionArtwork";
import { listingCategories } from "@/lib/categories";

const listingActions: Array<{ label: string; copy: string; href: string; artwork: ActionArtworkName }> = [
  { label: "Sell", copy: "Name your price", href: "/sell-item?intent=SELL", artwork: "sell" },
  { label: "Trade", copy: "Swap what you have", href: "/sell-item?intent=TRADE", artwork: "trade" },
  { label: "Donate", copy: "Give it forward", href: "/sell-item?intent=DONATE", artwork: "donate" },
  { label: "Repair", copy: "Find someone to fix it", href: "/sell-item?intent=FIX", artwork: "repair" },
  { label: "Recycle", copy: "Keep useful parts moving", href: "/sell-item?intent=RECYCLE", artwork: "recycle" },
];

const howItWorks = [
  { number: "01", title: "Search or list", text: "Describe the exact thing you need, or show people what you already have." },
  { number: "02", title: "Find the right person", text: "Browse listings, complementary pieces and people interested in the same item." },
  { number: "03", title: "Arrange it directly", text: "Agree on price, trade, collection or delivery without Remnant holding payment." },
];

export default function HomePageClient({
  initialFeaturedListings,
}: {
  initialFeaturedListings: ListingCardItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const search = (value: string) => {
    const next = value.trim();
    router.push(`/marketplace${next ? `?search=${encodeURIComponent(next)}` : ""}`);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    search(query);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#111]">
      <div className="home-ambient-field" aria-hidden="true">
        <span className="ambient-dot ambient-dot--page-one" />
        <span className="ambient-dot ambient-dot--page-two" />
        <span className="ambient-dot ambient-dot--page-three" />
      </div>

      <section className="relative mx-auto max-w-7xl overflow-hidden border-b border-black/10 px-4 sm:px-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8">
        <aside className="hidden border-r border-black/10 py-12 pr-7 lg:block" aria-label="Browse categories">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-black/45">Browse categories</p>
          <nav className="space-y-0.5">
            {listingCategories.slice(0, 10).map((category) => (
              <Link
                key={category.label}
                href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                className="group flex min-h-10 items-center justify-between gap-3 text-sm font-semibold text-black/70 transition-colors hover:text-black"
              >
                <span>{category.label}</span>
                <ChevronRight size={14} className="translate-x-0 text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-black" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <Link href="/marketplace" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-black">
            All categories <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative flex min-h-[25rem] items-start overflow-hidden py-7 sm:min-h-[29rem] sm:py-10 lg:min-h-[36rem] lg:items-center lg:py-14 lg:pl-14"
        >
          <div className="home-motion-field" aria-hidden="true">
            <span className="home-motion-dot home-motion-dot--one" />
            <span className="home-motion-dot home-motion-dot--two" />
            <span className="home-motion-dot home-motion-dot--three" />
            <span className="home-motion-orbit" />
          </div>
          <ActionArtwork
            name="marketplace"
            priority
            className="absolute -right-8 top-8 h-36 w-36 opacity-25 sm:-right-2 sm:h-52 sm:w-52 sm:opacity-40 lg:-right-10 lg:top-1/2 lg:h-[25rem] lg:w-[25rem] lg:-translate-y-1/2 lg:opacity-100"
            imageClassName="motion-safe:animate-[quiet-art-float_7s_ease-in-out_infinite_alternate]"
          />

          <div className="relative z-10 w-full max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">A marketplace for what still works</p>
            <h1 className="mt-3 max-w-[17rem] text-[2.15rem] font-bold leading-[1.01] tracking-[-0.05em] sm:mt-5 sm:max-w-xl sm:text-5xl lg:max-w-[42rem] lg:text-[4.6rem] lg:leading-[0.98]">
              Find the exact piece.{" "}
              <span className="hero-flourish relative inline-block pb-1">
                Pass yours on
                <svg className="hero-flourish__line" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7.5 C36 2.5 92 11 148 4.5" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-4 max-w-[18rem] text-sm font-medium leading-6 text-black/60 sm:mt-6 sm:max-w-[31rem] sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              Search useful items across Nigeria, or list what you have for sale, trade, donation, repair or recycling.
            </p>

            <form onSubmit={handleSearch} className="mt-5 max-w-[43rem] md:hidden" role="search">
              <div className="flex min-h-12 items-center rounded-full border border-black bg-white p-1 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]">
                <Search className="search-glyph ml-3 shrink-0 text-black/55" size={17} strokeWidth={2.1} aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search the marketplace"
                  placeholder="Search an item, model, size or missing piece"
                  className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm shadow-none focus-visible:ring-0"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-[#111] text-white hover:bg-black" aria-label="Search">
                  <Search className="search-glyph" size={16} strokeWidth={2.1} aria-hidden="true" />
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 sm:mt-7">
              <Link href="/marketplace" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#111] underline decoration-black/25 underline-offset-4 hover:decoration-black sm:min-h-11 sm:text-base">
                Browse marketplace <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/sell-item" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-black/55 hover:text-black sm:min-h-11 sm:text-base">
                List an item free <PackagePlus size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 md:pb-20 md:pt-20 lg:px-8"
      >
        <div className="mb-6 flex items-end justify-between gap-6 md:mb-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Recent listings</p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.035em] sm:text-3xl md:text-4xl">Useful things, ready for someone else</h2>
          </div>
          <Link href="/marketplace" className="hidden min-h-11 items-center gap-2 text-sm font-bold text-black sm:inline-flex">
            View all <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {initialFeaturedListings.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 md:grid-cols-3 md:gap-y-10 lg:gap-x-8">
            {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="border-y border-black/10 py-16 text-center">
            <ActionArtwork name="sell" className="mx-auto h-24 w-24" />
            <h3 className="mt-5 text-2xl font-bold">Be the first to list something useful</h3>
            <Button asChild className="mt-6 bg-[#111] text-white hover:bg-black"><Link href="/sell-item">List an item</Link></Button>
          </div>
        )}
        <Link href="/marketplace" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-black sm:hidden">
          View the marketplace <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </motion.section>

      <section className="border-y border-black/10 bg-[#fafafa] py-12 md:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="px-4 text-2xl font-bold tracking-[-0.035em] sm:px-6 sm:text-3xl md:px-0 md:text-4xl">Choose what happens next</h2>
          <div className="mt-6 grid auto-cols-[4.75rem] grid-flow-col gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:px-6 md:mt-10 md:grid-flow-row md:grid-cols-5 md:gap-8 md:overflow-visible md:px-0">
            {listingActions.map((action, index) => (
              <motion.div key={action.href} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Link href={action.href} className="group flex snap-start flex-col items-center text-center">
                  <ActionArtwork name={action.artwork} className="h-[2.65rem] w-[2.65rem] md:h-24 md:w-24" imageClassName="transition-transform duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105" />
                  <h3 className="mt-1.5 text-xs font-bold md:mt-4 md:text-lg">{action.label}</h3>
                  <p className="mt-1 hidden text-sm leading-6 text-black/50 md:block">{action.copy}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Simple by design</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl md:text-4xl">How Remnant works</h2>
          <div className="mt-6 grid grid-cols-3 md:mt-10">
            {howItWorks.map((step, index) => (
              <article key={step.number} className={`${index > 0 ? "border-l border-black/20" : ""} min-w-0 px-2 py-1 sm:px-5 md:px-8`}>
                <span className="text-xs font-bold tabular-nums text-black/35">{step.number}</span>
                <h3 className="mt-3 text-xs font-bold leading-4 sm:text-base md:text-xl">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-black/55 md:max-w-sm md:text-sm md:leading-6">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
