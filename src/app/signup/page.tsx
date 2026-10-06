"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, ArrowLeft, AlertCircle, 
  CheckCircle2, Eye, EyeOff, ArrowRight, ShieldCheck, 
  Zap, Users, Sparkles, BarChart3, Code2, BrainCircuit, 
  FileText, Circle, Mic, Rocket, Award, Building2, Check, Star,
  Activity, Cpu, Network, Layers, Fingerprint
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// 8 Orbiting Glass Panel Specs around 3D Registration Mascot
const ORBITING_PANELS = [
  { id: "resume", title: "Resume Score 98%", subtitle: "ATS Verified", icon: FileText, color: "text-[#FF2E8B]", borderColor: "border-[#FF2E8B]/40", top: "4%", left: "4%" },
  { id: "ats", title: "ATS Optimization", subtitle: "Keyword Match 100%", icon: ShieldCheck, color: "text-emerald-500", borderColor: "border-emerald-500/40", top: "2%", right: "6%" },
  { id: "coding", title: "Coding Progress", subtitle: "450+ Solved", icon: Code2, color: "text-[#5B8CFF]", borderColor: "border-[#5B8CFF]/40", top: "28%", left: "-2%" },
  { id: "interview", title: "AI Interview Coach", subtitle: "Real-time Feedback", icon: Mic, color: "text-[#7B61FF]", borderColor: "border-[#7B61FF]/40", top: "26%", right: "-3%" },
  { id: "jobmatch", title: "Job Match 99%", subtitle: "High Placement Fit", icon: Zap, color: "text-amber-500", borderColor: "border-amber-500/40", top: "54%", left: "4%" },
  { id: "readiness", title: "Placement Readiness", subtitle: "Top 1% Rank", icon: Award, color: "text-pink-500", borderColor: "border-pink-500/40", top: "52%", right: "4%" },
  { id: "google", title: "Placed at Google", subtitle: "89% Pass Probability", icon: Sparkles, color: "text-[#5B8CFF]", borderColor: "border-[#5B8CFF]/40", top: "76%", left: "10%" },
  { id: "microsoft", title: "Placed at Microsoft", subtitle: "Mock Interview Cleared", icon: Building2, color: "text-[#7B61FF]", borderColor: "border-[#7B61FF]/40", top: "77%", right: "10%" },
];

function NewMascotRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, register, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const role = "student";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const target = searchParams?.get("redirect") || (user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard");
      router.replace(target);
    }
  }, [user, authLoading, router, searchParams]);

  // Handle OAuth error params
  useEffect(() => {
    const oauthError = searchParams?.get("error");
    if (oauthError) {
      const msg = decodeURIComponent(oauthError).replace(/_/g, " ");
      setError(`Authentication error: ${msg}`);
      toast.error(`Authentication error: ${msg}`);
    }
  }, [searchParams, toast]);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const redirectPath = "/dashboard";
      await loginWithGoogle(redirectPath);
      toast.success("Redirecting to Google authentication...");
    } catch (err: any) {
      const errMsg = err?.message || "Google authentication failed. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      setIsGoogleLoading(false);
    }
  };

  // Live Password Validation
  const meetsLength = password.length >= 8;
  const meetsUppercase = /[A-Z]/.test(password);
  const meetsLowercase = /[a-z]/.test(password);
  const meetsNumber = /[0-9]/.test(password);
  const meetsSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passedChecksCount = [meetsLength, meetsUppercase, meetsLowercase, meetsNumber, meetsSpecial].filter(Boolean).length;
  const strengthPercentage = (passedChecksCount / 5) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      const msg = "Please fill in all required fields.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (passedChecksCount < 5) {
      const msg = "Please satisfy all password strength requirements.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const autoLogged = await register(name.trim(), email.trim(), password, role);
      if (autoLogged) {
        toast.success("Account registered successfully!");
      } else {
        setIsSuccess(true);
        toast.success("Verification link sent to your email.");
      }
    } catch (err: any) {
      const errMsg = err?.message || "Failed to create account. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="w-full h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row font-sans select-none relative bg-[#F8FAFF] dark:bg-[#060913] text-[#111827] dark:text-white transition-colors duration-300"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 12%, rgba(255, 46, 139, 0.09) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(123, 97, 255, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 88% 22%, rgba(91, 140, 255, 0.09) 0%, transparent 45%)
        `
      }}
    >
      {/* ─── LUXURY BACKGROUND & ATMOSPHERE ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-[0.24] dark:opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(123, 97, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(123, 97, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        <div className="absolute top-[-120px] left-[15%] w-[650px] h-[650px] rounded-full bg-[#7B61FF]/14 dark:bg-[#7B61FF]/24 blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-120px] left-[5%] w-[700px] h-[700px] rounded-full bg-[#FF2E8B]/14 dark:bg-[#FF2E8B]/24 blur-[180px] animate-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[30%] right-[8%] w-[600px] h-[600px] rounded-full bg-[#5B8CFF]/14 dark:bg-[#5B8CFF]/24 blur-[160px]" />

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-[#FF2E8B]/50 via-[#7B61FF]/50 to-[#5B8CFF]/50 animate-particle-drift"
            style={{
              width: `${(i % 4) + 2}px`,
              height: `${(i % 4) + 2}px`,
              top: `${((i * 17) % 90) + 5}%`,
              left: `${((i * 23) % 95) + 2}%`,
              animationDuration: `${6 + (i % 6)}s`,
              animationDelay: `${i % 4}s`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
         LEFT SECTION (60% Width) - NEW 3D AI REGISTRATION MASCOT VISUAL
      ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[60%] h-screen flex-col justify-between p-6 xl:p-8 z-10 overflow-hidden border-r border-[#7B61FF]/10 dark:border-white/10">
        
        {/* TOP OS HEADER BAR */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-[#7B61FF]/15 dark:border-white/10 text-xs font-bold text-[#111827] dark:text-white shadow-sm hover:scale-105 hover:border-[#FF2E8B]/30 backdrop-blur-xl transition-all group"
          >
            <ArrowLeft className="h-4 w-4 text-[#FF2E8B] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] p-[1px] shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center overflow-hidden">
                  <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova" />
                </div>
              </div>
              <span className="font-black text-xl text-[#111827] dark:text-white tracking-tight">
                Exam<span className="bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] bg-clip-text text-transparent">Nova</span>
              </span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7B61FF]/10 dark:bg-[#7B61FF]/20 border border-[#7B61FF]/20 text-[10px] font-extrabold text-[#7B61FF] dark:text-purple-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2E8B] animate-pulse" />
              <span>AI Powered Career Platform</span>
            </div>

            <ThemeToggle />
          </div>
        </div>

        {/* HEADLINE & SUBTITLE */}
        <div className="pt-2 space-y-1 max-w-xl">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-tight uppercase">
            LAND YOUR DREAM CAREER{" "}
            <span className="bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] bg-clip-text text-transparent">
              FASTER.
            </span>
          </h1>
          <p className="text-xs xl:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Prepare smarter with AI Resume Review, ATS Optimization, Live Mock Interviews, Coding Practice, and Placement Analytics.
          </p>
        </div>

        {/* CENTERPIECE: NEW 3D PIXAR REGISTRATION MASCOT & 8 ORBITING GLASS WIDGETS */}
        <div 
          className="relative my-auto flex flex-col items-center justify-center min-h-[300px] xl:min-h-[340px] w-full"
        >
          
          {/* BEHIND MASCOT: Glowing Halo Circle & Volumetric Soft Blur */}
          <div className="absolute w-72 h-72 xl:w-80 xl:h-80 rounded-full bg-gradient-to-tr from-[#FF2E8B]/20 via-[#7B61FF]/25 to-[#5B8CFF]/20 blur-3xl animate-pulse" />
          <div className="absolute w-64 h-64 xl:w-72 xl:h-72 rounded-full border border-white/70 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-2xl pointer-events-none" />

          {/* SPEECH BUBBLE ABOVE MASCOT (Level, centered, smooth pure vertical float) */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-max max-w-[92vw]">
            <div className="animate-float-bubble glass-pill px-4 py-1.5 rounded-2xl shadow-xl border border-[#FF2E8B]/30 flex items-center gap-2 text-xs font-extrabold text-[#111827] dark:text-white relative">
              <span>Hi, I'm Nova 👋 Ready to start your AI career journey?</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-900 rotate-45 border-r border-b border-[#FF2E8B]/30" />
            </div>
          </div>

          {/* 3D EXAMNOVA GRADUATE AI MASCOT */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative w-64 xl:w-76 h-[270px] xl:h-[300px] flex items-center justify-center animate-float-mascot">
              <img
                src="/exam-nova-diploma-robot.png"
                alt="ExamNova Graduate AI Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(255,46,139,0.35)] select-none pointer-events-none"
              />
            </div>

            {/* Soft Volumetric Ground Shadow */}
            <div className="w-44 h-3 rounded-full bg-[#111827]/15 dark:bg-black/50 blur-sm mt-[-10px] animate-pulse-shadow" />
          </div>

          {/* 8 ORBITING GLASS WIDGETS AROUND MASCOT */}
          {ORBITING_PANELS.map((panel, idx) => {
            const Icon = panel.icon;
            return (
              <div
                key={panel.id}
                className={`absolute z-20 ${idx % 2 === 0 ? "animate-float-1" : "animate-float-2"}`}
                style={{ top: panel.top, left: panel.left, right: panel.right }}
              >
                <div className={`glass-pill px-3.5 py-1.5 rounded-2xl ${panel.borderColor} shadow-xl backdrop-blur-2xl bg-white/85 dark:bg-zinc-900/85 flex items-center gap-2 text-xs font-bold text-[#111827] dark:text-white hover:scale-105 transition-transform cursor-pointer`}>
                  <div className={`p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${panel.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold leading-tight">{panel.title}</span>
                    <span className="block text-[8px] font-semibold text-zinc-400 leading-tight">{panel.subtitle}</span>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* BOTTOM AI OS STATUS BAR */}
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400 pt-2 border-t border-[#7B61FF]/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>50,000+ Students Preparing Active</span>
          </div>
          <span className="text-[10px] text-[#7B61FF] dark:text-[#5B8CFF] uppercase tracking-widest font-extrabold">ExamNova AI System</span>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════
         RIGHT SECTION (40% Width) - LUXURY GLASS REGISTRATION PANEL
      ═══════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[40%] h-screen flex items-center justify-center p-4 sm:p-6 z-10 overflow-y-auto lg:overflow-hidden">
        
        {/* FLOATING LUXURY GLASS REGISTRATION CARD (INCREASED SIZE) */}
        <div 
          className="w-full max-w-[490px] rounded-[38px] bg-white/65 dark:bg-zinc-950/85 backdrop-blur-[40px] border border-white/90 dark:border-white/10 shadow-[0_30px_90px_rgba(123,97,255,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.7)] p-6 sm:p-7 xl:p-8 relative transition-all duration-300"
        >
          
          {/* Gradient Accent Bar */}
          <div className="absolute top-0 left-10 right-10 h-[4px] rounded-full bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF]" />

          {isSuccess ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#111827] dark:text-white">Verify Your Email</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-300 leading-relaxed">
                Account created successfully! Check your inbox <strong>{email}</strong> to verify and login.
              </p>
              <Link href="/login" className="block w-full">
                <button className="w-full rounded-2xl bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] text-white font-bold h-12 text-sm shadow-md cursor-pointer border-0">
                  Go to Sign In
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* HEADER */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
                  Create Account <span className="text-[#FF2E8B]">✨</span>
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Join the future of AI-powered placements.
                </p>
              </div>

              {/* ERROR BANNER */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Signup Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-12 rounded-2xl bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/15 border border-[#7B61FF]/20 dark:border-white/20 text-[#111827] dark:text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
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
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/10 dark:border-white/10" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#0E1329] text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest rounded-full">
                  OR SIGN UP WITH EMAIL
                </span>
              </div>

              {/* INPUT FORM FIELDS (INCREASED HEIGHT & FONT SIZES) */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#111827] dark:text-zinc-200 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#FF2E8B]">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Shahid Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-[52px] xl:h-[56px] pl-12 pr-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-[#7B61FF]/20 dark:border-white/10 text-sm font-semibold text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF2E8B] focus:ring-4 focus:ring-[#FF2E8B]/15 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#111827] dark:text-zinc-200 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#FF2E8B]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[52px] xl:h-[56px] pl-12 pr-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-[#7B61FF]/20 dark:border-white/10 text-sm font-semibold text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF2E8B] focus:ring-4 focus:ring-[#FF2E8B]/15 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#111827] dark:text-zinc-200 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#FF2E8B]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[52px] xl:h-[56px] pl-12 pr-11 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-[#7B61FF]/20 dark:border-white/10 text-sm font-semibold text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF2E8B] focus:ring-4 focus:ring-[#FF2E8B]/15 transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#111827] dark:hover:text-white bg-transparent border-0 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-[#111827] dark:text-zinc-200 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#FF2E8B]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-[52px] xl:h-[56px] pl-12 pr-11 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-[#7B61FF]/20 dark:border-white/10 text-sm font-semibold text-[#111827] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF2E8B] focus:ring-4 focus:ring-[#FF2E8B]/15 transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#111827] dark:hover:text-white bg-transparent border-0 cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* ANIMATED PASSWORD STRENGTH METER & CHECKLIST (INCREASED FONT & ICONS) */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] transition-all duration-300 rounded-full"
                        style={{ width: `${strengthPercentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        {meetsLength ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                        <span className={meetsLength ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>8+ Characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {meetsUppercase ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                        <span className={meetsUppercase ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Uppercase Letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {meetsLowercase ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                        <span className={meetsLowercase ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Lowercase Letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {meetsNumber ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                        <span className={meetsNumber ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Number</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        {meetsSpecial ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />}
                        <span className={meetsSpecial ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>Special Character (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRIMARY GRADIENT BUTTON (LARGER HEIGHT & TEXT) */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-[52px] xl:h-[56px] rounded-2xl bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF2E8B]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer border-0"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

              </form>



              {/* DIRECT LINK TO LOGIN PAGE (LARGER TEXT) */}
              <div className="text-center pt-1">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-black bg-gradient-to-r from-[#FF2E8B] via-[#7B61FF] to-[#5B8CFF] bg-clip-text text-transparent hover:underline cursor-pointer"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFF] dark:bg-[#060913]" />}>
      <NewMascotRegistrationPage />
    </Suspense>
  );
}
