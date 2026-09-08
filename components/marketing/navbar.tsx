"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ isAuthed, userName, userRole }: { isAuthed?: boolean; userName?: string | null; userRole?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
          GC Career Studio
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? <div className="flex items-center gap-3"><Link href={userRole === "ADMIN" ? "/admin" : userRole === "CONSULTANT" ? "/consultant" : "/dashboard"} className="text-sm font-medium hover:text-primary">Dashboard</Link><details className="relative"><summary className="cursor-pointer list-none border-l border-border pl-3 text-sm leading-tight"><span className="block font-medium">{userName || "Account"}</span><span className="block text-xs text-muted-foreground">{userRole === "ADMIN" ? "Administrator" : userRole === "CONSULTANT" ? "Consultant" : "Candidate"}</span></summary><div className="absolute right-0 top-11 w-48 border border-border bg-card p-2 shadow-subtle"><Link className="block px-3 py-2 text-sm hover:bg-secondary" href={userRole === "ADMIN" ? "/admin" : userRole === "CONSULTANT" ? "/consultant" : "/dashboard"}>Dashboard</Link>{userRole === "CANDIDATE" && <><Link className="block px-3 py-2 text-sm hover:bg-secondary" href="/profile">Profile</Link><Link className="block px-3 py-2 text-sm hover:bg-secondary" href="/dashboard/appointments">My bookings</Link></>}<button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="block w-full px-3 py-2 text-left text-sm hover:bg-secondary">Log out</button></div></details></div> : <><Button variant="ghost" size="sm" asChild><Link href="/login">Log in</Link></Button><Button size="sm" asChild><Link href="/book">Book a call <ArrowRight className="h-3.5 w-3.5" /></Link></Button></>}
        </div>

        <button
          className="p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm text-foreground">
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href={isAuthed ? userRole === "ADMIN" ? "/admin" : userRole === "CONSULTANT" ? "/consultant" : "/dashboard" : "/login"} onClick={() => setOpen(false)}>
                  {isAuthed ? "Dashboard" : "Log in"}
                </Link>
              </Button>
              {isAuthed && <><Button variant="outline" asChild><Link href={userRole === "CANDIDATE" ? "/profile" : userRole === "ADMIN" ? "/admin" : "/consultant"} onClick={() => setOpen(false)}>{userRole === "CANDIDATE" ? "Profile" : userRole === "ADMIN" ? "Admin Dashboard" : "Consultant Dashboard"}</Link></Button><Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>Log out</Button></>}
              {(!isAuthed || userRole === "CANDIDATE") && <Button asChild>
                <Link href="/book" onClick={() => setOpen(false)}>
                  Book a discovery call
                </Link>
              </Button>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
