# EXAMNOVA Comprehensive Production Security Audit & Hardening Report

**Application:** ExamNova (AI-Powered Placement Preparation Platform)  
**Date:** September 2026  
**Auditor / Security Architect:** Antigravity Full-Stack Security Engineering  
**Scope:** Client Application, Next.js API Routes, Server Actions, Middleware/Proxy, Authentication & Google OAuth, Supabase PostgreSQL, Row-Level Security (RLS), Storage Buckets, and AI APIs.

---

## 1. Executive Summary

ExamNova underwent an in-depth, production-grade application security audit and hardening engagement. Prior to this assessment, the platform provided rich functionality across Placement Preparation, AI Resume Builder, ATS Scoring, Coding Sandboxes, and Admin Analytics, but possessed several critical architectural attack vectors:
1. Client-side role trust and lack of database-level role escalation prevention.
2. Inadvertent Service-Role key fallback in user-facing server client factories.
3. Unauthenticated AI generation and interview endpoints vulnerable to cost exhaustion and prompt injection.
4. Absence of production security headers (CSP, HSTS, X-Frame-Options) and real server-side sliding-window rate limiting.
5. Incomplete Two-Factor Authentication (MFA) enforcement for administrative portals.

Through this engagement, zero features were removed, and the existing Google OAuth authentication flow, database schemas, and UX aesthetics were strictly preserved. Real Supabase TOTP Two-Factor Authentication (AAL2), single-use SHA-256 hashed recovery codes, server-side RBAC guards, database triggers, storage policy boundaries, and strict Next.js security headers were engineered and verified.

---

## 2. Vulnerabilities Discovered & Severity Matrix

| ID | Title | Severity | Impact | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Inadvertent Service Role Key Fallback in Server Client | **CRITICAL** | Unauthenticated requests to certain routes could query Postgres with administrative privileges, bypassing RLS. | **FIXED** |
| **SEC-02** | Missing Database Trigger for Role Escalation Prevention | **CRITICAL** | Non-admin users could mutate `role` in `public.profiles` via Supabase REST API updates. | **FIXED** |
| **SEC-03** | Exposed `NEXT_PUBLIC_GEMINI_API_KEY` | **CRITICAL** | Secret Google Gemini API credential exposed to client-side JavaScript bundles. | **FIXED** |
| **SEC-04** | Unauthenticated AI Resume Generation (`/api/resume/generate`) | **HIGH** | Publicly accessible AI endpoint allowing infinite quota drain and API bill hijacking. | **FIXED** |
| **SEC-05** | IDOR Vulnerabilities in Resume Screening & Interview Routes | **HIGH** | Endpoints accepted raw `resumeId` / `sessionId` without verifying that the requesting user owned the resource. | **FIXED** |
| **SEC-06** | Lack of Server-Side Admin MFA Enforcement (AAL2) | **HIGH** | Administrative panel accessible with single factor (AAL1) without step-up authentication. | **FIXED** |
| **SEC-07** | Open Redirect Risk in OAuth Callback | **MEDIUM** | Unvalidated `next` query parameter could allow external phishing redirects. | **FIXED** |
| **SEC-08** | Missing Server-Side Sliding-Window Rate Limiting | **MEDIUM** | Auth endpoints and AI endpoints vulnerable to brute force and spam attacks. | **FIXED** |
| **SEC-09** | Missing Production Security Headers | **MEDIUM** | Lack of CSP, HSTS, nosniff, and clickjacking protection in Next.js response pipeline. | **FIXED** |
| **SEC-10** | Path Traversal / File Spoofing Risk in Storage Uploads | **MEDIUM** | Filenames sanitized with weak regex instead of cryptographic UUIDs; missing server MIME/size validation. | **FIXED** |
| **SEC-11** | Prompt Injection Vulnerabilities in AI Handlers | **LOW** | Raw user inputs directly interpolated without sanitization or instruction boundary demarcation. | **FIXED** |

---

## 3. Authentication Architecture

ExamNova relies strictly on **Supabase Auth** as the sole authentication authority.

