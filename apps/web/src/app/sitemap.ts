import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chimp-pick.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/ranking`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/profile`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
