import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getActiveServices } from "@/lib/services/service-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Career strategy, resume, interview preparation, and transition services.",
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="section-padding">
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title="Every service starts with your actual situation"
          description="Choose the entry point that matches where you are today — each one includes a discovery call to make sure it's the right fit before you commit."
        />

        {services.length === 0 ? (
          <div className="mt-12">
            <EmptyState title="No services available right now" description="Please check back soon, or reach out via the contact page." />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <ServiceCard key={service.id} slug={service.slug} title={service.title} summary={service.summary} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
