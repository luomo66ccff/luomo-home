import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: getSiteUrl().href, changeFrequency: "monthly", priority: 1 }]; }
