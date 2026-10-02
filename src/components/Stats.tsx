"use client";

import { useEffect, useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import { Building2, Award, Users, ShieldCheck } from "lucide-react";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const duration = 1600; // ms
    const increment = end / (duration / 16);

    const updateCounter = () => {
      start += increment;
      if (start >= end) {
        setCount(end);
      } else {
        setCount(Math.floor(start));
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const TRUST_STATS = [
  { value: 50000, suffix: "+", label: "Students Trained", sub: "Cracked top placement drives", icon: Users, color: "text-pink-500" },
  { value: 95, suffix: "%", label: "ATS Success Rate", sub: "Passed automated HR filters", icon: ShieldCheck, color: "text-purple-500" },
  { value: 200, suffix: "+", label: "Partner Companies", sub: "Hiring directly via ExamNova", icon: Building2, color: "text-indigo-500" },
  { value: 100000, suffix: "+", label: "Mock Interviews", sub: "Completed with real-time AI feedback", icon: Award, color: "text-emerald-500" },
];

const COMPANY_LOGOS = [
  { name: "Amazon", color: "hover:text-amber-500" },
  { name: "Google", color: "hover:text-blue-500" },
  { name: "Microsoft", color: "hover:text-cyan-500" },
  { name: "Adobe", color: "hover:text-red-500" },
  { name: "Infosys", color: "hover:text-blue-600" },
  { name: "TCS", color: "hover:text-indigo-600" },
  { name: "Wipro", color: "hover:text-teal-600" },
  { name: "Accenture", color: "hover:text-purple-600" },
];

export default function Stats() {
  return (
    <section id="companies" className="py-14 bg-examnova-pastel relative overflow-hidden border-y border-purple-500/10 dark:border-white/5">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Animated Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card-saas p-8 rounded-[28px] border border-white/70 dark:border-white/10 shadow-xl shadow-purple-500/5 text-center flex flex-col items-center space-y-3 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>

                <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>

                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {stat.label}
                </h4>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                  {stat.sub}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Company Logos Banner Section */}
        <div className="space-y-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Engineers placed at top tech giants worldwide
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {COMPANY_LOGOS.map((company, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ scale: 1.15 }}
                className="glass-pill px-6 py-3 rounded-2xl shadow-md border border-purple-500/10 flex items-center justify-center group cursor-pointer"
              >
                <span className={`text-base sm:text-lg font-black tracking-tight text-zinc-600 dark:text-zinc-300 ${company.color} transition-colors`}>
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
