import type { Metadata } from "next";
import IntentLandingPage from "@/components/seo/IntentLandingPage";
import { intentPages } from "@/lib/intent-pages";

export const revalidate = 300;
export const metadata: Metadata = {
  title: intentPages.sell.title,
  description: intentPages.sell.description,
  alternates: { canonical: intentPages.sell.path },
  openGraph: { type: "website", url: intentPages.sell.path, title: intentPages.sell.title, description: intentPages.sell.description },
};

export default function SellLandingPage() {
  return <IntentLandingPage pageKey="sell" />;
}
