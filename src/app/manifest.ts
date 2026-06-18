import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habitus",
    short_name: "Habitus",
    description: "Independent verification for your building projects back home.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F2",
    theme_color: "#1F7A5A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
