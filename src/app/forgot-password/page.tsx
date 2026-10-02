"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-zinc-950 transition-colors">
      {/* Back to Login floating action */}
      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group z-20">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Login
      </Link>

      {/* Left decoration */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="forgot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#forgot-grid)" />
          </svg>
        </div>
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-2 z-10 select-none">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden">
            <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova Logo" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Exam<span className="text-violet-200">Nova</span>
          </span>
        </div>

        <div className="space-y-6 z-10">
          <h2 className="text-3xl font-extrabold leading-tight">
            Recover your prep space.
          </h2>
          <p className="text-indigo-100/90 text-sm leading-relaxed max-w-sm">
            No worries! Enter your registered university or personal email address, and we'll transmit a secure link to reset your password.
          </p>
        </div>

        <p className="text-xs text-indigo-200/60 z-10">
          &copy; {new Date().getFullYear()} ExamNova. Your AI Placement Coach.
        </p>
      </div>

      {/* Right container */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Reset Password</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              We will send you a recovery link to restore access to your account.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Email Sent!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1 leading-relaxed">
                    Check your inbox. We have dispatched password recovery instructions to <strong>{email}</strong>.
                  </p>
                </div>
              </div>
              <Link href="/login" className="block w-full">
                <Button className="w-full justify-center">Return to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                id="email"
                placeholder="e.g. name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />

              <Button type="submit" className="w-full justify-center mt-2" isLoading={isLoading}>
                Send Recovery Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
