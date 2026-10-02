"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mfaService } from "@/services/mfa.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, AlertCircle, ArrowRight, RefreshCw, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";

function MfaVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  // Open-redirect protection: ensure target path starts with / and not //
  const safeRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/dashboard";

  useEffect(() => {
    async function initMfa() {
      try {
        const status = await mfaService.getMfaStatus();
        if (!status.isEnabled) {
          // If MFA is not enabled on this account, send straight to destination
          router.replace(safeRedirect);
          return;
        }

        if (status.currentLevel === "aal2") {
          // Already verified in this session
          router.replace(safeRedirect);
          return;
        }

        setFactorId(status.verifiedFactorId || status.factors[0]?.id || null);
      } catch (err) {
        console.error("Failed to load MFA challenge:", err);
      } finally {
        setCheckingStatus(false);
      }
    }
    initMfa();
  }, [router, safeRedirect]);

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = totpCode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError("Please enter a valid 6-digit numeric authenticator code.");
      return;
    }

    if (!factorId) {
      setError("No active two-factor configuration found. Please contact support.");
      return;
    }

    setIsLoading(true);
    try {
      await mfaService.verifyLoginChallenge(factorId, clean);
      toast.success("Identity verified successfully!");
      router.replace(safeRedirect);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Invalid authenticator code. Please try again.");
      toast.error(err?.message || "Verification failed");
      setIsLoading(false);
    }
  };

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recoveryCode.trim()) {
      setError("Please enter your backup recovery code.");
      return;
    }

    setIsLoading(true);
    try {
      await mfaService.verifyWithRecoveryCode(recoveryCode.trim());
      toast.success("Recovery code verified! Session authorized.");
      router.replace(safeRedirect);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Invalid or used recovery code.");
      toast.error(err?.message || "Recovery verification failed");
      setIsLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--aurora-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium" style={{ color: "var(--aurora-text-secondary)" }}>
            Checking two-factor security status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--aurora-bg)" }}>
      <div className="w-full max-w-md p-8 rounded-3xl space-y-6 relative z-10 shadow-2xl" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)" }}>
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6D5DF6, #4F46E5)" }}>
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: "var(--aurora-text)" }}>
            Two-Factor Verification
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "var(--aurora-text-secondary)" }}>
            {useRecovery
              ? "Enter one of your 8-character single-use emergency recovery codes."
              : "Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, 1Password)."}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {!useRecovery ? (
          <form onSubmit={handleVerifyTotp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold block" style={{ color: "var(--aurora-text)" }}>
                Authentication Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-3.5 px-4 text-center tracking-[0.5em] text-2xl font-mono font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: "var(--aurora-surface)",
                    borderColor: "var(--aurora-border)",
                    color: "var(--aurora-text)",
                  }}
                />
                <KeyRound className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 font-bold cursor-pointer"
              isLoading={isLoading}
              disabled={totpCode.length !== 6}
            >
              Verify & Continue
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyRecovery} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold block" style={{ color: "var(--aurora-text)" }}>
                Backup Recovery Code
              </label>
              <input
                type="text"
                autoFocus
                placeholder="XXXX-XXXX"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                className="w-full py-3 px-4 text-center tracking-widest text-lg font-mono font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                style={{
                  background: "var(--aurora-surface)",
                  borderColor: "var(--aurora-border)",
                  color: "var(--aurora-text)",
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 font-bold cursor-pointer"
              isLoading={isLoading}
              disabled={!recoveryCode.trim()}
            >
              Verify Recovery Code
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        <div className="pt-2 border-t flex flex-col gap-2.5 text-center text-xs" style={{ borderColor: "var(--aurora-border)" }}>
          <button
            type="button"
            onClick={() => {
              setUseRecovery(!useRecovery);
              setError(null);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-none"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            {useRecovery ? "Use Authenticator App instead" : "Lost access? Use a Recovery Code"}
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="text-2xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:underline cursor-pointer bg-transparent border-none"
          >
            Cancel and Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MfaVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MfaVerifyContent />
    </Suspense>
  );
}
