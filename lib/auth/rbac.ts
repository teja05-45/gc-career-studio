import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type Role = "ADMIN" | "CONSULTANT" | "CANDIDATE";

/**
 * Server-side guard for use at the top of Server Components / route
 * handlers. Middleware already redirects unauthenticated/unauthorized
 * requests for the matched prefixes, but every server entry point that
 * touches sensitive data re-checks here too — defense in depth, and a
 * safety net for any route added later that forgets to update the
 * middleware matcher.
 */
export async function requireRole(allowed: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as Role;
  if (!allowed.includes(role)) {
    // Keep role mismatches within the correct workspace. Redirecting every
    // mismatch to /dashboard would loop once /dashboard itself is
    // candidate-only.
    const roleHome: Record<Role, string> = {
      ADMIN: "/admin",
      CONSULTANT: "/consultant",
      CANDIDATE: "/dashboard",
    };
    redirect(roleHome[role] || "/login");
  }

  return session.user;
}

export async function requireUser(callbackUrl?: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl || "/dashboard")}`);
  }
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}
