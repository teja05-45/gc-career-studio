import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/80">{eyebrow}</p>
      )}
      <h2 className="text-balance text-3xl font-medium leading-tight md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-balance text-muted-foreground">{description}</p>}
    </div>
  );
}
