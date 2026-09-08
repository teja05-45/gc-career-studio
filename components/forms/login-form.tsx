"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "@/components/forms/password-input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setStatus("submitting");
    setServerError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        // CredentialsSignin is deliberately generic; it must not disclose
        // whether a particular email exists.
        setServerError(result?.error === "CredentialsSignin" ? "Invalid email or password." : "We couldn't sign you in right now. Please try again.");
        setStatus("error");
        return;
      }

      const session = await getSession();
      if (!session?.user) {
        setServerError("We couldn't sign you in right now. Please try again.");
        setStatus("error");
        return;
      }

      const requestedCallback = searchParams.get("callbackUrl");
      let callbackUrl: string | null = null;
      if (requestedCallback) {
        const candidate = new URL(requestedCallback, window.location.origin);
        if (candidate.origin === window.location.origin) callbackUrl = `${candidate.pathname}${candidate.search}${candidate.hash}`;
      }
      const roleHome = session.user.role === "ADMIN" ? "/admin" : session.user.role === "CONSULTANT" ? "/consultant" : "/dashboard";
      router.replace(callbackUrl || roleHome);
      router.refresh();
    } catch {
      // Network and unexpected Auth.js failures must release the form rather
      // than leaving the button in its loading state indefinitely.
      setServerError("We couldn't sign you in right now. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t sign in</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" className="mt-1.5" error={!!errors.email} {...register("email")} />
        <FormFieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" autoComplete="current-password" className="mt-1.5" error={!!errors.password} {...register("password")} />
        <FormFieldError message={errors.password?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "submitting" ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
