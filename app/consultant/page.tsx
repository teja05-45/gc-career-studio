import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Consultant Dashboard",
};

export default async function ConsultantDashboardPage() {
  const user = await requireRole(["CONSULTANT"]);
  const [assignedCount, upcoming] = await Promise.all([
    prisma.booking.count({ where: { consultantId: user.id, status: { not: "CANCELLED" } } }),
    prisma.booking.findMany({ where: { consultantId: user.id, preferredDate: { gte: new Date() }, status: { not: "CANCELLED" } }, include: { candidate: { select: { name: true } }, service: { select: { title: true } } }, orderBy: { preferredDate: "asc" }, take: 4 }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-medium">Welcome, {user.name?.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">Consultant account</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assigned candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{assignedCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Candidates you&apos;re currently working with</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{upcoming.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Discovery calls and sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 rounded-lg border border-border bg-secondary/40 p-8">
          <h2 className="font-serif text-xl font-medium">Upcoming appointments</h2>
          {upcoming.length ? <ul className="mt-4 divide-y divide-border">{upcoming.map((booking) => <li key={booking.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium">{booking.candidate?.name || "Candidate"} · {booking.service?.title || "Discovery call"}</p><p className="mt-1 text-sm text-muted-foreground">{booking.preferredDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {booking.preferredSlot}</p></div><ArrowRight className="h-4 w-4 text-muted-foreground" /></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No appointments are assigned to you yet. Assignment and workflow tools can grow from this focused MVP.</p>}
        </div>
      </div>
    </div>
  );
}
