"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CAREER_STAGE_LABELS, cn } from "@/lib/utils";

type ServiceOption = { id: string; title: string };
type SlotDay = { date: string; label: string; times: string[] };

const BOOKING_STEPS: { label: string; title: string; fields: (keyof BookingInput)[] }[] = [
  { label: "About you", title: "A few details to get started", fields: ["phone"] },
  { label: "Career goals", title: "Tell us where you want to go", fields: ["careerStage", "currentRole", "targetRole", "careerGoal", "additionalContext"] },
  { label: "Service", title: "Choose the support that fits", fields: ["serviceId"] },
  { label: "Schedule", title: "Select a time that works", fields: ["preferredDate", "preferredSlot"] },
  { label: "Review", title: "Review your booking", fields: [] },
];

function displayTime(value?: string) {
  if (!value) return "Not selected";
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

export function BookingFlow({ services, slots, user }: { services: ServiceOption[]; slots: SlotDay[]; user: { name: string; email: string } }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const currentStep = BOOKING_STEPS[stepIndex]!;
  const totalSteps = BOOKING_STEPS.length;
  const { register, handleSubmit, trigger, setValue, setError, watch, formState: { errors } } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema), mode: "onTouched",
    defaultValues: { phone: "", careerStage: undefined, currentRole: "", targetRole: "", careerGoal: "", additionalContext: "", serviceId: "", preferredDate: "", preferredSlot: "" },
  });
  const values = watch();
  const selectedDay = slots.find((day) => day.date === values.preferredDate);
  const selectedService = services.find((service) => service.id === values.serviceId);

  async function goNext() {
    if (await trigger(currentStep.fields)) setStepIndex((value) => Math.min(value + 1, totalSteps - 1));
  }

  async function onSubmit(data: BookingInput) {
    setStatus("submitting"); setServerError(null);
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (body.issues && typeof body.issues === "object") for (const [field, message] of Object.entries(body.issues)) setError(field as keyof BookingInput, { type: "server", message: String(message) });
        setServerError(body.message || "We couldn't complete your booking right now. Please try again."); setStatus("error"); return;
      }
      setStatus("success");
    } catch { setServerError("We couldn't complete your booking right now. Please try again."); setStatus("error"); }
  }

  if (status === "success") return <section className="mx-auto max-w-2xl border border-primary/20 bg-card px-6 py-10 text-center shadow-subtle sm:px-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary"><CheckCircle2 className="h-6 w-6" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-primary">Booking confirmed</p><h2 className="mt-3 font-serif text-3xl">Your discovery call is requested.</h2><dl className="mx-auto mt-8 grid max-w-md gap-4 border-y border-border py-6 text-left text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Service</dt><dd className="mt-1 font-medium">{selectedService?.title}</dd></div><div><dt className="text-muted-foreground">Status</dt><dd className="mt-1 font-medium">Pending</dd></div><div><dt className="text-muted-foreground">Date</dt><dd className="mt-1 font-medium">{selectedDay?.label}</dd></div><div><dt className="text-muted-foreground">Time</dt><dd className="mt-1 font-medium">{displayTime(values.preferredSlot)} IST</dd></div></dl><p className="mt-6 text-sm text-muted-foreground">Your next step is to prepare for your discovery conversation. We&apos;ll use the goals you shared to guide it.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild><Link href="/dashboard/appointments">View booking</Link></Button><Button variant="outline" asChild><Link href="/dashboard">Go to dashboard</Link></Button></div></section>;

  return <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start"><div className="border border-border bg-card p-5 shadow-subtle sm:p-8"><nav aria-label="Booking progress" className="mb-8 border-b border-border pb-6"><ol className="grid grid-cols-5 gap-1">{BOOKING_STEPS.map((item, index) => { const active = index === stepIndex; const complete = index < stepIndex; return <li key={item.label} aria-current={active ? "step" : undefined} className="min-w-0"><div className={cn("h-1 w-full", complete || active ? "bg-primary" : "bg-muted")} /><p className={cn("mt-2 hidden text-[10px] font-semibold uppercase tracking-wide sm:block", active ? "text-primary" : "text-muted-foreground")}>{String(index + 1).padStart(2, "0")} {item.label}</p><p className={cn("mt-2 text-center text-xs font-semibold sm:hidden", active ? "text-primary" : "text-muted-foreground")}>{index + 1}</p></li>; })}</ol><p className="mt-6 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Step {stepIndex + 1} of {totalSteps} — {currentStep.label}</p><h2 className="mt-2 font-serif text-2xl">{currentStep.title}</h2></nav>{serverError && <Alert variant="destructive" className="mb-6"><AlertTitle>Couldn&apos;t submit your booking</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert>}<form onSubmit={handleSubmit(onSubmit)} noValidate><AnimatePresence mode="wait"><motion.div key={stepIndex} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .18 }} className="space-y-5">
        {stepIndex === 0 && <><p className="border-l-2 border-primary bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">Your account details are securely linked to this booking.</p><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="booking-name">Full name</Label><Input id="booking-name" className="mt-1.5" value={user.name} readOnly /></div><div><Label htmlFor="booking-email">Email</Label><Input id="booking-email" type="email" className="mt-1.5" value={user.email} readOnly /></div></div><div><Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label><Input id="phone" autoComplete="tel" className="mt-1.5" error={!!errors.phone} {...register("phone")} /><FormFieldError message={errors.phone?.message} /></div></>}
        {stepIndex === 1 && <><div><Label htmlFor="careerStage">Career stage</Label><Select value={values.careerStage} onValueChange={(value) => setValue("careerStage", value as BookingInput["careerStage"], { shouldValidate: true, shouldTouch: true })}><SelectTrigger id="careerStage" className="mt-1.5" aria-invalid={!!errors.careerStage}><SelectValue placeholder="Select one" /></SelectTrigger><SelectContent>{Object.entries(CAREER_STAGE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><FormFieldError message={errors.careerStage?.message} /></div><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="currentRole">Current role <span className="text-muted-foreground">(optional)</span></Label><Input id="currentRole" className="mt-1.5" error={!!errors.currentRole} {...register("currentRole")} /><FormFieldError message={errors.currentRole?.message} /></div><div><Label htmlFor="targetRole">Target role <span className="text-muted-foreground">(optional)</span></Label><Input id="targetRole" className="mt-1.5" error={!!errors.targetRole} {...register("targetRole")} /><FormFieldError message={errors.targetRole?.message} /></div></div><div><Label htmlFor="careerGoal">What would you like to achieve?</Label><p className="mt-1 text-xs text-muted-foreground">A concise description helps us prepare for the call.</p><Textarea id="careerGoal" className="mt-1.5" rows={4} error={!!errors.careerGoal} {...register("careerGoal")} /><FormFieldError message={errors.careerGoal?.message} /></div><div><Label htmlFor="additionalContext">Anything else we should know? <span className="text-muted-foreground">(optional)</span></Label><Textarea id="additionalContext" className="mt-1.5" rows={3} error={!!errors.additionalContext} {...register("additionalContext")} /><FormFieldError message={errors.additionalContext?.message} /></div></>}
        {stepIndex === 2 && <div><Label>Which service would be most useful?</Label><div className="mt-3 grid gap-3">{services.map((service) => <button type="button" key={service.id} onClick={() => setValue("serviceId", service.id, { shouldValidate: true, shouldTouch: true })} className={cn("border px-4 py-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", values.serviceId === service.id ? "border-primary bg-accent" : "border-border hover:border-primary/40 hover:bg-secondary/40")} aria-pressed={values.serviceId === service.id}><span className="font-medium">{service.title}</span></button>)}</div><FormFieldError message={errors.serviceId?.message} /></div>}
        {stepIndex === 3 && <div className="space-y-6"><div><Label>Choose a date</Label><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{slots.map((day) => <button type="button" key={day.date} onClick={() => { setValue("preferredDate", day.date, { shouldValidate: true, shouldTouch: true }); setValue("preferredSlot", "", { shouldValidate: false }); }} className={cn("border px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", values.preferredDate === day.date ? "border-primary bg-accent" : "border-border hover:border-primary/40 hover:bg-secondary/40")} aria-pressed={values.preferredDate === day.date}><CalendarCheck2 className="mb-2 h-4 w-4 text-primary" /><span className="font-medium">{day.label}</span></button>)}</div><FormFieldError message={errors.preferredDate?.message} /></div>{selectedDay && <div><div className="flex items-center justify-between gap-4"><Label>Choose a time</Label><span className="text-xs text-muted-foreground">IST (UTC+5:30)</span></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{selectedDay.times.map((time) => <button type="button" key={time} onClick={() => setValue("preferredSlot", time, { shouldValidate: true, shouldTouch: true })} className={cn("border px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", values.preferredSlot === time ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40 hover:bg-secondary/40")} aria-pressed={values.preferredSlot === time}><Clock3 className="mr-1 inline h-3.5 w-3.5" />{displayTime(time)}</button>)}</div><FormFieldError message={errors.preferredSlot?.message} /><p className="mt-4 text-xs text-muted-foreground">Availability is managed internally for this MVP; it is not synchronized with an external calendar.</p></div>}</div>}
        {stepIndex === 4 && <section><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Review your booking</p><dl className="mt-5 grid gap-5 border-y border-border py-5 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Service</dt><dd className="mt-1 font-medium">{selectedService?.title}</dd></div><div><dt className="text-muted-foreground">Date & time</dt><dd className="mt-1 font-medium">{selectedDay?.label}, {displayTime(values.preferredSlot)} IST</dd></div><div><dt className="text-muted-foreground">Name</dt><dd className="mt-1 font-medium">{user.name}</dd></div><div><dt className="text-muted-foreground">Email</dt><dd className="mt-1 font-medium">{user.email}</dd></div><div><dt className="text-muted-foreground">Career stage</dt><dd className="mt-1 font-medium">{values.careerStage && CAREER_STAGE_LABELS[values.careerStage]}</dd></div><div><dt className="text-muted-foreground">Current role</dt><dd className="mt-1 font-medium">{values.currentRole || "Not provided"}</dd></div><div><dt className="text-muted-foreground">Target role</dt><dd className="mt-1 font-medium">{values.targetRole || "Not provided"}</dd></div><div className="sm:col-span-2"><dt className="text-muted-foreground">Career goal</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{values.careerGoal}</dd></div>{values.additionalContext && <div className="sm:col-span-2"><dt className="text-muted-foreground">Additional context</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{values.additionalContext}</dd></div>}</dl></section>}
      </motion.div></AnimatePresence><div className="mt-8 flex items-center justify-between border-t border-border pt-6"><Button type="button" variant="ghost" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0 || status === "submitting"}><ArrowLeft className="h-4 w-4" /> Back</Button>{stepIndex < totalSteps - 1 ? <Button type="button" onClick={goNext}>Continue <ArrowRight className="h-4 w-4" /></Button> : <Button type="submit" disabled={status === "submitting"}>{status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}{status === "submitting" ? "Creating your booking..." : "Confirm booking"}</Button>}</div></form></div><aside className="border border-border bg-secondary/50 p-5 lg:sticky lg:top-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Your booking</p><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-muted-foreground">Service</dt><dd className="mt-1 font-medium">{selectedService?.title || "To be selected"}</dd></div><div><dt className="text-muted-foreground">Date</dt><dd className="mt-1 font-medium">{selectedDay?.label || "To be selected"}</dd></div><div><dt className="text-muted-foreground">Time</dt><dd className="mt-1 font-medium">{values.preferredSlot ? `${displayTime(values.preferredSlot)} IST` : "To be selected"}</dd></div></dl></aside></div>;
}
