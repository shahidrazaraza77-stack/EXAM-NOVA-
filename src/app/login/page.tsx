"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { 
  Mail, Lock, ArrowLeft, AlertCircle, 
  ArrowRight, ShieldCheck, Zap, Users, Sparkles, 
  Code2, FileText, Mic, Eye, EyeOff, Building2, Award
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { mfaService } from "@/services/mfa.service";

// 6 BALANCED ORBITING GLASS WIDGETS (Strategically spaced to prevent any overlap)
const FLOATING_WIDGETS = [
  { id: "resume", title: "ATS Resume 98%", subtitle: "AI Scored & Verified", icon: FileText, color: "text-[#FF2E8B]", borderColor: "border-[#FF2E8B]/40", top: "12%", left: "-2%" },
  { id: "coding", title: "450+ Solved", subtitle: "Data Structures & Algo", icon: Code2, color: "text-[#4F7CFF]", borderColor: "border-[#4F7CFF]/40", top: "10%", right: "0%" },
  { id: "interview", title: "AI Interview Coach", subtitle: "Real-time Voice Feedback", icon: Mic, color: "text-[#7C5CFF]", borderColor: "border-[#7C5CFF]/40", top: "42%", left: "-6%" },
  { id: "readiness", title: "Placement Rank #1", subtitle: "Top 1% Percentile", icon: Award, color: "text-[#00FFC6]", borderColor: "border-[#00FFC6]/40", top: "40%", right: "-5%" },
  { id: "match", title: "99% Job Fit", subtitle: "Target Tech Role", icon: Zap, color: "text-[#FF2E8B]", borderColor: "border-[#FF2E8B]/40", top: "72%", left: "2%" },
  { id: "offer", title: "Dream Offer", subtitle: "Interview Cleared ✓", icon: Sparkles, color: "text-[#00D9FF]", borderColor: "border-[#00D9FF]/40", top: "70%", right: "2%" },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const target = searchParams?.get("redirect") || (user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard");
      router.replace(target);
    }
  }, [user, authLoading, router, searchParams]);

  // Show any OAuth error from searchParams
  useEffect(() => {
    const oauthError = searchParams?.get("error");
    if (oauthError) {
      const msg = decodeURIComponent(oauthError).replace(/_/g, " ");
      setError(`Authentication error: ${msg}`);
      toast.error(`Authentication error: ${msg}`);
    }
    if (searchParams?.get("reset") === "true") {
      toast.success("Authentication state successfully reset. Ready to log in!");
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      const msg = "Please enter both email and password.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      
      const rawTarget = searchParams?.get("redirect") || "/dashboard";
      const safeTarget = rawTarget.startsWith("/") && !rawTarget.startsWith("//") && !rawTarget.includes("://") ? rawTarget : "/dashboard";

      // Requirement 10: Check if MFA is required before dashboard access
      try {
        const mfaStatus = await mfaService.getMfaStatus();
        if (mfaStatus.isEnabled && mfaStatus.nextLevel === "aal2" && mfaStatus.currentLevel === "aal1") {
          toast.success("Password verified. Two-factor authentication required.");
          router.replace(`/mfa-verify?redirect=${encodeURIComponent(safeTarget)}`);
          return;
        }
      } catch (mfaErr) {
        console.warn("[LOGIN] MFA check error:", mfaErr);
      }

      toast.success("Successfully logged in!");
      router.replace(safeTarget);
    } catch (err: any) {
      const errMsg = err?.message || "Failed to log in. Please check credentials.";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const redirectUrl = searchParams?.get("redirect") || "/dashboard";
      await loginWithGoogle(redirectUrl);
    } catch (err: any) {
      const errMsg = err?.message || "Google authentication failed. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div 
      className="w-full min-h-screen min-h-dvh flex flex-col font-sans relative bg-[#F8FAFF] dark:bg-[#070B1D] text-[#111827] dark:text-white transition-colors duration-300"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(124, 92, 255, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(255, 46, 139, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 88% 22%, rgba(0, 217, 255, 0.10) 0%, transparent 45%)
        `
      }}
    >
      {/* ─── HOLOGRAPHIC NEURAL GRID OVERLAY & AMBIENT AURORA BLOOMS ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* SVG Mesh Grid */}
        <div 
          className="absolute inset-0 opacity-[0.24] dark:opacity-[0.14]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(124, 92, 255, 0.10) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(124, 92, 255, 0.10) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        {/* Aurora Volumetric Light Blobs */}
        <div className="absolute top-[-120px] left-[15%] w-[650px] h-[650px] rounded-full bg-[#7C5CFF]/15 dark:bg-[#7C5CFF]/22 blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-120px] left-[5%] w-[700px] h-[700px] rounded-full bg-[#FF2E8B]/15 dark:bg-[#FF2E8B]/22 blur-[180px] animate-pulse" style={{ animationDelay: "2.5s" }} />
        <div className="absolute top-[30%] right-[8%] w-[600px] h-[600px] rounded-full bg-[#00D9FF]/15 dark:bg-[#00D9FF]/22 blur-[160px]" />

        {/* Floating Particles */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] animate-particle-drift"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              top: `${((i * 17) % 90) + 5}%`,
              left: `${((i * 23) % 90) + 5}%`,
              opacity: 0.25 + ((i % 3) * 0.1),
              animationDuration: `${8 + (i % 5)}s`,
              animationDelay: `${i % 3}s`,
            }}
          />
        ))}
      </div>

      {/* ─── TOP GLASS NAVIGATION BAR ─── */}
      <header className="relative z-30 px-3.5 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between">
        
        {/* Left: Back to Home */}
        <Link 
          href="/" 
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-purple-500/15 dark:border-white/15 text-xs font-black text-zinc-700 dark:text-zinc-200 hover:text-[#FF2E8B] dark:hover:text-white transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF2E8B]" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </Link>

        {/* Center: ExamNova Logo & AI Workspace OS Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] p-[1.5px] shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova Logo" />
              </div>
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-zinc-950 dark:text-white">
              Exam<span className="bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] bg-clip-text text-transparent">Nova</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 dark:border-white/15 text-xs font-black text-purple-700 dark:text-purple-300 backdrop-blur-md select-none">
            <Sparkles className="w-3.5 h-3.5 text-[#FF2E8B] animate-pulse" />
            <span>AI Workspace OS</span>
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-2 py-1 rounded-2xl bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-purple-500/15 dark:border-white/15 shadow-sm">
            <ThemeToggle />
          </div>
        </div>

      </header>

      {/* ─── MAIN CONTENT: RESPONSIVE SHOWCASE + ULTRA-PREMIUM LOGIN CARD ─── */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-2 sm:py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* ═══════════════════════════════════════════════════
             LEFT SIDE (DESKTOP ONLY / 7 COLS): FLOATING 3D AI ROBOT SCENE
          ═══════════════════════════════════════════════════ */}
          <div 
            className="hidden lg:flex lg:col-span-7 relative flex-col items-center justify-center min-h-[480px] xl:min-h-[520px] w-full select-none"
          >
            {/* Holographic Plasma Glow Circles */}
            <div className="absolute w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-gradient-to-tr from-[#7C5CFF]/20 via-[#FF2E8B]/15 to-[#00D9FF]/20 blur-3xl animate-pulse" />
            <div className="absolute w-72 h-72 xl:w-80 xl:h-80 rounded-full border border-purple-500/25 dark:border-white/15 border-dashed pointer-events-none" />

            {/* CHAT BUBBLE ABOVE ROBOT (Level, centered, smooth pure vertical float) */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-max max-w-[92vw]">
              <div className="animate-float-bubble px-4 py-2 rounded-2xl shadow-xl border border-[#FF2E8B]/35 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl flex items-center gap-2.5 text-xs font-black text-[#111827] dark:text-white relative whitespace-nowrap shadow-purple-500/10">
                <span className="text-sm">🤖</span>
                <span className="font-extrabold text-[#7C5CFF] dark:text-[#00D9FF]">NOVA AI:</span>
                <span>"Welcome back! Ready to continue your placement journey?"</span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-900 rotate-45 border-r border-b border-[#FF2E8B]/35" />
              </div>
            </div>

            {/* TRANSPARENT 3D AI ROBOT MASCOT */}
            <div className="relative z-10 flex flex-col items-center justify-center mt-4">
              
              <div className="absolute top-4 right-4 z-30 bg-white/95 dark:bg-zinc-900/95 border border-[#FF2E8B]/40 rounded-full p-1.5 shadow-md animate-robot-wave">
                <span className="text-lg select-none">👋</span>
              </div>

              <div className="relative w-64 sm:w-72 xl:w-80 h-[280px] sm:h-[300px] xl:h-[330px] flex items-center justify-center animate-float-mascot">
                <img
                  src="/login-3d-ai-robot.png"
                  alt="ExamNova Login 3D AI Robot"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(124,92,255,0.35)] select-none pointer-events-none"
                />
              </div>

              {/* Volumetric Ground Shadow */}
              <div className="w-48 h-3.5 rounded-full bg-[#111827]/15 dark:bg-black/50 blur-sm mt-[-10px] animate-pulse-shadow" />
            </div>

            {/* 6 BALANCED FLOATING GLASS WIDGETS AROUND ROBOT */}
            {FLOATING_WIDGETS.map((widget, idx) => {
              const Icon = widget.icon;
              return (
                <div
                  key={widget.id}
                  className={`absolute z-20 ${idx % 2 === 0 ? "animate-float-1" : "animate-float-2"}`}
                  style={{ top: widget.top, left: widget.left, right: widget.right }}
                >
                  <div className={`px-3.5 py-1.5 rounded-2xl ${widget.borderColor} shadow-xl backdrop-blur-2xl bg-white/85 dark:bg-white/[0.08] border flex items-center gap-2 text-xs font-bold text-[#111827] dark:text-white hover:scale-105 transition-transform cursor-pointer`}>
                    <div className={`p-1.5 rounded-xl bg-zinc-100 dark:bg-white/10 ${widget.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-extrabold leading-tight">{widget.title}</span>
                      <span className="block text-[8px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight">{widget.subtitle}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* BOTTOM STATUS BAR (FUTURISTIC FOOTER CAPSULES) */}
            <div className="mt-8 pt-2 w-full flex flex-wrap items-center justify-center gap-3 z-20">
              <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-emerald-500/30 text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>AI Engine: ONLINE</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-[#7C5CFF]/30 text-[10px] font-black text-[#7C5CFF] dark:text-purple-300 flex items-center gap-1.5 shadow-sm">
                <Users className="w-3 h-3" />
                <span>Students: 50,000+</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-[#FF2E8B]/30 text-[10px] font-black text-[#FF2E8B] flex items-center gap-1.5 shadow-sm">
                <Building2 className="w-3 h-3" />
                <span>Companies: 500+</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-[#00D9FF]/30 text-[10px] font-black text-[#00D9FF] flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3 h-3" />
                <span>AI Mentor: ACTIVE</span>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════
             RIGHT SIDE (MOBILE & DESKTOP): ULTRA-PREMIUM LOGIN CARD
          ═══════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 w-full max-w-[450px] mx-auto"
          >
            <div className="rounded-[30px] sm:rounded-[32px] bg-white/90 dark:bg-[#0C1027]/85 backdrop-blur-[35px] border border-purple-500/20 dark:border-white/15 p-5 sm:p-7 xl:p-8 shadow-[0_20px_50px_rgba(123,97,255,0.10)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden space-y-4 sm:space-y-4.5">
              
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-8 right-8 h-[3px] rounded-full bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF]" />

              {/* Header with Integrated Compact Nova Mascot Avatar on Mobile */}
              <div className="text-center space-y-1.5 pt-0.5">
                
                {/* Mobile-Only Nova AI Greeting Pill */}
                <div className="lg:hidden flex items-center justify-center gap-2 mb-1">
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C5CFF]/20 to-[#FF2E8B]/20 p-1 flex items-center justify-center border border-purple-500/20">
                    <img 
                      src="/login-3d-ai-robot.png" 
                      alt="Nova AI" 
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(124,92,255,0.4)]"
                    />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-white/10 text-[10px] font-extrabold text-[#7C5CFF] dark:text-[#00D9FF]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    NOVA AI ASSISTED
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tight">
                  Welcome Back 👋
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
                  Continue your AI-powered placement journey.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-11 sm:h-12 rounded-2xl bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/15 border border-purple-500/20 dark:border-white/20 text-[#111827] dark:text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 select-none"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{isGoogleLoading ? "Connecting Google..." : "Continue with Google"}</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1 select-none">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/10 dark:border-white/10" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#0C1027] text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest rounded-full">
                  OR CONTINUE WITH EMAIL
                </span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                
                {/* Email Field */}
                <div className="space-y-1 sm:space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/15 text-xs font-semibold text-[#111827] dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[11px] font-extrabold text-[#7C5CFF] dark:text-[#00D9FF] hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white/70 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/15 text-xs font-semibold text-[#111827] dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-purple-500/30 text-[#7C5CFF] focus:ring-[#7C5CFF] cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#FF2E8B]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 border-0 select-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to ExamNova</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Security Badges */}
              <div className="pt-2 border-t border-purple-500/10 dark:border-white/10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 select-none">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> SSL Encrypted</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#00D9FF]" /> AI Protected</span>
                <span>•</span>
                <span>50,000+ Students</span>
              </div>

              {/* Card Footer */}
              <div className="text-center pt-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 select-none">
                Don't have an account?{" "}
                <Link href="/register" className="font-extrabold text-[#7C5CFF] dark:text-[#00D9FF] hover:underline">
                  Create Account
                </Link>
              </div>

            </div>
          </motion.div>

        </div>
      </main>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070B1D] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#FF2E8B] animate-spin" />
          <span className="text-sm font-bold tracking-wider">Loading ExamNova AI OS...</span>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
