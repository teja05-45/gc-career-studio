import { cva, type VariantProps } from "class-variance-authority";
import { Clock, CheckCircle2, XCircle, CalendarCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        pending: "border-warning/30 bg-warning/10 text-warning",
        confirmed: "border-success/30 bg-success/10 text-success",
        completed: "border-success/40 bg-success/15 text-success",
        cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "pending" },
  }
);

const statusIconMap = {
  pending: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
  confirmed: <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
  cancelled: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
};

export type BookingStatusVariant = VariantProps<typeof statusVariants>["variant"];

interface BookingStatusBadgeProps extends VariantProps<typeof statusVariants> {
  status: string;
  className?: string;
}

/**
 * Semantic booking status badge. Uses an icon + text label so state is never
 * communicated by color alone (the label is the source of truth for screen
 * readers).
 */
export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const variant: NonNullable<BookingStatusVariant> =
    status === "CONFIRMED"
      ? "confirmed"
      : status === "COMPLETED"
        ? "completed"
        : status === "CANCELLED"
          ? "cancelled"
          : "pending";

  const label =
    status === "CONFIRMED"
      ? "Confirmed"
      : status === "COMPLETED"
        ? "Completed"
        : status === "CANCELLED"
          ? "Cancelled"
          : "Pending";

  return (
    <span className={cn(statusVariants({ variant }), className)}>
      {statusIconMap[variant]}
      <span className="sr-only">{status}: </span>
      <span>{label}</span>
    </span>
  );
}