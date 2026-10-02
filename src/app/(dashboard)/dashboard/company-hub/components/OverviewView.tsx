"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2, TrendingUp, PlayCircle, CheckCircle2, BookmarkCheck,
  ArrowRight, Sparkles, Target, Clock, Trophy, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { companyService } from "@/services/company.service";
import { dashboardService } from "@/services/dashboard.service";

const activityIcons: Record<string, React.ReactNode> = {
  company_added: <Building2 className="w-4 h-4 text-aurora-primary" />,
  practice_completed: <PlayCircle className="w-4 h-4 text-aurora-success" />,
  readiness_updated: <TrendingUp className="w-4 h-4 text-aurora-warning" />,
  bookmark_added: <BookmarkCheck className="w-4 h-4 text-aurora-accent" />,
  fallback: <CheckCircle2 className="w-4 h-4 text-aurora-primary" />
};

function getActivityTypeAndMessage(action: string, module: string): { type: string; message: string } {
  const lowerAction = action.toLowerCase();
  
  let type = "fallback";
  if (lowerAction.includes("added") || lowerAction.includes("start")) {
    type = "company_added";
  } else if (lowerAction.includes("complete") || lowerAction.includes("solved") || lowerAction.includes("practice")) {
    type = "practice_completed";
  } else if (lowerAction.includes("readiness") || lowerAction.includes("score")) {
    type = "readiness_updated";
  } else if (lowerAction.includes("bookmark") || lowerAction.includes("save")) {
    type = "bookmark_added";
  }
  
  return { type, message: action };
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return "Recent";
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return "Recent";
  }
}

