import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|images|icons|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
