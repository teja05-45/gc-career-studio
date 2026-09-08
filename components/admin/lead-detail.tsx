"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { updateLeadSchema, type UpdateLeadInput } from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDateTime, LEAD_STATUS_LABELS, CAREER_STAGE_LABELS } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  careerStage: string;
  currentRole?: string | null;
  message?: string | null;
  serviceId?: string | null;
  status: NonNullable<UpdateLeadInput["status"]>;
  notes?: string | null;
  createdAt: Date | string;
  service?: { title: string; slug: string } | null;
};

export function AdminLeadDetail({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<UpdateLeadInput>({
    resolver: zodResolver(updateLeadSchema),
    defaultValues: {
      status: lead.status,
      notes: lead.notes || "",
    },
  });

  const leadStatus = watch("status");

  async function onSubmit(data: UpdateLeadInput) {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || "Something went wrong");
        setStatus("error");
        return;
      }

      setStatus("success");
      reset({ status: leadStatus, notes: watch("notes") });
      router.refresh();

      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError("Network error — please try again");
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Name</Label>
                <p className="mt-1 text-foreground">{lead.name}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                <p className="mt-1 text-foreground">{lead.email}</p>
              </div>
              {lead.phone && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
                  <p className="mt-1 text-foreground">{lead.phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Career stage</Label>
                <p className="mt-1 text-foreground">{CAREER_STAGE_LABELS[lead.careerStage]}</p>
              </div>
              {lead.currentRole && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Current role</Label>
                  <p className="mt-1 text-foreground">{lead.currentRole}</p>
                </div>
              )}
            </div>
            {lead.message && (
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Message</Label>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{lead.message}</p>
              </div>
            )}
            {lead.service && (
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Interested in</Label>
                <p className="mt-1 text-foreground">{lead.service.title}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs font-semibold text-muted-foreground">Last updated: {formatDateTime(lead.createdAt)}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="status" className="text-xs font-semibold">Status</Label>
                <Select value={leadStatus} onValueChange={(v) => setValue("status", v as UpdateLeadInput["status"], { shouldDirty: true })}>
                  <SelectTrigger id="status" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-xs font-semibold">Notes</Label>
                <Textarea id="notes" className="mt-1.5 min-h-[120px]" placeholder="Internal notes..." {...register("notes")} />
              </div>

              <Button type="submit" className="w-full" disabled={!isDirty || status === "submitting"}>
                {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "success" ? "Saved" : status === "submitting" ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
