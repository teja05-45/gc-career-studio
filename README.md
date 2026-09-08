# GC Career Studio — MVP

A production-grade marketing website and admin platform for a career consultancy, built to demonstrate product thinking, UX/UI judgment, engineering quality, and scalability.

## Problem

Job seekers often face:

- **Unclear direction**: uncertain about next steps, feeling stuck
- **Weak positioning**: resume/LinkedIn don't reflect their actual value
- **Inefficient search**: applying broadly with little strategy or return
- **Poor interview preparation**: losing final-round opportunities

GC Career Studio solves this by providing structured, personalized career guidance — from strategy to execution.

## Solution

An MVP combining:

- **Marketing website**: clear value proposition, service discovery, trust-building through process and case studies
- **Lead generation**: contact form for lower-commitment inquiries
- **Booking system**: multi-step discovery call booking with internal MVP availability
- **Real authentication**: role-based access for candidates, consultants, and admins
- **Admin dashboard**: lead management (search, filter, status updates, notes), conversion tracking

The architecture is designed to scale into a full SaaS platform (candidate profiles, applications, career plans, consultant workflows) without rewriting the core.

## Product Goals

1. **Lead generation**: capture job seekers considering a paid service
2. **Discovery calls**: move qualified leads to phone conversations
3. **Trust building**: demonstrate credibility through clear process and sample outcomes
4. **Future SaaS foundation**: architected so candidate/consultant functionality can be added without core rewrites

## Target Users

### Persona 1: Early Career / Graduate
- **Needs**: direction, resume help, interview prep, job-search strategy
- **Pain**: confusion about career path, unsure how to position experience

### Persona 2: Working Professional
- **Needs**: career growth, role transition, resume/LinkedIn polish
- **Pain**: plateau without a clear next step, losing final-round interviews

### Persona 3: Career Switcher
- **Needs**: transition strategy, positioning in new field, credible roadmap
- **Pain**: worried background won't translate, unsure if switch is viable

## User Journey

### Primary (ready to commit)
Visitor → identify career challenge → explore services → build trust → sign in or create a candidate account → book discovery call → receive staff follow-up

### Secondary (not ready)
Visitor → explore content → submit lead form → follow-up via email/contact

## Features

### Public Website
- **Responsive marketing site**: home, services (dynamic listing), service details, how it works, success stories, about, contact, book
- **Trust indicators**: clear process (Discover → Assess → Strategize → Execute), sample case studies, FAQ
- **Lead forms**: contact form and multi-step booking flow, both persisted to Postgres

### Authentication
- **Registration**: email/password, CANDIDATE role only (admins provisioned separately)
- **Login**: credentials-based with hashed passwords (bcrypt)
- **Protected routes**: role-based access control enforced server-side + middleware
- **Session management**: Auth.js with Prisma adapter, JWT sessions

### Admin Dashboard
- **Metrics**: total leads, new leads, qualified, converted, conversion rate
- **Lead table**: search by name/email, filter by status, sort, view/update status, add notes
- **Lead detail**: full contact/career info, status/notes update, direct edit interface

### Candidate Dashboard (MVP)
- **Profile overview**: placeholder for future profile completion, appointments, services
- **Navigation**: link to book calls, explore services

### Consultant Dashboard (MVP)
- **Placeholder**: foundation for future assigned candidates, bookings, tasks

## Technology Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + design tokens (warm off-white, forest green palette, no blue default)
- **UI**: shadcn/ui primitives, customized to brand
- **Auth**: Auth.js (NextAuth v5) + bcrypt
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod (shared schemas, client + server)
- **Forms**: React Hook Form + zodResolver
- **Motion**: Framer Motion (subtle, intentional transitions)
- **Icons**: lucide-react
- **Testing**: Vitest (for validation, auth, business logic)

## Architecture

### High-level flow

```
Browser
   ↓
Next.js (App Router, Server Components by default)
   ├── (marketing) routes → Server-rendered, public
   ├── (auth) routes → Login/register
   ├── dashboard/admin/consultant → Protected, role-gated
   └── /api → Route handlers (public leads/bookings, protected admin)
   ↓
Auth.js middleware + route guards
   ├── Redirect unauthenticated to /login
   └── Redirect unauthorized roles to /dashboard
   ↓
Server Actions / Route Handlers
   ├── Zod validation
   ├── Role re-check server-side
   └── Prisma operations
   ↓
PostgreSQL
```

### Key decisions

