"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CAREER_STAGE_LABELS } from "@/lib/utils";

type ServiceOption = { id: string; title: string };

export function LeadForm({ services }: { services: ServiceOption[] }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
  });

  const careerStage = watch("careerStage");
  const serviceId = watch("serviceId");

  async function onSubmit(data: LeadInput) {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body?.message || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setServerError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Thanks — we&apos;ve got your message.</AlertTitle>
        <AlertDescription>
          A member of our team will follow up by email shortly. In the meantime, feel free to{" "}
          <a href="/book" className="underline">book a discovery call</a> directly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t submit your message</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" className="mt-1.5" error={!!errors.name} {...register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-1.5" error={!!errors.email} {...register("email")} />
          <FormFieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" className="mt-1.5" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="currentRole">Current role (optional)</Label>
          <Input id="currentRole" className="mt-1.5" {...register("currentRole")} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="careerStage">Career stage</Label>
          <Select value={careerStage} onValueChange={(v) => setValue("careerStage", v as LeadInput["careerStage"], { shouldValidate: true })}>
            <SelectTrigger id="careerStage" className="mt-1.5">
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CAREER_STAGE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldError message={errors.careerStage?.message} />
        </div>
        <div>
          <Label htmlFor="serviceId">Interested in (optional)</Label>
          <Select value={serviceId} onValueChange={(v) => setValue("serviceId", v)}>
            <SelectTrigger id="serviceId" className="mt-1.5">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea id="message" className="mt-1.5" rows={4} {...register("message")} />
        <FormFieldError message={errors.message?.message} />
      </div>

      <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "submitting" ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
