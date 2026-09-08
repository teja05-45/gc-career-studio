# Deployment Guide — Free Tier

This guide walks you through deploying GC Career Studio for free using Vercel + Railway (or Render) for Postgres.

## Prerequisites

- GitHub account (for version control + CI/CD)
- Vercel account (free)
- Railway or Render account (free Postgres)
- Node.js 18+ installed locally

## Step 1: Push to GitHub

```bash
# Initialize Git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GC Career Studio MVP"

# Create a new repository on GitHub.com (push instructions will appear)
git remote add origin https://github.com/YOUR_USERNAME/gc-career-studio.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Postgres (Railway)

### Option A: Railway (Recommended)

1. Go to https://railway.app/
2. Sign up with GitHub
3. Create a new project
4. Choose "Deploy from GitHub repo"
5. Select your `gc-career-studio` repo
6. Select "PostgreSQL" as the database
7. Railway auto-creates a PostgreSQL instance
8. In the PostgreSQL tab, copy the `DATABASE_URL`

### Option B: Render

1. Go to https://render.com/
2. Sign up with GitHub
3. Create a new "PostgreSQL Database"
4. Set "Free" tier
5. Name: `gc-career-studio-db`
6. Copy the internal connection string (shown after creation)

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "New Project"
4. Import your `gc-career-studio` repository
5. Set project name: `gc-career-studio`
6. Select "Next.js" framework (auto-detected)
7. Click "Configure Project" (optional, defaults work)
8. Under "Environment Variables", add:

   ```
   DATABASE_URL=<paste from Railway/Render>
   AUTH_SECRET=<generate: openssl rand -base64 32>
   AUTH_URL=https://gc-career-studio-YOUR_USERNAME.vercel.app
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=ChangeMe123!
   ```

   Click "Add" for each one.

9. Click "Deploy"

## Step 4: Run Database Migrations

After Vercel deployment succeeds:

```bash
# Pull environment variables
vercel env pull

# Run Prisma migrations
npx prisma migrate deploy

# Seed data (creates admin account, services, testimonials)
npx prisma db seed
```

You can run these commands locally after pulling env vars, or connect directly to Railway/Render Postgres.

## Step 5: Verify Deployment

1. Visit https://gc-career-studio-YOUR_USERNAME.vercel.app
2. You should see the homepage
3. Click "Book a discovery call" → should show booking form
4. Click "Contact" → should show lead form
5. Submit a test lead (goes to Postgres)
6. Sign in as admin: `admin@example.com` / `ChangeMe123!`
7. Visit `/admin` → should see dashboard with your test lead

## Step 6: Set Up a Custom Domain (Optional)

1. In Vercel project settings → "Domains"
2. Enter your domain (e.g., `careerstudio.com`)
3. Follow DNS instructions
4. Update `AUTH_URL` in Vercel environment variables to match domain

## Troubleshooting

### Deployment fails with "Failed to compile"

- Check build logs in Vercel dashboard
- Ensure TypeScript is strict: `npm run typecheck`
- Ensure ESLint passes: `npm run lint`

### Database migrations fail

- Check that `DATABASE_URL` is set in Vercel
- Ensure URL is not truncated (it's long)
- For Railway: click the PostgreSQL service, copy full connection string

### Admin login doesn't work

- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` were set in `.env.local` during seed
- Re-run seed if you change them: `npm run db:seed`
- Check `.env.local` locally after `vercel env pull`

### "AUTH_URL doesn't match" error

- Ensure `AUTH_URL` in Vercel environment matches your deployment URL
- If using custom domain, update to `https://yourdomain.com`
- Redeploy after changing

## Environment Variable Reference

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Postgres connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | 32-char base64 random string | `openssl rand -base64 32` |
| `AUTH_URL` | Your deployment URL | `https://gc-career-studio.vercel.app` |
| `ADMIN_EMAIL` | Email for seed admin | `admin@example.com` |
| `ADMIN_PASSWORD` | Password for seed admin (min 8 chars) | `ChangeMe123!` |
| `GROQ_API_KEY` | (Optional) Groq API key for AI | — |
| `GEMINI_API_KEY` | (Optional) Google Gemini API key | — |

## Updating Your Deployment

After making changes locally:

```bash
# Commit and push
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-deploys (watch https://vercel.com/dashboard)

# If you changed the schema:
vercel env pull
npx prisma migrate dev
git push
```

## Free Tier Limitations

- **Vercel**: 100 GB bandwidth/month, 1 GB function memory (plenty for MVP)
- **Railway**: 5GB storage, $5/month credit (usually covers small Postgres)
- **Render**: 100 concurrent connections, 256MB RAM (free tier has limits)

Monitor usage in your dashboards to avoid surprise bills.

## Moving to Production (when needed)

When the MVP is ready to serve real users:

1. **Database**: Upgrade to paid tier on Railway/Render (or use AWS RDS)
2. **Hosting**: Can stay on Vercel (paid) or move to Fly.io, Railway's paid tier
3. **Email**: Add transactional email (Mailgun, SendGrid) for notifications
4. **Monitoring**: Add error tracking (Sentry) and analytics (Vercel Analytics)
5. **CDN**: Enable edge caching (Vercel, Cloudflare) for marketing pages

But these steps aren't necessary for the MVP.

---

For local development, see the main `README.md` "Local Development" section.
