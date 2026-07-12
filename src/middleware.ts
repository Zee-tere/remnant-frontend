import { NextResponse, type NextRequest } from "next/server";

const cacheableAssetPattern =
  /^\/(?:_next\/static|_next\/image|images\/|icons\/|favicon\.ico|robots\.txt|sitemap\.xml|manifest\.webmanifest)/;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!cacheableAssetPattern.test(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    response.headers.set("CDN-Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|icons|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
