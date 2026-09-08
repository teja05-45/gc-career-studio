import { CandidateAppShell } from "@/components/dashboard/candidate-app-shell";
import { requireRole } from "@/lib/auth/rbac";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["CANDIDATE"]);
  return <CandidateAppShell userName={user.name}>{children}</CandidateAppShell>;
}
