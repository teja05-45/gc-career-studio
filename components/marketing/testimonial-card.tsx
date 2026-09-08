import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialCard({
  name,
  role,
  challenge,
  approach,
  outcome,
  isDemo,
}: {
  name: string;
  role: string;
  challenge: string;
  approach: string;
  outcome: string;
  isDemo: boolean;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-7">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="font-serif text-base font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
          {isDemo && <Badge variant="secondary">Sample</Badge>}
        </div>
        <div className="space-y-3 text-sm">
          <p><span className="font-medium text-foreground">Challenge — </span><span className="text-muted-foreground">{challenge}</span></p>
          <p><span className="font-medium text-foreground">Approach — </span><span className="text-muted-foreground">{approach}</span></p>
          <p><span className="font-medium text-foreground">Outcome — </span><span className="text-muted-foreground">{outcome}</span></p>
        </div>
      </CardContent>
    </Card>
  );
}
