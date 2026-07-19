import type { Metadata } from "next";
import IntentLandingPage from "@/components/seo/IntentLandingPage";
import { intentPages } from "@/lib/intent-pages";

export const revalidate = 300;
export const metadata: Metadata = {
  title: intentPages.trade.title,
  description: intentPages.trade.description,
  alternates: { canonical: intentPages.trade.path },
  openGraph: { type: "website", url: intentPages.trade.path, title: intentPages.trade.title, description: intentPages.trade.description },
};

export default function TradeLandingPage() {
  return <IntentLandingPage pageKey="trade" />;
}
