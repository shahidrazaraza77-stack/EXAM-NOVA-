"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Target, FileText, Brain, Code2, Video, TrendingUp, Sparkles,
  ChevronRight, Briefcase, Loader2, Flame, Trophy, Activity,
  Zap, Check, User, ArrowRight, Award, Bell, Clock, Plus,
  BookOpen, AlertCircle, ArrowUpRight, Cpu, BarChart2,
  CheckCircle2, Circle, Star
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Area, AreaChart
} from "recharts";
import { dashboardService } from "@/services/dashboard.service";
import { resumeService } from "@/services/resume";
import { interviewService } from "@/services/interview.service";
import { notificationService } from "@/services/notification.service";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const timeAgo = (dateStr: string) => {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs < 0) return "just now";
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  } catch { return "some time ago"; }
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
    <div className="h-24 rounded-2xl aurora-skeleton" />
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl aurora-skeleton" />
      ))}
    </div>
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-6">
        <div className="h-48 rounded-2xl aurora-skeleton" />
        <div className="h-64 rounded-2xl aurora-skeleton" />
      </div>
      <div className="col-span-4 space-y-6">
        <div className="h-48 rounded-2xl aurora-skeleton" />
        <div className="h-48 rounded-2xl aurora-skeleton" />
      </div>
    </div>
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <motion.div
      whileHover={{ y: -2 }}
      className="aurora-card aurora-card-hoverable p-4 flex flex-col gap-3 group"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {href && (
          <ArrowUpRight
            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#64748B" }}
          />
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-zinc-900 dark:text-[#F8FAFC] leading-none">{value}</div>
        <div className="text-xs text-zinc-500 dark:text-[#64748B] mt-1 leading-tight">{label}</div>
        {sub && (
          <div className="text-[10px] mt-1" style={{ color }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(109,93,246,0.12)", border: "1px solid rgba(109,93,246,0.2)" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: "#6D5DF6" }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-[#F8FAFC] leading-none">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-[#64748B] mt-0.5 leading-tight truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");

  // Data states (unchanged from original)
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [codingStats, setCodingStats] = useState<any>(null);
  const [aptitudeStats, setAptitudeStats] = useState<any>(null);
  const [latestResume, setLatestResume] = useState<any>(null);
  const [latestInterview, setLatestInterview] = useState<any>(null);
  const [targetCompanies, setTargetCompanies] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, text: "Solve a coding challenge", completed: false, type: "coding" },
    { id: 2, text: "Complete an aptitude workout", completed: false, type: "aptitude" },
    { id: 3, text: "Optimize ATS resume score", completed: false, type: "resume" },
    { id: 4, text: "Conduct a technical interview session", completed: false, type: "interview" },
  ]);

  const toggleGoal = async (id: number, text: string) => {
    setDailyGoals(prev => prev.map(g => {
      if (g.id === id) {
        const next = !g.completed;
        if (next && user) {
          dashboardService.logActivity(user.id, `Completed goal: ${text}`, "Goals").catch(() => {});
          reloadLogs();
        }
        return { ...g, completed: next };
      }
      return g;
    }));
  };

  const reloadLogs = async () => {
    if (!user) return;
    try {
      const d = await dashboardService.getDashboardData(user.id);
      setActivities(d.activities);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    console.log("[AUTH] Dashboard Mounted for user:", user.id);

    async function load() {
      if (!user) return;
      try {
        setDataLoading(true);

        // Fetch all requirements in parallel to prevent sequential execution blocking
        const [
          baseDataResult,
          codingInfoResult,
          aptitudeInfoResult,
          resumesResult,
          interviewsResult,
          companiesResult,
          notificationsResult,
        ] = await Promise.allSettled([
          dashboardService.getDashboardData(user.id),
          apiFetch("/api/coding/analytics").then((r) => (r.ok ? r.json() : null)),
          apiFetch("/api/aptitude/analytics").then((r) => (r.ok ? r.json() : null)),
          resumeService.getResumes(user.id),
          interviewService.getSessions(user.id),
          (supabase as any)
            .from("user_company_progress")
            .select("*, companies(*)")
            .eq("user_id", user.id),
          notificationService.getNotifications(user.id),
        ]);

        const baseData = baseDataResult.status === "fulfilled" ? baseDataResult.value : { profile: null, analytics: null, activities: [] };
        const codingInfo = codingInfoResult.status === "fulfilled" ? codingInfoResult.value : null;
        const aptitudeInfo = aptitudeInfoResult.status === "fulfilled" ? aptitudeInfoResult.value : null;

        const resumes = resumesResult.status === "fulfilled" ? (resumesResult.value as any) : [];
        const resumeRecord = resumes && resumes.length > 0 ? resumes[0] : null;

        const interviews = interviewsResult.status === "fulfilled" ? (interviewsResult.value as any) : [];
        const interviewRecord = interviews && interviews.length > 0 ? interviews[0] : null;

        let companyRoadmaps: any[] = [];
        if (companiesResult.status === "fulfilled" && companiesResult.value) {
          const { data, error } = companiesResult.value as any;
          if (!error && data) companyRoadmaps = data;
        }

        const recentNotifications = notificationsResult.status === "fulfilled" ? (notificationsResult.value || []) as any : [];

        setProfile(baseData.profile);
        setAnalytics(baseData.analytics);
        setActivities(baseData.activities);
        setCodingStats(codingInfo);
        setAptitudeStats(aptitudeInfo);
        setLatestResume(resumeRecord);
        setLatestInterview(interviewRecord);
        setTargetCompanies(companyRoadmaps);
        setNotifications(recentNotifications);

        if (baseData.analytics) {
          const a = baseData.analytics;
          const calc = Math.round(
            ((a.resume_score || 0) * 0.25) +
            ((a.aptitude_score || 0) * 0.25) +
            ((a.coding_score || 0) * 0.30) +
            ((a.interview_score || 0) * 0.20)
          );
          if (calc !== a.overall_readiness) {
            await (supabase.from("user_analytics") as any)
              .update({ overall_readiness: calc })
              .eq("user_id", user.id);
            setAnalytics((p: any) => ({ ...p, overall_readiness: calc }));
          }
        }

        await dashboardService.logActivity(user.id, "Accessed Student Performance Dashboard Center", "Dashboard");
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setDataLoading(false);
      }
    }

    load();
  }, [user, authLoading, router]);

  const dismissNotification = async (id: string) => {
    const ok = await notificationService.markNotificationRead(id);
    if (ok) setNotifications(p => p.filter(n => n.id !== id));
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    const ok = await notificationService.clearAllNotifications(user.id);
    if (ok) setNotifications([]);
  };

  if (authLoading || dataLoading) return <DashboardSkeleton />;

  // Derived values
  const displayName = profile?.full_name || user?.full_name || user?.name || "Candidate";
  const overallReadiness = analytics?.overall_readiness || 0;
  const streakDays = analytics?.streak || 0;
  const xpEarned = analytics?.xp || 0;
  const currentLevel = Math.floor(xpEarned / 100) + 1;
  const levelProgress = xpEarned % 100;

  const totalCodingSolved = codingStats
    ? (codingStats.solvedEasy || 0) + (codingStats.solvedMedium || 0) + (codingStats.solvedHard || 0)
    : 0;

  // AI recommendation
  let recTitle = "Build Your Resume";
  let recDesc = "Upload your resume to get ATS score and AI feedback.";
  let recHref = "/dashboard/resume-builder";
  let recBtn = "Build Resume";
  if (latestResume) {
    if (totalCodingSolved === 0) {
      recTitle = "Start Coding Practice"; recDesc = "Solve your first DSA challenge."; recHref = "/dashboard/coding"; recBtn = "Practice Coding";
    } else if (!latestInterview) {
      recTitle = "Try AI Interview Coach"; recDesc = "Run a live behavioral mock with AI feedback."; recHref = "/dashboard/interview-coach"; recBtn = "Start Interview";
    } else if (aptitudeStats?.totalSolved === 0) {
      recTitle = "Aptitude Workout"; recDesc = "Build your quantitative aptitude skills."; recHref = "/dashboard/aptitude"; recBtn = "Start Aptitude";
    }
  }

  // Chart data
  const weeklySolved = codingStats?.weeklySolved || [
    { name: "W1", solved: 0 }, { name: "W2", solved: 0 }, { name: "W3", solved: 0 },
    { name: "W4", solved: 0 }, { name: "W5", solved: 0 }, { name: "W6", solved: 0 },
  ];
  const accuracyTrend = codingStats?.accuracyTrend || [
    { name: "W1", accuracy: 0 }, { name: "W2", accuracy: 0 }, { name: "W3", accuracy: 0 },
    { name: "W4", accuracy: 0 }, { name: "W5", accuracy: 0 }, { name: "W6", accuracy: 0 },
  ];

  // Readiness gauge
  const R = 46;
  const C = 2 * Math.PI * R;
  const offset = C - (overallReadiness / 100) * C;

  const completedGoals = dailyGoals.filter(g => g.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16 text-zinc-900 dark:text-[#F8FAFC]"
    >

      {/* ── Welcome Banner ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-pink-50 via-white to-pink-50 border border-zinc-200 dark:from-[#18233F] dark:via-[#1a1f3a] dark:to-[#101827] dark:border-white/10"
      >
        {/* Glow */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(219,39,119,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(109,93,246,0.12)_0%,transparent_70%)]"
        />

        <div className="relative space-y-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-[#64748B]">{greeting},</p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#F8FAFC] leading-tight truncate">{displayName} 👋</h1>
          <p className="text-sm text-zinc-500 dark:text-[#64748B]">
            Your placement readiness is at{" "}
            <span className={`font-semibold ${overallReadiness >= 70 ? "text-green-500" : overallReadiness >= 40 ? "text-amber-500" : "text-red-500"}`}>
              {overallReadiness}%
            </span>
            {" "}— keep pushing.
          </p>
        </div>

        <div className="relative flex items-center gap-3 shrink-0 flex-wrap">
          {streakDays > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-[#F59E0B]"
            >
              <Flame className="w-4 h-4 fill-current" />
              {streakDays} day streak
            </div>
          )}
          <Link href="/dashboard/mock-placement">
            <Button size="md" className="gap-2">
              <Award className="w-4 h-4" />
              Take Placement Test
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Placement Readiness"
          value={`${overallReadiness}%`}
          sub={overallReadiness >= 70 ? "↑ On track" : "Needs work"}
          color="#6D5DF6"
          href="/dashboard/analytics"
        />
        <StatCard
          icon={Code2}
          label="Problems Solved"
          value={totalCodingSolved}
          sub={codingStats?.accuracy ? `${codingStats.accuracy}% accuracy` : "Start coding"}
          color="#00D4FF"
          href="/dashboard/coding"
        />
        <StatCard
          icon={Brain}
          label="Aptitude Score"
          value={`${analytics?.aptitude_score ?? 0}%`}
          sub={aptitudeStats?.totalSolved ? `${aptitudeStats.totalSolved} MCQs solved` : "Not started"}
          color="#22C55E"
          href="/dashboard/aptitude"
        />
        <StatCard
          icon={Video}
          label="Interview Score"
          value={latestInterview ? `${latestInterview.score}/100` : "—"}
          sub={latestInterview ? "Last session" : "No sessions yet"}
          color="#F59E0B"
          href="/dashboard/interview-coach"
        />
      </div>

      {/* ── Main 8/4 Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Placement Readiness Card */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={Target}
              title="Placement Readiness Score"
              subtitle="Resume 25% · Aptitude 25% · Coding 30% · Interview 20%"
            />

            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* SVG Ring */}
              <div className="relative shrink-0 flex items-center justify-center" style={{ width: 112, height: 112 }}>
                <svg width={112} height={112} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={56} cy={56} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                  <motion.circle
                    cx={56} cy={56} r={R}
                    fill="none"
                    stroke="url(#readinessGrad)"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6D5DF6" />
                      <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-[#F8FAFC] leading-none">{overallReadiness}%</span>
                  <span className="text-[9px] text-zinc-500 dark:text-[#64748B] font-medium uppercase tracking-wider mt-1">Ready</span>
                </div>
              </div>

              {/* Score bars */}
              <div className="flex-1 space-y-3 min-w-0 w-full">
                {[
                  { label: "Resume", score: analytics?.resume_score ?? 0, color: "#6D5DF6" },
                  { label: "Aptitude", score: analytics?.aptitude_score ?? 0, color: "#22C55E" },
                  { label: "Coding", score: analytics?.coding_score ?? 0, color: "#00D4FF" },
                  { label: "Interview", score: analytics?.interview_score ?? 0, color: "#F59E0B" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-[#94A3B8]">{item.label}</span>
                      <span className="font-semibold" style={{ color: item.color }}>{item.score}%</span>
                    </div>
                    <div className="aurora-progress">
                      <motion.div
                        className="aurora-progress-fill"
                        style={{ background: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coding Progress */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={Code2}
              title="Coding Progress"
              subtitle="Algorithm & DSA challenge tracker"
              action={
                codingStats && (
                  <span className="text-xs font-semibold" style={{ color: "#00D4FF" }}>
                    {codingStats.accuracy || 0}% accuracy
                  </span>
                )
              }
            />

            {totalCodingSolved === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-white/5"
                >
                  <Code2 className="w-5 h-5 text-zinc-400 dark:text-[#64748B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-[#94A3B8]">No problems solved yet</p>
                  <p className="text-xs mt-1 text-zinc-500 dark:text-[#64748B]">Start practicing to build your DSA profile</p>
                </div>
                <Link href="/dashboard/coding">
                  <Button size="sm">Solve Challenges</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Easy", count: codingStats.solvedEasy, total: codingStats.totalEasy || 10, color: "#22C55E" },
                    { label: "Medium", count: codingStats.solvedMedium, total: codingStats.totalMedium || 10, color: "#F59E0B" },
                    { label: "Hard", count: codingStats.solvedHard, total: codingStats.totalHard || 10, color: "#EF4444" },
                  ].map((d, i) => {
                    const pct = Math.round((d.count / Math.max(d.total, 1)) * 100);
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl space-y-2 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-[#94A3B8]">{d.label}</span>
                          <span className="font-semibold" style={{ color: d.color }}>
                            {d.count}/{d.total}
                          </span>
                        </div>
                        <div className="aurora-progress">
                          <motion.div
                            className="aurora-progress-fill"
                            style={{ background: d.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-[#64748B]">{pct}%</div>
                      </div>
                    );
                  })}
                </div>

                {codingStats.dailyChallenge && (
                  <div
                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-pink-50 dark:bg-[#6D5DF6]/10 border border-pink-100 dark:border-[#6D5DF6]/20"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="aurora-badge aurora-badge-primary text-[10px]">Daily Challenge</span>
                        <span className="text-[10px] text-zinc-500 dark:text-[#64748B]">{codingStats.dailyChallenge.topic}</span>
                      </div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-[#F8FAFC] truncate">{codingStats.dailyChallenge.title}</p>
                    </div>
                    <Link href="/dashboard/coding" className="shrink-0">
                      <Button size="sm" className="gap-1">
                        Solve <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Aptitude Progress */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={Brain}
              title="Aptitude Progress"
              subtitle="Quantitative & logical reasoning tracker"
              action={
                aptitudeStats?.totalSolved ? (
                  <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>
                    {aptitudeStats.totalSolved} solved
                  </span>
                ) : null
              }
            />
            {(!aptitudeStats || aptitudeStats.totalSolved === 0) ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-white/5"
                >
                  <Brain className="w-5 h-5 text-zinc-400 dark:text-[#64748B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-[#94A3B8]">No aptitude logs yet</p>
                  <p className="text-xs mt-1 text-zinc-500 dark:text-[#64748B]">Practice MCQs to unlock analytics</p>
                </div>
                <Link href="/dashboard/aptitude">
                  <Button size="sm">Begin Aptitude</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aptitudeStats.topicAccuracy?.map((t: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl text-xs bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                    >
                      <span className="font-medium text-zinc-500 dark:text-[#94A3B8]">{t.topic}</span>
                      <span className="font-semibold text-pink-600 dark:text-[#6D5DF6]">{t.accuracy}%</span>
                    </div>
                  ))}
                </div>

                {aptitudeStats.weakTopics?.length > 0 && (
                  <div
                    className="p-4 rounded-xl space-y-2 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/15"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-500 dark:text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Priority Topics
                    </div>
                    {aptitudeStats.weakTopics.map((t: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-xs py-1.5 ${i > 0 ? "border-t border-red-100 dark:border-red-500/10" : ""}`}
                      >
                        <span className="text-zinc-600 dark:text-[#94A3B8]">{t.name}</span>
                        <span className="font-semibold text-red-600 dark:text-[#EF4444]">{t.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analytics Charts */}
          {mounted && (
            <div className="aurora-card p-5">
              <SectionHeader icon={TrendingUp} title="Skill Progression" subtitle="Weekly solved count and accuracy trends" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-zinc-500 dark:text-[#64748B]">
                    Weekly Solved
                  </p>
                  <div className="w-full min-w-0" style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height={180} minWidth={0}>
                      <BarChart data={weeklySolved} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "#18233F",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10,
                            fontSize: 11,
                            color: "#F8FAFC",
                          }}
                          cursor={{ fill: "rgba(109,93,246,0.06)" }}
                        />
                        <Bar dataKey="solved" fill="#6D5DF6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-zinc-500 dark:text-[#64748B]">
                    Accuracy Trend (%)
                  </p>
                  <div className="w-full min-w-0" style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height={180} minWidth={0}>
                      <AreaChart data={accuracyTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "#18233F",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10,
                            fontSize: 11,
                            color: "#F8FAFC",
                          }}
                          cursor={{ stroke: "rgba(0,212,255,0.2)" }}
                        />
                        <Area type="monotone" dataKey="accuracy" stroke="#00D4FF" strokeWidth={2} fill="url(#areaGrad)" dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Roadmaps */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={Briefcase}
              title="Target Company Roadmaps"
              subtitle="Your prep progress by company"
              action={
                <Link href="/dashboard/company-hub">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              }
            />

            {targetCompanies.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-white/5"
                >
                  <Briefcase className="w-5 h-5 text-zinc-400 dark:text-[#64748B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-[#94A3B8]">No roadmaps yet</p>
                  <p className="text-xs mt-1 text-zinc-500 dark:text-[#64748B]">Add target companies to track progress</p>
                </div>
                <Link href="/dashboard/company-hub">
                  <Button size="sm">Explore Companies</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {targetCompanies.map((c: any, i: number) => {
                  const name = c.companies?.name || "Target";
                  const score = c.readiness_score || 0;
                  return (
                    <Link key={i} href={`/dashboard/company-hub/${c.companies?.slug || ""}`}>
                      <motion.div
                        whileHover={{ y: -1 }}
                        className="p-4 rounded-xl space-y-3 cursor-pointer transition-colors bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-pink-200 dark:hover:border-[#6D5DF6]/25"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-[#F8FAFC]">{name}</p>
                          <span className="aurora-badge aurora-badge-primary">{score}%</span>
                        </div>
                        <div className="aurora-progress">
                          <div className="aurora-progress-fill" style={{ width: `${score}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 dark:text-[#64748B]">
                          <span>Coding: {c.coding_progress || 0}%</span>
                          <span>Aptitude: {c.aptitude_progress || 0}%</span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Daily Goals */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={Sparkles}
              title="Daily Goals"
              subtitle={`${completedGoals}/${dailyGoals.length} completed`}
            />

            {/* Level progress */}
            <div
              className="flex items-center justify-between mb-4 p-3 rounded-xl text-xs bg-pink-50 dark:bg-[#6D5DF6]/10 border border-pink-100 dark:border-[#6D5DF6]/20"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-pink-600 dark:text-[#6D5DF6]" />
                <span className="text-zinc-600 dark:text-[#94A3B8]">Level {currentLevel}</span>
              </div>
              <span className="font-semibold text-pink-500 dark:text-[#a99ef9]">{xpEarned} XP</span>
            </div>
            <div className="aurora-progress mb-4">
              <div className="aurora-progress-fill" style={{ width: `${levelProgress}%` }} />
            </div>

            <ul className="space-y-2">
              {dailyGoals.map((goal) => (
                <li
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id, goal.text)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                    goal.completed
                      ? "bg-green-50 border-green-200 dark:bg-green-500/5 dark:border-green-500/15"
                      : "bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all border-2 ${
                      goal.completed
                        ? "bg-green-500 border-green-500"
                        : "bg-transparent border-zinc-300 dark:border-white/15"
                    }`}
                  >
                    {goal.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-xs font-medium leading-snug ${
                      goal.completed
                        ? "text-zinc-400 dark:text-[#64748B] line-through"
                        : "text-zinc-600 dark:text-[#94A3B8]"
                    }`}
                  >
                    {goal.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Continue Learning */}
          <div className="aurora-card p-5">
            <SectionHeader icon={BookOpen} title="Continue Learning" subtitle="AI-recommended next step" />

            <div
              className="p-4 rounded-xl space-y-3 bg-pink-50 dark:bg-[#6D5DF6]/5 border border-pink-100 dark:border-[#6D5DF6]/15"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-pink-100 dark:bg-[#6D5DF6]/20"
                >
                  <Cpu className="w-3.5 h-3.5 text-pink-600 dark:text-[#6D5DF6]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-[#F8FAFC] leading-snug">{recTitle}</p>
                  <p className="text-[11px] mt-1 leading-relaxed text-zinc-500 dark:text-[#64748B]">{recDesc}</p>
                </div>
              </div>
              <Link href={recHref}>
                <Button size="sm" className="w-full gap-1.5">
                  {recBtn} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Resume Status */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={FileText}
              title="Resume Status"
              subtitle="ATS compliance analysis"
            />

            {!latestResume ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-white/5"
                >
                  <FileText className="w-4.5 h-4.5 text-zinc-400 dark:text-[#64748B]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-[#94A3B8]">No resume uploaded</p>
                  <p className="text-[11px] mt-0.5 text-zinc-500 dark:text-[#64748B]">Upload to get ATS score</p>
                </div>
                <Link href="/dashboard/resume-builder" className="w-full">
                  <Button size="sm" className="w-full">Upload Resume</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-[#F8FAFC] truncate">
                      {latestResume.file_name || latestResume.name || "Resume.pdf"}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>
                      {timeAgo(latestResume.created_at)}
                    </p>
                  </div>
                  <span className="aurora-badge aurora-badge-success ml-2 shrink-0">
                    {latestResume.score || latestResume.ats_score || 0}% ATS
                  </span>
                </div>
                <Link href="/dashboard/resume-builder" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Edit Resume
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Interview Status */}
          <div className="aurora-card p-5">
            <SectionHeader
              icon={Video}
              title="Interview Coach"
              subtitle="AI mock session tracker"
            />

            {!latestInterview ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-white/5"
                >
                  <Video className="w-4.5 h-4.5 text-zinc-400 dark:text-[#64748B]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-[#94A3B8]">No sessions yet</p>
                  <p className="text-[11px] mt-0.5 text-zinc-500 dark:text-[#64748B]">Try a mock behavioral or technical interview</p>
                </div>
                <Link href="/dashboard/interview-coach" className="w-full">
                  <Button size="sm" className="w-full">Start Interview</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                >
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-[#F8FAFC] capitalize">
                      {latestInterview.mode} Interview
                    </p>
                    <p className="text-[10px] mt-0.5 text-zinc-500 dark:text-[#64748B]">
                      {latestInterview.role || "Software Engineer"}
                    </p>
                  </div>
                  <span className="aurora-badge aurora-badge-primary shrink-0">
                    {latestInterview.score}/100
                  </span>
                </div>
                {latestInterview.feedback_summary && (
                  <p className="text-[11px] italic leading-relaxed text-zinc-500 dark:text-[#64748B]">
                    "{latestInterview.feedback_summary}"
                  </p>
                )}
                <Link href="/dashboard/interview-coach" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    New Session
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="aurora-card p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={Bell} title="Alerts" subtitle="AI-powered study suggestions" />
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[10px] font-semibold shrink-0 mb-4 ml-2"
                  style={{ color: "#EF4444" }}
                >
                  Clear all
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs font-medium text-zinc-500 dark:text-[#94A3B8]">All caught up 🌟</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {notifications.slice(0, 4).map((n) => (
                    <motion.div
                      key={n.id}
                      exit={{ opacity: 0, x: -8 }}
                      className="flex items-start gap-3 p-3 rounded-xl group relative bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.priority === "high" ? "bg-red-50 dark:bg-red-500/15" : "bg-indigo-50 dark:bg-[#6D5DF6]/15"}`}
                      >
                        <Bell className={`w-2.5 h-2.5 ${n.priority === "high" ? "text-red-500 dark:text-[#EF4444]" : "text-indigo-600 dark:text-[#6D5DF6]"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-[#F8FAFC] leading-snug truncate">{n.title}</p>
                        <p className="text-[10px] mt-0.5 line-clamp-2 text-zinc-500 dark:text-[#64748B]">{n.message}</p>
                        <p className="text-[9px] mt-1 font-medium text-zinc-500 dark:text-[#64748B]">{timeAgo(n.created_at)}</p>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-zinc-400 hover:text-zinc-600 dark:text-[#64748B] dark:hover:text-[#F8FAFC]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="aurora-card p-5">
            <SectionHeader icon={Activity} title="Recent Activity" subtitle="Latest actions synced from DB" />

            {activities.length === 0 ? (
              <p className="text-xs text-center py-6 text-zinc-500 dark:text-[#64748B]">No recent activity logged.</p>
            ) : (
              <ul className="space-y-3">
                {activities.slice(0, 5).map((act, i) => (
                  <li key={act.id || i} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-indigo-50 dark:bg-[#6D5DF6]/10 border border-indigo-100 dark:border-[#6D5DF6]/20"
                    >
                      <Clock className="w-3 h-3 text-indigo-500 dark:text-[#6D5DF6]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-700 dark:text-[#94A3B8] leading-snug truncate">{act.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-[#64748B]"
                        >
                          {act.module}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-[#64748B]">{timeAgo(act.created_at)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
