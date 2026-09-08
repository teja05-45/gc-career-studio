# GC Career Studio — Architecture

This document explains the current MVP architecture and how it's designed to scale into a full SaaS platform.

## Current Architecture

### Tech Stack Overview

```
Browser (Next.js client + SSR)
   │
   ├─ Public pages (marketing) → Server-Rendered Components
   ├─ Protected pages (dashboard/admin) → Server Components + Client Components
   └─ API routes → Route Handlers (REST-like)
   │
   ├─ Auth.js (middleware + JWT session management)
   │
   ├─ Server Functions / Route Handlers
   │  └─ Service Layer (validation, business logic)
   │     └─ Zod (schema validation)
   │
   └─ PostgreSQL (data persistence)
```

### Request Lifecycle: Public Lead Form

```
1. User fills lead form (client-side React Hook Form)
   ↓
2. Form submits to POST /api/leads
   ↓
3. Route handler receives JSON body
   ↓
4. leadSchema.safeParse() validates against Zod schema
   ↓
5. If valid, createLead() service is called
   ↓
6. Service validates again (defense in depth)
   ↓
7. prisma.lead.create() persists to Postgres
   ↓
8. 201 + created lead returned to browser
   ↓
9. Client shows success state
```

### Request Lifecycle: Protected Admin Action (Update Lead Status)

```
1. Admin clicks "Update Status" on /admin/leads/[id]
   ↓
2. Client submits PATCH /api/admin/leads/[id] with new status
   ↓
3. Middleware intercepts request
   ├─ Checks session.user exists → redirect to /login if not
   └─ Checks session.user.role === "ADMIN" → redirect to /dashboard if not
   ↓
4. Route handler receives request
   ├─ Re-checks await auth() to get session (defense in depth)
   ├─ Re-validates role is ADMIN
   └─ Proceeds if both pass
   ↓
5. updateLeadSchema.safeParse() validates payload
   ↓
6. updateLead() service calls prisma.lead.update()
   ↓
7. 200 + updated lead returned
   ↓
8. Client refreshes lead detail from server
```

## Component Architecture

### Server vs. Client Components

**Server Components (default):**
- All marketing pages (home, services, how-it-works, etc.)
- Dashboard overview pages
- Admin dashboard page (metrics fetched server-side)
- Protected routes (auth + data fetched before render)

Benefits:
- No authentication logic or database credentials exposed to browser
- Smaller JS payload shipped
- Can use async/await for data fetching

**Client Components (where necessary):**
- Forms (React Hook Form needs client state)
- Modal/Dialog components (Radix UI)
- Table with filtering/sorting (client-side state)
- Multi-step form (step state management)

### Data Access Patterns

#### Direct Server Components
```typescript
// app/admin/page.tsx (server component)
import { getLeadStats } from "@/lib/services/lead-service";

export default async function AdminDashboard() {
  const stats = await getLeadStats(); // runs on server
  return <Dashboard stats={stats} />;
}
```

#### Via Route Handler (API)
```typescript
// Client makes fetch request to /api/admin/leads
const res = await fetch("/api/admin/leads?status=NEW");
const { leads, total } = await res.json();
// leads:  the page of records matching the filters
// total:  the unfiltered count, used to tell "no leads exist" from
//         "no leads match this search"
```

Both use the same underlying service layer (`lib/services/*`), so business logic is never duplicated.

## Database Design

