"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  Quote, Play, ArrowRight, Sparkles, Video, ChevronLeft, ChevronRight, CheckCircle2, X 
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";

interface CounterProps {
  value: number;
  suffix?: string;
}

function Counter({ value, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const duration = 1500; // ms
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

const statsData = [
  { value: 10000, suffix: "+", label: "Students Preparing" },
  { value: 5000, suffix: "+", label: "Mock Interviews" },
  { value: 100000, suffix: "+", label: "Questions Solved" },
  { value: 500, suffix: "+", label: "Placement Offers" }
];

const testimonialsList = [
  {
    name: "Priya Verma",
    placedAt: "Microsoft",
    package: "₹22 LPA",
    review: "The AI Interview Coach helped me identify weaknesses and improve my communication skills before interviews. It felt like speaking to a real interviewer, and the granular feedback on my answer structure was a game changer.",
    initials: "PV",
    color: "from-blue-500 to-indigo-500",
    role: "Software Engineer Intern"
  },
  {
    name: "Aman Gupta",
    placedAt: "TCS",
    package: "₹7 LPA",
    review: "The company-specific roadmaps saved me time and helped me focus on the right topics. Instead of reading endless materials, I knew exactly what TCS asked in recent drives and cleared it on my first attempt.",
    initials: "AG",
    color: "from-purple-500 to-pink-500",
    role: "System Engineer"
  },
  {
    name: "Sneha Patel",
    placedAt: "Infosys",
    package: "₹8 LPA",
    review: "The aptitude preparation and analytics dashboard helped me stay consistent and improve steadily. I was able to track my accuracy rates by topic and double my speed in just three weeks of focused practice.",
    initials: "SP",
    color: "from-emerald-500 to-teal-500",
    role: "Systems Associate"
  }
];

const companiesList = [
  "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini", "Amazon", "Microsoft", "Google"
];

export default function Testimonials() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % testimonialsList.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length);
  };

  // Auto scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="relative py-28 bg-white dark:bg-[#030014] text-zinc-900 dark:text-white overflow-hidden border-t border-zinc-200 dark:border-zinc-900/60">
      {/* Styles for Infinite Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-70 pointer-events-none" />

      {/* Glow lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50/80 dark:bg-zinc-900/80 border border-pink-200 dark:border-indigo-500/25 backdrop-blur-md text-pink-700 dark:text-indigo-300 text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(219,39,119,0.1)] dark:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-purple-400 animate-pulse" />
            <span>🎉 Success Stories</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent leading-tight"
          >
            Students Who Cracked Their Dream Placements
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Thousands of students use ExamNova to prepare smarter, improve faster, and achieve placement success.
          </motion.p>
        </div>

        {/* Featured Success Story & Video Testimonial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          
          {/* Highlighted Success Card (7/12) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-md p-8 md:p-10 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden group hover:border-pink-500/35 dark:hover:border-indigo-500/35 transition-all duration-550"
          >
            {/* Animated card corner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-transparent to-pink-500/10 dark:to-indigo-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-pink-500/5 via-transparent to-rose-500/5 dark:from-purple-500/10 dark:via-transparent dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 flex items-center justify-center font-extrabold text-lg text-white shadow-xl">
                  RS
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Rahul Sharma</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Software Engineer</p>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Placed at Amazon
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Package: <strong className="text-zinc-900 dark:text-white text-sm">₹18 LPA</strong>
                </span>
              </div>
            </div>

            <div className="relative">
              <Quote className="absolute -top-6 -left-4 w-12 h-12 text-pink-500/10 dark:text-indigo-500/10 pointer-events-none" />
              <p className="text-zinc-700 dark:text-zinc-200 text-base md:text-lg font-medium leading-relaxed italic relative z-10">
                "ExamNova helped me improve my coding skills, optimize my resume, and gain confidence in interviews. The mock placement process gave me a realistic experience before the actual placement drive."
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-6 border-t border-zinc-200 dark:border-zinc-900 text-xs text-zinc-500 font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              SDE Preparation Path Verified & Bullseye Placement
            </div>
          </motion.div>

          {/* Video Testimonial Placeholder (5/12) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/80 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-pink-500/35 dark:hover:border-purple-500/35 transition-all duration-550"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 dark:via-zinc-950/40 to-white/90 dark:to-zinc-950/90 pointer-events-none z-10" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/5 to-rose-500/5 dark:from-purple-500/5 dark:to-indigo-500/5 opacity-50 pointer-events-none" />

            <div className="relative z-20">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pink-500 dark:text-purple-400 uppercase tracking-widest mb-1.5">
                <Video className="w-3 h-3" /> VIDEO SUCCESS STORIES
              </span>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">Hear From Successful Students</h4>
            </div>

            {/* Video Player & Testimonial */}
            <div className="flex-1 min-h-[220px] flex items-center justify-center relative mt-6 mb-3 bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden group/video shadow-inner">
              {isPlayingVideo ? (
                <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
                  <video
                    className="w-full h-full object-contain rounded-2xl"
                    controls
                    autoPlay
                    playsInline
                  >
                    <source src="/testimonial.mp4" type="video/mp4" />
                    <source src="/video/testimonial.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsPlayingVideo(false); }}
                    className="absolute top-2.5 right-2.5 z-40 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
                    title="Close video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsPlayingVideo(true)}
                  className="w-full h-full min-h-[220px] flex items-center justify-center relative cursor-pointer"
                >
                  {/* Real video preview thumbnail behind play button */}
                  <video
                    className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-75 group-hover/video:scale-105 transition-transform duration-500 pointer-events-none"
                    src="/testimonial.mp4#t=0.5"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                  {/* Play button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsPlayingVideo(true); }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-rose-600 dark:from-purple-600 dark:to-indigo-600 border border-white/30 flex items-center justify-center text-white shadow-2xl z-20 group-hover:scale-110 group-hover/video:shadow-[0_0_30px_rgba(219,39,119,0.5)] dark:group-hover/video:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer"
                    aria-label="Play testimonial video"
                  >
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-black/70 border border-white/15 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white z-20 flex items-center gap-2 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Hear From Successful Students
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Carousel Student Testimonials */}
        <div className="relative mb-24 max-w-4xl mx-auto">
          <div className="overflow-hidden relative min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {testimonialsList.map((tc, idx) => {
                if (idx !== activeSlide) return null;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="w-full rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-8 md:p-10 flex flex-col justify-between space-y-6 shadow-xl relative"
                  >
                    {/* Corner gradient glow */}
                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-transparent to-pink-500/5 dark:to-indigo-500/5 rounded-full blur-3xl pointer-events-none`} />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tc.color} flex items-center justify-center font-bold text-base text-white shadow-lg`}>
                          {tc.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-zinc-900 dark:text-white">{tc.name}</h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{tc.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-pink-600 dark:text-indigo-400 bg-pink-50 dark:bg-indigo-500/10 border border-pink-200 dark:border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                          Placed at {tc.placedAt}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Package: <strong className="text-zinc-900 dark:text-white">{tc.package}</strong></span>
                      </div>
                    </div>

                    <div className="relative">
                      <Quote className="absolute -top-5 -left-4 w-10 h-10 text-zinc-100 dark:text-white/5 pointer-events-none" />
                      <p className="text-zinc-700 dark:text-zinc-350 text-sm md:text-base font-semibold leading-relaxed italic relative z-10">
                        "{tc.review}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="flex justify-between items-center mt-6 px-2">
            <div className="flex gap-2">
              {testimonialsList.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveSlide(dotIdx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === activeSlide 
                      ? "bg-pink-500 dark:bg-indigo-500 w-6" 
                      : "bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Success Metrics Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-zinc-200 dark:border-zinc-900 pt-16 pb-16">
          {statsData.map((stat, sIdx) => (
            <motion.div 
              key={sIdx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: sIdx * 0.1 }}
              className="space-y-2 bg-zinc-50/80 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900/60 p-6 rounded-2xl shadow-inner backdrop-blur-sm group hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-300"
            >
              <span className="block text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white leading-none">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="block text-2xs md:text-xs text-zinc-500 font-bold uppercase tracking-wider group-hover:text-pink-500 dark:group-hover:text-indigo-400 transition-colors">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Company Logos Infinite Marquee Row */}
        <div className="border-t border-b border-zinc-200 dark:border-zinc-900/60 py-10 mb-28 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white dark:from-[#030014] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white dark:from-[#030014] to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-[200%] gap-12 items-center">
            {/* First sequence */}
            <div className="flex justify-around items-center gap-16 flex-1 animate-marquee shrink-0">
              {companiesList.map((logo, lIdx) => (
                <span 
                  key={`m1-${lIdx}`} 
                  className="text-sm font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors duration-300 select-none cursor-default"
                >
                  {logo}
                </span>
              ))}
            </div>
            {/* Duplicate sequence for seamless loop */}
            <div className="flex justify-around items-center gap-16 flex-1 animate-marquee shrink-0">
              {companiesList.map((logo, lIdx) => (
                <span 
                  key={`m2-${lIdx}`} 
                  className="text-sm font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors duration-300 select-none cursor-default"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Highlight Callout Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto rounded-3xl p-[1px] bg-gradient-to-r from-pink-500/20 via-rose-500/30 to-pink-500/20 dark:from-purple-500/20 dark:via-indigo-500/30 dark:to-blue-500/20 shadow-2xl"
        >
          <div className="relative rounded-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-8 py-12 md:py-16 text-center overflow-hidden border border-zinc-200 dark:border-white/5">
            {/* Backdrop glow lights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                Your Success Story Could Be Next
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Join thousands of students preparing for placements with ExamNova.
              </p>
              
              <div className="pt-4 flex justify-center">
                <Link href="/register" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 dark:from-purple-650 dark:via-indigo-650 dark:to-blue-650 rounded-xl opacity-75 group-hover:opacity-100 blur transition-opacity duration-300 shadow-[0_0_20px_rgba(219,39,119,0.25)] dark:shadow-[0_0_20px_rgba(99,102,241,0.25)]" />
                    <button className="relative flex items-center gap-2.5 px-8 py-4 rounded-xl bg-aurora-primary text-white font-bold text-sm w-full justify-center border border-aurora-primary/30 cursor-pointer transition-all duration-300">
                      Start Preparing Today
                      <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
