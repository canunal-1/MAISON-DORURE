import type { MetadataRoute } from "next";
import { pages, urlDuSite } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((chemin) => ({
    url: chemin === "/" ? urlDuSite() : `${urlDuSite()}${chemin}`,
  }));
}
