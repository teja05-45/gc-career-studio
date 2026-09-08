import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createLead,
  listLeads,
  countLeads,
  getLeadStats,
  updateLead,
  ValidationError,
} from "@/lib/services/lead-service";
import { prisma } from "@/lib/db/prisma";

// Mock Prisma — real service logic runs against these fakes, no DB touched.
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    lead: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Lead Service", () => {
  const validLead = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-0100",
    careerStage: "PROFESSIONAL",
    currentRole: "Product Manager",
    message: "Looking for career guidance.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLead", () => {
    it("creates a lead with valid input", async () => {
      const mockLead = { id: "lead-1", ...validLead, status: "NEW", createdAt: new Date() };
      vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as never);

      const result = await createLead(validLead);

      expect(result.id).toBe("lead-1");
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-0100",
          careerStage: "PROFESSIONAL",
          currentRole: "Product Manager",
          serviceId: undefined,
          message: "Looking for career guidance.",
        },
      });
    });

    it("normalizes empty optional strings to undefined", async () => {
      vi.mocked(prisma.lead.create).mockResolvedValue({ id: "lead-2" } as never);

      await createLead({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "",
        careerStage: "PROFESSIONAL",
        currentRole: "",
        serviceId: "",
        message: "",
      });

      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: undefined,
          careerStage: "PROFESSIONAL",
          currentRole: undefined,
          serviceId: undefined,
          message: undefined,
        },
      });
    });

    it("lowercases the email", async () => {
      vi.mocked(prisma.lead.create).mockResolvedValue({ id: "lead-3" } as never);

      await createLead({ ...validLead, email: "Jane@Example.COM" });

      expect(prisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: "jane@example.com" }),
        })
      );
    });

    it("throws ValidationError for invalid email", async () => {
      await expect(
        createLead({ ...validLead, email: "not-an-email" })
      ).rejects.toThrow(ValidationError);
      expect(prisma.lead.create).not.toHaveBeenCalled();
    });

    it("throws ValidationError for short name", async () => {
      await expect(createLead({ ...validLead, name: "J" })).rejects.toThrow(ValidationError);
      expect(prisma.lead.create).not.toHaveBeenCalled();
    });

    it("throws ValidationError for invalid career stage", async () => {
      await expect(
        createLead({ ...validLead, careerStage: "NOT_A_STAGE" })
      ).rejects.toThrow(ValidationError);
      expect(prisma.lead.create).not.toHaveBeenCalled();
    });
  });

  describe("listLeads", () => {
    it("returns leads with no filters (default sort is createdAt desc)", async () => {
      vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);

      await listLeads({});

      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        where: {},
        include: { service: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      });
    });

    it("applies a status filter", async () => {
      vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);

      await listLeads({ status: "QUALIFIED" });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "QUALIFIED" },
        })
      );
    });

    it("searches case-insensitively across name and email", async () => {
      vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);

      await listLeads({ search: "jane" });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: "jane", mode: "insensitive" } },
              { email: { contains: "jane", mode: "insensitive" } },
            ],
          },
        })
      );
    });

    it("respects custom sort", async () => {
      vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);

      await listLeads({ sortBy: "name", sortDir: "asc" });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: "asc" } })
      );
    });
  });

  describe("getLeadStats", () => {
    it("computes all KPIs from real counts", async () => {
      vi.mocked(prisma.lead.count).mockResolvedValue(10); // total
      // count({ where }) calls share the mock — queue responses by call order.
      vi.mocked(prisma.lead.count)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(6) // NEW
        .mockResolvedValueOnce(3) // QUALIFIED
        .mockResolvedValueOnce(2); // CONVERTED

      const stats = await getLeadStats();

      expect(stats).toEqual({ total: 10, newCount: 6, qualified: 3, converted: 2, conversionRate: 20 });
    });

    it("returns 0% conversion when there are no leads", async () => {
      vi.mocked(prisma.lead.count).mockResolvedValue(0);

      const stats = await getLeadStats();

      expect(stats).toEqual({ total: 0, newCount: 0, qualified: 0, converted: 0, conversionRate: 0 });
    });

    it("rounds conversion rate to a whole number", async () => {
      vi.mocked(prisma.lead.count)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1); // 1/3 = 33.3% → 33

      const stats = await getLeadStats();

      expect(stats.conversionRate).toBe(33);
    });
  });

  describe("countLeads", () => {
    it("returns the unfiltered total count", async () => {
      vi.mocked(prisma.lead.count).mockResolvedValue(42);

      const total = await countLeads();

      expect(total).toBe(42);
      expect(prisma.lead.count).toHaveBeenCalledWith();
    });

    it("reports zero when no leads exist", async () => {
      vi.mocked(prisma.lead.count).mockResolvedValue(0);

      await expect(countLeads()).resolves.toBe(0);
    });
  });

  describe("updateLead", () => {
    it("updates status and notes with valid input", async () => {
      const mockLead = { id: "lead-1", status: "QUALIFIED", notes: "Confirmed at career fair" };
      vi.mocked(prisma.lead.update).mockResolvedValue(mockLead as never);

      const result = await updateLead("lead-1", {
        status: "QUALIFIED",
        notes: "Confirmed at career fair",
      });

      expect(result).toEqual(mockLead);
      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: "lead-1" },
        data: { status: "QUALIFIED", notes: "Confirmed at career fair" },
      });
    });

    it("throws on invalid status value", async () => {
      await expect(
        updateLead("lead-1", { status: "HOPEFUL" })
      ).rejects.toThrow(ValidationError);
      expect(prisma.lead.update).not.toHaveBeenCalled();
    });

    it("throws on empty status when notes provided", async () => {
      await expect(
        updateLead("lead-1", { status: "", notes: "nope" })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("dashboard integration (create → count → stats)", () => {
    it("reflects a newly created lead in total count and stats", async () => {
      vi.mocked(prisma.lead.create).mockResolvedValue({ id: "lead-1" } as never);
      // One freshly created lead: countLeads() sees 1; getLeadStats() then
      // reads total=1, NEW=1, QUALIFIED=0, CONVERTED=0 — in call order.
      vi.mocked(prisma.lead.count)
        .mockResolvedValueOnce(1) // countLeads()
        .mockResolvedValueOnce(1) // getLeadStats total
        .mockResolvedValueOnce(1) // NEW
        .mockResolvedValueOnce(0) // QUALIFIED
        .mockResolvedValueOnce(0); // CONVERTED

      await createLead(validLead);

      const total = await countLeads();
      const stats = await getLeadStats();

      expect(total).toBe(1);
      expect(stats.total).toBe(1);
      // 1 NEW lead, 0 qualified, 0 converted → 0% conversion
      expect(stats.newCount).toBe(1);
      expect(stats.qualified).toBe(0);
      expect(stats.converted).toBe(0);
      expect(stats.conversionRate).toBe(0);
    });
  });
});