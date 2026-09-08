import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listLeads, countLeads } from "@/lib/services/lead-service";

export async function GET(request: NextRequest) {
  const session = await auth();

  // Authorization check — this should never be reached if middleware works,
  // but double-check anyway since middleware can be bypassed.
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as "createdAt" | "name" | "status") || "createdAt";
    const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";

    const [leads, total] = await Promise.all([
      listLeads({ status, search, sortBy, sortDir }),
      countLeads(),
    ]);
    return NextResponse.json({ leads, total });
  } catch (error) {
    console.error("List leads error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
