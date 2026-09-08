import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge middleware: first line of defense for protected routes. This is
// deliberately NOT the only authorization check — every server
// action/route handler under app/api/admin, app/api/... re-checks the
// session and role server-side too, since middleware can be bypassed by
// calling route handlers directly and must never be the sole guard.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*", "/consultant/:path*", "/dashboard/:path*", "/profile", "/book"],
};
