import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Providers } from "@/providers/Providers";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  applicationName: "Remnant Market",
  title: {
    default: "Remnant Market Nigeria | Sell, Trade, Donate & Find Used Items",
    template: "%s | Remnant Market Nigeria",
  },
  description:
    "Nigeria's marketplace for single items, second-hand goods, spare parts, donations, barter trades, repairs, and recycling.",
  authors: [{ name: "Remnant Team" }],
  creator: "Remnant",
  publisher: "Remnant Market",
  category: "marketplace",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/remnant-mark.svg", type: "image/svg+xml" }],
    shortcut: "/remnant-mark.svg",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://remnantmarket.co"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://remnantmarket.co",
    title: "Remnant Market Nigeria",
    description:
      "Buy and sell used items, trade by barter, donate useful goods, find spare parts, repair pieces, and recycle locally.",
    siteName: "Remnant Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remnant Market Nigeria",
    description:
      "Sell, trade, donate, repair, recycle, or find the exact item you need.",
    creator: "@remnant_africa",
    site: "@remnant_africa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  appleWebApp: {
    capable: true,
    title: "Remnant Market",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#006c52",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://remnantmarket.co/#organization",
        name: "Remnant Market",
        alternateName: "Remnant",
        url: "https://remnantmarket.co",
        logo: {
          "@type": "ImageObject",
          url: "https://remnantmarket.co/remnant-mark.svg",
        },
        email: "support@remnantmarket.co",
        sameAs: [
          "https://x.com/remnant_africa",
          "https://www.instagram.com/remnantmarket.co/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://remnantmarket.co/#website",
        name: "Remnant Market",
        alternateName: "Remnant Marketplace",
        url: "https://remnantmarket.co",
        inLanguage: "en-NG",
        description:
          "Nigerian C2C marketplace for single items, used goods, donations, barter trades, repairs, recycling, and useful parts.",
        publisher: { "@id": "https://remnantmarket.co/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://remnantmarket.co/find-a-pair?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://36yevvooae.execute-api.us-east-1.amazonaws.com" />
        <JsonLd data={structuredData} />
      </head>

      <body className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-[100] rounded-full bg-white px-5 py-3 text-[var(--brand)] soft-shadow"
          >
            Skip to main content
          </a>

          <div className="safe-top">
            <Navbar />
          </div>

          <main id="main-content" className="flex-grow pb-[calc(4rem+var(--safe-area-bottom))] md:pb-0">
            {children}
          </main>

          <div className="safe-bottom hidden md:block">
            <Footer />
          </div>
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
