import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Remnant Market Nigeria",
    short_name: "Remnant",
    description:
      "Sell, trade, donate, repair, recycle, and find useful items across Nigeria.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006c52",
  };
}
