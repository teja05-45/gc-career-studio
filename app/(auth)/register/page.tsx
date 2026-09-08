import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl font-medium">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <Suspense><RegisterForm /></Suspense>
    </>
  );
}
