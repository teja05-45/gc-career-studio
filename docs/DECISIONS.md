# Technical Decisions

This document explains the key technical decisions made in this MVP and the reasoning behind them.

## 1. Next.js (not Express / Fastify / etc)

### Decision
Use Next.js 14 with the App Router.

### Context
- Built a marketing website + dashboard in one codebase
- Need server-side rendering for public pages (SEO, performance)
- Need real-time interactivity in admin dashboard
- Need quick iteration (no separate frontend/backend)

### Options Considered
1. **Express + React (separate repos)**: More separation of concerns, but more complex deployment
2. **Next.js**: Unified codebase, built-in routing, server/client components
3. **Django + React**: Python backend, but less familiarity with auth patterns

### Why Next.js
- Single deploy pipeline (Vercel native)
- Server Components reduce shipped JS
- Built-in Auth.js support
- ISR (incremental static regeneration) for marketing content
- Easy API routes
- Type safety across client/server boundary

### Trade-offs
- Monolithic deployment (can't scale independent services yet, but documented path to do so)
- Requires Node.js runtime (not edge-compatible for everything)

---

## 2. PostgreSQL + Prisma (not MongoDB / DynamoDB / etc)

### Decision
Use PostgreSQL with Prisma ORM.

### Context
- Data is highly relational (Users, Leads, Bookings, Services)
- Need consistent structure for an MVP
- Need migrations (schema versions)

### Options Considered
1. **MongoDB**: Flexible schema, but relational queries are awkward
2. **DynamoDB**: AWS-locked, cold start issues, expensive for small scale
3. **PostgreSQL + Prisma**: Mature, relational, great DX

### Why PostgreSQL + Prisma
- Prisma generates type-safe queries automatically
- Migrations are version-controlled
- PostgreSQL is battle-tested at scale
- Auth.js has a first-class Prisma adapter
- Free-tier options available (Railway, Render, Vercel Postgres)

### Trade-offs
- Learning curve (Prisma syntax, SQL concepts)
- Migrations must run before each deploy

---

## 3. Auth.js (NextAuth) over Passport.js or Supabase Auth

### Decision
Use Auth.js v5 with a Credentials provider and signed JWT sessions.

### Context
- Need user registration / login
- Need role-based access control (ADMIN, CONSULTANT, CANDIDATE)
- Need server-side session management

### Options Considered
1. **Passport.js**: Mature, flexible, but lower-level (more code to write)
2. **Supabase Auth**: Hosted, but clouds provider lock-in, pricing model
3. **Auth.js**: Higher-level, great Next.js integration, open-source

### Why Auth.js
- Works seamlessly with Next.js App Router
- JWT sessions avoid database session lookups for the Credentials-only MVP
- Support for multiple providers (Credentials, OAuth) without rewrite
- Type-safe (TypeScript augmentation)
- Battle-tested by thousands of projects

### Trade-offs
- Credentials provider requires bcrypt (not federated)
- No built-in 2FA / passwordless (can be added)
- JWT sessions require a protected `AUTH_SECRET`; server-side route handlers
  still authorize every sensitive operation.

### Split configuration decision

The credentials provider stays in `auth.ts` because it uses Prisma and
`bcryptjs`, both Node-only. Middleware uses `auth.config.ts`, which contains
only Edge-compatible settings. JWT/session role callbacks are shared in
`auth.config.ts`; otherwise a login can succeed while middleware lacks the
role claim needed to authorize the destination route.

---

## 4. Zod for Validation (not Yup / Joi / Valibot)

### Decision
Use Zod for all schema validation.

### Context
- Validate user input on client (UX) and server (security)
- Share schema definition between client and server
- Catch errors before they reach the database

### Options Considered
1. **Yup**: Similar features, slightly heavier
2. **Joi**: Great for backend, but not as ergonomic for TypeScript
3. **Zod**: Lightweight, TypeScript-first, type inference

### Why Zod
- Infers TypeScript types automatically (`type LeadInput = z.infer<typeof schema>`)
- Plays well with React Hook Form
- Small bundle size
- Great error messages
- Single source of truth for validation

### Trade-offs
- Another dependency to maintain
- Requires understanding of schema composition

---

## 5. Tailwind CSS + Design Tokens (not styled-components / Chakra UI)

### Decision
Use Tailwind CSS with custom design tokens (no blue SaaS template).

### Context
- Need fast styling without context switching
- Need a cohesive visual brand (not generic)
- Need dark mode support (future)

### Options Considered
1. **styled-components**: Full CSS-in-JS, large bundle, runtime overhead
2. **Chakra UI**: Pre-built component system, but less design flexibility
3. **Tailwind CSS**: Utility-first, fast, customizable

### Why Tailwind
- No runtime overhead (all compiled to CSS)
- Design tokens via CSS variables (forest green, warm off-white palette)
- Utilities compose for a consistent system
- Easy to maintain and update

### Trade-offs
- Utility classes can feel verbose in JSX
- Learning curve (class composition)
- But trade-off is worth the performance and consistency

---

## 6. Framer Motion for Animations (not just CSS / Three.js)

### Decision
Use Framer Motion sparingly for intentional transitions (page enter, form steps, etc).

### Context
- Marketing site needs polish without feeling overdone
- Dashboard transitions should feel smooth but professional

### Options Considered
1. **CSS transitions only**: Limited control, no orchestration
2. **Three.js**: Overkill for this MVP, huge bundle
3. **Framer Motion**: Simple declarative animations, respects `prefers-reduced-motion`

### Why Framer Motion
- `<motion.div>` components are declarative
- Respects accessibility (reduced motion)
- Small bundle impact
- Great for coordinating multiple animations

### Trade-offs
- Another dependency
- Animations are optional (not core functionality)
- But adds perceived polish

---

## 7. Monolithic Deployment (not microservices yet)

### Decision
Keep everything in one Next.js deploy, one Postgres database.

### Context
- MVP scope doesn't justify microservices
- Single deploy pipeline is simpler
- Easier to reason about and debug

### When to Split (Future)
- When consultant dashboard becomes performance-critical
- When async jobs (email, AI) need dedicated workers
- When scale requires splitting

### Path to Microservices
- Each service layer (`lib/services/*`) is already isolated
- Prisma schema is modular (add new models without touching core)
- API routes can become standalone services (same schemas)
- Described in `docs/ARCHITECTURE.md`

### Trade-offs
- Single database means coordination overhead
- Harder to scale independent features
- But easier to build now

---

## 8. Internal MVP Booking Availability (not Calendly integration)

### Decision
For MVP, generate mock availability server-side; architect for later Calendly/Google Calendar swap.

### Context
- Real calendar integration requires OAuth + consultant availability setup
- MVP needs to show booking flow without external dependency
- MVP booking data needs to persist to Postgres

### Options Considered
1. **Calendly iframe**: Works, but data not in our database
2. **Google Calendar API**: Requires OAuth, consultant setup
3. **Internal availability model**: MVP approach, clear swap-out path

### Why Internal Model
```typescript
// getAvailableSlots() in booking-service.ts
// Returns mock future weekday slots
// Booking persists preferred date + time to database
// Later: replace getAvailableSlots() to call Calendly API
// Rest of code: unchanged
```

- Booking data stays in Postgres (for admin dashboard, emails, etc)
- No external vendor lock-in
- Clear migration path

### Trade-offs
- Availability is fake (clearly labeled)
- Consultant doesn't control calendar
- But architecture supports real calendar later

---

## 9. API Routes over Server Actions

### Decision
Use API routes for lead/booking creation (public endpoints), but server components + helpers for protected operations.

### Context
- Public forms need REST-style endpoints
- Admin operations need authorization
- Both need validation + persistence

### Options Considered
1. **Server Actions only**: Works, but harder to expose public APIs
2. **API routes only**: Works, but admin operations more verbose
3. **Hybrid**: Use the right tool for each

### Why Hybrid Approach
- Public forms → API routes (`POST /api/leads`, `/api/bookings`)
  - Can be called from anywhere (REST clients, mobile apps, etc)
  - Clear contract
- Protected operations → Server components + server actions + route handlers
  - Authorization is natural
  - Can fetch data server-side

### Trade-offs
- More code to maintain
- But clearer separation

---

## 10. Role-Based Access Control (not attribute-based)

### Decision
Implement three fixed roles: ADMIN, CONSULTANT, CANDIDATE.

### Context
- MVP scope is simple
- Most access decisions are role-based
- No need for fine-grained attributes yet

### Options Considered
1. **Attribute-based access control (ABAC)**: Flexible, complex
2. **Role-based access control (RBAC)**: Simple, sufficient for MVP
3. **No roles (public only)**: Doesn't work for admin

### Why RBAC
- Easy to reason about
- Sufficient for MVP
- Can upgrade to ABAC later

### Future Evolution
```
CANDIDATE
  ├─ read own profile
  ├─ read own bookings
  └─ read own documents

→ Attribute: user.id === resource.candidate_id
```

But for MVP, roles are enough.

---

## 11. Server-side Authorization (not just UI hiding)

### Decision
Authorization is checked at three levels:
1. Middleware (redirect)
2. Route handler (403)
3. Service layer (if accessible)

### Context
- Can't trust client state
- Users can tamper with browser storage
- Authorization must be server-side

### Options Considered
1. **Client-side only**: Terrible (trivially bypassed)
2. **Middleware only**: Better, but not enough (middleware can be bypassed)
3. **Multiple layers**: Defense in depth

### Why Multiple Layers
```
request → middleware check → route handler check → service logic
                ↓                      ↓                    ↓
         Redirect to /login     403 Forbidden        Sanitize data
```

Even if one layer is bypassed, others catch it.

### Trade-offs
- More code
- Repeated checks
- But security is worth it

---

## 12. Environment Variables (not config files)

### Decision
Store secrets in environment variables, populated from `.env.local` (dev) or CI/CD (production).

### Options Considered
1. **Hardcoded**: Never (don't do this)
2. **Config file (JSON)**: Risky (easy to commit secrets)
3. **Environment variables**: Standard, safe

### Why Environment Variables
- 12-factor app standard
- Never committed to version control
- Different per environment (dev, staging, production)

### Trade-offs
- Requires discipline (don't print them)
- CI/CD must provide them

---

## 13. Minimal Testing (Vitest, not E2E)

### Decision
Implement unit tests for validation, auth, and business logic; not full E2E.

### Context
- Internship assessment prioritizes feature completeness and UX
- Full E2E test coverage would slow down iteration
- Can still demonstrate testing discipline

### Options Considered
1. **No tests**: Risky, doesn't demonstrate testing
2. **Full E2E (Cypress/Playwright)**: Comprehensive, but slow to write
3. **Unit + some integration (Vitest)**: Balanced, demonstrates core logic

### Why Unit Tests
- Fast feedback loop
- Covers critical paths (auth, validation, conversions)
- Shows testing discipline

### Trade-offs
- Not comprehensive
- UI bugs may slip through
- But sufficient for MVP

---

## 14. Free-tier Deployment (Vercel + Railway / Render)

### Decision
Target free-tier deployment on Vercel + a free Postgres provider.

### Context
- Internship candidate likely has no budget
- Need to prove it actually runs somewhere
- Free tiers are sufficient for MVP load

### Options Considered
1. **AWS / GCP / Azure**: Paid, overkill
2. **Heroku**: Deprecated free tier
3. **Vercel + Railway**: Free (with limits), sufficient for MVP

### Why Vercel + Railway
- Vercel is optimized for Next.js
- Railway and Render offer free Postgres (10GB is plenty for MVP)
- Simple deployment (Git push → deploy)

### Limitations to Document
- Free tier may have downtime
- Database size limited to 10GB
- Request limits may apply
- But sufficient for demonstration

See `docs/DEPLOYMENT.md` for step-by-step instructions.

---

## 15. Monolithic Design System (no third-party components)

### Decision
Build component library from primitives (shadcn/ui) instead of grabbing a SaaS template.

### Context
- Need a cohesive, non-generic visual brand
- Most SaaS templates use blue + generic layouts
- shadcn/ui provides unstyled Radix UI primitives

### Options Considered
1. **Design system from scratch**: Time-consuming
2. **Buy Tailwind UI template**: Generic, limited customization
3. **shadcn/ui + customize**: Good balance

### Why shadcn/ui
- Copy-paste unstyled components
- Customize colors and spacing for brand
- Keeps dependencies minimal

### Trade-offs
- More design work (worth it for differentiation)
- Custom theme maintenance (manageable)

---

## Summary: Philosophy

**This MVP prioritizes:**
1. **Coherence**: One codebase, one database, one deploy
2. **Clarity**: Easy to understand flow (form → API → DB → dashboard)
3. **Completeness**: Every feature actually works
4. **Polish**: UX/UI is professional, not generic
5. **Scalability**: Path documented for growth without rewrites

**It deliberately avoids:**
- Premature optimization (single database, no caching)
- Premature complexity (no microservices, no event bus)
- Generic templates (custom design, not off-the-shelf)
- Overengineering (what's not needed is not built)

This is the right trade-off for an internship assessment.

---

## 16. Candidate-only discovery booking

### Decision
Only `CANDIDATE` sessions may create bookings or see the candidate booking form.

### Reason
Administrators and consultants are staff users. Treating their account identity as a candidate would create misleading records and make the workflow harder to reason about. The `/book` page therefore renders staff guidance for those roles, while `POST /api/bookings` independently returns `403` for non-candidates.

### Trade-off
Staff-created bookings are intentionally out of scope for this MVP. A future staff workflow can add an explicit candidate selector and audit trail.

---

For the why behind non-technical decisions, see `REQUIREMENTS.md` and the main `README.md`.
