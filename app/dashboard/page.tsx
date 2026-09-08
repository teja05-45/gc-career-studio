import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Candidate Dashboard",
};

export default async function CandidateDashboardPage() {
  const user = await requireRole(["CANDIDATE"]);
  const nextBooking = await prisma.booking.findFirst({
    where: { candidateId: user.id, preferredDate: { gte: new Date() }, status: { not: "CANCELLED" } },
    include: { service: { select: { title: true } } }, orderBy: { preferredDate: "asc" },
  });
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phone: true, careerStage: true, experience: true, currentRole: true, targetRole: true, skills: true, careerGoals: true },
  });
  const profileValues = [user.name, profile?.phone, profile?.careerStage, profile?.experience, profile?.currentRole, profile?.targetRole, profile?.skills, profile?.careerGoals];
  const profileCompletion = Math.round((profileValues.filter((value) => Boolean(value?.trim())).length / profileValues.length) * 100);

  return (
      <div className="container max-w-6xl py-8 sm:py-10">
        <div className="mb-9 border-b border-border pb-7">
          <h1 className="font-serif text-3xl font-medium">Welcome back, {user.name?.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">Candidate account</p>
        </div>

        <section aria-labelledby="overview-heading">
          <p id="overview-heading" className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">Overview</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{profileCompletion}%</div>
              <div className="mt-3 h-1.5 overflow-hidden bg-border" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profileCompletion}><div className="h-full bg-primary" style={{ width: `${profileCompletion}%` }} /></div>
              <p className="mt-3 text-xs text-muted-foreground">{profileCompletion === 100 ? "Your profile is ready for every session." : `Add your ${!profile?.careerGoals ? "career goal" : "remaining details"} to complete it.`}</p>
              <Link href="/profile" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Complete your profile</Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{nextBooking?.service?.title || "No upcoming appointments"}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextBooking ? `${nextBooking.preferredDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · ${nextBooking.preferredSlot} · ${nextBooking.status}` : <Link href="/book" className="text-primary hover:underline">Book a discovery call</Link>}
              </p>
              {nextBooking && <Link href="/dashboard/appointments" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">View appointments <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Selected service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{nextBooking?.service?.title || "—"}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                <Link href="/services" className="text-primary hover:underline">
                  Explore services
                </Link>
              </p>
            </CardContent>
          </Card>
          </div>
        </section>

        <section className="mt-10 border border-border bg-secondary/40 p-6 sm:p-8">
          <h2 className="font-serif text-xl font-medium">Next steps</h2>
          <p className="mt-2 text-sm text-muted-foreground">Prepare a short overview of your current role, target role, and what you want to improve before your discovery conversation.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/appointments"><CalendarDays className="h-4 w-4" /> My bookings</Link>
            </Button>
            <Button asChild>
              <Link href="/book">
                Book a discovery call <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
  );
}
