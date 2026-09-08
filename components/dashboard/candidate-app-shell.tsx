import { CandidateDashboardNav } from "@/components/dashboard/candidate-dashboard-nav";

export function CandidateAppShell({ children, userName }: { children: React.ReactNode; userName?: string | null }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <CandidateDashboardNav userName={userName} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