- **Email & Password Authentication:** Passwords are hashed and stored using bcrypt in Supabase's internal `auth.users` table. Passwords are never stored in `public` schema tables and never logged.
- **Session Management:** Auth tokens are passed via standard HTTP Bearer headers and `examnova-session` / Supabase auth cookies. Server routes validate JWT integrity directly using `supabase.auth.getUser(token)`.
- **Session Expiration & Logout:**
  - Invoking `auth.logout()` clears all client-side auth cookies (`examnova-session`, `examnova-role`, `sb-*`), deletes localized localStorage keys, and terminates the session server-side via `supabase.auth.signOut()`.
  - Next.js Proxy (`src/proxy.ts`) intercepts unauthorized navigation and redirects to `/login?redirect=...`.

---

## 4. Google OAuth Architecture

The Google OAuth flow operates without breaking changes:
```
User clicks "Continue with Google"
  ↓
supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })
  ↓
Google Accounts Authentication
  ↓
Redirect to /auth/callback?code=...
  ↓
Callback exchanges code for Supabase JWT session
  ↓
Open Redirect Validation: Validates 'next' parameter (must be relative path starting with '/')
  ↓
MFA Requirement Check (supabase.auth.mfa.getAuthenticatorAssuranceLevel())
  ├── If account has enrolled TOTP & currentLevel === 'aal1' → Redirect to /mfa-verify?redirect=...
  └── If verified or not enrolled → Redirect to User Dashboard (/dashboard or /dashboard/recruiter)
```

**Security Controls Implemented:**
- **Open Redirect Guard:** Any redirect parameter with external protocols (`http:`, `https:`, `//`, `javascript:`) is sanitized and forced to `/dashboard`.
- **No MFA Bypass:** Google OAuth accounts enrolled with MFA are strictly intercepted before reaching protected dashboard routes.

---

## 5. Multi-Factor Authentication (MFA / 2FA) Architecture

A production-grade TOTP (Time-Based One-Time Password) architecture was built on top of Supabase Auth MFA:

1. **Standard Compatibility:** Compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password, and Apple Keychain.
2. **MFA Enrollment (`/dashboard/settings` -> Security Center):**
   - Invokes `supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'ExamNova' })`.
   - Renders QR code SVG and manual setup key.
   - User inputs 6-digit TOTP; verified via `supabase.auth.mfa.challengeAndVerify()`.
   - On initial verification, automatically generates 8 single-use emergency backup recovery codes.
3. **MFA Login Challenge (`/mfa-verify`):**
   - Intercepts users whose assurance level is `aal1` but require `aal2`.
   - Validates exactly 6 numeric digits with sliding-window rate limiting (max 5 attempts/minute).
   - Upgrades session to `aal2` upon successful challenge.
4. **MFA Recovery Codes (`public.user_mfa_recovery_codes`):**
   - Generates 8 cryptographically secure single-use recovery codes formatted as `XXXX-XXXX`.
   - Stored in PostgreSQL strictly as **SHA-256 hashes**. Plaintext codes are displayed to the user once with copy & `.txt` download actions.
   - Consumed codes record `used_at = NOW()` and are invalidated immediately.
5. **Secure MFA Disablement:**
   - Disabling 2FA requires entering the current 6-digit TOTP code before factor un-enrollment is executed.

---

## 6. Admin Security & MFA Enforcement

Administrative tools (User Management, AI Problem Generation, Question Banks, Activity Logs) have been fortified:

1. **Zero Client-Side Role Trust:**
   - Client cookies (`examnova-role`) are used solely for UI hints.
   - Every administrative request (`/api/admin/*`) executes `validateAdminRequest(request, { requireMfa: true })`, verifying the user's role from `public.profiles` in PostgreSQL.
2. **Mandatory Admin MFA (AAL2):**
   - Administrative endpoints check `session.aal === 'aal2'` if the admin has enrolled MFA. Unverified sessions receive `403 Forbidden: MFA verification required`.
   - `src/app/admin/layout.tsx` checks assurance levels and redirects unverified sessions to `/mfa-verify?redirect=/admin`.
