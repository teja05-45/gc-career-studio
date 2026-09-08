import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { SessionFeedback } from "@/components/candidate/session-feedback";

export const metadata: Metadata = { title: "Appointments" };

function displayTime(value: string) {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export default async function AppointmentsPage() {
  const user = await requireRole(["CANDIDATE"]);
  const bookings = await prisma.booking.findMany({
    where: { candidateId: user.id },
    include: {
      service: { select: { title: true } },
      consultant: { select: { name: true } },
      review: { select: { rating: true, comment: true } },
    },
    orderBy: { preferredDate: "asc" },
  });

  const now = new Date();
  const upcoming = bookings.filter(
    (booking) => booking.preferredDate >= now && booking.status !== "CANCELLED"
  );
  const previous = bookings.filter((booking) => !upcoming.includes(booking));

  return (
    <main className="container max-w-6xl py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-foreground">Appointments</span>
      </nav>

      <header className="border-b border-border pb-7">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">Your schedule</p>
        <h1 className="mt-3 font-serif text-3xl font-medium">Appointments</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Keep track of your upcoming career conversations and share feedback after each session.
        </p>
      </header>

      {/* Upcoming */}
      <section className="mt-9" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="font-serif text-xl font-medium">Upcoming</h2>
        {upcoming.length ? (
          <ul className="mt-4 grid gap-4">
            {upcoming.map((booking) => (
              <li
                key={booking.id}
                className="border border-border bg-card p-5 shadow-subtle transition-shadow duration-150 hover:shadow-card sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Upcoming appointment</p>
                    <h3 className="mt-2 font-serif text-xl font-medium">{booking.service?.title || "Discovery call"}</h3>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                        {booking.preferredDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                        {displayTime(booking.preferredSlot)} IST
                      </span>
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="mt-1 font-medium">{booking.service?.title || "Discovery call"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Consultant</dt>
                    <dd className="mt-1 font-medium">{booking.consultant?.name || "Assignment pending"}</dd>
                  </div>
                </dl>
                <div className="mt-5 border-l-2 border-primary bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">What to expect</p>
                  <p className="mt-1">Use this session to share your current role, target direction, and the support you need.</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 border border-border bg-secondary/40 p-6 sm:p-8">
            <p className="font-medium">No appointments yet.</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Once you book a discovery call, your upcoming appointment will appear here.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/book">Book a discovery call <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        )}
      </section>

      {/* Past */}
      {previous.length > 0 && (
        <section className="mt-12" aria-labelledby="previous-heading">
          <h2 id="previous-heading" className="font-serif text-xl font-medium">Past appointments</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {previous.map((booking) => (
              <li key={booking.id} className="py-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium">{booking.service?.title || "Discovery call"}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {booking.preferredDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {displayTime(booking.preferredSlot)} IST
                      </p>
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
                {booking.status === "COMPLETED" && (
                  <div className="mt-4 rounded-lg border border-border bg-card p-4">
                    <SessionFeedback bookingId={booking.id} review={booking.review} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}