- **Server Components first**: marketing site, forms, dashboards all render on server (less JS shipped)
- **Client Components only where interactivity requires**: booking flow step transitions, form submission, table filtering
- **Middleware + per-route guards**: defense in depth (middleware redirects, but each protected route re-checks)
- **Service layer abstraction**: data access (lead, booking, service) isolated in `lib/services/*`, so API routes and future server actions both use the same validation and database logic
- **Zod schemas as single source of truth**: same schema validates client form input and server payload, preventing double-validation or drift

### Authentication flow

```
User registers
   ↓
/api/register (POST)
   ├── Zod validation
   ├── Check if email exists
   ├── Hash password (bcrypt)
   └── Create CANDIDATE user
   ↓
Auto-sign in with credentials provider
   ↓
Session created via Auth.js + Prisma adapter
   ↓
Token includes user.id + user.role
   ↓
Protected routes check session + role in middleware + server
```

### Authorization

Every protected route enforces authorization at two levels:

1. **Middleware** (`middleware.ts`): redirects unauthenticated users to /login, redirects unauthorized roles to /dashboard
2. **Server function** (`requireRole()` in `lib/auth/rbac.ts`): re-checks session and role before returning data

This ensures even if middleware is bypassed (by calling a route handler directly), authorization is still enforced.

### Lead/Booking flow

```
Lead submission (form or booking)
   ↓
/api/leads or /api/bookings (POST)
   ├── Zod validation
   ├── Create Lead/Booking in Postgres
   └── Return 201 with created object
   ↓
Admin views lead in /admin dashboard
   ↓
Admin clicks lead → /admin/leads/[id]
   ├── Server fetches lead data
   ├── Display in AdminLeadDetail form
   └── Allow status + notes update (PATCH /api/admin/leads/[id])
   ↓
Lead status updated in Postgres
```

## Database Design

### Core Models

```
User
  ├── id (cuid)
  ├── email (unique)
  ├── passwordHash (bcrypt)
  ├── role (enum: ADMIN, CONSULTANT, CANDIDATE)
  ├── name
  ├── createdAt, updatedAt
  └── relations: accounts, sessions, bookingsAsCandidate, bookingsAsConsultant

Service (data-driven)
  ├── id (cuid)
  ├── slug (unique) — used in URLs
  ├── title, summary, description
  ├── problem, whoFor, included[], process (JSON), outcomes[], faq (JSON)
  ├── isActive, order
  └── relations: leads[], bookings[]

Lead
  ├── id (cuid)
  ├── name, email, phone
  ├── careerStage (enum)
  ├── currentRole
  ├── message (optional)
  ├── serviceId (foreign key → Service)
  ├── status (enum: NEW, CONTACTED, QUALIFIED, CONVERTED, CLOSED)
  ├── notes (internal only)
  └── createdAt, updatedAt

Booking
  ├── id (cuid)
  ├── name, email, phone
  ├── careerStage, currentRole, targetRole, careerGoal, additionalContext
  ├── serviceId (foreign key → Service)
  ├── preferredDate, preferredSlot (MVP-internal availability)
  ├── candidateId (foreign key → authenticated candidate User)
  ├── consultantId (foreign key → User, assigned by admin)
  ├── status (enum: PENDING, CONFIRMED, CANCELLED, COMPLETED)
  ├── notes
  └── createdAt, updatedAt

Testimonial
  ├── id (cuid)
  ├── name, role
  ├── challenge, approach, outcome
  ├── isDemo (boolean — all marked true for MVP)
  ├── order
  └── createdAt, updatedAt

// Auth.js Prisma adapter tables
Account (OAuth accounts)
Session (user sessions)
VerificationToken (password reset, email verification)
```

### Indexes

- User: `(role)`, `(email unique)`
- Service: `(slug unique)`, `(isActive, order)`
- Lead: `(status)`, `(email)`, `(createdAt)`
- Booking: `(status)`, `(preferredDate)`

## Folder Structure

