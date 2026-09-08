import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";

type BookingRow = {
  id: string;
  name: string;
  email: string;
  preferredDate: Date;
  preferredSlot: string;
  status: string;
  createdAt: Date;
  candidate: { name: string; email: string } | null;
  service: { title: string } | null;
};

function displayTime(value: string) {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")}${hour >= 12 ? "PM" : "AM"}`;
}

/**
 * Admin booking rows. Desktop shows a compact table; on small screens the
 * same data becomes stacked cards so nothing forces horizontal scroll.
 */
export function AdminBookingsTable({ bookings }: { bookings: BookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No bookings yet. Candidate discovery-call requests will appear here.
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Candidate</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date & time</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr key={booking.id} className="transition-colors duration-150 hover:bg-muted/30">
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{booking.candidate?.name || booking.name}</p>
                  <p className="text-xs text-muted-foreground">{booking.candidate?.email || booking.email}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{booking.service?.title || "—"}</td>
                <td className="px-6 py-4">
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {booking.preferredDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:ml-4 sm:mt-0">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {displayTime(booking.preferredSlot)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(booking.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/bookings/${booking.id}`}>
                      View <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {bookings.map((booking) => (
          <li key={booking.id} className="flex items-start justify-between gap-3 px-6 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{booking.candidate?.name || booking.name}</p>
              <p className="truncate text-xs text-muted-foreground">{booking.service?.title || "—"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {booking.preferredDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" · "}
                {displayTime(booking.preferredSlot)}
              </p>
              <BookingStatusBadge status={booking.status} className="mt-2" />
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href={`/admin/bookings/${booking.id}`} aria-label={`View booking for ${booking.candidate?.name || booking.name}`}>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}