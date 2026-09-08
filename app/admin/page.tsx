import type { Metadata } from "next";
import { Suspense } from "react";
import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { getAverageSessionRating } from "@/lib/services/booking-status";
import { prisma } from "@/lib/db/prisma";
import { AdminNav, AdminWordmark } from "@/components/admin/admin-nav";
import { AdminBookingsTable } from "@/components/admin/admin-bookings-table";
import { AdminLeadsTable } from "@/components/admin/leads-table";
import { KpiCards, KpiCardsSkeleton } from "@/components/admin/kpi-cards";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const user = await requireRole(["ADMIN"]);
  const rating = await getAverageSessionRating();

  const bookings = await prisma.booking.findMany({
    include: { candidate: { select: { name: true, email: true } }, service: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="container flex items-center justify-between py-4">
          <AdminWordmark />
          <AdminNav />
        </div>
      </div>

      <div className="container py-8 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-serif text-2xl font-medium sm:text-3xl">Operations Dashboard</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Track leads, manage bookings, and see how every session performs — all from one workspace.
          </p>
        </header>

        {/* Overview — KPI grid defers to its own server component. Wrapped in
            Suspense so the shell renders before stats resolve (structural in
            this force-dynamic build, streaming-ready in newer Next versions). */}
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiCards />
        </Suspense>

        {/* Session feedback metric (only when real reviews exist) */}
        {rating.count > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-2.5">
            <Star className="h-4 w-4 fill-success/60 text-success" aria-hidden="true" />
            <p className="text-sm text-foreground">
              <span className="font-medium">{rating.average} / 5</span>
              <span className="text-muted-foreground"> average session rating · {rating.count} review{rating.count === 1 ? "" : "s"}</span>
            </p>
          </div>
        )}

        {/* Upcoming sessions */}
        <section id="bookings" aria-labelledby="bookings-heading" className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 id="bookings-heading" className="font-serif text-lg font-medium">Bookings</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">All session requests, newest first.</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <AdminBookingsTable bookings={bookings} />
          </div>
        </section>

        {/* Recent leads */}
        <section id="leads" aria-labelledby="leads-heading" className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 id="leads-heading" className="font-serif text-lg font-medium">Leads</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Search, filter, and qualify incoming interest.</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <AdminLeadsTable />
          </div>
        </section>
      </div>
    </div>
  );
}