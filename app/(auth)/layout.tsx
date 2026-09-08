export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <p className="font-serif text-2xl">GC Career Studio</p>
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/65">Career strategy, made practical</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05]">A clearer way forward for your career.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/75">Thoughtful guidance for the decisions that shape your next opportunity.</p>
        </div>
        <p className="text-sm text-primary-foreground/60">Designed for deliberate career moves.</p>
      </aside>
      <div className="flex items-center justify-center px-6 py-14 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
