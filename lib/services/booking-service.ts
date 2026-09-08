import { prisma } from "@/lib/db/prisma";
import { bookingSchema, updateBookingSchema, type BookingInput, type UpdateBookingInput } from "@/lib/validations/booking";

export class ValidationError extends Error {
  issues: Record<string, string>;
  constructor(issues: Record<string, string>) {
    super("Validation failed");
    this.issues = issues;
  }
}

function bookingDateFromISO(value: string) {
  // Persist the selected calendar day at noon UTC. This avoids the common
  // UTC-midnight rollover when a browser and server are in different zones.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
    ? date
    : null;
}

function zodIssuesToRecord(issues: { path: (string | number)[]; message: string }[]) {
  const record: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!record[key]) record[key] = issue.message;
  }
  return record;
}

/**
 * MVP-internal availability. Deliberately simple and clearly fake-free:
 * we only ever offer future weekday slots, generated in code — never
 * claimed to reflect a real consultant's calendar. Swapping this for a
 * real Calendly/Google Calendar provider later means replacing this one
 * function; nothing else in the booking flow needs to change.
 */
export function getAvailableSlots(daysAhead = 14) {
  const slots: { date: string; label: string; times: string[] }[] = [];
  const timeOptions = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const now = new Date();
  let added = 0;
  let offset = 1;

  while (added < daysAhead) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    offset += 1;

    const day = date.getDay();
    if (day === 0 || day === 6) continue; // weekdays only for the MVP

    slots.push({
      date: date.toISOString().split("T")[0]!,
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      times: timeOptions,
    });
    added += 1;
  }

  return slots;
}

export async function createBooking(raw: unknown, candidateId: string) {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(zodIssuesToRecord(parsed.error.issues));
  }
  const data: BookingInput = parsed.data;

  const preferredDate = bookingDateFromISO(data.preferredDate);
  if (!preferredDate) {
    throw new ValidationError({ preferredDate: "Please select a valid date." });
  }
  const availableDay = getAvailableSlots().find((day) => day.date === data.preferredDate);
  if (!availableDay) {
    throw new ValidationError({ preferredDate: "Please select an available date." });
  }
  if (!availableDay.times.includes(data.preferredSlot)) {
    throw new ValidationError({ preferredSlot: "That time is no longer available. Please choose another time." });
  }

  const service = await prisma.service.findFirst({
    where: { id: data.serviceId, isActive: true },
    select: { id: true },
  });
  if (!service) {
    throw new ValidationError({ serviceId: "Please select a valid service." });
  }
  const conflict = await prisma.booking.findFirst({
    where: { preferredDate, preferredSlot: data.preferredSlot, status: { not: "CANCELLED" } },
  });
  if (conflict) throw new ValidationError({ preferredSlot: "That time is no longer available. Please choose another time." });

  const candidate = await prisma.user.findUniqueOrThrow({
    where: { id: candidateId },
    select: { email: true, name: true },
  });

  try {
    return await prisma.booking.create({
      data: {
        name: candidate.name,
        email: candidate.email,
        phone: data.phone,
        careerStage: data.careerStage,
        currentRole: data.currentRole,
        targetRole: data.targetRole,
        careerGoal: data.careerGoal,
        additionalContext: data.additionalContext,
        serviceId: service.id,
        preferredDate,
        preferredSlot: data.preferredSlot,
        candidateId,
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new ValidationError({ preferredSlot: "That time is no longer available. Please choose another time." });
    }
    throw error;
  }
}

export async function listBookings(filters: { status?: string } = {}) {
  return prisma.booking.findMany({
    where: filters.status ? { status: filters.status as never } : {},
    include: { service: { select: { title: true } } },
    orderBy: { preferredDate: "asc" },
  });
}

export async function updateBooking(id: string, raw: unknown) {
  const parsed = updateBookingSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(zodIssuesToRecord(parsed.error.issues));
  }
  const data: UpdateBookingInput = parsed.data;

  return prisma.booking.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.consultantId !== undefined ? { consultantId: data.consultantId } : {}),
    },
  });
}
