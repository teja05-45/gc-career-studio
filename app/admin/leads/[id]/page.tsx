import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { getLeadById } from "@/lib/services/lead-service";
import { Button } from "@/components/ui/button";
import { AdminLeadDetail } from "@/components/admin/lead-detail";

export const metadata: Metadata = {
  title: "Lead Details",
};

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  await requireRole(["ADMIN"]);
  const lead = await getLeadById(params.id);
  if (!lead) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Button>
        </Link>
        <AdminLeadDetail lead={lead} />
      </div>
    </div>
  );
}
