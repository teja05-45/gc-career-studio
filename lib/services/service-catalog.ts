import { prisma } from "@/lib/db/prisma";

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}

export async function getServiceOptions() {
  const services = await getActiveServices();
  return services.map((s) => ({ id: s.id, title: s.title, slug: s.slug }));
}
