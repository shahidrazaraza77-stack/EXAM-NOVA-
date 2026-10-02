/**
 * Production Security Event Logger
 * Records security-sensitive operations into the database public.security_logs
 * and structured server logs.
 *
 * CRITICAL RULE: NEVER log passwords, OTP codes, TOTP secrets, tokens, or API keys.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export type SecurityEventType =
  | "LOGIN"
  | "LOGOUT"
  | "GOOGLE_LOGIN"
  | "FAILED_LOGIN"
  | "PASSWORD_CHANGE"
  | "EMAIL_CHANGE"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "MFA_FAILED"
  | "MFA_SUCCESS"
  | "MFA_RECOVERY_USED"
  | "SESSION_REVOKED"
  | "ADMIN_ACTION"
  | "FILE_UPLOAD"
  | "RATE_LIMIT_EXCEEDED"
  | "PROMPT_INJECTION_DETECTED"
  | "SUSPICIOUS_REQUEST"
  | "ACCOUNT_DELETED";

export type SecuritySeverity = "info" | "warning" | "error" | "critical";

interface LogSecurityEventParams {
  event: SecurityEventType;
  userId?: string | null;
  email?: string | null;
  severity?: SecuritySeverity;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, any>;
}

// Redact sensitive patterns from details objects
function sanitizeDetails(details?: Record<string, any>): Record<string, any> {
  if (!details) return {};
  const redacted: Record<string, any> = {};

  const sensitiveKeys = [
    "password",
    "pass",
    "token",
    "secret",
    "key",
    "code",
    "totp",
    "otp",
    "authorization",
    "cookie",
    "recovery",
  ];

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((s) => lowerKey.includes(s));

    if (isSensitive) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      redacted[key] = sanitizeDetails(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Log a security event to console and Supabase public.security_logs table
 */
export async function logSecurityEvent({
  event,
  userId = null,
  email = null,
  severity = "info",
  ipAddress = null,
  userAgent = null,
  details = {},
}: LogSecurityEventParams): Promise<void> {
  const cleanDetails = sanitizeDetails(details);
  const timestamp = new Date().toISOString();

  // 1. Structured Console Log
  const logPrefix = `[SECURITY_EVENT] [${severity.toUpperCase()}] [${event}]`;
  if (severity === "critical" || severity === "error") {
    console.error(logPrefix, { timestamp, userId, email, ipAddress, details: cleanDetails });
  } else if (severity === "warning") {
    console.warn(logPrefix, { timestamp, userId, email, ipAddress, details: cleanDetails });
  } else {
    console.log(logPrefix, { timestamp, userId, email, ipAddress });
  }

  // 2. Persistent Supabase DB Log
  try {
    const payload = {
      event_type: event,
      user_id: userId || null,
      ip_address: ipAddress || null,
      user_agent: userAgent ? userAgent.substring(0, 255) : null,
      details: {
        ...cleanDetails,
        severity,
        ...(email ? { user_email: email } : {}),
      },
      created_at: timestamp,
    };

    // Use supabaseAdmin to guarantee log insertion even if client has restricted permissions
    const { error } = await (supabaseAdmin as any).from("security_logs").insert(payload);
    if (error) {
      // If table is not accessible or not created, warn in console without breaking the request
      console.warn("[SECURITY_LOGGER] Failed to persist security log to DB:", error.message);
    }
  } catch (err: any) {
    console.warn("[SECURITY_LOGGER] Error writing security log:", err?.message);
  }
}
