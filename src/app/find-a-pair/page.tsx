import type { Metadata } from "next";
import FindPageClient from "@/components/marketplace/FindPageClient";
import { getPublicSearchListings } from "@/lib/public-listings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Search Used Items and Spare Parts in Nigeria",
  description: "Search Remnant Market for used items, single pieces, spare parts, donations, barter trades, and recyclable goods across Nigeria.",
  alternates: { canonical: "/find-a-pair" },
};

interface FindPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function FindAPairPage({ searchParams }: FindPageProps) {
  const params = await searchParams;
  const search = firstValue(params.search).trim();
  const category = firstValue(params.category);
  const city = firstValue(params.city);
  const intent = firstValue(params.intent).toUpperCase();
  const requestParams: Record<string, string | number> = { limit: 24 };
  if (search) requestParams.q = search;
  if (category) requestParams.category = category;
  if (city) requestParams.city = city;
  if (intent) requestParams.intent = intent;

  const listings = await getPublicSearchListings(requestParams, 60);
  return (
    <FindPageClient
      initialListings={listings}
      initialSearch={search}
      initialCategory={category}
      initialCity={city}
      initialIntent={intent}
    />
  );
}
