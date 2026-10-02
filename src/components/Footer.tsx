"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Github, Twitter, Linkedin, Youtube, Instagram, 
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Mail
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setIsSubscribed(false);
    }, 3500);
  };

  const navLinks = [
    { label: "Home", href: "/#hero" },
    { label: "Features", href: "/#features" },
    { label: "Roadmap", href: "/#roadmap" },
    { label: "Companies", href: "/#companies" },
    { label: "Pricing", href: "/#pricing" },
    { label: "About", href: "/#about" },
  ];

  const productFeatures = [
    { label: "AI Resume Builder", href: "/#features" },
    { label: "ATS Scanner", href: "/#features" },
    { label: "Interview Coach", href: "/#features" },
    { label: "Coding Challenges", href: "/#features" },
    { label: "Placement Analytics", href: "/#features" },
    { label: "Company Hub", href: "/#companies" },
  ];

  const socials = [
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "X (Twitter)" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <footer className="bg-zinc-950 text-white pt-24 pb-12 relative overflow-hidden border-t border-purple-500/20">
      
      {/* Soft Dark Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        
        {/* Top CTA Banner */}
        <div className="rounded-[32px] p-8 sm:p-12 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Start Preparing Today
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Land Your Dream Offer Letter With ExamNova AI
            </h3>
            <p className="text-sm text-zinc-400 max-w-lg">
              Join over 50,000+ engineering students building top-tier technical careers.
            </p>
          </div>
          <Link href="/register">
            <button className="rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold px-8 py-4 text-base shadow-xl shadow-pink-500/20 flex items-center gap-2 group transition-transform hover:scale-105">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pt-8">
          
          {/* Brand Column (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-[1.5px] shadow-md shadow-pink-500/20">
                <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img src="/logo.jpg" className="w-full h-full object-cover" alt="ExamNova Logo" />
                </div>
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                Exam<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Nova</span>
              </span>
            </Link>

            <p className="text-xs font-bold text-pink-400 tracking-wider uppercase">
              AI-Powered Placement Platform
            </p>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Prepare smarter with AI Resume Builder, Coding Challenges, Mock Interviews, ATS Optimization, Placement Analytics, and Company-wise Practice.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10 transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links Column (3/12) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-xs font-medium text-zinc-400">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-pink-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Features Column (3/12) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Product Features</h4>
            <ul className="space-y-2.5 text-xs font-medium text-zinc-400">
              {productFeatures.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-purple-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (2/12) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Get weekly placement tips & interview updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs hover:opacity-95 transition-opacity"
              >
                {isSubscribed ? "Subscribed! 🎉" : "Subscribe"}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} ExamNova Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-zinc-300 transition-colors">Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
