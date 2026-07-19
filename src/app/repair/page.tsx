import type { Metadata } from "next";
import IntentLandingPage from "@/components/seo/IntentLandingPage";
import { intentPages } from "@/lib/intent-pages";

export const revalidate = 300;
export const metadata: Metadata = {
  title: intentPages.repair.title,
  description: intentPages.repair.description,
  alternates: { canonical: intentPages.repair.path },
  openGraph: { type: "website", url: intentPages.repair.path, title: intentPages.repair.title, description: intentPages.repair.description },
};

export default function RepairLandingPage() {
  return <IntentLandingPage pageKey="repair" />;
}
