import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ServiceCard({
  slug,
  title,
  summary,
  index,
}: {
  slug: string;
  title: string;
  summary: string;
  index: number;
}) {
  return (
    <Link href={`/services/${slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card">
        <CardContent className="flex h-full flex-col p-7">
          <span className="mb-4 font-serif text-sm text-primary/50">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="font-serif text-xl font-medium leading-snug">{title}</h3>
          <p className="mt-2.5 flex-1 text-sm text-muted-foreground">{summary}</p>
          <span className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary">
            Learn more
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
