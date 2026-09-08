import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Polished metric card for the admin dashboard. Intentional hierarchy:
 * small uppercase label → large value → optional supporting context, with a
 * restrained accent icon. Consistent height across a row of cards.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "muted",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "muted" | "primary" | "success" | "warning";
  className?: string;
}) {
  const accentClasses: Record<string, string> = {
    muted: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div
      className={cn(
        "flex min-h-28 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-subtle",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[.14em] text-muted-foreground">{label}</p>
        {icon && <span className={cn("shrink-0", accentClasses[accent])}>{icon}</span>}
      </div>
      <div>
        <p className="text-3xl font-medium tracking-tight text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}