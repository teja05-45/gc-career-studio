# Security Considerations

This document outlines security practices implemented in this MVP, assumptions, limitations, and recommendations for production hardening.

**IMPORTANT**: This is an MVP built for an internship assessment, not a production-ready system. It implements foundational security practices but has not undergone a professional security audit.

## Authentication Security

### Password Hashing
- **Algorithm**: bcrypt (via `bcryptjs`)
- **Salt rounds**: 12 (reasonable cost for MVP; production may adjust based on hardware)
- **Storage**: `passwordHash` stored in database, never plaintext

**Limitation**: No password reset / forgot-password flow implemented (but architecture supports it).

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

These are enforced both client-side (UX) and server-side (validation).

### Session Management
- **Strategy**: signed JWT (no Prisma adapter is configured for the Credentials-only MVP)
- **Role propagation**: the JWT/session callbacks are in the edge-safe shared
  Auth.js config so middleware and server handlers enforce the same role.
- **Cookie flags**: `httpOnly: true`, `secure: true` (in production)
- **Duration**: Default Next-Auth duration (30 days sliding window)

### Authentication configuration safeguard

The middleware uses Auth.js' split-config pattern because Prisma and bcrypt
are Node-only. JWT and session callbacks are intentionally kept in the shared
edge-safe config, rather than only in the Node auth route. This ensures a
role-bearing session is available before middleware authorizes a protected
route.

### Login Error Messages
- Deliberately generic: "Invalid email or password"
- Does not reveal whether email exists (prevents account enumeration)

## Authorization Security

### Server-side Enforcement
- **Middleware**: Redirects unauthenticated users, checks role
- **Route handlers**: Re-check session and role before accessing protected endpoints
- **Server components**: `requireRole()` helper enforces authorization before rendering

**Important**: Authorization is NEVER trusted from the client. Even if a user modifies `localStorage` or cookies, server-side checks prevent unauthorized access.

### Role-Based Access Control
```
ADMIN
  ├─ GET /api/admin/leads (list all)
  ├─ GET /api/admin/leads/[id] (view detail)
  ├─ PATCH /api/admin/leads/[id] (update status/notes)
  └─ GET /api/admin/bookings (list bookings)

CONSULTANT
  └─ /consultant (placeholder, limited access)

CANDIDATE
  └─ /dashboard (limited, own data only)

PUBLIC
  └─ /api/leads (POST only — create new lead)

AUTHENTICATED CANDIDATE
  └─ /api/bookings (POST only — create an owned booking)
```

### Booking Ownership and Availability
- `/api/bookings` accepts only `CANDIDATE` sessions; administrators and
  consultants are rejected on the server even if they call the endpoint directly.
- The payload intentionally excludes `userId`, `name`, and `email`. Candidate
  identity and `candidateId` are loaded from the server session and database.
- Service IDs, dates, and slots are checked server-side. A unique database
  constraint on active scheduling slots prevents duplicate inserts under races.

## Input Validation

### Zod Schemas
All user input validated with Zod, both client-side and server-side:
- Email format
- String lengths and patterns
- Enum values (career stage, status)
- Type coercion

**Defense in depth**: Client-side validation is for UX; server-side validation is the security boundary.

### Protected Against
- XSS (Next.js escapes by default)
- Invalid data types (Zod coerces/rejects)
- Oversized payloads (Next.js has built-in limits)

### Not Implemented (Future)
- Input sanitization for HTML (not needed; no rich text editor in MVP)
- Rate limiting (documented below)

## Secrets Management

### Environment Variables
All secrets stored in `.env.local` (never committed):
- `DATABASE_URL`: Postgres connection string
- `AUTH_SECRET`: Used to encrypt sessions
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Only used for seeding (not in code)
- `GROQ_API_KEY` / `GEMINI_API_KEY`: Optional (if AI feature is used)

### Never Exposed
- Secrets are never logged
- Secrets are never sent to the client
- Secrets are never committed to version control

### `.gitignore` Covers
```
.env
.env.local
.env.*.local
.env*.local
```

## API Security

### CORS
Not explicitly configured (Next.js defaults to same-origin).

### CSRF Protection
Handled implicitly by Auth.js (cookies are not exposed to cross-origin requests).

### API Rate Limiting
**Status**: Not implemented in MVP.

**Strategy for production**:
- Public endpoints (`POST /api/leads`, `POST /api/bookings`): 10 requests per IP per hour
- Auth endpoints (`POST /api/register`, `POST /api/auth/...`): 5 requests per IP per 15 minutes
- Admin endpoints: Rate-limit by user ID (trusted context)

**Implementation options**:
- Middleware using Redis (e.g., with `@next/rate-limit`)
- Vercel Rate Limiting (if deployed on Vercel)
- WAF rules (Cloudflare, AWS WAF)

