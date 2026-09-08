import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return <main className="container max-w-4xl py-8 sm:py-10" aria-label="Loading profile"><Skeleton className="h-5 w-32" /><Skeleton className="mt-8 h-4 w-24" /><Skeleton className="mt-4 h-9 w-40" /><Skeleton className="mt-3 h-5 w-96 max-w-full" /><Skeleton className="mt-10 h-32" /><Skeleton className="mt-8 h-80" /></main>;
}
