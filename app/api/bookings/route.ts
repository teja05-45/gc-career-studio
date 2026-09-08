import { NextRequest, NextResponse } from "next/server";
import { createBooking, ValidationError } from "@/lib/services/booking-service";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Please sign in to book a call." }, { status: 401 });
  }
  if (session.user.role !== "CANDIDATE") {
    return NextResponse.json(
      { message: "Discovery-call booking is available for candidate accounts only." },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const booking = await createBooking(body, session.user.id);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      const firstIssue = Object.values(error.issues)[0];
      return NextResponse.json(
        {
          message: firstIssue || "Please complete all required fields.",
          issues: error.issues,
        },
        { status: 400 }
      );
    }
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
