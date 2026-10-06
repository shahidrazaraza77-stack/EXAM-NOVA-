"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sparkles, ArrowRight, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navbar focuses on rendering navigation, scroll state, and auth profile buttons

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Features", href: "/features" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Companies", href: "/companies" },
    { label: "Pricing", href: "/pricing" },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-purple-500/10 dark:border-white/10 py-3 shadow-lg shadow-purple-500/5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left: ExamNova logo + Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-[1.5px] shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova Logo" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
                Exam<span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Nova</span>
              </span>
            </Link>

            {/* AI Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/20 dark:border-purple-400/30 text-xs font-semibold text-purple-700 dark:text-purple-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span>AI Powered Placement Platform</span>
            </div>
          </div>

          {/* Center Nav Links with Animated Gliding Active Pill */}
          <nav className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl px-2.5 py-1.5 rounded-full border border-purple-500/15 dark:border-white/10 shadow-lg relative">
            {navLinks.map((link) => {
              const isActive = mounted && pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`relative text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full transition-colors duration-200 select-none ${
                    isActive
                      ? "text-white"
                      : "text-zinc-600 hover:text-[#FF2E8B] dark:text-zinc-300 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavbarPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#5B8CFF] shadow-md shadow-[#FF2E8B]/25"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2 rounded-full">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="font-medium text-zinc-700 dark:text-zinc-200 hover:text-purple-600"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push("/register")}
                  className="rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold px-5 py-2 shadow-lg shadow-pink-500/20 border-0 flex items-center gap-1.5 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-purple-500/20 text-zinc-700 dark:text-zinc-300 backdrop-blur-md"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-purple-500/10 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-xs font-semibold text-purple-600 dark:text-purple-300 w-max mb-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                <span>AI Powered Placement Platform</span>
              </div>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`block px-4 py-2.5 rounded-xl text-base font-extrabold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#5B8CFF] text-white shadow-md"
                        : "text-zinc-700 hover:bg-purple-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <hr className="border-purple-500/10 dark:border-zinc-800 my-2" />
              {user ? (
                <div className="flex flex-col gap-3 px-3">
                  <div className="text-sm font-medium text-zinc-500">
                    Signed in as <span className="text-zinc-800 dark:text-zinc-200">{user.name}</span>
                  </div>
                  <Button variant="ghost" className="w-full text-center" onClick={() => { router.push("/dashboard"); setIsMobileMenuOpen(false); }}>
                    Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-center gap-2 rounded-full" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-3 pt-2">
                  <Button variant="outline" className="w-full justify-center rounded-full" onClick={() => { router.push("/login"); setIsMobileMenuOpen(false); }}>
                    Login
                  </Button>
                  <Button variant="primary" className="w-full justify-center rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-semibold shadow-md" onClick={() => { router.push("/register"); setIsMobileMenuOpen(false); }}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

