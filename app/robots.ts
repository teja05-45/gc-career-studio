import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.AUTH_URL || "http://localhost:3000";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/consultant", "/dashboard", "/api"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
