"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const challenges = [
  { label: "I'm graduating soon", href: "/services/resume-linkedin-optimization" },
  { label: "I want to grow in my career", href: "/services/career-strategy" },
  { label: "I'm switching industries", href: "/services/career-transition" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="container grid gap-12 py-20 md:grid-cols-2 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary/80">
            Career strategy &amp; job search guidance
          </p>
          <h1 className="text-balance text-4xl font-medium leading-[1.1] md:text-5xl">
            A clear, structured path from career uncertainty to your next offer.
          </h1>
          <p className="mt-5 max-w-lg text-balance text-lg text-muted-foreground">
            GC Career Studio helps graduates, working professionals, and career switchers
            build a real strategy — then prepares you to execute it, one step at a time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/book">
                Book a discovery call <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/services">Explore services</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-center gap-3 rounded-lg border border-border bg-card p-6 shadow-card"
        >
          <p className="text-sm font-medium text-muted-foreground">What brings you here today?</p>
          {challenges.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center justify-between rounded-md border border-border px-4 py-3.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {c.label}
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