```
gc-career-studio/
├── app/
│   ├── (marketing)/              # Public marketing site
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Homepage
│   │   ├── services/
│   │   ├── services/[slug]/      # Service detail
│   │   ├── how-it-works/
│   │   ├── success-stories/
│   │   ├── about/
│   │   ├── contact/
│   │   └── book/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # Candidate dashboard
│   ├── consultant/               # Consultant dashboard
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── page.tsx
│   │   └── leads/[id]/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── register/
│   │   ├── leads/
│   │   ├── bookings/
│   │   ├── services/
│   │   └── admin/
│   │       ├── leads/
│   │       └── bookings/
│   ├── layout.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
├── components/
│   ├── ui/                       # Primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   └── ...
│   ├── marketing/                # Marketing components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── service-card.tsx
│   │   ├── testimonial-card.tsx
│   │   └── ...
│   ├── forms/                    # Form components
│   │   ├── lead-form.tsx
│   │   ├── booking-flow.tsx
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── admin/                    # Admin-specific components
│   │   ├── leads-table.tsx
│   │   └── lead-detail.tsx
│   └── providers/
│       └── session-provider.tsx
├── lib/
│   ├── auth/
│   │   └── rbac.ts               # Role-based access guards
│   ├── db/
│   │   └── prisma.ts             # Prisma client singleton
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── lead.ts
│   │   └── booking.ts
│   ├── services/
│   │   ├── service-catalog.ts
│   │   ├── lead-service.ts
│   │   └── booking-service.ts
│   ├── data/
│   │   └── services.ts           # Service seed data
│   └── utils.ts                  # Shared utilities, enums, labels
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
├── tests/
│   └── lib/
│       ├── validations.test.ts
│       └── services.test.ts
├── public/
├── auth.ts                       # Auth.js config (Node runtime)
├── auth.config.ts                # Auth.js split config (Edge runtime)
├── middleware.ts                 # Middleware (route protection)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .dockerignore
└── README.md
```

## Environment Variables

Never commit secrets. Copy `.env.example` → `.env`, fill in real values, and pass the same names into Docker / Vercel.

**The `DATABASE_URL` rule that prevents most deploy failures:**

- **On Vercel:** the Prisma Postgres integration **injects `DATABASE_URL` automatically.** Do **not** add your own value in the Vercel dashboard.
- **Locally (for `npx prisma db push` / `npm run db:seed`):** set `DATABASE_URL` in `.env` to the **direct, non-pooled** connection string from the Prisma Postgres panel (host `db.prisma.io`, `?sslmode=require`).
- An **already-set OS environment variable** named `DATABASE_URL` **always overrides `.env`**. If Prisma ever connects to a host you don't recognize, check for a stale one (`echo %DATABASE_URL%`).

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string used by Prisma. Injected on Vercel; set locally to the direct Prisma Postgres URL for CLI commands |
| `AUTH_SECRET` | Yes in production | Auth.js session signing key. Generate with `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Public origin of the app (`http://localhost:3000` locally) |
| `ADMIN_EMAIL` | For first admin | Seeded admin login. Default in Docker: `admin@example.com` |
| `ADMIN_PASSWORD` | For first admin | Seeded admin password (min 8 chars). Default in Docker: `TestPassword123` |
| `ADMIN_NAME` | No | Display name for the seeded admin |
| `GROQ_API_KEY` / `GEMINI_API_KEY` | No | Optional Career Direction Assistant. The app runs without them |

For local Docker / Node runs, a minimal file:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gc_career_studio
AUTH_SECRET=replace-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMeImmediately123
```

---

## How to deploy

There are three supported ways. **Option A (Docker Compose) is the path this repo is built for** — the same stack used in development. Pick one and follow every step in order.

### Option A — Docker Compose (recommended)

This starts Postgres + the Next.js app together. On first start the container applies the Prisma schema (`prisma db push`) and seeds services, demo testimonials, and the admin account.

#### 1. Install Docker

- Windows / macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Linux: Docker Engine + the Compose plugin

Confirm:

```bash
docker --version
docker compose version
```

#### 2. Open a terminal in the project root

```bash
cd gc-career-studio
```

You should see `docker-compose.yml`, `Dockerfile`, and `prisma/` in that folder.

#### 3. Set production secrets (do this before the first start)

Create a `.env` file next to `docker-compose.yml` (Compose reads it automatically):

```
AUTH_SECRET=paste-the-output-of-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=pick-a-strong-password-at-least-8-chars
```

If you skip this file, Docker still starts, but it uses the compose defaults (`AUTH_SECRET=change-me-in-production`, `ADMIN_EMAIL=admin@example.com`, `ADMIN_PASSWORD=TestPassword123`). Change those before exposing the app.

`AUTH_URL` must be the URL people type in the browser. For a VPS or custom domain, set it to `https://your-domain.com` and redeploy.

#### 4. Build and start

```bash
docker compose up --build
```

First run takes several minutes (npm install + `next build` inside the image). Leave this terminal open. You will see:

