"use client";

import * as React from "react";
import {
  CalendarDays,
  ArrowRight,
  Check,
  AlertTriangle,
  X,
  Loader2,
  User,
  Briefcase,
  StickyNote,
  MessageSquare,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingStatusBadge } from "@/components/ui/status-badge";
import { StarRating } from "@/components/ui/star-rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { updateBookingStatus, saveBookingNotes } from "@/app/admin/bookings/[id]/actions";
import { formatDate, CAREER_STAGE_LABELS } from "@/lib/utils";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type BookingDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  careerStage: string;
  currentRole: string | null;
  targetRole: string | null;
  careerGoal: string | null;
  additionalContext: string | null;
  service: { title: string; slug: string } | null;
  preferredDate: Date;
  preferredSlot: string;
  status: BookingStatus;
  notes: string | null;
  candidate: { name: string; email: string } | null;
  consultant: { name: string } | null;
  createdAt: Date;
  updatedAt: Date;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  } | null;
};

function displayTime(value: string) {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

// Which actions make sense for each status.
const STATUS_ACTIONS: Record<BookingStatus, { to: BookingStatus; label: string; variant: "default" | "outline" | "destructive" | "success"; description: string; confirm?: boolean }[]> = {
  PENDING: [
    { to: "CONFIRMED", label: "Confirm booking", variant: "default", description: "Reserve the slot for this candidate and notify them of confirmation." },
  ],
  CONFIRMED: [
    { to: "COMPLETED", label: "Mark completed", variant: "default", description: "The session has taken place and can now receive candidate feedback." },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

const CANCELLABLE: Partial<Record<BookingStatus, boolean>> = {
  PENDING: true,
  CONFIRMED: true,
};

function Section({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export function AdminBookingDetail({ booking }: { booking: BookingDetail }) {
  const [status, setStatus] = React.useState<BookingStatus>(booking.status);
  const [notes, setNotes] = React.useState(booking.notes ?? "");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [statusBusy, setStatusBusy] = React.useState<BookingStatus | null>(null);

  const actions = STATUS_ACTIONS[status];

  // Synchronous in-flight lock. `disabled={Boolean(statusBusy)}` only takes
  // effect after React re-renders, so a fast double-click can fire a second
  // request against a booking the first request has already advanced. This ref
  // is checked before the first await, closing that window and preventing the
  // "duplicate transition" failure (e.g. a second CONFIRMED against a booking
  // that is already CONFIRMED).
  const statusRequest = React.useRef<Promise<unknown> | null>(null);

  const applyAuthoritativeStatus = React.useCallback((next: BookingStatus) => {
    setStatus(next);
  }, []);

  async function handleStatusChange(to: BookingStatus) {
    if (statusRequest.current) return; // a transition is already in flight
    setStatusBusy(to);
    const request = updateBookingStatus({ bookingId: booking.id, status: to })
      .then((result) => {
        if (result.success) {
          applyAuthoritativeStatus(result.status);
          toast({
            title:
              result.status === "CONFIRMED"
                ? "Booking confirmed"
                : result.status === "COMPLETED"
                  ? "Session marked as completed"
                  : "Booking updated",
            description: `${booking.name}'s booking is now marked as ${result.status.toLowerCase().replace("_", " ")}.`,
            variant: "success",
          });
        } else if (result.currentStatus) {
          // The booking is already in the target state (a duplicate/stale
          // submission, possibly from another tab or session). Re-sync the UI
          // to the authoritative database status instead of leaving it stale.
          applyAuthoritativeStatus(result.currentStatus);
          toast({
            title: "Booking already updated",
            description: `This booking is now ${result.currentStatus.toLowerCase().replace("_", " ")}. No refresh needed.`,
            variant: "info",
          });
        } else {
          toast({ title: "Unable to update booking", description: result.error, variant: "error" });
        }
      })
      .then(
        undefined,
        () => toast({ title: "Unable to update booking", description: "Please try again.", variant: "error" })
      )
      .finally(() => {
        statusRequest.current = null;
        setStatusBusy(null);
      });
    // Synchronously latch the lock BEFORE the first await completes, so a
    // second click in the same tick (or on a slow network) is ignored.
    statusRequest.current = request;
    await statusRequest.current;
  }

  function openAction(to: BookingStatus) {
    if (statusRequest.current) return;
    if (to === "CANCELLED") {
      setConfirmOpen(true);
      return;
    }
    void handleStatusChange(to);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const result = await saveBookingNotes({ bookingId: booking.id, notes });
    setSavingNotes(false);
    if (result.success) {
      toast({ title: "Notes saved", variant: "success" });
    } else {
      toast({ title: "Unable to save notes", description: result.error, variant: "error" });
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[.16em] text-muted-foreground">
            Booking
          </p>
          <h1 className="mt-1.5 font-serif text-2xl sm:text-3xl font-medium">
            {booking.candidate?.name || booking.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.service?.title || "Discovery call"}
            <span className="mx-1.5 text-border">·</span>
            {booking.preferredDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={status} />
        </div>
      </header>

      {/* Status management */}
      {actions.length > 0 || CANCELLABLE[status] ? (
        <Section
          title="Manage booking"
          icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
        >
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.to}
                variant={action.variant === "success" ? "default" : action.variant}
                size="sm"
                onClick={() => openAction(action.to)}
                disabled={Boolean(statusBusy)}
                className="min-w-36"
              >
                {statusBusy === action.to ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Updating…
                  </>
                ) : (
                  <>
                    {action.to === "CONFIRMED" && <Check className="h-4 w-4" aria-hidden="true" />}
                    {action.to === "COMPLETED" && <BadgeCheck className="h-4 w-4" aria-hidden="true" />}
                    {action.label}
                  </>
                )}
              </Button>
            ))}
            {CANCELLABLE[status] && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("CANCELLED")}
                disabled={Boolean(statusBusy)}
                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                {statusBusy === "CANCELLED" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Updating…</>
                ) : (
                  <><X className="h-4 w-4" aria-hidden="true" /> Cancel booking</>
                )}
              </Button>
            )}
            {actions.length === 0 && status === "COMPLETED" && (
              <p className="text-sm text-muted-foreground">
                This session is complete. No further changes can be made.
              </p>
            )}
            {status === "CANCELLED" && (
              <p className="text-sm text-muted-foreground">
                This booking was cancelled and is now closed.
              </p>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">
            {actions[0]?.description || ""}
          </p>
        </Section>
      ) : null}

      {/* Confirm cancellation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This will cancel the session for {booking.candidate?.name || booking.name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              The candidate will no longer have a confirmed session for this booking.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={Boolean(statusBusy)}>
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                void handleStatusChange("CANCELLED");
              }}
              disabled={Boolean(statusBusy)}
            >
              {statusBusy === "CANCELLED" ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cancelling…</>
              ) : (
                <>Cancel booking</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Candidate */}
        <Section title="Candidate" icon={<User className="h-4 w-4" aria-hidden="true" />}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Name" value={booking.candidate?.name || booking.name} />
            <DetailItem label="Email" value={booking.candidate?.email || booking.email} />
            <DetailItem label="Phone" value={booking.phone} />
          </dl>
        </Section>

        {/* Career */}
        <Section title="Career context" icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Career stage" value={CAREER_STAGE_LABELS[booking.careerStage] || booking.careerStage} />
            <DetailItem label="Current role" value={booking.currentRole} />
            <DetailItem label="Target role" value={booking.targetRole} />
            {booking.careerGoal && <DetailItem label="Career goal" value={booking.careerGoal} />}
            {booking.additionalContext && (
              <div className="sm:col-span-2">
                <DetailItem label="Additional context" value={booking.additionalContext} />
              </div>
            )}
          </dl>
        </Section>

        {/* Session */}
        <Section title="Session" icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Service" value={booking.service?.title || "Discovery call"} />
            <DetailItem label="Preferred date" value={booking.preferredDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })} />
            <DetailItem label="Preferred time" value={`${displayTime(booking.preferredSlot)} IST`} />
            <DetailItem label="Consultant" value={booking.consultant?.name || "Assignment pending"} />
            <DetailItem label="Created" value={formatDate(booking.createdAt)} />
            <DetailItem label="Last updated" value={formatDate(booking.updatedAt)} />
          </dl>
        </Section>

        {/* Internal notes */}
        <Section title="Internal notes" icon={<StickyNote className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-3">
            <Label htmlFor="booking-notes" className="text-xs text-muted-foreground">
              Private — only visible to staff.
            </Label>
            <Textarea
              id="booking-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context for the consultant or notes from your call…"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onClick={handleSaveNotes} disabled={savingNotes || notes === (booking.notes ?? "")}>
                {savingNotes ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</> : "Save notes"}
              </Button>
            </div>
          </div>
        </Section>
      </div>

      {/* Session feedback */}
      <Section title="Session feedback" icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}>
        {booking.review ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <StarRating value={booking.review.rating} size="sm" />
              <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground">
                &ldquo;{booking.review.comment || "No written feedback was provided."}&rdquo;
              </p>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              Submitted {formatDate(booking.review.createdAt)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {status === "COMPLETED"
              ? "Feedback not submitted yet."
              : "Feedback will appear here once the session is completed and the candidate shares a review."}
          </p>
        )}
      </Section>
    </div>
  );
}