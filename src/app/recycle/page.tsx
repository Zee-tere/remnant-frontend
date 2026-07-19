import type { Metadata } from "next";
import IntentLandingPage from "@/components/seo/IntentLandingPage";
import { intentPages } from "@/lib/intent-pages";

export const revalidate = 300;
export const metadata: Metadata = {
  title: intentPages.recycle.title,
  description: intentPages.recycle.description,
  alternates: { canonical: intentPages.recycle.path },
  openGraph: { type: "website", url: intentPages.recycle.path, title: intentPages.recycle.title, description: intentPages.recycle.description },
};

export default function RecycleLandingPage() {
  return <IntentLandingPage pageKey="recycle" />;
}
