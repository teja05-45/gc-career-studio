import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <main className="container max-w-6xl py-8 sm:py-10" aria-label="Loading dashboard"><Skeleton className="h-4 w-24" /><Skeleton className="mt-4 h-9 w-64" /><Skeleton className="mt-3 h-5 w-80 max-w-full" /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div><Skeleton className="mt-10 h-36" /></main>;
}
