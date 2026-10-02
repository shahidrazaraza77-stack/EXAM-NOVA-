"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/context/ToastContext";
import { setAuthCookies } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Avoid double processing in React 18/19 strict mode
    if (processedRef.current) return;
    processedRef.current = true;

    let isCompleted = false;

    const handleCallback = async () => {
      console.log("[AUTH] Callback page mounted. Processing OAuth return...");

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const savedNext = 
        (typeof window !== "undefined" ? sessionStorage.getItem("examnova_auth_next") : null) ||
        (typeof window !== "undefined" ? localStorage.getItem("examnova_auth_next") : null) ||
        getCookie("examnova_auth_next");
      const next = searchParams.get("next") || savedNext || "/dashboard";

      // Check for errors in query parameters from provider
      const authError = searchParams.get("error");
      const authErrorDescription = searchParams.get("error_description");
      if (authError) {
        const errMsg = authErrorDescription || authError;
        console.error("[AUTH] Provider OAuth error:", errMsg);
        setError(errMsg);
        toast.error(`OAuth error: ${errMsg}`);
        return;
      }

      const completeAuth = async (session: any): Promise<boolean> => {
        if (isCompleted || !session || !session.user) return false;
        isCompleted = true;
        clearInterval(pollInterval);

        console.log("[AUTH] Session verified in Callback. Completing redirect...");
        
        // Fast-path role from user metadata
        const role = session.user?.user_metadata?.role || "student";
        
        // Synchronously set auth cookies so Next.js proxy allows access to dashboard
        setAuthCookies(session, role);

        // Open redirect protection: validate destination
        let safeDestination = next;
        if (!safeDestination || !safeDestination.startsWith("/") || safeDestination.startsWith("//") || safeDestination.includes("://")) {
          safeDestination = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
        }
        if (safeDestination === "/login" || safeDestination === "/signup" || safeDestination === "/") {
          safeDestination = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
        }

        // Clean up storage markers
        try {
          sessionStorage.removeItem("examnova_auth_next");
          sessionStorage.removeItem("examnova_oauth_in_progress");
          localStorage.removeItem("examnova_auth_next");
          localStorage.removeItem("examnova_oauth_in_progress");
          document.cookie = "examnova_auth_next=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } catch {}

        // Ensure profile row in background without blocking navigation
        profileService.ensureProfile(session.user).catch((e) => {
          console.warn("[AUTH] Profile ensure background warning:", e);
        });

        // Requirement 3 & 10: Check if user account has MFA enabled
        try {
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aalData && aalData.nextLevel === "aal2" && aalData.currentLevel === "aal1") {
            console.log("[AUTH] MFA verification required for this account. Redirecting to /mfa-verify...");
            window.location.replace(`/mfa-verify?redirect=${encodeURIComponent(safeDestination)}`);
            return true;
          }
        } catch (mfaErr) {
          console.warn("[AUTH] Error checking MFA status in callback:", mfaErr);
        }

        console.log(`[AUTH] Profile ready (${role}). Immediately replacing location: ${safeDestination}`);
        window.location.replace(safeDestination);
        return true;
      };

      // Active poller every 100ms for up to 3000ms
      const pollInterval = setInterval(async () => {
        if (isCompleted) {
          clearInterval(pollInterval);
          return;
        }
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            clearInterval(pollInterval);
            await completeAuth(session);
          }
        } catch {}
      }, 100);

      // 1. Check if session already exists
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession?.user) {
          await completeAuth(existingSession);
          return;
        }
      } catch (err) {
        console.warn("[AUTH] getSession initial check warning:", err);
      }

      // 2. If PKCE code is present, try to exchange it for a session
      if (code) {
        try {
          console.log("[AUTH] Exchanging authorization code for session...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (data?.session?.user) {
            await completeAuth(data.session);
            return;
          }
          if (exchangeError) {
            console.warn("[AUTH] Code exchange failed, will check fallback:", exchangeError.message);
          }
        } catch (err: any) {
          console.warn("[AUTH] Exchange error, will check fallback:", err?.message);
        }
      }

      // 3. Check if implicit flow returned tokens in URL hash fragment
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        if (hashError) {
          console.error("[AUTH] Hash OAuth error:", hashError);
          setError(hashError);
          toast.error(`OAuth error: ${hashError}`);
          return;
        }

        if (accessToken && refreshToken) {
          try {
            console.log("[AUTH] Setting session from hash parameters...");
            const { data: setData } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setData?.session?.user) {
              await completeAuth(setData.session);
              return;
            }
          } catch (err: any) {
            console.warn("[AUTH] Error setting session from hash:", err?.message);
          }
        }
      }

      // 4. Subscribe to onAuthStateChange to capture asynchronous auth events
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[AUTH] Callback listener detected event: ${event}`);
        if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
          subscription.unsubscribe();
          await completeAuth(session);
        }
      });

      // 5. Final fallback timer (3 seconds) before displaying error
      setTimeout(async () => {
        clearInterval(pollInterval);
        if (isCompleted) return;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await completeAuth(session);
            return;
          }
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const role = user.user_metadata?.role || "student";
            const target = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
            window.location.replace(target);
            return;
          }
        } catch {}

        console.warn("[AUTH] No session resolved after callback wait.");
        setError("Authentication session not found. Please click below to retry.");
      }, 3000);
    };

    handleCallback();
  }, [router, toast]);

  return (
    // Light white background — matches the login/signup page theme
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl max-w-sm w-full p-10 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-zinc-100">
            <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova Logo" />
          </div>
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="flex justify-center text-red-500">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Authentication Failed</h2>
            <p className="text-sm text-zinc-500">{error}</p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => (window.location.href = "/auth/reset?reprocess=true")}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer border-none shadow-md shadow-violet-500/20"
              >
                Reset &amp; Retry Google Login
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-none"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Spinner */}
            <div className="flex justify-center">
              <svg
                className="h-10 w-10 animate-spin text-pink-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Completing Sign-In</h2>
            <p className="text-sm text-zinc-500">Securing your session and opening dashboard…</p>
          </div>
        )}
      </div>
    </div>
  );
}
