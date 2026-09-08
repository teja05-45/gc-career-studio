import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { getServiceBySlug } from "@/lib/services/service-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  if (!service) return {};
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug);
  if (!service) notFound();

  const process = service.process as { step: string; description: string }[];
  const faq = service.faq as { question: string; answer: string }[];

  return (
    <div className="section-padding">
      <div className="container-narrow">
        <Badge variant="secondary" className="mb-4">Service</Badge>
        <h1 className="text-balance font-serif text-4xl font-medium">{service.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{service.description}</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">The problem</h2>
            <p className="mt-2 text-sm">{service.problem}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Who it&apos;s for</h2>
            <p className="mt-2 text-sm">{service.whoFor}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">What&apos;s included</h2>
          <ul className="mt-3 space-y-2">
            {service.included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Process</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {process.map((p, i) => (
              <div key={p.step} className="rounded-lg border border-border p-5">
                <span className="font-serif text-lg text-primary/50">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-1 font-medium">{p.step}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Expected outcomes</h2>
          <ul className="mt-3 space-y-2">
            {service.outcomes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {faq?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">FAQ</h2>
            <div className="mt-4">
              <FaqAccordion items={faq} />
            </div>
          </div>
        )}

        <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-7 text-center">
          <p className="font-serif text-xl font-medium">Ready to talk through your situation?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Book a discovery call to see if {service.title.toLowerCase()} is the right fit.
          </p>
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