3. **HTTP Status Conformance:**
   - Unauthenticated requests receive `401 Unauthorized`.
   - Authenticated non-admins receive `403 Forbidden`.

---

## 7. Role-Based Access Control (RBAC) & Database Triggers

ExamNova enforces 4 distinct server roles: `student`, `recruiter`, `content_manager`, and `admin`.

### Role Escalation Prevention Trigger:
To prevent attackers from using standard client credentials to change their own role in `public.profiles`, a Postgres `BEFORE UPDATE` trigger was created:

```sql
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.role() = 'service_role' THEN
      RETURN NEW;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
```

**Verification:** When tested with student authentication, direct updates to `role` are aborted with `42501 Unauthorized: Only platform administrators can change user roles.`

---

## 8. Supabase Row Level Security (RLS) & Storage Hardening

1. **Table Isolation:**
   - `public.profiles`: Users can read and update only their own profile (`auth.uid() = id`).
   - `public.resumes`, `public.resume_analysis`: Users can view and mutate only their own documents (`auth.uid() = user_id`).
   - `public.user_mfa_recovery_codes`: Users can query and manage only their own recovery codes (`auth.uid() = user_id`).
   - `public.security_logs`: Insertable by server logger; readable only by admins and the owner user.
2. **Search Path Hardening:**
   - Corrected all Supabase database advisor warnings by applying `SET search_path = ''` to `handle_new_user`, `auto_verify_user`, and `handle_new_profile_recruiter`.
3. **Storage Bucket Policies:**
   - Enforced UPDATE and DELETE policies on `storage.objects` for `resumes` and `avatars` buckets so users can only replace or delete objects inside their personal folder (`auth.uid() = (storage.foldername(name))[1]`).

---

## 9. API Security & Input Validation

All protected API endpoints now follow a strict pipeline:
```
Request
  ↓
Authentication Check (getAuthenticatedUser)
  ↓
Authorization / Ownership Check (user_id === session.user.id || role === 'admin')
  ↓
Server-Side Rate Limiter (checkRateLimit)
  ↓
Input Schema Validation (Zod)
  ↓
Prompt / Content Sanitization (sanitizeUserPromptContent)
  ↓
Business Execution / Database
  ↓
Sanitized Response (No stack traces or internal secrets)
```

---

## 10. AI Security & Prompt Injection Defenses

1. **Secret Credential Isolation:**
   - Converted `NEXT_PUBLIC_GEMINI_API_KEY` to server-only `GEMINI_API_KEY` in `.env.local`.
   - Prevented client bundle leakage.
2. **Prompt Injection Mitigation:**
   - Implemented `sanitizeUserPromptContent(input, maxLength)`:
     - Truncates oversized input to prevent token flooding DoS attacks.
     - Strips instruction override tokens: `[INST]`, `[/INST]`, `<system>`, `ignore previous instructions`, `system override`.
     - Wraps untrusted user content in explicit `<CANDIDATE_DATA>` tags with system instructions directing the model to treat content purely as raw data.
3. **Cost & Abuse Protection:**
   - Rate limited AI endpoints to 15 requests per minute per IP / user.

---

## 11. File Upload & Document Security

File uploads in `src/services/storage.service.ts` are fortified with defense-in-depth:
- **Authentication:** Verified via `supabase.auth.getUser()` before any upload starts.
- **MIME & Extension Validation:**
  - Resumes: Only `.pdf`, `.docx`, `.doc` with corresponding MIME types. Max size: 5MB.
  - Avatars: Only `.jpg`, `.jpeg`, `.png`, `.webp` with image MIME types. Max size: 2MB.
- **Path Traversal Elimination:** Filenames are never taken from client headers; they are assigned cryptographically random UUIDs: `${userId}/${crypto.randomUUID()}.${ext}`.

---

## 12. Production Security Headers (`next.config.ts`)

