import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import * as leadService from "@/lib/services/lead-service";
import { prisma } from "@/lib/db/prisma";

// Mock auth so auth.ts (which pulls in prisma + bcrypt) never loads.
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock Prisma — real service logic runs against fakes, no DB touched.
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

// Import the routes AFTER mocks are registered (ESM hoists vi.mock anyway,
// but importing here keeps the intent explicit).
const { GET } = await import("@/app/api/admin/leads/route");
const { GET: getSingle, PATCH } = await import("@/app/api/admin/leads/[id]/route");

const adminSession = {
  user: { id: "admin-1", name: "Admin", email: "admin@example.com", role: "ADMIN" },
  expires: "2099-01-01T00:00:00.000Z",
};
const candidateSession = {
  user: { id: "cand-1", name: "Candidate", email: "cand@example.com", role: "CANDIDATE" },
  expires: "2099-01-01T00:00:00.000Z",
};

const mockLeads = [
  {
    id: "lead-1",
    name: "Jane Doe",
    email: "jane@example.com",
    careerStage: "PROFESSIONAL",
    status: "NEW",
    // API responses serialize dates to ISO strings — model the payload as-is.
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];

function adminRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

describe("GET /api/admin/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const res = await GET(adminRequest("http://localhost/api/admin/leads"));

    expect(res.status).toBe(403);
  });

  it("returns 403 for a CANDIDATE session", async () => {
    vi.mocked(auth).mockResolvedValue(candidateSession as never);

    const res = await GET(adminRequest("http://localhost/api/admin/leads"));

    expect(res.status).toBe(403);
  });

  it("returns 403 for a CONSULTANT session", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "consult-1", name: "Consultant", email: "c@example.com", role: "CONSULTANT" },
      expires: "2099-01-01T00:00:00.000Z",
    } as never);

    const res = await GET(adminRequest("http://localhost/api/admin/leads"));

    expect(res.status).toBe(403);
  });

  it("returns { leads, total } for an ADMIN", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.lead.findMany).mockResolvedValue(mockLeads as never);
    vi.mocked(prisma.lead.count).mockResolvedValue(1);

    const res = await GET(adminRequest("http://localhost/api/admin/leads"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ leads: mockLeads, total: 1 });
  });

  it("distinguishes a filtered result from the total count", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    // 3 leads total, but the search only matches 1.
    vi.mocked(prisma.lead.findMany).mockResolvedValue([mockLeads[0]] as never);
    vi.mocked(prisma.lead.count).mockResolvedValue(3);

    const res = await GET(
      adminRequest("http://localhost/api/admin/leads?search=jane@example.com")
    );

    const body = await res.json();
    expect(body.leads).toHaveLength(1);
    expect(body.total).toBe(3);
  });

  it("passes status filter through to the service", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.lead.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.lead.count).mockResolvedValue(0);

    await GET(adminRequest("http://localhost/api/admin/leads?status=QUALIFIED"));

    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "QUALIFIED" } })
    );
  });

  it("returns 500 when the service throws", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.lead.findMany).mockRejectedValue(new Error("db down"));

    const res = await GET(adminRequest("http://localhost/api/admin/leads"));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toMatch(/something went wrong/i);
  });
});

describe("GET /api/admin/leads/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for a non-admin", async () => {
    vi.mocked(auth).mockResolvedValue(candidateSession as never);

    const res = await getSingle(adminRequest("http://localhost/api/admin/leads/lead-1"), {
      params: { id: "lead-1" },
    });

    expect(res.status).toBe(403);
  });

  it("returns 404 when the lead is missing", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.lead.findUnique).mockResolvedValue(null);

    const res = await getSingle(adminRequest("http://localhost/api/admin/leads/missing"), {
      params: { id: "missing" },
    });

    expect(res.status).toBe(404);
  });

  it("returns the lead for an ADMIN", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.lead.findUnique).mockResolvedValue(mockLeads[0] as never);

    const res = await getSingle(adminRequest("http://localhost/api/admin/leads/lead-1"), {
      params: { id: "lead-1" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("lead-1");
  });
});

describe("PATCH /api/admin/leads/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for a non-admin", async () => {
    vi.mocked(auth).mockResolvedValue(candidateSession as never);

    const res = await PATCH(
      adminRequest("http://localhost/api/admin/leads/lead-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "QUALIFIED" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "lead-1" } }
    );

    expect(res.status).toBe(403);
  });

  it("updates a lead for an ADMIN", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    const updated = { ...mockLeads[0], status: "QUALIFIED" };
    vi.mocked(prisma.lead.update).mockResolvedValue(updated as never);

    const res = await PATCH(
      adminRequest("http://localhost/api/admin/leads/lead-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "QUALIFIED", notes: "Following up" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "lead-1" } }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("QUALIFIED");
    expect(prisma.lead.update).toHaveBeenCalledWith({
      where: { id: "lead-1" },
      data: { status: "QUALIFIED", notes: "Following up" },
    });
  });

  it("returns 400 for an invalid status", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);

    const res = await PATCH(
      adminRequest("http://localhost/api/admin/leads/lead-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "NOT_A_STATUS" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "lead-1" } }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/validation failed/i);
    expect(body.issues).toBeDefined();
    expect(prisma.lead.update).not.toHaveBeenCalled();
  });

  it("returns 500 when the service throws", async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as never);
    vi.mocked(prisma.lead.update).mockRejectedValue(new Error("db down"));

    const res = await PATCH(
      adminRequest("http://localhost/api/admin/leads/lead-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "QUALIFIED" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "lead-1" } }
    );

    expect(res.status).toBe(500);
  });
});

// Silence unused-import lint for the service module (used implicitly via
// mocked prisma through the real routes).
void leadService;