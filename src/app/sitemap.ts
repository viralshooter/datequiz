import type { MetadataRoute } from "next";

/** Only the public pages. Invitations and answers are deliberately absent. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yeslink.app";
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, priority: 1 },
    { url: `${siteUrl}/create`, lastModified: now, priority: 0.8 },
    { url: `${siteUrl}/login`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: now, priority: 0.2 },
    { url: `${siteUrl}/terms`, lastModified: now, priority: 0.2 },
  ];
}