### API Response Security
- No sensitive data in responses (e.g., no password hashes)
- Errors are generic (don't leak implementation details)
- No stack traces sent to client in production

## Database Security

### Connection
- `DATABASE_URL` includes credentials (stored in `.env`)
- SSL mode recommended for production (Postgres default is `prefer`)
- Pool connection limits configured by Prisma

### Permissions
- Application user (Postgres role) has minimal permissions (select, insert, update on necessary tables)
- Separate backup user with read-only access (production pattern)

### Data Protection
- No personally identifiable information (PII) is encrypted at rest (not implemented in MVP)
- Backups are assumed to be protected by infrastructure (Heroku, Vercel, AWS RDS)

**Recommendation for production**: Encrypt sensitive fields (email, phone) at application level using a library like `libsodium.js`.

## Deployment Security

### Environment-Specific Config
- **Development**: `NODE_ENV=development`, logging enabled
- **Production**: `NODE_ENV=production`, detailed logs suppressed, secure cookies

### HTTPS
- Production URL must use HTTPS
- `AUTH_URL` must match production domain
- Secure cookie flag ensures cookies only sent over HTTPS

### Security Headers (Not Implemented)
**Future additions**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Can be added via `next.config.mjs` or reverse proxy.

## Third-party Security

### Dependencies
- All dependencies from npm
- No audit issues in production dependencies (run `npm audit`)
- Lock file (`package-lock.json`) ensures reproducible installs

### Next-Auth / Auth.js
- Battle-tested, widely used
- Security updates followed closely
- OAuth providers (Google, GitHub) validated by Auth.js

### Prisma
- Official ORM, prevents SQL injection via parameterized queries
- Client-side schema generation (no exposure of database structure)

## Logging & Monitoring

### What's Logged
- Authentication attempts (failed logins)
- API errors (500s)
- Database errors

### What's NOT Logged
- Passwords (never)
- Full request bodies containing sensitive data
- Database credentials

**Production recommendation**: Use a centralized logging service (e.g., Loggly, Sentry) with PII redaction rules.

## Known Limitations & Risks

### Not Implemented
1. **Email verification**: Users can register with any email address
   - **Mitigation**: Future: send verification email before account is usable

2. **Password reset**: No way to recover lost password
   - **Mitigation**: Future: email-based reset token flow

3. **Two-factor authentication**: Not available
   - **Mitigation**: Future: TOTP or SMS-based 2FA

4. **Account lockout**: No protection against brute-force login attempts
   - **Mitigation**: Rate limiting (see above)

5. **Session revocation**: No way to manually revoke sessions (e.g., if password is compromised)
   - **Mitigation**: Sessions expire naturally; force password change flow (future)

6. **Audit logging**: No record of who did what when
   - **Mitigation**: Future: audit trail for admin actions

### Assumptions
1. **Postgres is trusted**: The database server is not compromised
2. **Environment variables are protected**: `.env` file is on a secure server, not in version control
3. **HTTPS is used in production**: HTTP is not acceptable for auth
4. **Network is trusted**: No man-in-the-middle attacks (relies on HTTPS/TLS)

### Attack Vectors NOT Addressed

1. **SQL Injection**: Mitigated by Prisma (parameterized queries)
2. **XSS**: Mitigated by Next.js (escaping by default)
3. **CSRF**: Mitigated by Auth.js (SameSite cookies)
4. **Clickjacking**: Not addressed; future: X-Frame-Options header
5. **Denial of Service**: Not addressed; mitigation is infrastructure-level

## Compliance Considerations

### Data Privacy
- **GDPR**: Not compliant (no data deletion, export, or privacy policy)
- **CCPA**: Not compliant (no opt-out mechanism)

**For production**: Implement user data export, deletion, and privacy policy.

### Data Retention
- **Leads**: No automatic deletion (policy TBD by GC Career Studio)
- **Bookings**: No automatic deletion (policy TBD)

**Recommendation**: Define retention policies (e.g., delete leads after 2 years of inactivity).

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] `AUTH_SECRET` is a strong, random 32-character string
- [ ] `DATABASE_URL` is the production Postgres URI with strong password
- [ ] HTTPS is enabled on the domain
- [ ] Environment variables are set on the hosting platform (not in code)
- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] `npm audit` passes (no critical vulnerabilities)
- [ ] Postgres backups are configured and tested
- [ ] Monitoring & alerting are in place
- [ ] Security headers are configured
- [ ] CORS is restricted appropriately
- [ ] Rate limiting is implemented on public endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Logging doesn't include passwords or tokens

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/going-to-production/security-checklist)
- [Auth.js Security](https://authjs.dev/concepts/faq)
- [Prisma Security](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/securing-passwords-and-data-in-your-database)

---

This document is a working security reference, not a comprehensive security audit. For production systems handling sensitive user data, engage a professional security firm for a full penetration test and security review.
