import { z } from "zod";
import { careerStageEnum } from "./lead";

// This is the browser-to-server booking contract. Identity is deliberately
// absent: the route gets the candidate name, email, and ownership from Auth.js.
// The five UI steps use this one contract for their per-step validation.
export const bookingStepOneSchema = z.object({
  phone: z.string().trim().max(30).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

export const bookingStepTwoSchema = z.object({
  careerStage: careerStageEnum,
  currentRole: z.string().trim().max(150).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  targetRole: z.string().trim().max(150).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  careerGoal: z
    .string()
    .trim()
    .min(10, "Tell us a little more about your goal (10+ characters)")
    .max(1000),
  additionalContext: z.string().trim().max(2000).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

export const bookingStepThreeSchema = z.object({
  serviceId: z.string().trim().min(1, "Select a service"),
});

export const bookingStepFourSchema = z.object({
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date"),
  preferredSlot: z.string().min(1, "Select a time slot"),
});

export const bookingSchema = bookingStepOneSchema
  .merge(bookingStepTwoSchema)
  .merge(bookingStepThreeSchema)
  .merge(bookingStepFourSchema);

export type BookingInput = z.infer<typeof bookingSchema>;

export const bookingStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const updateBookingSchema = z.object({
  status: bookingStatusEnum.optional(),
  notes: z.string().trim().max(4000).optional(),
  consultantId: z.string().trim().optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
