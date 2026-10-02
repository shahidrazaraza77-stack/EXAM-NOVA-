"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { clearAuthCookies } from "@/context/AuthContext";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

function AuthResetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReprocess = searchParams.get("reprocess") === "true";

  const [status, setStatus] = useState<"resetting" | "done" | "redirecting" | "error">("resetting");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function runReset() {
      try {
        console.log("[AUTH-RESET] Starting complete auth reset...");

        // 1. Sign out from Supabase (both local and server)
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch (e) {
          console.warn("[AUTH-RESET] Supabase signOut warning:", e);
        }

        // 2. Clear all auth cookies client-side
        clearAuthCookies();

        // 3. Clear server cookies via API call
        try {
          await fetch("/api/auth/reset", { method: "POST" });
        } catch (e) {
          console.warn("[AUTH-RESET] API reset fetch warning:", e);
        }

        // 4. Wipe auth keys in localStorage and sessionStorage
        if (typeof window !== "undefined") {
          try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith("sb-") || k.includes("supabase") || k.startsWith("examnova-") || k.startsWith("rp_"))) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
            sessionStorage.clear();
          } catch (e) {
            console.warn("[AUTH-RESET] Storage wipe warning:", e);
          }
        }

        console.log("[AUTH-RESET] Auth state completely cleaned.");

        if (isCancelled) return;

        if (shouldReprocess) {
          setStatus("redirecting");
          console.log("[AUTH-RESET] Launching fresh Google OAuth login...");
          await authService.signInWithGoogle();
        } else {
          setStatus("done");
          setTimeout(() => {
            if (!isCancelled) {
              window.location.href = "/login?reset=true";
            }
          }, 1000);
        }
      } catch (err: any) {
        console.error("[AUTH-RESET] Reset error:", err);
        if (!isCancelled) {
          setStatus("error");
          setErrorMessage(err?.message || "Failed to reset authentication.");
        }
      }
    }

    runReset();

    return () => {
      isCancelled = true;
    };
  }, [shouldReprocess, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#070B1D] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="rounded-[32px] bg-white/90 dark:bg-white/[0.08] backdrop-blur-[40px] border border-purple-500/20 dark:border-white/15 p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] p-[2px] shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova" />
            </div>
          </div>
        </div>

        {/* State Messaging */}
        {status === "resetting" && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <RefreshCw className="w-10 h-10 text-[#7C5CFF] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Resetting Session
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Clearing cached sessions, cookies, and local tokens…
            </p>
          </div>
        )}

        {status === "redirecting" && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <RefreshCw className="w-10 h-10 text-[#FF2E8B] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Connecting to Google…
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Launching fresh account chooser for Google sign-in…
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Reset Complete!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Returning you to the login screen…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex justify-center text-red-500">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Reset Issue
            </h2>
            <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E8B] to-[#7C5CFF] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthResetPageContent />
    </Suspense>
  );
}
