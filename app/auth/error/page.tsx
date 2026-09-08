import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-6">
      <section className="w-full max-w-lg border border-border bg-background p-8 shadow-subtle sm:p-10">
        <AlertCircle className="h-7 w-7 text-warning" aria-hidden="true" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">GC Career Studio</p>
        <h1 className="mt-3 font-serif text-3xl">Something went wrong</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We couldn&apos;t complete your sign-in. Please check your credentials and try again.
        </p>
        <Button className="mt-7" asChild><Link href="/login">Try again</Link></Button>
      </section>
    </main>
  );
}
