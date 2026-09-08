import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-border bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center gap-6 py-20 text-center">
        <h2 className="text-balance font-serif text-3xl font-medium md:text-4xl">
          Ready to get clarity on your next step?
        </h2>
        <p className="max-w-lg text-balance text-primary-foreground/80">
          Book a discovery call and walk through your situation with a consultant — no
          pressure, just a clear read on where you stand.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/book">
            Book a discovery call <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
