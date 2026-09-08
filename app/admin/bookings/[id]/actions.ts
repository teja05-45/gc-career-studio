"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  transitionBookingStatus,
  AlreadyInStatusError,
} from "@/lib/services/booking-status";
import type { BookingStatus } from "@prisma/client";

const updateStatusSchema = z.object({
  bookingId: z.string().cuid("Invalid booking reference."),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

const notesSchema = z.object({
  bookingId: z.string().cuid("Invalid booking reference."),
  notes: z.string().trim().max(4000, "Notes must be under 4000 characters."),
});

/**
 * Success path carries the persisted status. Failure path carries a
 * user-facing error plus the booking's authoritative current status when the
 * transition failed because the booking was already in the target state — the
 * client uses that to re-sync its UI instead of showing a stale status.
 */
export type UpdateStatusResult =
  | { success: true; status: BookingStatus }
  | { success: false; error: string; currentStatus?: BookingStatus };

export type SaveNotesResult = { success: true } | { success: false; error: string };

/**
 * ADMIN-only booking status update.
 *
 * Authorization: verified from the authenticated session on the server.
 * Never trusts role, bookingId, or status supplied by the client without
 * validation. The transition (PENDING→CONFIRMED etc.) is enforced here and
 * again in transitionBookingStatus before persistence.
 */
export async function updateBookingStatus(raw: unknown): Promise<UpdateStatusResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "You don't have permission to update bookings." };
  }

  const parsed = updateStatusSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Invalid booking details." };
  }

  try {
    const updated = await transitionBookingStatus(parsed.data.bookingId, parsed.data.status);
    return { success: true, status: updated.status };
  } catch (error) {
    if (error instanceof AlreadyInStatusError) {
      // The booking is already in the requested state — a duplicate/stale
      // submission. Reveal the real status so the UI can reconcile.
      return {
        success: false,
        error: "This booking has already been updated.",
        currentStatus: error.currentStatus,
      };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Something went wrong." };
  }
}

/** ADMIN-only. Upserts the internal notes field on a booking. */
export async function saveBookingNotes(raw: unknown): Promise<SaveNotesResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "You don't have permission to update bookings." };
  }

  const parsed = notesSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue?.message ?? "Invalid notes." };
  }

  try {
    await prisma.booking.update({
      where: { id: parsed.data.bookingId },
      data: { notes: parsed.data.notes || null },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unable to save notes. Please try again." };
  }
}