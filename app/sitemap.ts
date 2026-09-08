import type { MetadataRoute } from "next";
import { getActiveServices } from "@/lib/services/service-catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.AUTH_URL || "http://localhost:3000";
  const services = await getActiveServices().catch(() => []);

  const staticRoutes = [
    "",
    "/services",
    "/how-it-works",
    "/success-stories",
    "/about",
    "/contact",
    "/book",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: s.updatedAt,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