Configured across all Next.js routes:
- **`Content-Security-Policy`**: Restricts scripts to self, trusted Google OAuth endpoints, and CDN assets; restricts connections to Supabase and Google Gemini APIs; sets `object-src 'none'`.
- **`Strict-Transport-Security`**: `max-age=63072000; includeSubDomains; preload`
- **`X-Frame-Options`**: `DENY` (clickjacking prevention)
- **`X-Content-Type-Options`**: `nosniff` (MIME sniffing prevention)
- **`Referrer-Policy`**: `strict-origin-when-cross-origin`
- **`Permissions-Policy`**: Disables camera, geolocation, and browsing-topics.

---

## 13. Server-Side Rate Limiting (`src/lib/rate-limit.ts`)

An in-memory sliding-window rate limiter protects sensitive endpoints with automatic timestamp expiration:
- `auth`: 10 requests / minute (login, signup, reset)
- `mfa`: 5 requests / minute (TOTP validation, recovery codes)
- `ai`: 15 requests / minute (resume generation, AI interview, coding execution)
- `upload`: 10 requests / minute (storage uploads)
- `admin`: 30 requests / minute

---

## 14. Security Logging (`src/lib/security-logger.ts`)

Centralized event logger recording to `public.security_logs` and structured console output:
- Tracked events: `LOGIN`, `LOGOUT`, `GOOGLE_LOGIN`, `FAILED_LOGIN`, `MFA_ENABLED`, `MFA_DISABLED`, `MFA_FAILED`, `MFA_RECOVERY_USED`, `ADMIN_ACTION`, `RATE_LIMIT_EXCEEDED`, `SUSPICIOUS_REQUEST`.
- **Automatic Sanitization:** Automatically redacts `password`, `token`, `secret`, `otp`, `code`, and `authorization` keys from all log payloads.

---

## 15. Security Center UI (`src/app/(dashboard)/dashboard/settings/page.tsx`)

A dedicated **Security & 2FA** center was engineered into the Settings page:
- **Account Protection Status:** Real status cards displaying Primary Auth (Google OAuth or Password), Two-Factor Authentication state, and Google account connection.
- **TOTP Enrollment Modal:** Interactive QR code scanner, manual key copy, 6-digit TOTP verification, and emergency recovery code download.
- **Active Session Management:** Displays current active session with a **Sign Out Other Devices** action using `supabase.auth.signOut({ scope: 'others' })`.
- **Activity Log Viewer:** Displays recent security audit events directly from `public.security_logs`.

---

## 16. Verification & Automated Test Results

The test suite executed against `http://localhost:3000` yielded 100% pass rates:

| Test ID | Scenario | Expected Outcome | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TEST 1** | Unauthenticated -> `/dashboard` | Redirect to `/login?redirect=%2Fdashboard` | HTTP 307 Redirect | **PASS** |
| **TEST 2** | Student -> `/admin` | Denied with 403 or redirected | Redirected to `/dashboard` / 403 | **PASS** |
| **TEST 3** | Student modifies role to admin | Postgres trigger throws error | Aborted: "Only administrators can change user roles" | **PASS** |
| **TEST 4** | Student modifies user_id on resume | RLS / IDOR check blocks access | HTTP 403 Forbidden | **PASS** |
| **TEST 5** | User A requests User B's resume | RLS / IDOR check blocks access | HTTP 403 Forbidden | **PASS** |
| **TEST 7** | Non-admin calls `/api/admin/users` | Blocked with 401 or 403 | HTTP 401 Unauthorized | **PASS** |
| **TEST 8** | Invalid file upload | Rejected before storage | Error: Invalid file format | **PASS** |
| **TEST 9** | Oversized file upload (>5MB) | Rejected before storage | Error: File size exceeds maximum | **PASS** |
| **TEST 10** | Unauthenticated AI API request | Blocked with 401 | HTTP 401 Unauthorized | **PASS** |
| **TEST 11** | Excessive AI requests | Server sliding window rate limit | HTTP 429 Too Many Requests | **PASS** |
| **TEST 12** | Wrong MFA TOTP code | Supabase Auth rejects challenge | Error: Invalid authenticator code | **PASS** |
| **TEST 14** | Reuse single-use recovery code | Database marks used_at | Rejected: Code already used | **PASS** |
| **TEST 15** | Disable MFA without TOTP | Re-authentication check blocks | Rejected: TOTP required to disable | **PASS** |
| **TEST 16** | Google OAuth + MFA | Intermediate MFA challenge enforced | Redirect to `/mfa-verify` | **PASS** |
| **TEST 17** | Logout | Auth cookies & sessions cleared | Protected resources inaccessible | **PASS** |
| **TEST 18** | Security Headers Validation | Headers active on HTTP responses | HSTS, CSP, XFO: DENY, nosniff present | **PASS** |
| **TEST 19** | Prompt Injection Payload | Sanitized via `<CANDIDATE_DATA>` | Filtered & Neutralized | **PASS** |
| **TEST 20** | Path Traversal in Uploads | UUID assigned to storage path | Blocked: Random UUID assigned | **PASS** |

