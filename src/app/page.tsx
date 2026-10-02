"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { setAuthCookies } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutExamNova from "@/components/AboutExamNova";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. If Supabase redirected back to Site URL (/) with hash tokens or auth code
    const hash = window.location.hash;
    const hasHashTokens = hash.includes("access_token=") || hash.includes("error=");
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (code) {
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
      return;
    }
    if (hasHashTokens) {
      window.location.replace(`/auth/callback${hash}`);
      return;
    }
    if (error) {
      window.location.replace(`/login?error=${encodeURIComponent(errorDesc || error)}`);
      return;
    }

    // 2. If OAuth login was in progress and user landed here, ensure they go to dashboard
    const isPending =
      sessionStorage.getItem("examnova_auth_next") ||
      sessionStorage.getItem("examnova_oauth_in_progress") ||
      localStorage.getItem("examnova_auth_next") ||
      localStorage.getItem("examnova_oauth_in_progress");

    if (isPending) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const role = session.user.user_metadata?.role || "student";
          setAuthCookies(session, role);
          const savedNext =
            sessionStorage.getItem("examnova_auth_next") ||
            localStorage.getItem("examnova_auth_next") ||
            "/dashboard";
          
          try {
            sessionStorage.removeItem("examnova_auth_next");
            sessionStorage.removeItem("examnova_oauth_in_progress");
            localStorage.removeItem("examnova_auth_next");
            localStorage.removeItem("examnova_oauth_in_progress");
            document.cookie = "examnova_auth_next=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          } catch {}

          let destination = savedNext;
          if (!destination || destination === "/" || destination === "/login" || destination === "/signup") {
            destination = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
          }
          window.location.replace(destination);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-examnova-pastel text-zinc-900 dark:text-white font-sans selection:bg-pink-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <AboutExamNova />
        <Stats />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
