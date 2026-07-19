import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Search Used Items, Spare Parts & Single Pieces",
  description:
    "Search Remnant Market for used goods, single items, spare parts, donations, barter trades, repair projects, and recyclable materials in Nigeria.",
  alternates: { canonical: "/find-a-pair" },
};

export default function FindAPairLayout({ children }: { children: ReactNode }) {
  return children;
}
