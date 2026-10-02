"use client";

import React, { useState } from "react";
import { Check, Sparkles, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/Button";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const pricingPlans = [
    {
      name: "Starter",
      priceMonthly: "₹0",
      priceAnnual: "₹0",
      period: "forever",
      description: "Ideal for students beginning their placement journey.",
      features: [
        "Basic Aptitude & Reasoning Sets",
        "Standard Coding Problem Suite",
        "Public Company Hub Access",
        "Basic Placement Analytics",
        "1 AI Resume Audit / Month",
      ],
      buttonText: "Get Started Free",
      buttonHref: "/register",
      popular: false,
      glowColor: "border-purple-500/10",
    },
    {
      name: "Pro Placement",
      priceMonthly: "₹399",
      priceAnnual: "₹299",
      period: "month",
      description: "Everything you need to guarantee placement readiness.",
      features: [
        "Everything in Starter",
        "Unlimited AI Resume ATS Audits",
        "AI Voice & Video Interview Coach",
        "500+ Company Specific Coding Problems",
        "Detailed ATS Keyword Matrix",
        "Personalized Weak Topic Remediation",
        "Priority 24/7 Support",
      ],
      buttonText: "Start 7-Day Free Trial",
      buttonHref: "/register?plan=pro",
      popular: true,
      badge: "🔥 Most Popular Choice",
      glowColor: "border-pink-500/40 shadow-2xl shadow-pink-500/20",
    },
    {
      name: "Ultimate Career",
      priceMonthly: "₹799",
      priceAnnual: "₹599",
      period: "month",
      description: "Full recruitment simulation & 1-on-1 AI mentorship.",
      features: [
        "Everything in Pro Placement",
        "Full Mock Campus Drive Simulator",
        "Unlimited AI Interview Sessions",
        "Custom Resume Rewrite Engine",
        "Direct HR Referral Network",
        "Live System Design Masterclasses",
        "Dedicated Placement Mentor",
      ],
      buttonText: "Unlock Ultimate",
      buttonHref: "/register?plan=ultimate",
      popular: false,
      glowColor: "border-purple-500/20",
    },
  ];

  return (
    <section id="pricing" className="py-14 bg-examnova-pastel relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-purple-500/20 shadow-md backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
              Transparent Investment
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight"
          >
            Simple, Flexible Pricing. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              No Hidden Fees.
            </span>
          </motion.h2>

          <p className="text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
            Choose the plan that accelerates your preparation velocity and secures your target salary package.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className={`text-sm font-bold ${!isAnnual ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
              Monthly Billing
            </span>

            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 p-1 transition-colors duration-300 focus:outline-none"
            >
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-md transform transition-transform duration-300 ${
                  isAnnual ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>

            <span className={`text-sm font-bold flex items-center gap-1.5 ${isAnnual ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
              <span>Annual Billing</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-extrabold shadow-sm">
                Save 25%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-[32px] p-8 glass-card-saas border ${
                plan.popular ? "border-pink-500/50 shadow-2xl shadow-pink-500/15" : "border-white/80 dark:border-white/10 shadow-xl"
              } flex flex-col justify-between transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{plan.description}</p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400">/{plan.period}</span>
                </div>

                <hr className="border-purple-500/10 dark:border-white/10 my-4" />

                {/* Feature Checklist */}
                <ul className="space-y-3.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-8 mt-6">
                <Link href={plan.buttonHref}>
                  <Button
                    size="lg"
                    className={`w-full rounded-2xl font-bold py-4 text-sm shadow-md border-0 transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white hover:scale-[1.02] shadow-pink-500/20"
                        : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800"
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
