import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function ProfilePage() {
  const sessionUser = await requireRole(["CANDIDATE"]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  return <main className="container max-w-4xl py-8 sm:py-10"><nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"><Link href="/dashboard" className="inline-flex items-center gap-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Dashboard</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Profile</span></nav><header className="border-b border-border pb-7"><p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">Your account</p><h1 className="mt-3 font-serif text-3xl font-medium">Profile</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Keep your career information up to date so your sessions can be more useful.</p></header><ProfileForm user={user} /></main>;
}
