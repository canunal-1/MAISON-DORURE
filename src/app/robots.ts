import type { MetadataRoute } from "next";
import { urlDuSite } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${urlDuSite()}/sitemap.xml`,
  };
}
