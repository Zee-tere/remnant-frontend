import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ListingDetailClient from "@/components/marketplace/ListingDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getListingImageUrl,
  getListingPath,
  getPublicListing,
  type PublicListing,
} from "@/lib/public-listings";

export const revalidate = 300;

const siteUrl = "https://remnantmarket.co";
const intentLabels: Record<string, string> = {
  SELL: "For sale",
  TRADE: "Available for barter",
  DONATE: "Free donation",
  FIX: "Available for repair",
  RECYCLE: "Available for recycling",
};
const conditionUrls: Record<string, string> = {
  NEW: "https://schema.org/NewCondition",
  LIKE_NEW: "https://schema.org/UsedCondition",
  FAIRLY_USED: "https://schema.org/UsedCondition",
  WORN_OUT: "https://schema.org/DamagedCondition",
  DAMAGED: "https://schema.org/DamagedCondition",
};

function cleanDescription(listing: PublicListing) {
  const location = listing.city ? ` in ${listing.city}, Nigeria` : " in Nigeria";
  const intent = intentLabels[listing.intentionTag] || "Listed";
  const text = `${intent}${location}. ${listing.description || `${listing.title} on Remnant Market.`}`
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 158 ? `${text.slice(0, 155).trimEnd()}...` : text;
}

function getProductStructuredData(listing: PublicListing) {
  const path = getListingPath(listing);
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}${path}#product`,
    name: listing.title,
    description: listing.description,
    image: listing.images?.length ? listing.images.map((_, index) => getListingImageUrl(listing.id, index)) : undefined,
    sku: listing.id,
    category: listing.category,
    itemCondition: conditionUrls[listing.condition] || "https://schema.org/UsedCondition",
    url: `${siteUrl}${path}`,
    dateCreated: listing.createdAt,
    dateModified: listing.updatedAt,
    seller: listing.user?.name
      ? {
          "@type": "Person",
          name: listing.user.name,
          address: listing.user.city || listing.city
            ? {
                "@type": "PostalAddress",
                addressRegion: listing.user.city || listing.city,
                addressCountry: "NG",
              }
            : undefined,
        }
      : undefined,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Listing intent", value: intentLabels[listing.intentionTag] || listing.intentionTag },
      { "@type": "PropertyValue", name: "Location", value: listing.city || "Nigeria" },
    ],
  };

  if (listing.intentionTag === "SELL" || listing.intentionTag === "DONATE") {
    product.offers = {
      "@type": "Offer",
      url: `${siteUrl}${path}`,
      priceCurrency: "NGN",
      price: listing.intentionTag === "DONATE" ? 0 : Number(listing.price || 0),
      availability: "https://schema.org/InStock",
      itemCondition: conditionUrls[listing.condition] || "https://schema.org/UsedCondition",
      seller: listing.user?.name ? { "@type": "Person", name: listing.user.name } : undefined,
    };
  }

  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getPublicListing(id);
  if (!listing) {
    return {
      title: "Listing not found",
      robots: { index: false, follow: false },
    };
  }

  const path = getListingPath(listing);
  const image = listing.images?.length ? getListingImageUrl(listing.id) : "/opengraph-image";
  const description = cleanDescription(listing);
  const location = listing.city ? ` in ${listing.city}` : "";

  return {
    title: `${listing.title}${location} - ${intentLabels[listing.intentionTag] || "Listing"}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: listing.title,
      description,
      images: [{ url: image, alt: `${listing.title}${location}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getPublicListing(id);
  if (!listing) notFound();

  if (listing.slug && id !== listing.slug) {
    permanentRedirect(getListingPath(listing));
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Marketplace", item: `${siteUrl}/marketplace` },
      { "@type": "ListItem", position: 3, name: listing.title, item: `${siteUrl}${getListingPath(listing)}` },
    ],
  };

  return (
    <>
      <JsonLd data={[getProductStructuredData(listing), breadcrumb]} />
      <ListingDetailClient initialListing={listing} />
    </>
  );
}
