"use server";

import { auth } from "@/auth";
import { submitReviewForBooking } from "@/lib/services/review-service";

export type SubmitReviewResult = { success: true; rating: number } | { success: false; error: string };

/**
 * CANDIDATE-only review submission.
 *
 * Authorization: the authenticated candidate's id is taken from the server
 * session and used as ownership — a client-supplied candidateId or role is
 * never trusted. Booking ownership, COMPLETED status, and the one-review-per-
 * booking rule are all enforced server-side in review-service.
 */
export async function submitReview(raw: unknown): Promise<SubmitReviewResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to leave a review." };
  }
  if (session.user.role !== "CANDIDATE") {
    return { success: false, error: "Only candidates can leave session reviews." };
  }

  try {
    const review = await submitReviewForBooking(session.user.id, raw);
    return { success: true, rating: review.rating };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unable to submit your review. Please try again." };
  }
}