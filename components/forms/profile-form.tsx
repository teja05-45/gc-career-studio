"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Profile = { name: string; email: string; phone: string | null; currentRole: string | null; targetRole: string | null; experience: string | null; skills: string | null; careerGoals: string | null; careerStage: string | null };
export function ProfileForm({ user }: { user: Profile }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const completionFields = [user.name, user.phone, user.careerStage, user.experience, user.currentRole, user.targetRole, user.skills, user.careerGoals];
  const completeCount = completionFields.filter((value) => Boolean(value?.trim())).length;
  const completion = Math.round((completeCount / completionFields.length) * 100);
  const nextField = !user.phone ? "phone number" : !user.careerStage ? "career stage" : !user.experience ? "experience" : !user.currentRole ? "current role" : !user.targetRole ? "target role" : !user.skills ? "skills" : "career goal";
  async function save(form: FormData) {
    setStatus("saving"); setMessage(null);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      setStatus(res.ok ? "saved" : "error");
      setMessage(res.ok ? "Saved just now" : body.message || "Unable to save changes. Please try again.");
    } catch { setStatus("error"); setMessage("Unable to save changes. Please try again."); }
  }
  return <form action={save} className="mt-8 space-y-9">
    <section className="border border-border bg-secondary/40 p-5 sm:p-6" aria-labelledby="completion-heading"><div className="flex flex-wrap items-baseline justify-between gap-3"><div><p id="completion-heading" className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Profile completion</p><p className="mt-2 font-serif text-2xl font-medium">{completion}% complete</p></div><p className="max-w-sm text-sm text-muted-foreground">Add your {nextField} to make your career context more useful.</p></div><div className="mt-5 h-1.5 overflow-hidden bg-border" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}><div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${completion}%` }} /></div></section>
    <fieldset className="border-t border-border pt-7"><legend className="pr-4 font-serif text-xl font-medium">Personal</legend><p className="mt-2 text-sm text-muted-foreground">Your account details are used to identify and support you.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><Label htmlFor="name">Name</Label><Input id="name" name="name" defaultValue={user.name} className="mt-1.5" required /></div><div><Label htmlFor="email">Email</Label><Input id="email" defaultValue={user.email} className="mt-1.5" readOnly aria-describedby="email-help" /><p id="email-help" className="mt-1.5 text-xs text-muted-foreground">Verified account email. Contact support to change it.</p></div><div><Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label><Input id="phone" name="phone" defaultValue={user.phone || ""} className="mt-1.5" autoComplete="tel" /></div></div></fieldset>
    <fieldset className="border-t border-border pt-7"><legend className="pr-4 font-serif text-xl font-medium">Career</legend><p className="mt-2 text-sm text-muted-foreground">This helps us tailor your discovery conversation.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><Label htmlFor="careerStage">Career stage</Label><select id="careerStage" name="careerStage" defaultValue={user.careerStage || ""} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Select one</option><option value="STUDENT">Student</option><option value="EARLY_CAREER">Early career</option><option value="PROFESSIONAL">Working professional</option><option value="CAREER_SWITCHER">Career switcher</option><option value="SENIOR_LEADER">Senior leader</option></select></div><div><Label htmlFor="experience">Experience</Label><Input id="experience" name="experience" defaultValue={user.experience || ""} className="mt-1.5" placeholder="For example, 2 years" /></div><div><Label htmlFor="currentRole">Current role</Label><Input id="currentRole" name="currentRole" defaultValue={user.currentRole || ""} className="mt-1.5" /></div><div><Label htmlFor="targetRole">Target role</Label><Input id="targetRole" name="targetRole" defaultValue={user.targetRole || ""} className="mt-1.5" /></div><div className="sm:col-span-2"><Label htmlFor="skills">Skills</Label><Input id="skills" name="skills" defaultValue={user.skills || ""} className="mt-1.5" placeholder="For example, React, communication, SQL" /></div><div className="sm:col-span-2"><Label htmlFor="careerGoals">Career direction</Label><p className="mt-1 text-xs text-muted-foreground">What are you hoping to achieve?</p><Textarea id="careerGoals" name="careerGoals" defaultValue={user.careerGoals || ""} className="mt-1.5" rows={5} /></div></div></fieldset>
    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6"><Button type="submit" disabled={status === "saving"}>{status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}{status === "saving" ? "Saving..." : "Save changes"}</Button>{status === "saved" && <p className="inline-flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{message}</p>}{status === "error" && <p role="alert" className="text-sm text-destructive">{message}</p>}</div>
  </form>;
}
