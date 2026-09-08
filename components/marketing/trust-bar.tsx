export function TrustBar() {
  const items = [
    "Structured, not generic advice",
    "Built around your actual goals",
    "Practical next steps, every session",
  ];
  return (
    <div className="border-b border-border bg-secondary/30">
      <div className="container flex flex-col items-center gap-4 py-6 text-sm text-muted-foreground md:flex-row md:justify-center md:gap-10">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
