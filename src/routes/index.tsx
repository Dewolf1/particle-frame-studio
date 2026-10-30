import { createFileRoute } from "@tanstack/react-router";
import PortfolioPage from "@/components/PortfolioPage";

export const Route = createFileRoute("/")({
  // The WebGL hero renders client-only; SSR would try to mount the Canvas.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lumen Studio — Photography & Film" },
      {
        name: "description",
        content:
          "A photography and film studio portfolio: a shattering 3D camera hero, selected stills and films, and commissions for brands that want to be remembered.",
      },
      { property: "og:title", content: "Lumen Studio — Photography & Film" },
      {
        property: "og:description",
        content:
          "A photography and film studio portfolio with a 3D camera that shatters into light particles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});
