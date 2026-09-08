import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Discover, Assess, Strategize, Execute — the structured process behind every engagement.",
};

export default function HowItWorksPage() {
  return (
    <div className="section-padding">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="One process, applied to your specific situation"
          description="Every service — resume work, interview prep, strategy, or a full transition — runs through the same four stages."
        />
        <div className="mt-12">
          <HowItWorksSteps />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-medium">Why this structure?</h2>
            <p className="mt-3 text-muted-foreground">
              Career advice fails most often when it skips straight to tactics — a resume
              template, a list of interview questions — without first understanding what&apos;s
              actually true about your situation. Discover and Assess exist so the strategy
              that follows is built on your real experience and goals, not a generic template.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium">What you leave with</h2>
            <p className="mt-3 text-muted-foreground">
              Every engagement ends with something concrete: a rewritten resume, a rehearsed
              interview structure, a written strategy, or a transition plan — plus a clear
              sense of what to do next on your own.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-lg border border-border bg-secondary/40 p-8 text-center">
          <p className="font-serif text-xl font-medium">See it applied to your situation</p>
          <Button className="mt-5" asChild>
            <Link href="/book">
              Book a discovery call <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
