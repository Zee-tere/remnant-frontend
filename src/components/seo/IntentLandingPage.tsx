import Link from "next/link";
import { ArrowRight, MapPin, MessageSquare, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { intentPages, type IntentPageKey } from "@/lib/intent-pages";
import { getListingPath, getPublicListings } from "@/lib/public-listings";
import { ActionArtwork, type ActionArtworkName } from "@/components/brand/ActionArtwork";

const steps = [
  { title: "List it clearly", text: "Add honest photos, condition, and location.", icon: PackagePlus },
  { title: "Find the right person", text: "People search by item, need, intent, and state.", icon: MapPin },
  { title: "Agree directly", text: "Message each other and arrange the exchange yourselves.", icon: MessageSquare },
];

const intentArtwork: Record<IntentPageKey, ActionArtworkName> = {
  sell: "sell",
  trade: "trade",
  donate: "donate",
  repair: "repair",
  recycle: "recycle",
};

export default async function IntentLandingPage({ pageKey }: { pageKey: IntentPageKey }) {
  const config = intentPages[pageKey];
  const result = await getPublicListings({ intentionTag: config.intentTag, page: 1, limit: 8 }, 300);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.listingsLabel,
    numberOfItems: result.listings.length,
    itemListElement: result.listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: listing.title,
      url: `https://remnantmarket.co${getListingPath(listing)}`,
    })),
  };

  return (
    <main className="min-h-screen bg-white">
      {result.listings.length > 0 && <JsonLd data={itemList} />}

      <section className="border-b border-[var(--line-soft)] bg-[var(--background)] px-4 py-14 sm:px-5 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[minmax(0,1fr)_22rem] md:items-center md:gap-14">
          <div>
          <h1 className="max-w-4xl text-4xl font-bold leading-[1.02] text-[var(--foreground)] md:text-6xl lg:text-7xl">
            {config.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-[var(--ink-soft)] md:text-lg md:leading-8">
            {config.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 px-6 font-bold text-white">
              <Link href={`/sell-item?intent=${config.intentTag}`}>
                {config.actionLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 bg-white px-6 font-bold text-[var(--brand)]">
              <Link href={`/marketplace?intentionTag=${config.intentTag}`}>Browse current listings</Link>
            </Button>
          </div>
          </div>
          <div className="flex min-h-[160px] items-center justify-center md:min-h-[340px]" aria-hidden="true">
            <ActionArtwork name={intentArtwork[pageKey]} className="h-[150px] w-[150px] md:h-[330px] md:w-[330px]" />
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14" aria-labelledby={`${pageKey}-how`}>
        <div className="mx-auto max-w-5xl">
          <h2 id={`${pageKey}-how`} className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            How it works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 border-y border-[var(--border)]/45 py-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <span className="icon-frame h-10 w-10" data-preserve-icon-frame>
                  <step.icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="mb-1 text-xs font-black tabular-nums text-[var(--muted-foreground)]">0{index + 1}</p>
                  <h3 className="font-bold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-[var(--ink-soft)]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] px-4 py-10 md:px-8 md:py-16" aria-labelledby={`${pageKey}-listings`}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <h2 id={`${pageKey}-listings`} className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
              {config.listingsLabel}
            </h2>
            <Link href={`/marketplace?intentionTag=${config.intentTag}`} className="shrink-0 text-sm font-bold text-[var(--brand)] hover:underline">
              View all
            </Link>
          </div>

          {result.listings.length > 0 ? (
            <div className="mt-7 grid grid-cols-3 gap-2 md:gap-4 lg:grid-cols-4">
              {result.listings.map((listing) => <ListingCard key={listing.id} item={listing} />)}
            </div>
          ) : (
            <div className="mt-6 border-y border-[var(--border)]/45 py-10">
              <ActionArtwork name={intentArtwork[pageKey]} className="mb-4 h-[4.5rem] w-[4.5rem] md:h-24 md:w-24" />
              <p className="font-semibold text-[var(--ink-soft)]">No active listings here yet.</p>
              <Link href={`/sell-item?intent=${config.intentTag}`} className="mt-2 inline-flex font-bold text-[var(--brand)] hover:underline">
                Add the first one
              </Link>
            </div>
          )}
        </div>
      </section>

      <nav className="border-t border-[var(--line-soft)] px-4 py-10 sm:px-5 md:px-8" aria-label="Other ways to use Remnant">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-2 text-sm font-bold text-[var(--brand)]">
          {Object.entries(intentPages)
            .filter(([key]) => key !== pageKey)
            .map(([key, item]) => (
              <Link key={key} href={item.path} className="inline-flex min-h-14 items-center gap-2 rounded-xl border border-[var(--border)]/55 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-[var(--lavender)]/25 hover:bg-[var(--lavender-soft)]">
                <ActionArtwork name={intentArtwork[key as IntentPageKey]} className="h-9 w-9 md:h-11 md:w-11" />
                <span>{item.heading}</span>
              </Link>
            ))}
        </div>
      </nav>
    </main>
  );
}
