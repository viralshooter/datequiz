import type { MetadataRoute } from "next";

/**
 * The marketing pages are the only ones worth indexing.
 *
 * /d/ holds someone's private invitation and /r/ holds her answer; both
 * are reachable by URL alone, so they're kept out of search results as
 * well as being marked noindex on the page itself.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yeslink.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/d/", "/r/", "/dashboard", "/account", "/admin", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
