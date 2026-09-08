import { Users, Inbox, BadgeCheck, CalendarDays, TrendingUp } from "lucide-react";
import { getLeadStats } from "@/lib/services/lead-service";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin KPI grid backed by real database queries. Kept as its own async
 * server component so the admin page can wrap it in a Suspense boundary —
 * structural for now, since the app is force-dynamic and Next 14 has no PPR,
 * but it keeps the boundary in place for when streaming is available.
 */
export async function KpiCards() {
  const stats = await getLeadStats();
  const bookingCount = await prisma.booking.count();

  return (
    <section aria-labelledby="overview-heading" className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
      <h2 id="overview-heading" className="sr-only">Overview</h2>
      <StatCard label="Total leads" value={stats.total} icon={<Users className="h-5 w-5" aria-hidden="true" />} hint="All captured interest" />
      <StatCard label="New leads" value={stats.newCount} icon={<Inbox className="h-5 w-5" aria-hidden="true" />} accent="primary" hint="Awaiting first contact" />
      <StatCard label="Qualified" value={stats.qualified} icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />} accent="success" hint="In active pipeline" />
      <StatCard label="Bookings" value={bookingCount} icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />} hint="Across all services" />
      <StatCard
        label="Conversion"
        value={`${stats.conversionRate}%`}
        icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
        accent="warning"
        hint="Leads → converted"
      />
    </section>
  );
}

/** Matching grid of skeleton tiles for use as the Suspense fallback. */
export function KpiCardsSkeleton() {
  return (
    <section aria-label="Loading overview metrics" className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex min-h-28 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-subtle">
          <Skeleton className="h-3 w-16" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </section>
  );
}