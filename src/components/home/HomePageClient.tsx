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

const popularSearches = ["right earbud", "pot lid", "laptop charger", "single shoe"];

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

      <section className="relative mx-auto max-w-7xl border-b border-black/10 px-4 sm:px-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8">
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
          className="relative flex min-h-[31rem] items-center overflow-hidden py-14 lg:min-h-[36rem] lg:pl-14"
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
            className="absolute -right-14 top-8 h-48 w-48 opacity-35 sm:right-0 sm:h-64 sm:w-64 sm:opacity-55 lg:right-4 lg:top-1/2 lg:h-[25rem] lg:w-[25rem] lg:-translate-y-1/2 lg:opacity-100"
            imageClassName="motion-safe:animate-[quiet-art-float_7s_ease-in-out_infinite_alternate]"
          />

          <div className="relative z-10 w-full max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">A marketplace for what still works</p>
            <h1 className="mt-5 max-w-[18rem] text-balance text-[2.65rem] font-bold leading-[0.98] tracking-[-0.055em] sm:max-w-xl sm:text-6xl lg:max-w-[42rem] lg:text-[4.6rem]">
              Find the exact piece. Pass yours on.
            </h1>
            <p className="mt-6 max-w-[31rem] text-base font-medium leading-7 text-black/60 sm:text-lg sm:leading-8">
              Search useful items across Nigeria, or list what you have for sale, trade, donation, repair or recycling.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-[43rem]" role="search">
              <div className="flex min-h-14 items-center rounded-full border border-black bg-white p-1.5 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] sm:min-h-16">
                <Search className="ml-3 shrink-0 text-black/55 sm:ml-4" size={20} aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search the marketplace"
                  placeholder="Search an item, model, size or missing piece"
                  className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0 sm:h-12 sm:px-4"
                />
                <Button type="submit" className="h-11 shrink-0 bg-[#111] px-5 font-bold text-white hover:bg-black sm:h-12 sm:px-7">
                  <span className="hidden sm:inline">Search</span>
                  <Search className="sm:hidden" size={18} aria-hidden="true" />
                </Button>
              </div>
            </form>

            <div className="mt-4 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
              <span className="font-semibold text-black/45">Popular:</span>
              {popularSearches.map((item) => (
                <button key={item} type="button" onClick={() => search(item)} className="font-semibold text-black/65 underline decoration-black/20 underline-offset-4 hover:text-black hover:decoration-black">
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 font-bold text-[#111] underline decoration-black/25 underline-offset-4 hover:decoration-black">
                Browse marketplace <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/sell-item" className="inline-flex min-h-11 items-center gap-2 font-bold text-black/55 hover:text-black">
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
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <div className="mb-9 flex items-end justify-between gap-6 md:mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Fresh on Remnant</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Useful things, ready for someone else</h2>
          </div>
          <Link href="/marketplace" className="hidden min-h-11 items-center gap-2 text-sm font-bold text-black sm:inline-flex">
            View all <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {initialFeaturedListings.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8">
            {initialFeaturedListings.map((item) => <ListingCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="border-y border-black/10 py-16 text-center">
            <ActionArtwork name="sell" className="mx-auto h-24 w-24" />
            <h3 className="mt-5 text-2xl font-bold">Be the first to list something useful</h3>
            <Button asChild className="mt-6 bg-[#111] text-white hover:bg-black"><Link href="/sell-item">List an item</Link></Button>
          </div>
        )}
        <Link href="/marketplace" className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-black sm:hidden">
          View the marketplace <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </motion.section>

      <section className="border-y border-black/10 bg-[#fafafa] px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Your item, your terms</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Choose what happens next</h2>
            <p className="mt-4 text-base leading-7 text-black/55">Every listing makes its purpose clear, without forcing every useful object into the same kind of sale.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            {listingActions.map((action, index) => (
              <motion.div key={action.href} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Link href={action.href} className="group block">
                  <ActionArtwork name={action.artwork} className="h-24 w-24 sm:h-28 sm:w-28" imageClassName="transition-transform duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105" />
                  <h3 className="mt-4 text-xl font-bold tracking-[-0.025em]">{action.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-black/50">{action.copy}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:py-28 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-center md:justify-start">
          <ActionArtwork name="find" className="h-52 w-52 sm:h-72 sm:w-72" imageClassName="motion-safe:animate-[quiet-art-float_8s_ease-in-out_infinite_alternate]" />
        </motion.div>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Built for the difficult search</p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-0.045em] sm:text-5xl">Not everything you need is a whole new product.</h2>
          <p className="mt-6 text-lg leading-8 text-black/55">Find the right side, size, model, lid, charger or complementary part. Remnant’s matching tools are designed for the detail that ordinary marketplaces overlook.</p>
          <Button asChild className="mt-8 h-12 bg-[#111] px-6 font-bold text-white hover:bg-black"><Link href="/find-a-pair">Find a missing piece <ArrowRight size={16} /></Link></Button>
        </div>
      </section>

      <section className="border-t border-black/10 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Simple by design</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">How Remnant works</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-14">
            {howItWorks.map((step) => (
              <article key={step.number} className="border-t border-black pt-5">
                <span className="text-xs font-bold tabular-nums text-black/35">{step.number}</span>
                <h3 className="mt-7 text-2xl font-bold tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-3 max-w-sm text-base leading-7 text-black/55">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
