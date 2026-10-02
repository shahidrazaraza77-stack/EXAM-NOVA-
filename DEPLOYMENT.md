# ExamNova — Production Deployment & DevOps Runbook

This guide covers everything required to deploy **ExamNova** to **Vercel** with **Supabase**, **Google OAuth**, and **Google Gemini AI**.

---

## 1. System Architecture

```
User (Browser / Mobile / Desktop)
   │
   ▼ HTTPS
Vercel Edge & Node.js Runtime (Next.js 16 App Router)
   │
   ├── src/proxy.ts (Auth guards & route authorization)
   │
   ├── Supabase Auth (Email + Google OAuth + TOTP MFA)
   │
   ├── Supabase PostgreSQL Database (83 Tables, Row Level Security)
   │
   ├── Supabase Storage (Buckets: `resumes`, `avatars`)
   │
   └── Google Gemini AI API (Server-side ATS analysis & coaching)
```

---

## 2. Prerequisites

1. **Git Repository**: Code pushed to GitHub, GitLab, or Bitbucket.
2. **Vercel Account**: [https://vercel.com](https://vercel.com)
3. **Supabase Project**: [https://supabase.com/dashboard/project/iwpsckraxqrnkcfwdmgf](https://supabase.com/dashboard/project/iwpsckraxqrnkcfwdmgf)
4. **Google Cloud Console**: [https://console.cloud.google.com](https://console.cloud.google.com) for OAuth credentials.
5. **Google AI Studio**: [https://aistudio.google.com](https://aistudio.google.com) for Gemini API key.

---

## 3. Environment Variables for Vercel

In your **Vercel Project Dashboard** (`Settings` -> `Environment Variables`), configure the following variables for the **Production** environment:

| Variable Name | Value Description | Public / Private |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iwpsckraxqrnkcfwdmgf.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your Supabase anon key)* | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | *(Your Supabase publishable key)* | Public |
| `NEXT_PUBLIC_SITE_URL` | `https://your-production-domain.com` *(or your Vercel deployment URL)* | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase service_role secret key)* | **Private (Server-only)** |
| `GEMINI_API_KEY` | *(Your Google Gemini API key)* | **Private (Server-only)** |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | `825535258165-on4bhc17fikjdt21g8le5b2b4vs6e5kt.apps.googleusercontent.com` | Private |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | *(Your Google Client Secret)* | Private |

> [!CAUTION]
> **NEVER** add `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix. They must remain strictly server-side.

---

## 4. Supabase Production Configuration

### A. Authentication URL Configuration
1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/iwpsckraxqrnkcfwdmgf/auth/url-configuration](https://supabase.com/dashboard/project/iwpsckraxqrnkcfwdmgf/auth/url-configuration)
2. **Site URL**:
   - Set to your production URL: `https://your-domain.com` (or `https://exam-nova.vercel.app`)
3. **Redirect URLs (Allow List)**: Add both local and production callback paths:
   ```text
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   http://127.0.0.1:3000/**
   https://your-domain.com/**
   https://your-domain.com/auth/callback
   https://*.vercel.app/**
   https://*.vercel.app/auth/callback
   ```

### B. Storage Buckets
Ensure the following buckets exist in Supabase Storage (`Storage` tab):
- **`resumes`**: Private bucket for user resumes. Managed via user-isolated paths (`{userId}/{uuid}.pdf`).
- **`avatars`**: Public bucket for profile pictures.

### C. Database RLS & Schema
- All 83 tables have **Row Level Security (RLS)** active.
- `handle_new_user()` enforces strict server-side RBAC so user metadata cannot self-elevate to `admin`.
- `protect_profile_role()` prevents non-admins from changing roles or un-suspending accounts.

---

## 5. Google Cloud OAuth Configuration

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Select your OAuth 2.0 Client ID (`825535258165-on4bhc17fikjdt21g8le5b2b4vs6e5kt.apps.googleusercontent.com`).
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `https://your-domain.com`
   - `https://*.vercel.app`
4. Under **Authorized redirect URIs**, add your Supabase Auth callback URI:
   - `https://iwpsckraxqrnkcfwdmgf.supabase.co/auth/v1/callback`

---

## 6. Vercel Deployment Step-by-Step

### Option A: Via Vercel Web Dashboard (Recommended)
1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import your `exam-nova` repository.
4. Framework Preset: **Next.js** (auto-detected).
5. Build Command: `npm run build` (or leave default).
6. Expand **Environment Variables** and paste the variables from **Section 3**.
7. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 7. Custom Domain Configuration (e.g. `examnova.in`)

1. In Vercel Project Dashboard, navigate to **Settings** -> **Domains**.
2. Enter your domain (e.g., `examnova.in` and `www.examnova.in`).
3. Add the DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - **Apex Domain (`examnova.in`)**:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **Subdomain (`www.examnova.in`)**:
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`
4. Vercel automatically provisions and renews SSL/TLS certificates via Let's Encrypt.
5. After your domain is active, update `NEXT_PUBLIC_SITE_URL` in Vercel to `https://examnova.in`.

---

## 8. Post-Deployment Verification & Smoke Test

Perform the following smoke tests on the live production URL:
1. **Homepage & Static Pages**: Visit `/`, `/about`, `/features`, `/pricing` — verify fast loading and responsive layout.
2. **Registration**: Sign up with a test email address — verify email confirmation or immediate login.
3. **Google OAuth**: Click "Continue with Google" on `/login` — verify seamless redirect to Supabase -> Google -> `/auth/callback` -> `/dashboard`.
4. **MFA (2FA)**: In `/dashboard/settings`, click **Enable 2FA** — scan QR code in Google Authenticator / Authy, enter 6-digit code, save recovery codes.
5. **Resume Upload & ATS Parsing**: Upload a resume in `/dashboard/resume-builder` — verify text extraction, ATS score generation, and AI feedback.
6. **AI Features**: Test Interview Coach (`/dashboard/interview-coach`) and Coding Practice (`/dashboard/coding`) hints/reviews.
7. **Admin Security**: Log in as a normal student account and attempt to access `/admin` or `/api/admin/users` — verify access is blocked with `403 Forbidden`.
8. **Logout**: Click Logout — verify all session cookies are purged and you are returned to `/login`.

---

## 9. Rollback Procedure

If any unexpected error occurs in production:
1. In the Vercel Dashboard, go to **Deployments**.
2. Locate the previous working deployment.
3. Click the three dots (`...`) -> **Rollback to this deployment**.
4. Traffic is instantly routed back to the previous deployment in under 5 seconds with zero downtime.

---

## 10. Troubleshooting & Common Issues

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **OAuth redirect loops back to login** | Supabase Redirect URL or `NEXT_PUBLIC_SITE_URL` mismatch | Add `https://your-domain.com/auth/callback` to Supabase Auth -> URL Configuration -> Redirect URLs. |
| **AI requests fail with 500** | `GEMINI_API_KEY` missing or invalid in Vercel | Verify `GEMINI_API_KEY` is added to Vercel Environment Variables and redeploy. |
| **Resume upload fails with 403** | RLS policy or storage bucket permissions | Confirm user is authenticated; verify `resumes` bucket exists. |
| **CORS errors on API** | `NEXT_PUBLIC_SITE_URL` does not match the actual domain | Update `NEXT_PUBLIC_SITE_URL` in Vercel to match the exact protocol and domain. |
