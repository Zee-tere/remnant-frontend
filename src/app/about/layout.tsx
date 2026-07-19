import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Remnant Market",
  description:
    "Learn how Remnant helps people in Nigeria sell, trade, donate, repair, recycle, and find useful single or incomplete items.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