export default function OverviewView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    avgReadiness: 0,
    practiceSessions: 0,
    completedTopics: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const comps = await companyService.getCompanies();
        let progressList: any[] = [];
        let userActivities: any[] = [];
        
        if (user?.id) {
          progressList = await companyService.getAllProgress(user.id);
          const dashData = await dashboardService.getDashboardData(user.id);
          userActivities = dashData.activities || [];
        }

        const progressMap = new Map<string, any>();
        progressList.forEach(p => progressMap.set(p.company_id, p));

        const totalComps = comps.length;
        const avgReadiness = progressList.length > 0
          ? Math.round(progressList.reduce((sum, p) => sum + (p.readiness_score || 0), 0) / progressList.length)
          : 0;
        const completedTopics = progressList.reduce((sum, p) => sum + (Array.isArray(p.completed_tasks) ? p.completed_tasks.length : 0), 0);
        const practiceSessions = userActivities.length + completedTopics;

        setStats({
          totalCompanies: totalComps,
          avgReadiness,
          practiceSessions,
          completedTopics
        });

        // Map top companies
        const mappedComps = comps.map(c => {
          const prog = progressMap.get(c.id);
          return {
            ...c,
            readinessScore: prog?.readiness_score || 0,
            type: c.difficulty === "Easy" ? "IT Services" : c.difficulty === "Medium" ? "Consulting" : "Technology"
          };
        });

        const sorted = [...mappedComps]
          .sort((a, b) => b.readinessScore - a.readinessScore)
          .slice(0, 5);

        setTopCompanies(sorted);
        setActivities(userActivities);
      } catch (err) {
        console.error("Failed to load dashboard overview data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const statCards = [
    { label: "Companies", value: String(stats.totalCompanies), icon: Building2, bg: "bg-aurora-primary/10 border-aurora-primary/20", textColor: "text-aurora-primary" },
    { label: "Avg Readiness", value: `${stats.avgReadiness}%`, icon: TrendingUp, bg: "bg-aurora-success/10 border-aurora-success/20", textColor: "text-aurora-success" },
    { label: "Sessions", value: String(stats.practiceSessions), icon: PlayCircle, bg: "bg-aurora-warning/10 border-aurora-warning/20", textColor: "text-aurora-warning" },
    { label: "Topics Done", value: String(stats.completedTopics), icon: CheckCircle2, bg: "bg-aurora-accent/10 border-aurora-accent/20", textColor: "text-aurora-accent" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-aurora-primary" />
        <p className="text-sm text-aurora-text-secondary font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:border-aurora-border-strong transition-all duration-200">
                <CardContent className="p-5 space-y-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", stat.bg)}>
                    <Icon className={cn("w-5 h-5", stat.textColor)} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-aurora-text">{stat.value}</div>
                    <p className="text-xs text-aurora-text-secondary">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="hover:border-aurora-border-strong transition-all duration-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-aurora-primary" />
                  <h3 className="font-bold text-sm text-aurora-text">Recent Activity</h3>
                </div>
              </div>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-6 text-xs text-aurora-text-muted italic font-semibold">
                    No recent activities recorded. Start practicing to see logs!
                  </div>
                ) : (
                  activities.map((item) => {
                    const { type, message } = getActivityTypeAndMessage(item.action, item.module);
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-aurora-bg/30 border border-aurora-border hover:bg-aurora-card-hover/20 transition-colors duration-200">
                        <div className="w-8 h-8 rounded-lg bg-aurora-surface border border-aurora-border flex items-center justify-center shadow-sm shrink-0">
                          {activityIcons[type] || activityIcons.fallback}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-aurora-text">{message}</p>
                          <p className="text-[10px] text-aurora-text-secondary mt-0.5">{formatRelativeTime(item.created_at)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-gradient-to-br from-aurora-primary to-aurora-primary/80 text-white border-none shadow-xl relative overflow-hidden aurora-noise">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white/90 animate-pulse" />
                <h3 className="font-bold text-sm text-white">Top Companies</h3>
              </div>
              <div className="space-y-3">
                {topCompanies.length === 0 ? (
                  <div className="text-center py-4 text-xs text-white/70 italic">
                    No companies configured.
                  </div>
                ) : (
                  topCompanies.map((company, i) => (
                    <div key={company.id} className="flex items-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 p-2.5 rounded-xl transition-all duration-200">
                      <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-xs font-extrabold shrink-0 border border-white/10 shadow-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-white">{company.name}</p>
                        <p className="text-[10px] text-white/75">{company.type}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 shadow-sm shrink-0">
                        <Trophy className="w-3.5 h-3.5 text-amber-300 drop-shadow-md" />
                        <span className="text-xs font-extrabold text-white">{company.readinessScore}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => onNavigate?.("companies")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl py-2.5 border border-white/10 hover:border-white/20 transition-all duration-250 cursor-pointer shadow-sm"
              >
                View All Companies <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardContent>
          </Card>

          <Card className="hover:border-aurora-border-strong transition-all duration-200">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-aurora-success" />
                <h3 className="font-bold text-sm text-aurora-text">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onNavigate?.("roadmaps")}
                  className="p-3.5 rounded-2xl bg-aurora-surface border border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-card-hover hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer shadow-sm"
                >
                  <p className="text-xs font-bold text-aurora-text">View Roadmaps</p>
                  <p className="text-[10px] text-aurora-text-secondary mt-0.5">Weekly plans</p>
                </button>
                <button
                  onClick={() => onNavigate?.("technical")}
                  className="p-3.5 rounded-2xl bg-aurora-surface border border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-card-hover hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer shadow-sm"
                >
                  <p className="text-xs font-bold text-aurora-text">Technical Prep</p>
                  <p className="text-[10px] text-aurora-text-secondary mt-0.5">Core subjects</p>
                </button>
                <button
                  onClick={() => onNavigate?.("hr")}
                  className="p-3.5 rounded-2xl bg-aurora-surface border border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-card-hover hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer shadow-sm"
                >
                  <p className="text-xs font-bold text-aurora-text">HR Interview</p>
                  <p className="text-[10px] text-aurora-text-secondary mt-0.5">Common questions</p>
                </button>
                <button
                  onClick={() => onNavigate?.("bookmarks")}
                  className="p-3.5 rounded-2xl bg-aurora-surface border border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-card-hover hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer shadow-sm"
                >
                  <p className="text-xs font-bold text-aurora-text">Bookmarks</p>
                  <p className="text-[10px] text-aurora-text-secondary mt-0.5">Saved companies</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
