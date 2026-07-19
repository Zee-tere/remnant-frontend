import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Remnant Market to list, find, message about, and exchange items.",
  alternates: { canonical: "/terms" },
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
