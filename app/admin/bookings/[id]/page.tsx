import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { AdminBookingDetail } from "@/components/admin/booking-detail";

export const metadata: Metadata = {
  title: "Booking Details",
};

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole(["ADMIN"]);

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      service: { select: { title: true, slug: true } },
      candidate: { select: { name: true, email: true } },
      consultant: { select: { name: true } },
      review: true,
    },
  });

  if (!booking) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 sm:py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
        </Link>
        <AdminBookingDetail booking={booking} />
      </div>
    </div>
  );
}