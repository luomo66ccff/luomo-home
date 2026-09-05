import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl().origin;
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/live2d-test", "/atri-brain-test"] }, sitemap: origin + "/sitemap.xml", host: origin };
}
