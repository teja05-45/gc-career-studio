import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl font-medium">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
