import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  careerStage: z.enum(["STUDENT", "EARLY_CAREER", "PROFESSIONAL", "CAREER_SWITCHER", "SENIOR_LEADER"]).optional().or(z.literal("")).transform((value) => value || undefined),
  currentRole: z.string().trim().max(150).optional().or(z.literal("")),
  targetRole: z.string().trim().max(150).optional().or(z.literal("")),
  experience: z.string().trim().max(150).optional().or(z.literal("")),
  skills: z.string().trim().max(1000).optional().or(z.literal("")),
  careerGoals: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Please review the highlighted information.";
    return NextResponse.json({ message: firstIssue }, { status: 400 });
  }
  try {
    const user = await prisma.user.update({ where: { id: session.user.id }, data: parsed.data });
    return NextResponse.json({ name: user.name });
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json({ message: "Unable to save changes. Please try again." }, { status: 500 });
  }
}
