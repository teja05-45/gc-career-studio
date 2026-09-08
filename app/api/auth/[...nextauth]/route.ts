import { handlers } from "@/auth";

// Auth.js must be mounted at this catch-all route.  Without it, the client
// sign-in request (and Auth.js' own error redirects) resolve to a Next.js 404.
export const { GET, POST } = handlers;
