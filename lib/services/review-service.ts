import { prisma } from "@/lib/db/prisma";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}

/**
 * Submit a review for a COMPLETED booking that belongs to the authenticated
 * candidate. All domain rules are enforced here, server-side:
 *
 *   1. Booking must exist and belong to candidateId.
 *   2. Booking status must be COMPLETED.
 *   3. Only one review per booking (unique on bookingId).
 *   4. Rating 1–5, comment optional ≤2000 chars (Zod).
 *
 * The candidateId is passed by the server action from the session — it is
 * never taken from the request body.
 */
export async function submitReviewForBooking(candidateId: string, raw: unknown) {
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ReviewError(firstIssue?.message ?? "Unable to submit your review.");
  }
  const data: ReviewInput = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    select: { id: true, candidateId: true, status: true },
  });

  if (!booking) {
    throw new ReviewError("That booking could not be found.");
  }
  if (booking.candidateId !== candidateId) {
    throw new ReviewError("You can only review your own sessions.");
  }
  if (booking.status !== "COMPLETED") {
    throw new ReviewError("Reviews are only available after your session is completed.");
  }

  // Unique constraint on bookingId gives a second, DB-level guarantee.
  const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
  if (existing) {
    throw new ReviewError("You've already shared your feedback for this session.");
  }

  try {
    return await prisma.review.create({
      data: {
        bookingId: booking.id,
        candidateId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new ReviewError("You've already shared your feedback for this session.");
    }
    throw error;
  }
}

/** Fetch the review attached to a booking, if any. */
export async function getReviewForBooking(bookingId: string) {
  return prisma.review.findUnique({
    where: { bookingId },
    include: { candidate: { select: { name: true } } },
  });
}