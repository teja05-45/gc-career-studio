import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { BookingFlow } from "@/components/forms/booking-flow";
import { getServiceOptions } from "@/lib/services/service-catalog";
import { getAvailableSlots } from "@/lib/services/booking-service";
import { requireUser } from "@/lib/auth/rbac";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Book a Discovery Call",
  description: "Schedule a call with a consultant to discuss your career situation.",
};

export default async function BookPage() {
  const user = await requireUser("/book");
  if (user.role !== "CANDIDATE") {
    const isAdmin = user.role === "ADMIN";
    const destination = isAdmin ? "/admin" : "/consultant";
    const label = isAdmin ? "Go to Admin Dashboard" : "Go to Consultant Dashboard";
    const roleLabel = isAdmin ? "administrator" : "consultant";
    return (
      <div className="section-padding bg-secondary/25">
        <section className="container mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">GC Career Studio</p>
          <h1 className="mt-4 font-serif text-4xl">Booking is available for candidates</h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            You&apos;re signed in as a {roleLabel}. Use your dashboard to manage candidate bookings.
          </p>
          <Button className="mt-8" asChild><Link href={destination}>{label}</Link></Button>
        </section>
      </div>
    );
  }
  const [services, slots] = await Promise.all([getServiceOptions(), Promise.resolve(getAvailableSlots())]);

  return (
    <div className="section-padding bg-secondary/25">
      <div className="container mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Discovery call"
          title="Book a discovery call"
          description="Tell us where you are today and choose a time to take the next step."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12">
          <BookingFlow services={services} slots={slots} user={{ name: user.name || "", email: user.email || "" }} />
        </div>
      </div>
    </div>
  );
}
