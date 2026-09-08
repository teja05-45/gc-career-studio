"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "@/components/forms/password-input";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setStatus("submitting");
    setServerError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body?.message || "We couldn't create your account right now. Please try again.");
        setStatus("error");
        return;
      }

      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      const session = result && !result.error ? await getSession() : null;
      if (!session?.user) {
        router.replace(`/login${searchParams.get("callbackUrl") ? `?callbackUrl=${encodeURIComponent(searchParams.get("callbackUrl")!)}` : ""}`);
        return;
      }

      const requestedCallback = searchParams.get("callbackUrl");
      const candidate = requestedCallback ? new URL(requestedCallback, window.location.origin) : null;
      router.replace(candidate?.origin === window.location.origin ? `${candidate.pathname}${candidate.search}${candidate.hash}` : "/dashboard");
      router.refresh();
    } catch {
      setServerError("We couldn't create your account right now. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t create your account</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" className="mt-1.5" error={!!errors.name} {...register("name")} />
        <FormFieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" className="mt-1.5" error={!!errors.email} {...register("email")} />
        <FormFieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" autoComplete="new-password" className="mt-1.5" error={!!errors.password} {...register("password")} />
        <FormFieldError message={errors.password?.message} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput id="confirmPassword" autoComplete="new-password" className="mt-1.5" error={!!errors.confirmPassword} {...register("confirmPassword")} />
        <FormFieldError message={errors.confirmPassword?.message} />
      </div>

      <p className="text-xs text-muted-foreground">
        New accounts are created as Candidate accounts. Consultant and Admin access is
        provisioned separately.
      </p>

      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "submitting" ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
