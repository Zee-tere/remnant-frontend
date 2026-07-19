import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reuse, Repair & Recycle Useful Items",
  description:
    "See how Remnant keeps useful items and parts in circulation through reuse, direct donations, repairs, barter, and recycling in Nigeria.",
  alternates: { canonical: "/sustainability" },
};

export default function SustainabilityLayout({ children }: { children: ReactNode }) {
  return children;
}
