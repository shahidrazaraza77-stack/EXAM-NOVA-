"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { aptitudeService } from "@/services/aptitude";
import { Loader2, Brain, LayoutDashboard, BookOpen, GraduationCap, BookmarkCheck, BarChart3, Trophy } from "lucide-react";
import DashboardPageShell from "@/components/DashboardPageShell";
import OverviewView from "./components/OverviewView";
import TopicsView from "./components/TopicsView";
import PracticeView from "./components/PracticeView";
import MockTestsView from "./components/MockTestsView";
import BookmarksView from "./components/BookmarksView";
import AnalyticsView from "./components/AnalyticsView";
import LeaderboardView from "./components/LeaderboardView";

const tabs = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "topics",      label: "Topics",      icon: BookOpen },
  { id: "practice",   label: "Practice",    icon: Brain },
  { id: "mocktests",  label: "Mock Tests",  icon: GraduationCap },
  { id: "bookmarks",  label: "Bookmarks",   icon: BookmarkCheck },
  { id: "analytics",  label: "Analytics",   icon: BarChart3 },
  { id: "leaderboard",label: "Leaderboard", icon: Trophy },
];

export default function AptitudePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTopicName, setSelectedTopicName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const loadData = useCallback(async (showLoader = true) => {
    if (!user) return;
    try {
      if (showLoader) setLoading(true);
      const [fetchedAnalytics, fetchedTopics, fetchedQuestions] = await Promise.all([
        aptitudeService.getAnalytics(user.id),
        aptitudeService.getTopics(),
        aptitudeService.getQuestions({ limit: 1000 }),
      ]);
      setAnalyticsData(fetchedAnalytics);
      setTopics(fetchedTopics);
      setQuestions(fetchedQuestions);
    } catch (e) {
      console.error("Error fetching centralized aptitude data:", e);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(true); }, [loadData]);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ background: "var(--aurora-bg)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6D5DF6, #8B5CF6)" }}
        >
          <Brain className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#6D5DF6" }} />
        <p className="text-sm font-medium" style={{ color: "var(--aurora-text-secondary)" }}>
          Loading Aptitude Hub...
        </p>
      </div>
    );
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== "practice") setSelectedTopicName(null);
  };

  return (
    <DashboardPageShell
      icon={Brain}
      iconGradient="from-violet-500 to-indigo-600"
      iconColor="#6D5DF6"
      title="Aptitude Prep Hub"
      subtitle="Master quantitative, logical, and verbal aptitude for placements."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === "overview" && (
        <OverviewView
          analyticsData={analyticsData}
          onNavigateToTab={(tabId, topicName) => {
            setActiveTab(tabId);
            if (topicName !== undefined) setSelectedTopicName(topicName);
          }}
        />
      )}
      {activeTab === "topics" && (
        <TopicsView
          categories={analyticsData?.categories || []}
          onStartPractice={(topic) => {
            setSelectedTopicName(topic);
            setActiveTab("practice");
          }}
        />
      )}
      {activeTab === "practice" && (
        <PracticeView
          topics={topics}
          questions={questions}
          initialTopicName={selectedTopicName}
          onClearTopic={() => setSelectedTopicName(null)}
          onRefreshData={() => loadData(false)}
        />
      )}
      {activeTab === "mocktests" && <MockTestsView />}
      {activeTab === "bookmarks" && <BookmarksView />}
      {activeTab === "analytics" && <AnalyticsView analyticsData={analyticsData} />}
      {activeTab === "leaderboard" && <LeaderboardView />}
    </DashboardPageShell>
  );
}
