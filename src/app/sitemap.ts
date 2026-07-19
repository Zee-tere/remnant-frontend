import type { MetadataRoute } from "next";
import {
  getListingImageUrl,
  getListingPath,
  getSitemapListings,
} from "@/lib/public-listings";

export const revalidate = 1800;

const siteUrl = "https://remnantmarket.co";
const staticPages: MetadataRoute.Sitemap = [
  { url: siteUrl, changeFrequency: "daily", priority: 1 },
  { url: `${siteUrl}/marketplace`, changeFrequency: "hourly", priority: 0.9 },
  { url: `${siteUrl}/sell`, changeFrequency: "hourly", priority: 0.85 },
  { url: `${siteUrl}/trade`, changeFrequency: "hourly", priority: 0.85 },
  { url: `${siteUrl}/donate`, changeFrequency: "hourly", priority: 0.85 },
  { url: `${siteUrl}/repair`, changeFrequency: "hourly", priority: 0.8 },
  { url: `${siteUrl}/recycle`, changeFrequency: "hourly", priority: 0.8 },
  { url: `${siteUrl}/find-a-pair`, changeFrequency: "daily", priority: 0.8 },
  { url: `${siteUrl}/sell-item`, changeFrequency: "weekly", priority: 0.75 },
  { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/seller-guide`, changeFrequency: "monthly", priority: 0.65 },
  { url: `${siteUrl}/sustainability`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/help`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getSitemapListings(1800);
  const listingPages = listings.slice(0, 50_000 - staticPages.length).map((listing) => ({
    url: `${siteUrl}${getListingPath(listing)}`,
    lastModified: listing.updatedAt || listing.createdAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
    images: listing.imageCount > 0 ? [getListingImageUrl(listing.id)] : undefined,
  }));

  return [...staticPages, ...listingPages];
}
