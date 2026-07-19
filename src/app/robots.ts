import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/marketplace/", "/listing-image/"],
      disallow: [
        "/api/",
        "/auth/",
        "/guest/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/payment/",
        "/profile",
        "/register",
        "/settings",
        "/transactions/",
        "/user/",
      ],
    },
    sitemap: "https://remnantmarket.co/sitemap.xml",
    host: "https://remnantmarket.co",
  };
}
