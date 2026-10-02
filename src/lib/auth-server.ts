/**
 * Server-Side Authentication & Authorization Module
 * Enforces server-side RBAC, Admin MFA compliance, and user verification.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logSecurityEvent } from "@/lib/security-logger";
import { getClientIp } from "@/lib/rate-limit";

export interface AuthenticatedUserSession {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
  profile: {
    id: string;
    role: "student" | "recruiter" | "admin" | "content_manager";
    full_name?: string;
    email?: string;
    suspended?: boolean;
  };
  aal: "aal1" | "aal2";
}

/**
 * Extract auth token from Authorization header or cookies
 */
export function extractAuthToken(request: NextRequest): string | null {
  // 1. Check Bearer Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Check examnova-session cookie
  const sessionCookie = request.cookies.get("examnova-session")?.value;
  if (sessionCookie && sessionCookie !== '""' && sessionCookie !== "undefined") {
    return sessionCookie;
  }

  // 3. Check Supabase standard cookie (sb-<ref>-auth-token)
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        if (Array.isArray(parsed) && parsed[0]) {
          return parsed[0];
        } else if (parsed?.access_token) {
          return parsed.access_token;
        }
      } catch {
        if (cookie.value) return cookie.value;
      }
    }
  }

  return null;
}

/**
 * Authenticates user and fetches profile from database
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<{ session: AuthenticatedUserSession | null; errorResponse?: NextResponse }> {
  const token = extractAuthToken(request);
  if (!token) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Validate token via Supabase Auth
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      ),
    };
  }

  // Fetch verified profile from Postgres (bypassing client-side manipulation)
  const { data: profile, error: profileError } = await (supabaseAdmin.from("profiles") as any)
    .select("id, role, full_name, email, suspended")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "User profile not found or deactivated." },
        { status: 403 }
      ),
    };
  }

  if (profile.suspended) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Account suspended. Please contact platform support." },
        { status: 403 }
      ),
    };
  }

  // Determine Authenticator Assurance Level (AAL)
  // Check user.app_metadata or user.factors
  let aal: "aal1" | "aal2" = "aal1";
  const factors = user.factors || [];
  const verifiedFactors = factors.filter((f: any) => f.status === "verified");
  
  // If the JWT contains aal2 claim or user verified factor in this session
  if ((user as any).aal === "aal2" || (user.app_metadata as any)?.aal === "aal2") {
    aal = "aal2";
  }

  return {
    session: {
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      },
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
        email: profile.email,
        suspended: profile.suspended,
      },
      aal,
    },
  };
}

/**
 * Validates that the request is made by an authorized Admin or Content Manager
 * and optionally enforces MFA verification.
 */
export async function validateAdminRequest(
  request: NextRequest,
  options: { requireMfa?: boolean; allowedRoles?: string[] } = {}
): Promise<{ session: AuthenticatedUserSession | null; errorResponse?: NextResponse }> {
  const { requireMfa = false, allowedRoles = ["admin", "content_manager"] } = options;
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) {
    await logSecurityEvent({
      event: "SUSPICIOUS_REQUEST",
      severity: "warning",
      ipAddress: ip,
      userAgent,
      details: { path: request.nextUrl.pathname, reason: "Unauthenticated admin attempt" },
    });
    return { session: null, errorResponse };
  }

  // Verify Role Server-Side
  if (!allowedRoles.includes(session.profile.role)) {
    await logSecurityEvent({
      event: "SUSPICIOUS_REQUEST",
      userId: session.user.id,
      email: session.user.email,
      severity: "error",
      ipAddress: ip,
      userAgent,
      details: {
        path: request.nextUrl.pathname,
        claimedRole: session.profile.role,
        reason: "Unauthorized role attempted admin route",
      },
    });

    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden: You do not have permission to access administrative resources." },
        { status: 403 }
      ),
    };
  }

  // Verify MFA if required for admin
  if (requireMfa && session.profile.role === "admin") {
    // Check if user has MFA factor enrolled
    const { data: factorData } = await supabaseAdmin.auth.admin.mfa.listFactors({
      userId: session.user.id,
    });
    const hasEnrolledMfa = factorData?.factors?.some((f: any) => f.status === "verified");

    if (hasEnrolledMfa && session.aal !== "aal2") {
      await logSecurityEvent({
        event: "MFA_FAILED",
        userId: session.user.id,
        email: session.user.email,
        severity: "warning",
        ipAddress: ip,
        userAgent,
        details: { path: request.nextUrl.pathname, reason: "Admin MFA step-up verification needed" },
      });

      return {
        session: null,
        errorResponse: NextResponse.json(
          { error: "MFA verification required. Please verify your two-factor code to perform admin operations.", code: "MFA_REQUIRED" },
          { status: 403 }
        ),
      };
    }
  }

  // Log successful admin action access
  await logSecurityEvent({
    event: "ADMIN_ACTION",
    userId: session.user.id,
    email: session.user.email,
    severity: "info",
    ipAddress: ip,
    userAgent,
    details: { path: request.nextUrl.pathname, role: session.profile.role },
  });

  return { session };
}

/**
 * Sanitizes and shields user-provided content against prompt injection attacks
 */
export function sanitizeUserPromptContent(input: string, maxLength: number = 8000): string {
  if (!input || typeof input !== "string") return "";

  // 1. Truncate to avoid token-flooding DoS
  let sanitized = input.slice(0, maxLength);

  // 2. Neutralize typical system delimiter injection markers
  sanitized = sanitized
    .replace(/```/g, "'''")
    .replace(/<system>/gi, "[system]")
    .replace(/<\/system>/gi, "[/system]")
    .replace(/\[INST\]/gi, "(inst)")
    .replace(/\[\/INST\]/gi, "(/inst)")
    .replace(/<\|im_start\|>/gi, "")
    .replace(/<\|im_end\|>/gi, "")
    .replace(/\b(ignore previous instructions|disregard all previous instructions|system override)\b/gi, "[filtered instruction]");

  return sanitized.trim();
}
