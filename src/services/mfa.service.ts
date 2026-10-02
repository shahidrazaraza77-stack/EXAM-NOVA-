/**
 * MFA Service
 * Manages Supabase TOTP enrollment, verification, un-enrollment, and single-use recovery codes.
 */

import { supabase } from "@/lib/supabase";

export interface MfaStatus {
  isEnabled: boolean;
  factors: any[];
  currentLevel: "aal1" | "aal2";
  nextLevel: "aal1" | "aal2";
  verifiedFactorId?: string;
}

export const mfaService = {
  /**
   * Check current MFA configuration and assurance level
   */
  async getMfaStatus(): Promise<MfaStatus> {
    try {
      const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      const verifiedFactor = factorData?.totp?.find((f) => f.status === "verified");

      return {
        isEnabled: !!verifiedFactor,
        factors: factorData?.totp || [],
        currentLevel: (aalData?.currentLevel as "aal1" | "aal2") || "aal1",
        nextLevel: (aalData?.nextLevel as "aal1" | "aal2") || "aal1",
        verifiedFactorId: verifiedFactor?.id,
      };
    } catch (err) {
      console.warn("[MFA_SERVICE] Error checking MFA status:", err);
      return {
        isEnabled: false,
        factors: [],
        currentLevel: "aal1",
        nextLevel: "aal1",
      };
    }
  },

  /**
   * Step 1: Enroll a new TOTP factor
   */
  async enrollTotp(): Promise<{
    factorId: string;
    qrCode: string;
    secret: string;
    uri: string;
  }> {
    // Unenroll any previously unverified dangling factors first
    const { data: factorData } = await supabase.auth.mfa.listFactors();
    const unverified = (factorData?.totp as any[])?.filter((f) => (f as any).status !== "verified") || [];
    for (const f of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => {});
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "ExamNova",
    });

    if (error || !data) {
      throw error || new Error("Failed to initiate TOTP enrollment");
    }

    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  },

  /**
   * Step 2: Verify the initial 6-digit TOTP code and generate recovery codes
   */
  async verifyEnrollment(
    factorId: string,
    code: string
  ): Promise<{ success: boolean; recoveryCodes: string[] }> {
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new Error("TOTP code must be exactly 6 numeric digits.");
    }

    // Challenge and verify with Supabase Auth
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: cleanCode,
    });

    if (error) {
      throw new Error(error.message || "Invalid authenticator code. Please check your app.");
    }

    // Generate single-use recovery backup codes
    const recoveryRes = await fetch("/api/auth/mfa/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });

    let recoveryCodes: string[] = [];
    if (recoveryRes.ok) {
      const recData = await recoveryRes.json();
      recoveryCodes = recData.codes || [];
    }

    return {
      success: true,
      recoveryCodes,
    };
  },

  /**
   * Verify TOTP code during login challenge (upgrades session from aal1 to aal2)
   */
  async verifyLoginChallenge(factorId: string, code: string): Promise<boolean> {
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new Error("TOTP code must be exactly 6 numeric digits.");
    }

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: cleanCode,
    });

    if (error) {
      throw new Error(error.message || "Invalid authentication code.");
    }

    return true;
  },

  /**
   * Verify with Single-Use Recovery Code
   */
  async verifyWithRecoveryCode(code: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      throw new Error("Please enter a recovery code.");
    }

    const res = await fetch("/api/auth/mfa/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", code: cleanCode }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Invalid or already consumed recovery code.");
    }

    return true;
  },

  /**
   * Unenroll an MFA factor (Disable 2FA)
   */
  async unenrollFactor(factorId: string): Promise<void> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
  },

  /**
   * Fetch remaining recovery codes count
   */
  async getRecoveryCodesCount(): Promise<number> {
    try {
      const res = await fetch("/api/auth/mfa/recovery");
      if (!res.ok) return 0;
      const data = await res.json();
      return data.remainingCount || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Generate new recovery codes
   */
  async generateNewRecoveryCodes(): Promise<string[]> {
    const res = await fetch("/api/auth/mfa/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate recovery codes");
    }

    const data = await res.json();
    return data.codes || [];
  },
};
