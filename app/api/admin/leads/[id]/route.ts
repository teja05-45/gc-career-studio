import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateLead, ValidationError, getLeadById } from "@/lib/services/lead-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const lead = await getLeadById(params.id);
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const lead = await updateLead(params.id, body);
    return NextResponse.json(lead);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { message: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Update lead error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
