import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "How to Sell Used & Single Items in Nigeria",
  description:
    "Practical guidance for photographing, describing, pricing, listing, and safely exchanging used goods and single items in Nigeria.",
  alternates: { canonical: "/seller-guide" },
};

export default function SellerGuideLayout({ children }: { children: ReactNode }) {
  return children;
}
