"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CalendarDays, LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function CandidateDashboardNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border bg-card lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-6 py-4 lg:hidden">
        <Link href="/dashboard" className="shrink-0 font-serif text-lg font-semibold tracking-tight">
          GC Career Studio
        </Link>
        <Dialog><DialogTrigger asChild><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open navigation menu"><Menu className="h-5 w-5" aria-hidden="true" /></button></DialogTrigger><DialogContent className="left-0 top-0 h-full max-w-[17.5rem] !translate-x-0 !translate-y-0 rounded-none border-y-0 border-l-0 p-6"><DialogHeader><DialogTitle>GC Career Studio</DialogTitle></DialogHeader><nav aria-label="Candidate dashboard" className="mt-6"><ul className="space-y-1">
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return <li key={item.href}><DialogClose asChild><Link href={item.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors", active ? "bg-accent font-medium text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}><Icon className="h-4 w-4" aria-hidden="true" />{item.label}</Link></DialogClose></li>;
          })}
        </ul></nav><div className="mt-8 border-t border-border pt-5"><p className="text-sm font-medium">{userName || "Candidate"}</p><p className="mt-0.5 text-xs text-muted-foreground">Candidate</p><button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="mt-5 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button></div></DialogContent></Dialog>
      </div>
      <div className="hidden lg:block lg:px-7 lg:py-8">
        <Link href="/dashboard" className="font-serif text-lg font-semibold tracking-tight">
          GC Career Studio
        </Link>
        <nav aria-label="Candidate dashboard" className="mt-10">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active ? "bg-accent font-medium text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-sm font-medium">{userName || "Candidate"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Candidate</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-5 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
