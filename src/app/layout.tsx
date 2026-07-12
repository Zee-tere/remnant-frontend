import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Providers } from "@/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "Remnant | Buy, List, Match, Repair, Donate, and Recycle Useful Things",
    template: "%s | Remnant",
  },
  description:
    "A circular marketplace for useful pieces. Buy, sell, trade, donate, repair, recycle, or find the exact missing match.",
  keywords: [
    "AI marketplace",
    "C2C",
    "Nigeria",
    "Africa",
    "secondhand",
    "sustainable",
    "circular economy",
    "single items",
  ],
  authors: [{ name: "Remnant Team" }],
  creator: "Remnant",
  publisher: "Remnant Marketplace",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://remnant.africa"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://remnant.africa",
    title: "Remnant | Buy, List, Match, Repair, Donate, and Recycle Useful Things",
    description:
      "Buy, sell, trade, donate, repair, recycle, or find the exact missing piece.",
    siteName: "Remnant",
  },
  twitter: {
    card: "summary",
    title: "Remnant | Buy, List, Match, Repair, Donate, and Recycle Useful Things",
    description:
      "Buy, sell, trade, donate, repair, recycle, or find the exact missing piece.",
    creator: "@remnant_market",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Remnant",
    alternateName: "Remnant Marketplace",
    url: "https://remnant.africa",
    description:
      "Circular C2C marketplace for single items, mismatched products, broken goods, and useful parts",
    publisher: {
      "@type": "Organization",
      name: "Remnant",
      logo: {
        "@type": "ImageObject",
        url: "https://remnant.africa/favicon.ico",
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://remnant.africa/marketplace?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
        />
        <meta name="theme-color" content="#006c52" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://api.remnant.africa" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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

          <main id="main-content" className="flex-grow pb-20 md:pb-0">
            {children}
          </main>

          <div className="safe-bottom hidden md:block">
            <Footer />
          </div>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
