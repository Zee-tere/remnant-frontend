import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "List an Item on Remnant Market",
  description:
    "Create a free listing to sell, trade, donate, repair, or recycle a useful item in Nigeria. Guest listings are supported.",
  alternates: { canonical: "/sell-item" },
};

export default function SellItemLayout({ children }: { children: ReactNode }) {
  return children;
}
