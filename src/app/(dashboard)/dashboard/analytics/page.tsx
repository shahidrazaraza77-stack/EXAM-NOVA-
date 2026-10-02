"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart3, LayoutDashboard, Building2, TrendingUp,
  FileSpreadsheet, Award, Settings, RefreshCw, Loader2,
  Download, CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardPageShell from "@/components/DashboardPageShell";
import OverviewView from "./views/OverviewView";
import ReadinessView from "./views/ReadinessView";
import CompanyReadinessView from "./views/CompanyReadinessView";
import AnalyticsDetailView from "./views/AnalyticsDetailView";
import ReportsView from "./views/ReportsView";
import AchievementsView from "./views/AchievementsView";
import SettingsView from "./views/SettingsView";

type ViewState = "overview" | "readiness" | "companies" | "analytics" | "reports" | "achievements" | "settings";

const tabs = [
  { id: "overview"     as ViewState, label: "Overview",          icon: LayoutDashboard },
  { id: "readiness"    as ViewState, label: "Readiness Score",   icon: BarChart3 },
  { id: "companies"    as ViewState, label: "Company Readiness", icon: Building2 },
  { id: "analytics"   as ViewState, label: "Analytics",         icon: TrendingUp },
  { id: "reports"     as ViewState, label: "Reports",            icon: FileSpreadsheet },
  { id: "achievements" as ViewState, label: "Achievements",      icon: Award },
  { id: "settings"    as ViewState, label: "Settings",           icon: Settings },
];

interface AnalyticsData {
  user_analytics: {
    id: string; user_id: string;
    resume_score: number; aptitude_score: number; coding_score: number;
    interview_score: number; overall_readiness: number; updated_at: string | null;
  } | null;
  skill_gaps: { id: string; user_id: string; weakest_skill: string; strongest_skill: string; report: any; created_at: string | null; } | null;
  recommendations: Array<{ id: string; user_id: string; title: string; description: string | null; priority: string; created_at: string | null; }>;
}

export default function PlacementAnalyticsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ViewState>("overview");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const triggerFeedback = useCallback((message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const getAccessToken = useCallback((): string | null => {
    try {
      const raw = localStorage.getItem("supabase.auth.token");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.currentSession?.access_token || null;
    } catch { return null; }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/analytics", { headers });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, getAccessToken]);

  const calculateReadiness = useCallback(async () => {
    if (!user?.id) return;
    setCalculating(true);
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/analytics/calculate", {
        method: "POST", headers,
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) { setData(await res.json()); triggerFeedback("Readiness scores calculated successfully!"); }
    } catch (e) {
      console.error("Failed to calculate readiness:", e);
    } finally {
      setCalculating(false);
    }
  }, [user?.id, getAccessToken, triggerFeedback]);

  useEffect(() => { if (user?.id) fetchAnalytics(); }, [user?.id, fetchAnalytics]);

  const handleExport = useCallback((format: string) => {
    const messages: Record<string, string> = {
      pdf: "Downloading PDF Readiness Report...",
      csv: "Exporting performance logs to CSV...",
      share: "Generating secure shareable URL link...",
      print: "Opening print-friendly view...",
    };
    triggerFeedback(messages[format] || `Exporting as ${format.toUpperCase()}...`);
  }, [triggerFeedback]);

  const scores = {
    overall: data?.user_analytics?.overall_readiness ?? 0,
    resumeScore: data?.user_analytics?.resume_score ?? 0,
    aptitudeScore: data?.user_analytics?.aptitude_score ?? 0,
    codingScore: data?.user_analytics?.coding_score ?? 0,
    interviewScore: data?.user_analytics?.interview_score ?? 0,
  };
  const skillGaps = data?.skill_gaps;

  const headerActions = (
    <>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={calculateReadiness}
        disabled={calculating}
        className="flex items-center gap-1.5 py-2 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        style={{
          background: "var(--aurora-card)",
          borderColor: "var(--aurora-border)",
          color: "var(--aurora-text-secondary)",
        }}
      >
        {calculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        {calculating ? "Calculating..." : "Refresh"}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleExport("pdf")}
        className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-white text-xs font-bold transition-all cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, #6D5DF6, #4F46E5)",
          boxShadow: "0 4px 16px rgba(109,93,246,0.3)",
        }}
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </motion.button>
    </>
  );

  return (
    <>
      {/* Toast feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border"
            style={{
              background: "var(--aurora-card)",
              borderColor: "var(--aurora-border)",
              color: "var(--aurora-text)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <CheckCircle className="w-4 h-4" style={{ color: "var(--aurora-success)" }} />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <DashboardPageShell
        icon={BarChart3}
        iconGradient="from-violet-600 to-indigo-600"
        iconColor="#6D5DF6"
        title="Placement Analytics"
        subtitle="Track your progress, identify weaknesses, and improve your placement readiness."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as ViewState)}
        headerActions={headerActions}
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6D5DF6" }} />
          </div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewView scores={scores} />}
            {activeTab === "readiness" && <ReadinessView scores={scores} skillGaps={skillGaps} />}
            {activeTab === "companies" && <CompanyReadinessView scores={scores} skillGaps={skillGaps} />}
            {activeTab === "analytics" && <AnalyticsDetailView scores={scores} skillGaps={skillGaps} />}
            {activeTab === "reports" && <ReportsView onExport={handleExport} />}
            {activeTab === "achievements" && <AchievementsView scores={scores} />}
            {activeTab === "settings" && <SettingsView />}
          </>
        )}
      </DashboardPageShell>
    </>
  );
}
