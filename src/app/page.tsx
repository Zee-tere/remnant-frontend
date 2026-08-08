import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicListings } from "@/lib/public-listings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "Remnant Nigeria | Find the Missing Piece. Pass Useful Things On",
  },
  description:
    "Find an exact missing piece or list something useful for sale, trade, donation, repair, or recycling. Connect directly with people across Nigeria.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Find the missing piece with Remnant",
    description:
      "Search for the exact piece you need, or pass on what still works. List, match, and arrange the exchange directly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remnant Market Nigeria",
    description: "Find the missing piece, or pass on what still works.",
  },
};

export default async function HomePage() {
  const listingPage = await getPublicListings({ page: 1, limit: 6 }, 60);
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
