"use client";

import React, { useState } from "react";
import { Search, Sparkles, ChevronDown, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "features" | "preparation";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What makes ExamNova's 3D AI Mascot & platform unique?",
    answer: "ExamNova combines high-level AI intelligence with personalized feedback engines for resume ATS scanning, voice mock interviews, coding problem tracing, and company-specific preparation paths.",
    category: "general"
  },
  {
    question: "How does the AI Resume Builder optimize my score for top companies?",
    answer: "Our parser scans your resume against actual ATS job descriptions at companies like Google, Amazon, TCS, and Infosys. It detects missing keywords, formatting errors, and suggests actionable metrics.",
    category: "features"
  },
  {
    question: "Is there a free tier available for students?",
    answer: "Yes! The Starter plan is 100% free forever and provides full access to core aptitude questions, basic coding problems, and company hub roadmaps.",
    category: "general"
  },
  {
    question: "How realistic is the AI Mock Interview Coach?",
    answer: "The AI coach conducts real-time audio and text interviews, asking follow-up questions tailored to your target job role. It provides feedback on your technical accuracy, speech speed, and confidence.",
    category: "features"
  },
  {
    question: "Can I prepare for company-specific placement drives?",
    answer: "Absolutely. We offer tailored question banks and past exam archives for over 50 top recruiters including Microsoft, Adobe, Wipro, Accenture, TCS, and Infosys.",
    category: "preparation"
  },
  {
    question: "How is the Placement Readiness Score calculated?",
    answer: "The readiness score synthesizes your aptitude performance, coding speed, ATS resume rank, and mock interview grades into a single benchmark percentile.",
    category: "preparation"
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-14 bg-examnova-pastel relative overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-purple-500/20 shadow-md backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
              Common Questions
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <p className="text-base text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto">
            Everything you need to know about ExamNova's AI platform and placement preparation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-purple-500" />
          </div>
          <input
            type="text"
            placeholder="Search questions (e.g. resume, mock interview, pricing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl glass-card-saas border border-white/80 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-lg"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="glass-card-saas rounded-[24px] border border-white/80 dark:border-white/10 overflow-hidden shadow-lg transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-pink-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 bg-purple-500/20" : ""}`}>
                    <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 pt-0 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-purple-500/10 dark:border-white/5"
                    >
                      <p className="pt-4">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