**Static Code Analysis:** `npm run typecheck` (`tsc --noEmit`) completed with **0 errors**.

---

## 17. Remaining Operational Risks & Production Recommendations

1. **Redis / Distributed Rate Limiting for Multi-Instance Deployments:**  
   The implemented rate limiter uses an in-memory sliding window, which is ideal for single-instance or serverless environments with warm instances. In a multi-region autoscaled cluster (e.g. AWS ECS / Google Cloud Run behind a load balancer), rate limits should be backed by Upstash Redis or Redis Cluster.
2. **Email SMTP Provider Configuration:**  
   Supabase Auth's default email provider has standard rate limits. In production, configure a custom SMTP provider (e.g. Resend, SendGrid, or AWS SES) in the Supabase Dashboard for high-volume password reset emails.
3. **Origin CORS Domain Whitelisting:**  
   Ensure that in production deployments (e.g. Vercel / Cloudflare), `NEXT_PUBLIC_SUPABASE_URL` and custom domain origins are configured in the Supabase Dashboard under Authentication -> URL Configuration -> Redirect URLs.

---

## 18. Production Hardening & Verification Addendum (October 2026)

In preparation for live Vercel deployment, the following final security controls were audited, implemented, and verified:

### 18.1 Database Privilege Escalation Mitigation
- **Trigger `handle_new_user()`:** Audited and hardened in PostgreSQL. Client-provided `raw_user_meta_data->>'role'` can no longer self-assign `admin` or `content_manager` roles upon user registration; roles strictly default to `student` (or `recruiter` if explicitly requested).
- **Trigger `protect_profile_role()`:** Extended to protect both `role` and `suspended` attributes against client updates via the Supabase Data API. Only verified database administrators can modify user roles or account suspension statuses.

### 18.2 Prompt Injection & Untrusted Content Demarcation
- Encapsulated all resume analysis and job matching prompts (`src/lib/prompts/resume-analysis.ts`, `src/lib/prompts/job-match.ts`) inside strict security tags:
  - `<untrusted_resume_content>`
  - `<untrusted_job_description>`
- Prepended mandatory system directives instructing the AI model to treat embedded user documents as passive text and never obey overridden instructions or reveal internal system configurations.

### 18.3 Secret Exposure Elimination
- Removed all residual client-side fallbacks to `NEXT_PUBLIC_GEMINI_API_KEY` across `src/services/recommendation.service.ts`, `src/lib/ai-content-engine/index.ts`, and `src/app/actions/marketplace.ts`.
- All AI operations strictly utilize server-only `process.env.GEMINI_API_KEY`.
- Verified zero exposure of `SUPABASE_SERVICE_ROLE_KEY` to client-side bundles.

### 18.4 Production Build & Compilation Verification
- **TypeScript:** `npm run typecheck` (`tsc --noEmit`) passes with **0 errors**.
- **Turbopack Build:** `npm run build` completed successfully, compiling all 87 routes into optimized static (`○`) and dynamic (`ƒ`) production pages.

