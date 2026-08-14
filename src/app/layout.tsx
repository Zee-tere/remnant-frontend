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
    default: "Remnant Nigeria | Find the Missing Piece",
    template: "%s | Remnant Market Nigeria",
  },
  description:
    "Find an exact missing piece or pass a useful item on through sale, trade, donation, repair, or recycling. Connect directly across Nigeria.",
  authors: [{ name: "Remnant Team" }],
  creator: "Remnant",
  publisher: "Remnant Market",
  category: "marketplace",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
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
      "Find the missing piece, or pass on what still works. List, match, and arrange the exchange directly.",
    siteName: "Remnant Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remnant Market Nigeria",
    description:
      "Find the missing piece, or pass on what still works.",
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
          "A Nigerian marketplace for finding exact missing pieces and passing useful items directly to people who need them.",
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://36yevvooae.execute-api.us-east-1.amazonaws.com" />
        <JsonLd data={structuredData} />
      </head>

      <body className="flex min-h-[100dvh] flex-col bg-background text-foreground font-sans antialiased">
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

          <main id="main-content" className="flex-grow md:pb-0">
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
