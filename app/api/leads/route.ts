import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createLead, ValidationError } from "@/lib/services/lead-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = await createLead(body);
    // Cache hygiene for any cached route that renders leads. The app is
    // force-dynamic, so this is documentation/insurance rather than a
    // behaviour change.
    revalidatePath("/admin", "layout");
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { message: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
