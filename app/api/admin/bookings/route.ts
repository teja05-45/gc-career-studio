import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listBookings } from "@/lib/services/booking-service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const bookings = await listBookings({ status });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("List bookings error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
