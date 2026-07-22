import { getApiUrl } from "@/lib/api-url";

export interface PublicListingCard {
  id: string;
  title: string;
  slug: string;
  intentionTag: string;
  price: string | null;
  status: string;
  images: string[];
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicListing extends PublicListingCard {
  description: string;
  category: string;
  condition: string;
  pairingKeyword: string | null;
  isGuestListing?: boolean;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    trustTier: string;
    city?: string | null;
  };
}

export interface PublicListingPage {
  listings: PublicListingCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SitemapListing {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  imageCount: number;
}

const emptyPage: PublicListingPage = {
  listings: [],
  total: 0,
  page: 1,
  limit: 0,
  totalPages: 1,
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function getListingPath(listing: Pick<PublicListing, "id" | "slug">) {
  return `/marketplace/${listing.slug || listing.id}`;
}

export function getListingImageUrl(listingId: string, index = 0) {
  return `https://remnantmarket.co/listing-image/${encodeURIComponent(listingId)}/${index}`;
}

export async function getPublicListings(
  params: Record<string, string | number> = {},
  revalidate = 300,
): Promise<PublicListingPage> {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => searchParams.set(key, String(value)));

    const response = await fetch(`${getApiUrl()}/listings?${searchParams.toString()}`, {
      next: { revalidate, tags: ["public-listings"] },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return emptyPage;

    const payload = (await response.json()) as Partial<PublicListingPage> & {
      items?: PublicListingCard[];
    };
    const listings = Array.isArray(payload.listings)
      ? payload.listings
      : Array.isArray(payload.items)
        ? payload.items
        : [];

    return {
      listings: listings.filter((listing) => listing.status === "ACTIVE"),
      total: typeof payload.total === "number" ? payload.total : listings.length,
      page: typeof payload.page === "number" ? payload.page : 1,
      limit: typeof payload.limit === "number" ? payload.limit : listings.length,
      totalPages: typeof payload.totalPages === "number" ? payload.totalPages : 1,
    };
  } catch {
    return emptyPage;
  }
}

export async function getPublicSearchListings(
  params: Record<string, string | number> = {},
  revalidate = 60,
): Promise<PublicListingCard[]> {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => searchParams.set(key, String(value)));
    const response = await fetch(`${getApiUrl()}/listings/search?${searchParams.toString()}`, {
      next: { revalidate, tags: ["public-listings"] },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return [];

    const listings = (await response.json()) as PublicListingCard[];
    return Array.isArray(listings) ? listings.filter((listing) => listing.status === "ACTIVE") : [];
  } catch {
    return [];
  }
}

export async function getPublicListing(segment: string, revalidate = 300): Promise<PublicListing | null> {
  try {
    const endpoint = isUuid(segment)
      ? `/listings/${encodeURIComponent(segment)}`
      : `/listings/slug/${encodeURIComponent(segment)}`;
    const response = await fetch(`${getApiUrl()}${endpoint}?trackView=false`, {
      next: { revalidate, tags: ["public-listings", `listing:${segment}`] },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;

    const listing = (await response.json()) as PublicListing;
    return listing.status === "ACTIVE" ? listing : null;
  } catch {
    return null;
  }
}

export async function getSitemapListings(revalidate = 1800): Promise<SitemapListing[]> {
  try {
    const response = await fetch(`${getApiUrl()}/listings/sitemap`, {
      next: { revalidate, tags: ["public-listings", "listing-sitemap"] },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return getSitemapListingsFromPages(revalidate);

    const listings = (await response.json()) as SitemapListing[];
    return Array.isArray(listings) ? listings : getSitemapListingsFromPages(revalidate);
  } catch {
    return getSitemapListingsFromPages(revalidate);
  }
}

async function getSitemapListingsFromPages(revalidate: number): Promise<SitemapListing[]> {
  const firstPage = await getPublicListings({ page: 1, limit: 50 }, revalidate);
  const remaining: PublicListingPage[] = [];
  const totalPages = Math.min(firstPage.totalPages, 1000);
  for (let start = 2; start <= totalPages; start += 10) {
    const batch = Array.from(
      { length: Math.min(10, totalPages - start + 1) },
      (_, index) => start + index,
    );
    remaining.push(
      ...(await Promise.all(
        batch.map((page) => getPublicListings({ page, limit: 50 }, revalidate)),
      )),
    );
  }

  return [firstPage, ...remaining].flatMap((result) =>
    result.listings.map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      imageCount: listing.images.length,
    })),
  );
}
