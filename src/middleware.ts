import { NextResponse, type NextRequest } from "next/server";

const cacheableAssetPattern =
  /^\/(?:_next\/static|_next\/image|images\/|icons\/|indexnow-key\.txt|listing-image\/|opengraph-image|favicon\.ico|robots\.txt|sitemap\.xml|manifest\.webmanifest)/;
const privatePathPattern =
  /^\/(?:admin|api|auth|blog|guest|login|signup|forgot-password|reset-password|payment|profile|register|settings|transactions|user)(?:\/|$)/;
const publicPagePattern =
  /^\/(?:$|about(?:\/|$)|donate(?:\/|$)|find-a-pair(?:\/|$)|help(?:\/|$)|marketplace(?:\/|$)|privacy(?:\/|$)|recycle(?:\/|$)|repair(?:\/|$)|sell(?:\/|$)|sell-item(?:\/|$)|seller-guide(?:\/|$)|sustainability(?:\/|$)|terms(?:\/|$)|trade(?:\/|$))/;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (publicPagePattern.test(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    response.headers.set("CDN-Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  } else if (!cacheableAssetPattern.test(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    response.headers.set("CDN-Cache-Control", "no-store");
  }
  if (privatePathPattern.test(request.nextUrl.pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|icons|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
