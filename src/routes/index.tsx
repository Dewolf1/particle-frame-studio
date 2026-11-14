import { createFileRoute } from "@tanstack/react-router";
import PortfolioPage from "@/components/PortfolioPage";

export const Route = createFileRoute("/")({
  // The WebGL hero renders client-only; SSR would try to mount the Canvas.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Paiman Wafa — Photography & Film" },
      {
        name: "description",
        content:
          "Director, Cinematographer & Photographer. Crafting large-format frames, 35mm celluloid discipline, and moving images.",
      },
      { property: "og:title", content: "Paiman Wafa — Photography & Film" },
      {
        property: "og:description",
        content:
          "Director and cinematographer portfolio with an interactive 3D camera that shatters into light particles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});
