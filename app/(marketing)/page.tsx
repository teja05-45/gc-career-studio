import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { TrustBar } from "@/components/marketing/trust-bar";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaSection } from "@/components/marketing/cta-section";
import { Button } from "@/components/ui/button";
import { getActiveServices } from "@/lib/services/service-catalog";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "GC Career Studio — Career Strategy & Job Search Guidance",
};

const faqs = [
  {
    question: "Who is GC Career Studio for?",
    answer:
      "Graduates figuring out direction, working professionals looking to grow or move, and career switchers changing fields entirely.",
  },
  {
    question: "What happens after I book a discovery call?",
    answer:
      "A consultant reviews what you shared, calls you at the scheduled time, and helps you figure out the right next step — with or without continuing to work together.",
  },
  {
    question: "Is this a one-time session or ongoing support?",
    answer:
      "It depends on the service. Some engagements are focused sessions; others involve ongoing check-ins. Your consultant will recommend what fits.",
  },
];

export default async function HomePage() {
  const [services, testimonials] = await Promise.all([
    getActiveServices(),
    prisma.testimonial.findMany({ orderBy: { order: "asc" }, take: 3 }),
  ]);

  return (
    <>
      <Hero />
      <TrustBar />

      <section className="section-padding">
        <div className="container">
          <SectionHeading
            eyebrow="Services"
            title="Structured support for wherever you're starting from"
            description="Every service starts with the same question: where are you now, and what does 'better' actually look like?"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, i) => (
              <ServiceCard key={service.id} slug={service.slug} title={service.title} summary={service.summary} index={i} />
            ))}
          </div>
          <div className="mt-10">
            <Button variant="outline" asChild>
              <Link href="/services">
                View all services <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border bg-secondary/30">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="The same structured process, every time"
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <HowItWorksSteps />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <SectionHeading
            eyebrow="Success stories"
            title="What working together actually looks like"
            description="Sample case studies illustrating the kind of outcomes this process is designed to produce."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard
                key={t.id}
                name={t.name}
                role={t.role}
                challenge={t.challenge}
                approach={t.approach}
                outcome={t.outcome}
                isDemo={t.isDemo}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-border bg-secondary/30">
        <div className="container grid gap-12 md:grid-cols-2">
          <SectionHeading
            eyebrow="Why GC Career Studio"
            title="Structured, honest, and focused on your actual next step"
          />
          <div className="space-y-6">
            {[
              ["Structured, not generic", "Every engagement follows Discover → Assess → Strategize → Execute — not a template."],
              ["Direct feedback", "You'll hear what's actually working and what isn't, not just encouragement."],
              ["Built around your goals", "The plan is built around your background and target, not a one-size approach."],
            ].map(([title, body]) => (
              <div key={title} className="border-l-2 border-primary/30 pl-5">
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <SectionHeading eyebrow="FAQ" title="Common questions" align="center" className="mx-auto" />
          <div className="mt-10">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
