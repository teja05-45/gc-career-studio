import { NextResponse } from "next/server";
import { getActiveServices } from "@/lib/services/service-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await getActiveServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