1. Postgres become healthy
2. `npx prisma db push` apply the schema
3. `npm run db:seed` create services + the admin user
4. `next start` bind port 3000

#### 5. Open the site

Visit [http://localhost:3000](http://localhost:3000).

| What | Where |
|---|---|
| Marketing site | http://localhost:3000 |
| Contact form (creates a Lead) | http://localhost:3000/contact |
| Register / login | http://localhost:3000/register · http://localhost:3000/login |
| Admin dashboard | http://localhost:3000/admin |

Sign in as admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Change that password after the first login.

#### 6. Confirm data is live

1. Submit the contact form (name, email, and career stage are required).
2. Refresh `/admin`. Total leads should increment and the row should appear.
3. Bookings come from `/book` (signed-in candidate) and are a separate table — they do not count as leads.

#### 7. Everyday commands

```bash
# Start in the background
docker compose up -d --build

# Follow app logs
docker compose logs -f app

# Stop (keeps the Postgres volume — leads and bookings stay)
docker compose down

# Stop AND wipe the database (destructive)
docker compose down -v
```

Restarting with `docker compose up` re-runs seed. Seed is upsert/idempotent for services and the admin account; it will not delete existing leads or bookings.

#### 8. Deploy the same Compose file on a VPS

1. Copy the project onto the server (git clone, or `scp`).
2. Install Docker there.
3. Set `.env` with a strong `AUTH_SECRET`, your real `AUTH_URL` (`https://your-domain.com`), and a unique admin password.
4. Run `docker compose up -d --build`.
5. Point a reverse proxy (Caddy / nginx) at `127.0.0.1:3000` and terminate TLS.
6. Open port 3000 only on localhost if a proxy is in front; do not expose Postgres (`5432`) to the public internet.

---

### Option B — Local Node.js + Postgres (no Docker app)

Use this when you already have Postgres and want `npm run dev` or `npm start`.

#### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ listening on `localhost:5432` (or update `DATABASE_URL`)

You can still run **only** the database with Docker:

```bash
docker compose up -d db
```

#### 2. Install packages

```bash
npm install
```

#### 3. Create `.env.local`

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gc_career_studio
AUTH_SECRET=replace-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMeImmediately123
```

Create the database if it does not exist:

```bash
createdb gc_career_studio
# or in psql: CREATE DATABASE gc_career_studio;
```

#### 4. Apply the schema and seed

This repo’s checked-in Prisma migrations are incremental `ALTER`s, not a full baseline. A **new** database should use `db push` (same as Docker), not `prisma migrate deploy`.

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

`npm run db:migrate` (`prisma migrate dev`) is for adding **new** migrations during development after the schema already exists.

#### 5. Run

Development:

```bash
npm run dev
```

Production-style local process:

```bash
npm run build
npm start
```

Visit http://localhost:3000 and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

#### 6. Useful database commands

```bash
npm run db:studio    # Prisma Studio GUI
npm run db:seed      # re-seed services + admin (does not wipe leads)
```

---

### Option C — Vercel + Prisma Postgres (public URL)

The path used to deploy this project to production. The Next.js app runs on Vercel; the database is **Prisma Postgres**, connected through the Vercel Storage integration.

> **The one step everyone misses:** Vercel builds the app but **nothing creates or seeds the production database for you.** Skip the `db push` + `db seed` step and every server-side query fails at runtime with `The table "public.X" does not exist` — even though the build succeeded. That "Application error: a server-side exception" page is almost always this.

#### 1. Push the repo to GitHub

```bash
git init
git add .
git commit -m "Initial commit: GC Career Studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gc-career-studio.git
git push -u origin main
```

#### 2. Import the project on Vercel (framework preset matters!)

1. Go to [vercel.com](https://vercel.com/), **Add New… → Project**, import `gc-career-studio`.
2. Make sure the **Framework Preset says "Next.js"** (it auto-detects on import from GitHub).
   - ⚠️ If it ever reads "Other", the build fails with `Error: No entrypoint found. Searched for: src/main.{js,cjs,…}`. **Fix:** re-import via the GitHub flow, or set Framework Preset → Next.js manually. Do **not** add a `vercel.json` — it doesn't help and can make things worse.
3. Build command stays `next build`.

#### 3. Create the database (Vercel Storage → Prisma Postgres)

1. In the Vercel project, go to **Storage → Create Database → Prisma Postgres**.
2. Pick a region, hit create.
3. The integration **automatically injects `DATABASE_URL` into your project's environment variables** (Production + Preview). It also gives you two connection strings in its panel:
   - **pooled** — what the app uses on Vercel (injected for you)
   - **direct** (host `db.prisma.io`, `?sslmode=require`) — used for local `db push`/`db seed`

   **Do not paste your own `DATABASE_URL` over the injected one in Vercel.**

#### 4. Add the non-database environment variables in Vercel

Project → Settings → Environment Variables → (Production + Preview):

```
AUTH_SECRET=<output of: openssl rand -base64 32>
AUTH_URL=https://gc-career-studio.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<min 8 chars, change after first login>
```

Leave `DATABASE_URL` alone — it's already there from the integration. After the first deploy, update `AUTH_URL` to the *exact* URL Vercel reports (no trailing slash) if it differs, then **Redeploy**.

#### 5. Deploy

Click **Deploy** (or push to `main`). The build should turn **Ready**. This does **not** mean the site works yet — the database is empty.

#### 6. Push the schema + seed the production database (from your machine)

This must run **once, against the Prisma Postgres database,** not locally.

1. Copy the **direct** connection string from the Storage panel into your `.env`:
   ```
   DATABASE_URL=postgres://<the-direct-non-pooled-url>@db.prisma.io:5432/postgres?sslmode=require
   ```
   (Or run the commands with the variable set in-shell — see the shell syntax below. `.env` is cleaner because Prisma CLI auto-loads it.)
2. Run, from the project root:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   You should see the schema sync, then `Admin account ready: admin@example.com`.

⚠️ **Windows shell gotchas** (do not use `DATABASE_URL="..." npx ...` inline):

| Shell | Correct syntax |
|---|---|
| cmd | `set "DATABASE_URL=postgres://..." && npx prisma db push` |
| PowerShell | `$env:DATABASE_URL="postgres://..."; npx prisma db push` |
| Git Bash | `DATABASE_URL="postgres://..." npx prisma db push` |

If Prisma still resolves to a **Railway** or other foreign host (`postgres.railway.internal`), a stale `DATABASE_URL` env var set on your OS is overriding everything. Check `echo %DATABASE_URL%` and delete it (Windows → System → Environment Variables) — env vars always beat `.env`.

Why not `prisma migrate deploy`? The checked-in migration folder is incremental `ALTER`s, not a baseline — it will fail on an empty database. `db push` is the correct tool for fresh databases, and Docker Compose uses the same approach.

#### 7. Verify

1. Open `AUTH_URL` — homepage loads with services + testimonials (**this proves the DB has data**).
2. `/contact` — submit a test lead (career stage required).
3. `/login` — admin email/password from step 4.
4. `/admin` — the test lead is listed; KPI cards show real numbers.
5. Refresh `/admin` — numbers persist (from Postgres, not a cache).

#### 8. Custom domain (optional) / later deploys

- Vercel project → Settings → Domains → add the domain, follow DNS. Set `AUTH_URL=https://your-domain.com` and **Redeploy**.
- Later deploys: `git add . && git commit -m "..." && git push origin main` — Vercel rebuilds automatically.
- If you changed `prisma/schema.prisma`, re-run `npx prisma db push` against the hosted database after the build.

---

### After any deploy — smoke checklist

- [ ] Homepage renders
- [ ] `/contact` creates a row in `leads` (visible on `/admin`)
- [ ] `/register` + `/login` work for a candidate
- [ ] `/book` requires a signed-in **candidate** and creates a `bookings` row
- [ ] `/admin` is blocked for candidates (redirect) and for signed-out users (`/login`)
- [ ] Admin password is no longer the compose default if the site is public

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Can't reach database server` | Wrong host, Postgres not up, or `localhost` used inside Docker | In Compose the host must be `db`, not `localhost`. Wait until the db service is healthy. |
| Build fails on Vercel | TypeScript / ESLint | Run `npm run typecheck` and `npm run lint` locally. |
| Admin login fails | Seed never ran, or env vars differ from what you type | Re-run `npm run db:seed` with the same `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Password must be ≥ 8 characters. |
| Session / CSRF / “URL mismatch” | `AUTH_URL` ≠ the URL in the browser | Set `AUTH_URL` to the exact origin (`https://…` with no trailing slash) and restart / redeploy. |
| `/admin` shows 0 leads after a contact submit | You booked a call (`/book`) rather than `/contact`, or you are looking at a different database | Contact form → `leads`. Booking form → `bookings`. Confirm `DATABASE_URL` is the same for the app that wrote the row. |
| `prisma migrate deploy` errors on a fresh database | Migrations in this repo are incremental only | Use `npx prisma db push` for new databases (Docker already does this). |
| "Application error: a server-side exception" (deploy succeeded; runtime logs show `The table public.X does not exist`) | Schema was never pushed to the **production** database | Run `npx prisma db push` + `npm run db:seed` against the direct Prisma Postgres URL (see Option C step 6). |
| Vercel build fails: `Error: No entrypoint found. Searched for: src/main…` | Framework Preset is "Other", not Next.js | Set Framework Preset → Next.js (or re-import from GitHub). Do not add a `vercel.json`. |
| Prisma CLI/`db push` says `Environment variable not found: DATABASE_URL` | `DATABASE_URL="…" npx prisma …` inline prefix doesn't work in cmd/PowerShell | Use `set "DATABASE_URL=…" && npx prisma …` (cmd) or `$env:DATABASE_URL="…"; npx prisma …` (PowerShell). |
| Prisma connects to `postgres.railway.internal` or another host you don't use | A stale `DATABASE_URL` set as an OS env var overrides `.env` | `echo %DATABASE_URL%`, then delete it (Windows → System → Environment Variables) or override it in-shell. |
| Port 3000 already in use | Another `next dev` or Compose stack | Stop it, or change the published port in `docker-compose.yml`. |

More architecture notes: `docs/ARCHITECTURE.md`. Security assumptions: `docs/SECURITY.md`. The older free-tier sketch in `docs/DEPLOYMENT.md` is superseded by this section.
## Security Considerations

⚠️ This is an MVP. See `docs/SECURITY.md` for detailed assumptions and limitations.

**Key practices:**
- Passwords hashed with bcrypt, never stored plaintext
- Role-based authorization enforced server-side, not just UI
- Input validated with Zod on client and server
- Secrets stored in environment variables, never in code
- CSRF protection via Auth.js
- HTTP-only cookies for sessions

**Not implemented (out of MVP scope):**
- Rate limiting (documented strategy in SECURITY.md)
- Email verification / password reset (documented for future)
- 2FA / OAuth (architected for, not implemented)

## Performance & Accessibility

- **Performance**: server rendering, minimal client JS, image optimization, font optimization
- **Accessibility**: semantic HTML, keyboard navigation, focus states, ARIA labels, sufficient contrast, `prefers-reduced-motion` support

## SEO

- Metadata, Open Graph tags, semantic URLs
- Sitemap + robots.txt
- Proper heading hierarchy

## Optional: AI Career Assistant

If `GROQ_API_KEY` or `GEMINI_API_KEY` is set, an optional "Career Direction Assistant" endpoint exists at `/api/ai/career-assistant`. The app runs fully without it — the feature gracefully degrades.

## Scalability & Future Roadmap

### Phase 2: Candidate Profiles
- Authenticated candidates can set career goals, upload documents
- Track career plan progress

### Phase 3: Consultant Workflows
- Consultants assigned to bookings
- Task/notes management
- Calendar integration

### Phase 4: Applications & Career Plans
- Candidates track applications
- Collaborative career planning with consultant

### Phase 5: Notifications & Messaging
- Email notifications for bookings, status updates
- In-app messaging between candidate and consultant

### Phase 6: Advanced Analytics
- Conversion funnel analysis
- Consultant performance dashboards

### Phase 7: Automation & Integrations
- CRM sync (HubSpot, Pipedrive)
- Calendar integration (Google Calendar, Calendly)
- Email automation (Mailgun, SendGrid)

## Testing

Run the test suite:

```bash
npm test
npm test:watch
```

Includes:
- Validation schema tests
- Authentication flow tests
- Lead/booking creation tests
- Role-based access tests

## Assumptions & Known Limitations

See `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/DECISIONS.md` for detailed assumptions, trade-offs, and limitations.

## Open Questions for GC Career Studio

1. **Company info**: Who is the primary audience? What differentiates GC Career Studio?
2. **Services**: Confirmed service list, pricing, testimonials?
3. **Website goal**: Primary KPI (leads, calls booked, something else)?
4. **Lead management**: Where should leads ultimately sync (CRM, Slack, manual)?
5. **Calendar**: Existing integration (Calendly, Google) or MVP internal booking?
6. **Future direction**: Which comes first — candidate accounts, consultant workspace, or both?

See `REQUIREMENTS.md` for the full discovery list.

## Author
Teja Matta