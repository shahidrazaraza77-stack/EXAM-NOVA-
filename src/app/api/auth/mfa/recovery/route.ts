import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function generateRandomCode(): string {
  // Generates XXXX-XXXX format
  const bytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${bytes.substring(0, 4)}-${bytes.substring(4, 8)}`;
}

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Return count of unused recovery codes (never expose code contents or hashes)
  const { count, error } = await (supabaseAdmin as any).from("user_mfa_recovery_codes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .is("used_at", null);

  if (error) {
    return NextResponse.json({ error: "Failed to query recovery codes" }, { status: 500 });
  }

  return NextResponse.json({ remainingCount: count || 0 });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  // Rate limit
  const rateLimit = checkRateLimit(ip, "mfa");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action, code } = body;

  if (action === "generate") {
    // Generate 8 new single-use recovery codes
    // Delete any old unused recovery codes for this user
    await (supabaseAdmin as any).from("user_mfa_recovery_codes")
      .delete()
      .eq("user_id", session.user.id);

    const plainCodes: string[] = [];
    const dbRecords: any[] = [];

    for (let i = 0; i < 8; i++) {
      const plain = generateRandomCode();
      plainCodes.push(plain);
      dbRecords.push({
        user_id: session.user.id,
        code_hash: hashCode(plain),
        created_at: new Date().toISOString(),
      });
    }

    const { error: insertError } = await (supabaseAdmin as any).from("user_mfa_recovery_codes")
      .insert(dbRecords);

    if (insertError) {
      console.error("[RECOVERY_CODE_ERROR]", insertError);
      return NextResponse.json({ error: "Failed to generate recovery codes" }, { status: 500 });
    }

    await logSecurityEvent({
      event: "MFA_ENABLED",
      userId: session.user.id,
      email: session.user.email,
      severity: "info",
      ipAddress: ip,
      userAgent,
      details: { action: "RECOVERY_CODES_GENERATED", count: 8 },
    });

    // Plaintext codes returned ONLY ONCE
    return NextResponse.json({ codes: plainCodes });
  }

  if (action === "verify") {
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Recovery code is required." }, { status: 400 });
    }

    const hashed = hashCode(code);
    const { data: matchedCode, error: queryError } = await (supabaseAdmin as any).from("user_mfa_recovery_codes")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("code_hash", hashed)
      .is("used_at", null)
      .maybeSingle();

    if (queryError || !matchedCode) {
      await logSecurityEvent({
        event: "MFA_FAILED",
        userId: session.user.id,
        email: session.user.email,
        severity: "warning",
        ipAddress: ip,
        userAgent,
        details: { action: "INVALID_RECOVERY_CODE" },
      });
      return NextResponse.json({ error: "Invalid or already used recovery code." }, { status: 400 });
    }

    // Mark single-use code as consumed
    await (supabaseAdmin as any).from("user_mfa_recovery_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", matchedCode.id);

    await logSecurityEvent({
      event: "MFA_RECOVERY_USED",
      userId: session.user.id,
      email: session.user.email,
      severity: "warning",
      ipAddress: ip,
      userAgent,
      details: { action: "RECOVERY_CODE_CONSUMED" },
    });

    return NextResponse.json({ success: true, message: "Recovery code verified successfully." });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
