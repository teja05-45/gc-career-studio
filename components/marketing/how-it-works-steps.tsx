const steps = [
  { title: "Discover", description: "We start by understanding your current situation — role, experience, and what's not working." },
  { title: "Assess", description: "We evaluate your goals, options, and the real gaps between where you are and where you want to be." },
  { title: "Strategize", description: "We build a specific, realistic plan tailored to your background — not generic advice." },
  { title: "Execute", description: "We prepare you to act on the plan, with structured support at each step." },
];

export function HowItWorksSteps() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {steps.map((step, i) => (
        <div key={step.title} className="relative rounded-lg border border-border bg-card p-6">
          <span className="font-serif text-2xl text-primary/40">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-4 font-serif text-lg font-medium">{step.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
