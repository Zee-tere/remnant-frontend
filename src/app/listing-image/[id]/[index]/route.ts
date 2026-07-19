import { NextResponse } from "next/server";
import { getPublicListing } from "@/lib/public-listings";

export const revalidate = 1800;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; index: string }> },
) {
  const { id, index } = await params;
  const listing = await getPublicListing(id, 1800);
  const imageIndex = Number.parseInt(index, 10);
  const imageUrl = listing?.images?.[Number.isFinite(imageIndex) ? imageIndex : 0];

  if (!imageUrl) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  const response = NextResponse.redirect(imageUrl, 307);
  response.headers.set("Cache-Control", "public, max-age=1800, stale-while-revalidate=1800");
  return response;
}
