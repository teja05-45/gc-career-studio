import { prisma } from "@/lib/db/prisma";
import type { BookingStatus } from "@prisma/client";

// Booking lifecycle.
//   PENDING → CONFIRMED → COMPLETED
//   PENDING → CANCELLED
//   CONFIRMED → CANCELLED
//   COMPLETED / CANCELLED are terminal.
export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export class BookingTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingTransitionError";
  }
}

/**
 * Thrown when an action targets a status the booking already has (e.g. a
 * confirm request against a booking that is already CONFIRMED). This is the
 * signal callers use to re-sync their UI to the authoritative database state
 * instead of surfacing a confusing "duplicate transition" error.
 */
export class AlreadyInStatusError extends BookingTransitionError {
  currentStatus: BookingStatus;
  constructor(currentStatus: BookingStatus) {
    super(`Booking is already ${currentStatus}.`);
    this.name = "AlreadyInStatusError";
    this.currentStatus = currentStatus;
  }
}

/**
 * Apply a status change with lifecycle validation. Persists to PostgreSQL and
 * returns the updated booking. Throws BookingTransitionError on invalid moves.
 * Authorization is NOT handled here — callers (server actions / routes) must
 * verify the actor's role first.
 */
export async function transitionBookingStatus(bookingId: string, to: BookingStatus) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new BookingTransitionError("Booking not found.");
  }

  if (booking.status === to) {
    // Same-status requests are almost always a duplicate/stale submission.
    // Callers receive the real current status so their UI can reconcile
    // rather than keep retrying an invalid transition.
    throw new AlreadyInStatusError(booking.status);
  }

  if (!isValidTransition(booking.status, to)) {
    throw new BookingTransitionError(
      `Cannot change status from ${booking.status} to ${to}.`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: to },
  });
}

/**
 * Lightweight stat used on the admin dashboard. Returns the average rating
 * across submitted reviews, or null when none exist yet. Never fabricated.
 */
export async function getAverageSessionRating() {
  const result = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
  });
  const avg = result._avg.rating;
  const count = result._count.rating;
  return {
    average: avg === null ? null : Number(avg.toFixed(1)),
    count,
  };
}