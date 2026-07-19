import type { Metadata } from "next";
import MarketplaceClient from "@/components/marketplace/MarketplaceClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getListingPath, getPublicListings } from "@/lib/public-listings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Used Items, Single Pieces & Local Listings in Nigeria",
  description:
    "Browse used items, single pieces, spare parts, donations, barter trades, repairable goods, and recyclable materials listed across Nigeria.",
  alternates: { canonical: "/marketplace" },
  openGraph: {
    type: "website",
    url: "/marketplace",
    title: "Explore Remnant Market Nigeria",
    description:
      "Find second-hand goods, hard-to-find single items, donations, trade offers, repair projects, and useful parts near you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Remnant Market Nigeria",
    description: "Find used items, single pieces, donations, barter trades, and useful parts across Nigeria.",
  },
};

export default async function MarketplacePage() {
  const listingPage = await getPublicListings({ page: 1, limit: 12 }, 300);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Used items and local listings in Nigeria",
    numberOfItems: listingPage.listings.length,
    itemListElement: listingPage.listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: listing.title,
      url: `https://remnantmarket.co${getListingPath(listing)}`,
    })),
  };

  return (
    <>
      {listingPage.listings.length > 0 && <JsonLd data={itemList} />}
      <MarketplaceClient initialData={listingPage} />
    </>
  );
}
