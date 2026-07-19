import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Remnant Market handles account, listing, messaging, and marketplace information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
