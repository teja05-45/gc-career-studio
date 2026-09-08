import { prisma } from "@/lib/db/prisma";
import { leadSchema, updateLeadSchema, type LeadInput, type UpdateLeadInput } from "@/lib/validations/lead";

export class ValidationError extends Error {
  issues: Record<string, string>;
  constructor(issues: Record<string, string>) {
    super("Validation failed");
    this.issues = issues;
  }
}

function zodIssuesToRecord(issues: { path: (string | number)[]; message: string }[]) {
  const record: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!record[key]) record[key] = issue.message;
  }
  return record;
}

export async function createLead(raw: unknown) {
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(zodIssuesToRecord(parsed.error.issues));
  }
  const data: LeadInput = parsed.data;

  return prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      careerStage: data.careerStage,
      currentRole: data.currentRole,
      serviceId: data.serviceId || undefined,
      message: data.message,
    },
  });
}

export type LeadListFilters = {
  status?: string;
  search?: string;
  sortBy?: "createdAt" | "name" | "status";
  sortDir?: "asc" | "desc";
};

export async function listLeads(filters: LeadListFilters) {
  const { status, search, sortBy = "createdAt", sortDir = "desc" } = filters;

  return prisma.lead.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { service: { select: { title: true } } },
    orderBy: { [sortBy]: sortDir },
  });
}

export async function countLeads() {
  return prisma.lead.count();
}

export async function getLeadStats() {
  const [total, newCount, qualified, converted] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "QUALIFIED" } }),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
  ]);

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return { total, newCount, qualified, converted, conversionRate };
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { service: { select: { title: true, slug: true } } },
  });
}

export async function updateLead(id: string, raw: unknown) {
  const parsed = updateLeadSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(zodIssuesToRecord(parsed.error.issues));
  }
  const data: UpdateLeadInput = parsed.data;

  return prisma.lead.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });
}
