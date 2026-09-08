import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About",
  description: "GC Career Studio's mission, approach, and who we help.",
};

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="container-narrow">
        <Badge variant="secondary" className="mb-4">Placeholder content</Badge>
        <SectionHeading
          eyebrow="About"
          title="Career guidance that starts with your actual situation"
          description="GC Career Studio-specific mission and history have not been provided for this assessment — the content below is placeholder copy describing a plausible mission for a company of this kind."
        />

        <div className="mt-12 space-y-10">
          <div>
            <h2 className="font-serif text-xl font-medium">Mission</h2>
            <p className="mt-2 text-muted-foreground">
              To be confirmed by GC Career Studio. Placeholder: to give job seekers a
              structured, honest path from uncertainty to a role that actually fits — rather
              than generic advice or a stack of unanswered applications.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium">Approach</h2>
            <p className="mt-2 text-muted-foreground">
              Every engagement follows the same four-stage process — Discover, Assess,
              Strategize, Execute — so recommendations are grounded in your specific
              background rather than a template.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium">Who we help</h2>
            <p className="mt-2 text-muted-foreground">
              Recent graduates finding direction, working professionals pursuing growth or a
              change, and career switchers moving into a new field entirely.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium">Values</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Direct, specific feedback over generic encouragement</li>
              <li>A plan built on your actual experience, not a template</li>
              <li>Clarity on next steps at the end of every session</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 rounded-lg border border-border bg-secondary/40 p-8 text-center">
          <p className="font-serif text-xl font-medium">Want to see the approach in practice?</p>
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