### ER Diagram (simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────┐        ┌─────────────┐        ┌──────────────┐  │
│  │   User   │◄───────│   Booking   │───────►│   Service    │  │
│  │          │        │             │        │              │  │
│  │ id (PK)  │        │ id (PK)     │        │ id (PK)      │  │
│  │ email    │        │ name        │        │ slug (unique)│  │
│  │ role     │        │ email       │        │ title        │  │
│  │ pass...  │        │ status      │        │ description  │  │
│  └──────────┘        │ preferred.. │        └──────────────┘  │
│       ▲              │ candidate.. │              ▲            │
│       │              │ consultant. │              │            │
│       └──────────────┴─────────────┴──────────────┘            │
│                      Candidate / Consultant Relations          │
│                                                                 │
│  ┌──────────┐        ┌──────────────┐       ┌─────────────┐  │
│  │   Lead   │───────►│   Service    │       │ Testimonial │  │
│  │          │        │              │       │             │  │
│  │ id (PK)  │        │ (same)       │       │ id (PK)     │  │
│  │ email    │        └──────────────┘       │ name        │  │
│  │ status   │                               │ isDemo      │  │
│  └──────────┘                               └─────────────┘  │
│                                                                 │
│  Auth.js Tables: Account, Session, VerificationToken          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Relationships

- **User** → many Bookings (as candidate)
- **User** → many Bookings (as consultant)
- **Lead** → one Service (optional)
- **Booking** → one Service, one authenticated Candidate, one Consultant (optional)

### Indexes for Performance

```sql
-- Lead queries (admin dashboard)
CREATE INDEX idx_lead_status ON leads(status);
CREATE INDEX idx_lead_email ON leads(email);
CREATE INDEX idx_lead_created ON leads(created_at);

-- Booking queries
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_preferred_date ON bookings(preferred_date);

-- User lookups
CREATE INDEX idx_user_role ON users(role);
```

## Authentication Architecture

### How Auth.js Works Here

```
1. User visits /login
   ↓
2. Submits credentials (email + password)
   ↓
3. POST /api/auth/callback/credentials
   ├─ Auth.js invokes Credentials provider authorize()
   ├─ Hash is checked with bcrypt.compare()
   ├─ If match: returns { id, name, email, role }
   └─ If no match: returns null
   ↓
4. If authorized: Auth.js creates a signed JWT session
   └─ JWT contains: id, role, email
   ↓
5. Session cookie set (HTTP-only, secure)
   ↓
6. Redirect to /dashboard
```

### Session Callbacks

```typescript
// auth.ts
callbacks: {
  async jwt({ token, user }) {
    // Called when token is created/refreshed
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    // Called when session is accessed
    if (session.user) {
      session.user.id = token.id;
      session.user.role = token.role;
    }
    return session;
  },
}
```

### Protection: Middleware + Server Checks

**Middleware** (`middleware.ts`):
- Runs on every request to protected routes
- Fast redirect at Edge runtime
- Prevents unauthorized access to route
- Uses the same edge-safe JWT/session callbacks as the Auth.js route, so the
  `role` claim is available for role checks.

### Authentication incident: September 2026

Credential verification and session creation were healthy. The failure was in
the split Auth.js v5 configuration: `middleware.ts` initialized Auth.js from
`auth.config.ts`, but the JWT callback that copied `user.role` was defined
only in `auth.ts`. Consequently, middleware received a session without a role
and denied every protected route after sign-in. The JWT and session callbacks
now live in the edge-safe shared configuration; Prisma and bcrypt remain only
in `auth.ts`, where the credentials provider runs.

### Candidate booking flow

```mermaid
flowchart LR
  C[Candidate session] --> P[/book server role check]
  P --> F[Five-step booking form]
  F --> A[POST /api/bookings]
  A --> R[Candidate role check]
  R --> I[Load candidate identity from session]
  I --> V[Zod, service, date and slot validation]
  V --> D[(PostgreSQL Booking)]
  D --> U[Confirmation and dashboards]
```

Only `CANDIDATE` sessions pass both role checks. Staff see a role-specific
dashboard link instead; the API independently rejects staff booking requests.
The browser payload has no user ID, name, or email. The route derives booking
ownership and the stored candidate identity from the authenticated session,
then the service reloads the user record before persistence. A database unique
constraint on date plus slot closes the race between two simultaneous requests.

**Server-side** (`lib/auth/rbac.ts`):
- Every API route re-checks `await auth()`
- Every server component calls `requireRole()`
- Defense in depth: even if middleware is bypassed, auth is enforced

## Validation Strategy

