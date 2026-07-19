import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Remnant Market Help Centre",
  description:
    "Get help with listings, messages, safe exchanges, donations, barter trades, repairs, recycling, and using Remnant Market.",
  alternates: { canonical: "/help" },
};

export default function HelpLayout({ children }: { children: ReactNode }) {
  return children;
}
