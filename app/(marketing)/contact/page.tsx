import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { LeadForm } from "@/components/forms/lead-form";
import { getServiceOptions } from "@/lib/services/service-catalog";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us about your situation. We'll respond shortly.",
};

export default async function ContactPage() {
  const services = await getServiceOptions();

  return (
    <div className="section-padding">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Get in touch"
          title="Tell us about your situation"
          description="Not ready to book a call yet? Send us a message and we'll follow up with next steps."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12">
          <LeadForm services={services} />
        </div>
      </div>
    </div>
  );
}
