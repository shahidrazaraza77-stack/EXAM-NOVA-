"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { COMPANY_WEIGHTAGES, COMPANY_LOGOS } from "../components/mockData";
import { BarChart3, TrendingUp, Target, Building2, Award, PieChart, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mockPlacementService } from "@/services/mock-placement.service";
import { supabase } from "@/lib/supabase";

export default function AnalyticsView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readinessScore, setReadinessScore] = useState(70);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const uid: string = userId;
    async function loadData() {
      setLoading(true);
      try {
        const historyData = await mockPlacementService.getHistory(uid);
        setHistory(historyData);

        // Fetch user analytics for readiness score
        const { data: analytics } = await (supabase as any)
          .from("user_analytics")
          .select("resume_score, aptitude_score, coding_score, interview_score")
          .eq("user_id", uid)
          .maybeSingle();

        if (analytics) {
          const calculatedReadiness = Math.round(
            (analytics.resume_score || 0) * 0.20 +
            (analytics.aptitude_score || 0) * 0.25 +
            (analytics.coding_score || 0) * 0.30 +
            (analytics.interview_score || 0) * 0.25
          );
          setReadinessScore(calculatedReadiness);
        } else {
          const avgScore = historyData.length > 0
            ? Math.round(historyData.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / historyData.length)
            : 0;
          setReadinessScore(avgScore || 65);
        }
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const companyStats = useMemo(() => {
    const stats: Record<string, { count: number; totalScore: number; selections: number }> = {};
    history.forEach(h => {
      if (!stats[h.company]) stats[h.company] = { count: 0, totalScore: 0, selections: 0 };
      stats[h.company].count++;
      stats[h.company].totalScore += h.score || 0;
      if (h.result === "Selected" || h.result === "Offered") stats[h.company].selections++;
    });
    return Object.entries(stats).map(([company, s]) => ({
      company,
      avgScore: Math.round(s.totalScore / s.count),
      attempts: s.count,
      selections: s.selections,
      weight: COMPANY_WEIGHTAGES.find(w => w.company === company),
    }));
  }, [history]);

  const roundAverages = useMemo(() => {
    const totals = { resume: 0, aptitude: 0, coding: 0, interview: 0 };
    const counts = { resume: 0, aptitude: 0, coding: 0, interview: 0 };
    history.forEach(h => {
      if (h.rounds) {
        Object.entries(h.rounds).forEach(([key, val]) => {
          if (val !== null && val !== undefined && Number(val) > 0) {
            totals[key as keyof typeof totals] += Number(val);
            counts[key as keyof typeof counts]++;
          }
        });
      }
    });
    return Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [
        k,
        counts[k as keyof typeof counts] > 0 ? Math.round(v / counts[k as keyof typeof counts]) : 0
      ])
    );
  }, [history]);

  const getScoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-zinc-400">Loading analytics insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Placement Analytics</h2>
        <p className="text-xs text-zinc-500">Aggregated insights from your placement drives.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Drives", value: history.length, icon: BarChart3, color: "text-violet-600" },
          { label: "Avg Score", value: `${history.length > 0 ? Math.round(history.reduce((a, h) => a + (h.score || 0), 0) / history.length) : 0}%`, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Best Score", value: `${history.length > 0 ? Math.max(...history.map(h => h.score || 0)) : 0}%`, icon: Award, color: "text-amber-600" },
          { label: "Selections", value: `${history.filter(h => h.result === "Selected" || h.result === "Offered").length}/${history.length}`, icon: Target, color: "text-blue-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-955 space-y-2"
            >
              <div className={`p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 w-fit ${s.color}`}><Icon className="w-3.5 h-3.5" /></div>
              <div>
                <span className="text-xl font-black text-zinc-900 dark:text-white">{s.value}</span>
                <p className="text-[9px] font-semibold text-zinc-500">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Company-wise Performance</h3>
            </div>
            <div className="space-y-3">
              {companyStats.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-8">No placement data available yet.</p>
              ) : (
                companyStats.map((cs) => (
                  <div key={cs.company} className="flex items-center gap-4 p-3 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${COMPANY_LOGOS[cs.company] || "bg-zinc-500"}`}>{cs.company[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-extrabold text-zinc-800 dark:text-zinc-200">{cs.company}</span>
                        <span className={`text-xs font-black ${getScoreColor(cs.avgScore)}`}>{cs.avgScore}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${cs.avgScore >= 80 ? "bg-emerald-500" : cs.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${cs.avgScore}%` }} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-zinc-400">
                        <span>{cs.attempts} attempt{cs.attempts > 1 ? "s" : ""}</span>
                        <span>{cs.selections} selection{cs.selections !== 1 ? "s" : ""}</span>
                        {cs.weight && <span>Weights: Res 20% Apt 25% Cod 30% Int 25%</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Average Round Scores</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(roundAverages).map(([round, avg]) => {
                if (Number(avg) === 0) return null;
                return (
                  <div key={round} className="space-y-1.5">
                    <div className="flex justify-between text-2xs font-bold">
                      <span className="text-zinc-600 dark:text-zinc-400 capitalize">{round}</span>
                      <span className={getScoreColor(Number(avg))}>{avg}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${Number(avg) >= 80 ? "bg-emerald-500" : Number(avg) >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${avg}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.values(roundAverages).every(v => Number(v) === 0) && (
                <p className="text-xs text-zinc-400 text-center py-4">No round data available yet.</p>
              )}
            </div>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Readiness Impact</h3>
            </div>
            <p className="text-2xs text-zinc-500 leading-relaxed">
              Your placement drives contribute to your overall readiness score. Each completed drive updates your readiness metrics and skill gap analysis in the Analytics dashboard.
            </p>
            <div className="p-3 rounded-xl border border-violet-500/10 bg-violet-500/5 text-2xs font-semibold text-violet-700 dark:text-violet-300">
              Current Readiness: {readinessScore}% — {readinessScore >= 80 ? "Well prepared for placements" : readinessScore >= 60 ? "Moderately prepared, keep practicing" : "Needs significant preparation"}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
