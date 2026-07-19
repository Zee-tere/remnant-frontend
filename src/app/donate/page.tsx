import type { Metadata } from "next";
import IntentLandingPage from "@/components/seo/IntentLandingPage";
import { intentPages } from "@/lib/intent-pages";

export const revalidate = 300;
export const metadata: Metadata = {
  title: intentPages.donate.title,
  description: intentPages.donate.description,
  alternates: { canonical: intentPages.donate.path },
  openGraph: { type: "website", url: intentPages.donate.path, title: intentPages.donate.title, description: intentPages.donate.description },
};

export default function DonateLandingPage() {
  return <IntentLandingPage pageKey="donate" />;
}
