import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-lg font-semibold">GC Career Studio</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Structured career guidance for graduates, working professionals, and career
            switchers — from direction to interview to offer.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link href="/services" className="text-muted-foreground hover:text-foreground">Services</Link></li>
            <li><Link href="/success-stories" className="text-muted-foreground hover:text-foreground">Success Stories</Link></li>
            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Get started</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/book" className="text-muted-foreground hover:text-foreground">Book a discovery call</Link></li>
            <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Log in</Link></li>
            <li><Link href="/register" className="text-muted-foreground hover:text-foreground">Create an account</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} GC Career Studio. Demo project for internship assessment.</p>
          <p>All testimonials and case studies are sample content.</p>
        </div>
      </div>
    </footer>
  );
}
