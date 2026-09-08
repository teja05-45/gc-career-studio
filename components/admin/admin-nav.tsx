import Link from "next/link";
import { LayoutDashboard, Users, CalendarDays, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, active: true },
  { href: "/admin#leads", label: "Leads", icon: Users },
  { href: "/admin#bookings", label: "Bookings", icon: CalendarDays },
];

/**
 * Admin workspace navigation. Anchor links within the dashboard surface
 * keep the IA discoverable without creating empty pages. "Back to site"
 * exists in the public navbar; the workspace header below handles accent.
 */
export function AdminNav() {
  return (
    <nav aria-label="Admin" className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Compact wordmark used in the admin workspace header. */
export function AdminWordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-serif text-base font-medium text-foreground">
      <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
      GC Career Studio
    </span>
  );
}