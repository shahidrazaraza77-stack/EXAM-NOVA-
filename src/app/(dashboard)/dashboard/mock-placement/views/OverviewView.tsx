"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Target, TrendingUp, Award, CheckCircle, Play, Clock, Building2, Loader2, ArrowRight, Zap, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mockPlacementService } from "@/services/mock-placement.service";
import { supabase } from "@/lib/supabase";

interface OverviewViewProps {
  onNavigate?: (tab: string) => void;
}

export default function OverviewView({ onNavigate }: OverviewViewProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    simulationsCompleted: 0,
    bestScore: 0,
    successRate: 0,
    averageScore: 0,
    readinessScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const uid: string = userId;
    async function loadData() {
      setLoading(true);
      try {
        const [historyData, statsData] = await Promise.all([
          mockPlacementService.getHistory(uid),
          mockPlacementService.getDashboardStats(uid)
        ]);

        setHistory(historyData);

        let calculatedReadiness = 0;
        try {
          const { data: analytics } = await (supabase as any)
            .from("user_analytics")
            .select("resume_score, aptitude_score, coding_score, interview_score")
            .eq("user_id", uid)
            .maybeSingle();

          if (analytics) {
            calculatedReadiness = Math.round(
              (analytics.aptitude_score || 0) * 0.25 +
              (analytics.coding_score || 0) * 0.35 +
              (analytics.interview_score || 0) * 0.25 +
              (analytics.resume_score || 0) * 0.15
            );
          }
        } catch {
          // analytics query failed — fallback below
        }

        if (!calculatedReadiness) {
          const avgScore = historyData.length > 0
            ? Math.round(historyData.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / historyData.length)
            : 0;
          calculatedReadiness = avgScore || 65;
        }

        const avgScore = historyData.length > 0
          ? Math.round(historyData.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / historyData.length)
          : 0;

        setStats({
          simulationsCompleted: statsData?.simulationsCompleted ?? 0,
          bestScore: statsData?.bestScore ?? 0,
          successRate: statsData?.successRate ?? 0,
          averageScore: avgScore,
          readinessScore: calculatedReadiness
        });
      } catch (err: any) {
        console.error("Failed to load placement overview stats:", err?.message || err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C5CFF]" />
        <p className="text-xs font-black text-[#7C5CFF]">Loading Placement Workspace...</p>
      </div>
    );
  }

  const statsCards = [
    { label: "Placements Taken", value: stats.simulationsCompleted.toString(), icon: BarChart3, color: "#7C5CFF", change: "Total attempts" },
    { label: "Average Score", value: `${stats.averageScore}%`, icon: TrendingUp, color: "#00FFC6", change: "Overall average" },
    { label: "Best Score", value: `${stats.bestScore}%`, icon: Award, color: "#F59E0B", change: "Personal best" },
    { label: "Readiness Score", value: `${stats.readinessScore}%`, icon: Target, color: "#00D9FF", change: "Profile weight" },
    { label: "Selection Rate", value: `${stats.successRate}%`, icon: CheckCircle, color: "#FF2E8B", change: `${stats.simulationsCompleted} total drives` },
  ];

  const recentDrives = history.slice(0, 3);

  return (
    <div className="space-y-8">
      
      {/* ─── TOP 5 METRICS ROW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="p-5 rounded-2xl bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border flex flex-col justify-between shadow-lg space-y-4 transition-all duration-300 relative overflow-hidden group"
              style={{
                borderColor: `${card.color}35`,
                boxShadow: `0 10px 30px ${card.color}10, inset 0 1px 1px ${card.color}25`
              }}
            >
              {/* Glow Accent */}
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"
                style={{ background: `${card.color}25` }}
              />

              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                  {card.label}
                </span>
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                  style={{ background: `${card.color}20`, border: `1px solid ${card.color}40` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{card.value}</span>
                <p className="text-[10px] font-extrabold" style={{ color: card.color }}>{card.change}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── MAIN 2-COLUMN GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Actions & Recent Placements */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 rounded-[28px] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-purple-500/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF2E8B]" />
                <h3 className="font-black text-base text-zinc-900 dark:text-white tracking-tight">Quick Placement Modes</h3>
              </div>
              <span className="text-xs font-black text-[#7C5CFF]">Select Drive Mode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { 
                  label: "Quick Placement", 
                  desc: "20 min • Aptitude + Coding", 
                  color: "#00FFC6",
                  bgGradient: "from-[#00FFC6]/15 via-[#00D9FF]/10 to-transparent",
                  borderColor: "border-[#00FFC6]/40",
                  onClick: () => onNavigate?.("start") 
                },
                { 
                  label: "Standard Placement", 
                  desc: "45 min • Aptitude + Coding + Tech", 
                  color: "#7C5CFF",
                  bgGradient: "from-[#FF2E8B]/15 via-[#7C5CFF]/10 to-transparent",
                  borderColor: "border-[#FF2E8B]/40",
                  onClick: () => onNavigate?.("start") 
                },
                { 
                  label: "Full Drive", 
                  desc: "60-90 min • All 4 rounds", 
                  color: "#F59E0B",
                  bgGradient: "from-[#F59E0B]/15 via-[#FF2E8B]/10 to-transparent",
                  borderColor: "border-amber-500/40",
                  onClick: () => onNavigate?.("start") 
                },
              ].map((action, i) => (
                <motion.button 
                  key={i} 
                  onClick={action.onClick}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${action.bgGradient} border ${action.borderColor} text-left transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-md flex flex-col justify-between min-h-[150px]`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${action.color}30, ${action.color}10)`, border: `1px solid ${action.color}45` }}
                    >
                      <Play className="w-4 h-4 fill-current" style={{ color: action.color }} />
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" style={{ color: action.color }} />
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-zinc-900 dark:text-white mb-1 group-hover:text-[#FF2E8B] transition-colors">{action.label}</h4>
                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{action.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent Placements Card */}
          <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 rounded-[28px] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7C5CFF]" />
                <h3 className="font-black text-base text-zinc-900 dark:text-white tracking-tight">Recent Placement Drives</h3>
              </div>
              <button onClick={() => onNavigate?.("history")} className="text-xs font-black text-[#7C5CFF] hover:underline cursor-pointer border-none bg-transparent">
                View History →
              </button>
            </div>

            <div className="space-y-3">
              {recentDrives.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl border border-purple-500/15 dark:border-white/10 bg-purple-500/5 dark:bg-white/[0.03] hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#7C5CFF]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-zinc-900 dark:text-white block">{h.company}</span>
                      <span className="text-[10px] font-bold text-zinc-400 block">{h.status === "ongoing" ? "Ongoing Drive" : "Completed"} • {h.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{h.score}%</span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                      h.result === "Selected" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                      h.result === "Borderline" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                      h.result === "Incomplete" ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/30" :
                      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                    }`}>{h.result}</span>
                  </div>
                </div>
              ))}

              {recentDrives.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <p className="text-xs font-bold text-zinc-400">No placement drives attempted yet.</p>
                  <button onClick={() => onNavigate?.("start")} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] text-white text-xs font-black cursor-pointer border-none shadow-md">
                    Start Your First Drive
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Placement Drive Stages Pipeline */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 rounded-[28px] shadow-xl space-y-5 flex-1">
            <div className="flex items-center justify-between border-b border-purple-500/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF2E8B]" />
                <h3 className="font-black text-base text-zinc-900 dark:text-white tracking-tight">Drive Stages Pipeline</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF2E8B]/10 text-[#FF2E8B] border border-[#FF2E8B]/30">
                6 ROUNDS
              </span>
            </div>

            <div className="relative border-l-2 border-purple-500/20 dark:border-white/10 ml-4 pl-6 space-y-5 my-2">
              {[
                { step: 1, label: "Company Selection", desc: "Choose target hiring company", color: "#FF2E8B" },
                { step: 2, label: "Aptitude Round", desc: "Timed MCQ speed assessment", color: "#7C5CFF" },
                { step: 3, label: "Coding Round", desc: "DSA problem solving IDE", color: "#00D9FF" },
                { step: 4, label: "Technical Interview", desc: "AI Speech & core concepts", color: "#00FFC6" },
                { step: 5, label: "HR Interview", desc: "Behavioral & communication", color: "#F59E0B" },
                { step: 6, label: "Final Result", desc: "Score & AI hiring report", color: "#FF2E8B" },
              ].map((s) => (
                <div key={s.step} className="relative flex items-start justify-between group">
                  {/* Step bubble */}
                  <div 
                    className="absolute -left-[37px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md transition-transform group-hover:scale-110"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}45`, color: s.color }}
                  >
                    {s.step}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-[#7C5CFF] transition-colors">{s.label}</span>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
