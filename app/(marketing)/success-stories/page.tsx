import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Success Stories",
  description: "Sample case studies illustrating the outcomes this process is designed to produce.",
};

export default async function SuccessStoriesPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="section-padding">
      <div className="container">
        <SectionHeading
          eyebrow="Success stories"
          title="Sample outcomes across career stages"
          description="These are illustrative sample case studies, not verified customer accounts — GC Career Studio has not yet provided real testimonials for this MVP."
        />
        {testimonials.length === 0 ? (
          <div className="mt-12">
            <EmptyState title="No stories published yet" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