### Zod Schemas as Single Source of Truth

```typescript
// lib/validations/lead.ts
export const leadSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  // ...
});

export type LeadInput = z.infer<typeof leadSchema>;
```

### Client-side (React Hook Form)
```typescript
// components/forms/lead-form.tsx
const { register } = useForm<LeadInput>({
  resolver: zodResolver(leadSchema),
});
// Form field validation in real-time
```

### Server-side (Route Handler)
```typescript
// app/api/leads/route.ts
const parsed = leadSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { issues: parsed.error.issues },
    { status: 400 }
  );
}
// If we reach here, data is guaranteed valid
const lead = await createLead(parsed.data);
```

This ensures:
- Client can't bypass validation (server re-validates)
- Server has the same validation logic as client (no drift)
- Type safety throughout (TypeScript knows lead is valid)

## Future Scalability

### Architecture for Growth

The current monolith is designed so each major feature can be added without rewriting:

```
Current (MVP):
┌────────────────────────────────────┐
│         Monolithic Next.js         │
│  Marketing + Auth + Admin + CMS    │
│  ↓ (Single Postgres instance)      │
└────────────────────────────────────┘

Phase 2: Candidate Profiles
┌─────────────────────────────────────┐
│      Next.js (same deploy)          │
│  + CandidateProfile model           │
│  + /dashboard enhancements          │
│  ↓ (Same Postgres)                  │
└─────────────────────────────────────┘

Phase 3+: Separate Services (if needed)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Candidate API   │  │ Consultant API   │  │  Admin Service   │
│  (Node/Express)  │  │  (Node/Express)  │  │  (Could stay in  │
└────────┬─────────┘  └────────┬─────────┘  │   Next.js)       │
         │                     │            └──────────────────┘
         └─────────────┬───────┘
                       │
                   Postgres (shared, or split)
                   Redis (job queue, cache)
```

### What Stays the Same

- Prisma schema evolves (add models), doesn't rewrite
- Validation schemas add new validators
- Service layer adds new methods
- API routes add new endpoints

### What Changes

- Hosting: from single Vercel deploy → multiple services
- Database: shared Postgres → potentially split per service
- Caching: edge caching → Redis if needed
- Queue: synchronous → async jobs for heavy lifting

But the **code structure, auth patterns, and validation approach** remain the same.

## Error Handling

### Validation Errors
```typescript
// Return 400 with issues
{
  message: "Validation failed",
  issues: {
    email: "Invalid email address",
    password: "At least 8 characters"
  }
}
```

### Authorization Errors
```typescript
// Middleware or route handler
if (!session?.user || !roles.includes(session.user.role)) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
}
```

### Business Logic Errors
```typescript
if (existingUser) {
  return NextResponse.json(
    { message: "Email already exists" },
    { status: 409 }
  );
}
```

### Unexpected Errors
```typescript
catch (error) {
  console.error("Something failed:", error);
  return NextResponse.json(
    { message: "Something went wrong" },
    { status: 500 }
  );
}
```

## Observability & Monitoring

Currently minimal; for production:

- **Logging**: centralized logging (e.g., Loggly, Datadog)
- **Metrics**: API response times, error rates (e.g., Prometheus)
- **Tracing**: request tracing across services
- **Sentry**: error reporting and replay
- **Analytics**: conversion funnel, lead sources

## Performance Considerations

### Server Rendering
- Marketing pages are Server Components → no client JS for content
- Reduces waterfall (no "loading" phase)

### Database Queries
- N+1 queries avoided via Prisma include()
- Indexes on frequently-filtered columns (status, email, date)

### Caching Strategy
- Static pages (services, how-it-works) can be ISR (incremental static regeneration)
- API responses cached at edge if safe (Vercel, Cloudflare)

### Third-party Integrations (Future)
- AI features async via queue jobs
- Email sending via background jobs
- CRM syncs happen asynchronously

---

See `DECISIONS.md` for why specific choices were made, and `SECURITY.md` for assumptions and limitations.
