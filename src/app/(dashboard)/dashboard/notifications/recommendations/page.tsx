"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { regenerateRecommendations } from "@/app/actions/recommendations";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, Target, Flame, AlertTriangle, Clock, RefreshCw, ChevronRight, Award, Compass, ShieldAlert,
  TrendingUp, CheckCircle, BarChart3, Eye
} from "lucide-react";
import Link from "next/link";

interface RecommendationsData {
  studyRecommendations: string[];
  companyRecommendations: string[];
  streakAlerts: string[];
  weaknessAlerts: string[];
  dailyPlan: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  achievementAlerts: string[];
}

export default function AIRecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<RecommendationsData | null>(null);
  
  // Analytics states
  const [analytics, setAnalytics] = useState({
    openRate: 85,
    completionRate: 72,
    streakSuccessRate: 90
  });

  const fetchAnalyticsMetrics = useCallback(async (userId: string) => {
    try {
      // 1. Calculate Notification Open Rate dynamically
      const { data: notifs, error: notifError } = await (supabase.from("notifications") as any)
        .select("is_read")
        .eq("user_id", userId);
      
      let openRate = 85; // default fallback
      if (!notifError && notifs && notifs.length > 0) {
        const read = notifs.filter((n: any) => n.is_read).length;
        openRate = Math.round((read / notifs.length) * 100);
      }

      // 2. Fetch completed challenges to compute Recommendation Completion Rate
      const { data: challenges, error: chalError } = await (supabase.from("user_challenges") as any)
        .select("completed")
        .eq("user_id", userId);
      
      let completionRate = 70; // default fallback
      if (!chalError && challenges && challenges.length > 0) {
        const completed = challenges.filter((c: any) => c.completed).length;
        completionRate = Math.round((completed / challenges.length) * 100);
      }

      // 3. Compute Streak Protection Success Rate based on streak activity
      const { data: gamification } = await (supabase.from("user_gamification") as any)
        .select("streak_days")
        .eq("user_id", userId)
        .maybeSingle();

      const streakDays = gamification?.streak_days ?? 0;
      const streakSuccessRate = Math.min(100, 75 + (streakDays * 2));

      setAnalytics({
        openRate,
        completionRate: Math.max(10, completionRate),
        streakSuccessRate: Math.max(50, streakSuccessRate)
      });
    } catch (e) {
      console.error("Failed to compute analytics metrics:", e);
    }
  }, []);

  const loadSavedRecommendations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await (supabase.from("recommendation_logs") as any)
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Parse logs into structural object
        const study = data.filter((l: any) => l.recommendation_type === "study").map((l: any) => l.recommendation_text);
        const company = data.filter((l: any) => l.recommendation_type === "company").map((l: any) => l.recommendation_text);
        const streak = data.filter((l: any) => l.recommendation_type === "streak").map((l: any) => l.recommendation_text);
        const weakness = data.filter((l: any) => l.recommendation_type === "weakness").map((l: any) => l.recommendation_text);
        const achievement = data.filter((l: any) => l.recommendation_type === "achievement").map((l: any) => l.recommendation_text);

        // Daily plan
        const dailyPlanLog = data.find((l: any) => l.recommendation_type === "daily_plan");
        let dailyPlan = {
          morning: "Solve 5 Aptitude Questions",
          afternoon: "Solve 2 Coding Problems",
          evening: "Attempt 1 Interview Session"
        };

        if (dailyPlanLog) {
          const parts = dailyPlanLog.recommendation_text.split(" | ");
          dailyPlan = {
            morning: parts[0]?.replace("Morning: ", "") || dailyPlan.morning,
            afternoon: parts[1]?.replace("Afternoon: ", "") || dailyPlan.afternoon,
            evening: parts[2]?.replace("Evening: ", "") || dailyPlan.evening
          };
        }

        setRecs({
          studyRecommendations: study,
          companyRecommendations: company,
          streakAlerts: streak,
          weaknessAlerts: weakness,
          dailyPlan,
          achievementAlerts: achievement
        });
      } else {
        // Trigger initial recommendations generation
        handleRegenerate();
      }
      
      // Load analytics values
      fetchAnalyticsMetrics(user.id);
    } catch (e) {
      console.error("Failed to load saved recommendations:", e);
    }
  }, [user?.id, fetchAnalyticsMetrics]);

  useEffect(() => {
    if (user?.id) {
      loadSavedRecommendations();
    }
  }, [user?.id, loadSavedRecommendations]);

  const handleRegenerate = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await regenerateRecommendations(user.id);
      if (res.success && res.recommendations) {
        setRecs(res.recommendations);
        toast.success("AI Recommendations generated successfully!");
        fetchAnalyticsMetrics(user.id);
      } else {
        toast.error(res.error || "Failed to generate recommendations");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 260, damping: 22 } }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20 text-zinc-900 dark:text-zinc-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500 animate-pulse" />
            AI Placement Mentor
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Your personal coach analyzes your accuracy, resume, and coding speed to recommend steps.</p>
        </div>
        <div>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Analyzing profile..." : "Regenerate Recommendations"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <Link href="/dashboard/notifications" className="px-4 py-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
          Notification Center
        </Link>
        <Link href="/dashboard/notifications/recommendations" className="px-4 py-2 border-b-2 border-indigo-500 text-sm font-bold text-indigo-600 dark:text-indigo-400">
          AI Recommendations
        </Link>
        <Link href="/dashboard/notifications/settings" className="px-4 py-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
          Notification Settings
        </Link>
      </div>

      {/* Mentor Analytics Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Metric 1 */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Alert Open Rate</span>
            <p className="text-xl font-extrabold text-indigo-650 dark:text-indigo-400">{analytics.openRate}%</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Eye className="w-4.5 h-4.5" />
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Task Completion</span>
            <p className="text-xl font-extrabold text-emerald-500">{analytics.completionRate}%</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div variants={cardVariants} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Streak Preservation</span>
            <p className="text-xl font-extrabold text-amber-500">{analytics.streakSuccessRate}%</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
            <Flame className="w-4.5 h-4.5 fill-current" />
          </div>
        </motion.div>
      </motion.div>

      {loading && !recs ? (
        <div className="py-24 text-center space-y-4">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-500 animate-pulse">Our AI is fetching submissions, analyzing ATS score, and compiling roadmaps...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Daily AI Plan (Left / Column 4) */}
          <motion.div variants={cardVariants} className="md:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-full blur-xl" />
              
              <div className="space-y-0.5 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Daily Agenda</span>
                <h3 className="text-base font-bold flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Today's AI Plan
                </h3>
              </div>

              {recs?.dailyPlan && (
                <div className="space-y-4 relative">
                  <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-zinc-100 dark:bg-zinc-900" />
                  
                  {/* Morning */}
                  <div className="flex gap-3 relative z-10">
                    <div className="w-7.5 h-7.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs">
                      🌅
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Morning</span>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{recs.dailyPlan.morning}</p>
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="flex gap-3 relative z-10">
                    <div className="w-7.5 h-7.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-bold text-amber-500 shadow-2xs">
                      ☀️
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Afternoon</span>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{recs.dailyPlan.afternoon}</p>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="flex gap-3 relative z-10">
                    <div className="w-7.5 h-7.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-bold text-purple-500 shadow-2xs">
                      🌌
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Evening</span>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{recs.dailyPlan.evening}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Streak & Achievements Alerts */}
            {((recs?.streakAlerts && recs.streakAlerts.length > 0) || (recs?.achievementAlerts && recs.achievementAlerts.length > 0)) && (
              <motion.div variants={cardVariants} className="space-y-4">
                {/* Streak Alert */}
                {recs.streakAlerts?.map((alert, i) => (
                  <div key={i} className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                    <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 fill-current animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">Streak at Risk!</h4>
                      <p className="text-3xs text-zinc-550 dark:text-zinc-400 mt-0.5 font-medium leading-relaxed">{alert}</p>
                    </div>
                  </div>
                ))}

                {/* Achievement alert */}
                {recs.achievementAlerts?.map((ach, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
                    <Award className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 fill-current" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Milestone Unlocked!</h4>
                      <p className="text-3xs text-zinc-550 dark:text-zinc-400 mt-0.5 font-medium leading-relaxed">{ach}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Recommendations and Analysis (Right / Column 8) */}
          <motion.div variants={cardVariants} className="md:col-span-8 space-y-6">
            
            {/* Weakness Alerts */}
            {recs?.weaknessAlerts && recs.weaknessAlerts.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-700 dark:text-red-400">Active Weakness Flags</h4>
                  <ul className="list-disc list-inside text-3xs text-zinc-550 dark:text-zinc-400 mt-1 font-medium space-y-1">
                    {recs.weaknessAlerts.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Study Recommendations */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <Brain className="w-5 h-5 text-violet-500" />
                Study & Topic Recommendations
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {recs?.studyRecommendations?.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/10 hover:border-violet-500/30 transition-all duration-200"
                  >
                    <div className="h-6 w-6 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-650 dark:text-violet-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-normal">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Recommendations */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <Target className="w-5 h-5 text-indigo-500" />
                Target Company Prep readiness
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recs?.companyRecommendations?.map((comp, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-gradient-to-br from-zinc-50/40 to-zinc-50/10 dark:from-zinc-900/20 dark:to-zinc-900/5 flex flex-col justify-between hover:border-indigo-500/30 transition-all"
                  >
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-350 leading-relaxed">
                      {comp}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-4 cursor-pointer hover:underline">
                      <Compass className="w-3.5 h-3.5" />
                      View Preparations Roadmap
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
