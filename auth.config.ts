import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the auth config (no bcrypt/Prisma here — those need
// the Node runtime). middleware.ts uses only this file, per the NextAuth
// v5 "split config" pattern, so route protection can run on the Edge
// runtime while the actual credential check happens in auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // This callback must live in the edge-safe config as well as the route
    // configuration. `middleware.ts` constructs Auth.js from this object, so
    // it needs the role claim in the JWT to make a role decision. Keeping it
    // here avoids a successful login being immediately denied by middleware.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPrefixes: Record<string, string[]> = {
        "/admin": ["ADMIN"],
        "/consultant": ["CONSULTANT"],
        "/dashboard": ["CANDIDATE", "CONSULTANT", "ADMIN"],
        "/profile": ["CANDIDATE", "CONSULTANT", "ADMIN"],
        "/book": ["CANDIDATE", "CONSULTANT", "ADMIN"],
      };

      const matched = Object.entries(protectedPrefixes).find(([prefix]) =>
        pathname.startsWith(prefix)
      );

      if (!matched) return true;

      if (!isLoggedIn) return false;

      const [, allowedRoles] = matched;
      const role = auth?.user?.role as string | undefined;
      if (!role) return false;
      if (allowedRoles.includes(role)) return true;

      // Returning false would send an already authenticated user to the
      // sign-in page. Keep a role mismatch inside the authenticated area.
      return Response.redirect(new URL("/dashboard", request.nextUrl));
    },
  },
  providers: [], // populated in auth.ts (needs Node runtime for bcrypt)
};
