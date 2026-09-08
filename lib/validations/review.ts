import { z } from "zod";

// Candidate post-session review. Server-side contract: identity comes from
// the authenticated session, never from the request body.
export const reviewSchema = z.object({
  bookingId: z.string().cuid("Invalid booking reference."),
  rating: z.number().int("Rating must be a whole number.").min(1, "Rating must be at least 1.").max(5, "Rating cannot exceed 5."),
  comment: z
    .string()
    .trim()
    .max(2000, "Feedback must be under 2000 characters.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

export type ReviewInput = z.infer<typeof reviewSchema>;