import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicListings } from "@/lib/public-listings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "Remnant Market Nigeria | Sell, Trade, Donate & Find Used Items",
  },
  description:
    "Buy and sell single items, trade by barter, donate useful goods, find spare parts, repair pieces, and recycle locally across Nigeria.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Remnant Market Nigeria",
    description:
      "A Nigerian marketplace for single items, used goods, spare parts, donations, barter trades, repairs, and recycling.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remnant Market Nigeria",
    description: "Sell, trade, donate, repair, recycle, or find the exact item you need.",
  },
};

export default async function HomePage() {
  const listingPage = await getPublicListings({ page: 1, limit: 4 }, 60);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest listings on Remnant Market Nigeria",
    numberOfItems: listingPage.listings.length,
    itemListElement: listingPage.listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: listing.title,
      url: `https://remnantmarket.co/marketplace/${listing.slug || listing.id}`,
    })),
  };

  return (
    <>
      {listingPage.listings.length > 0 && <JsonLd data={itemList} />}
      <HomePageClient initialFeaturedListings={listingPage.listings} />
    </>
  );
}
