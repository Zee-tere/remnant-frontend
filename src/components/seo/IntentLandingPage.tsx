import Link from "next/link";
import { ArrowRight, MapPin, MessageSquare, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { intentPages, type IntentPageKey } from "@/lib/intent-pages";
import { getListingPath, getPublicListings } from "@/lib/public-listings";

const steps = [
  { title: "List it", text: "Add clear photos, condition, and location.", icon: PackagePlus },
  { title: "Get found", text: "People browse by need, intent, category, and state.", icon: MapPin },
  { title: "Agree directly", text: "Use Remnant messages to arrange the exchange.", icon: MessageSquare },
];

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

      <section className="border-b border-[var(--border)]/40 px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Remnant Market Nigeria</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-[var(--foreground)] md:text-6xl">
            {config.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-[var(--ink-soft)] md:text-lg md:leading-8">
            {config.intro}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-[var(--brand)] px-6 font-bold text-white hover:bg-[var(--brand-dark)]">
              <Link href={`/sell-item?intent=${config.intentTag}`}>
                {config.actionLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-[var(--border)] bg-white px-6 font-bold text-[var(--brand)]">
              <Link href={`/marketplace?intentionTag=${config.intentTag}`}>Browse current listings</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14" aria-labelledby={`${pageKey}-how`}>
        <div className="mx-auto max-w-5xl">
          <h2 id={`${pageKey}-how`} className="text-xl font-bold text-[var(--foreground)] md:text-3xl">
            How it works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 border-y border-[var(--border)]/45 py-6 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                  <step.icon size={18} aria-hidden="true" />
                </span>
                <div>
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
            <h2 id={`${pageKey}-listings`} className="text-xl font-bold text-[var(--foreground)] md:text-3xl">
              {config.listingsLabel}
            </h2>
            <Link href={`/marketplace?intentionTag=${config.intentTag}`} className="shrink-0 text-sm font-bold text-[var(--brand)] hover:underline">
              View all
            </Link>
          </div>

          {result.listings.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {result.listings.map((listing) => <ListingCard key={listing.id} item={listing} />)}
            </div>
          ) : (
            <div className="mt-6 border-y border-[var(--border)]/45 py-10">
              <p className="font-semibold text-[var(--ink-soft)]">No active listings here yet.</p>
              <Link href={`/sell-item?intent=${config.intentTag}`} className="mt-2 inline-flex font-bold text-[var(--brand)] hover:underline">
                Add the first one
              </Link>
            </div>
          )}
        </div>
      </section>

      <nav className="px-4 py-10 md:px-8" aria-label="Other ways to use Remnant">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-[var(--brand)]">
          {Object.entries(intentPages)
            .filter(([key]) => key !== pageKey)
            .map(([key, item]) => (
              <Link key={key} href={item.path} className="hover:underline">
                {item.heading}
              </Link>
            ))}
        </div>
      </nav>
    </main>
  );
}
