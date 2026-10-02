"use client";

import { useState } from "react";
import {
  Code2, LayoutDashboard, BookOpen, GraduationCap, Building2,
  BookmarkCheck, History, BarChart3, Trophy, Flame, Swords,
} from "lucide-react";
import DashboardPageShell from "@/components/DashboardPageShell";
import OverviewView from "./components/OverviewView";
import ProblemsView from "./components/ProblemsView";
import TopicsView from "./components/TopicsView";
import CompanyPrepView from "./components/CompanyPrepView";
import ProblemDetailView from "./components/ProblemDetailView";
import BookmarksView from "./components/BookmarksView";
import SubmissionsView from "./components/SubmissionsView";
import AnalyticsView from "./components/AnalyticsView";
import LeaderboardView from "./components/LeaderboardView";
import DailyChallengeView from "./components/DailyChallengeView";
import ContestsView from "./components/ContestsView";

const tabs = [
  { id: "overview",     label: "Overview",     icon: LayoutDashboard },
  { id: "problems",     label: "Problems",     icon: BookOpen },
  { id: "daily",        label: "Daily",        icon: Flame },
  { id: "contests",     label: "Contests",     icon: Swords },
  { id: "topics",       label: "Topics",       icon: GraduationCap },
  { id: "companies",    label: "Company Prep", icon: Building2 },
  { id: "bookmarks",    label: "Bookmarks",    icon: BookmarkCheck },
  { id: "submissions",  label: "Submissions",  icon: History },
  { id: "analytics",    label: "Analytics",    icon: BarChart3 },
  { id: "leaderboard",  label: "Leaderboard",  icon: Trophy },
];

export default function CodingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("");

  const handleOpenProblem = (problemId: string) => {
    setActiveProblemId(problemId);
    setActiveTab("editor");
  };

  const handlePracticeTopic = (topicName: string) => {
    setSelectedTopicFilter(topicName);
    setActiveTab("problems");
  };

  const handleBackFromEditor = () => {
    setActiveProblemId(null);
    setActiveTab("problems");
  };

  // When in editor mode, show full-screen LeetCode IDE
  if (activeTab === "editor" && activeProblemId) {
    return <ProblemDetailView problemId={activeProblemId} onBack={handleBackFromEditor} isStandalone={true} />;
  }

  return (
    <DashboardPageShell
      icon={Code2}
      iconGradient="from-[#6D5DF6] to-[#00D4FF]"
      iconColor="#6D5DF6"
      title="Coding Challenges"
      subtitle="Practice DSA, master algorithms & ace technical interviews"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview" && <OverviewView onOpenProblem={handleOpenProblem} onNavigate={setActiveTab} />}
      {activeTab === "problems" && (
        <ProblemsView
          onOpenProblem={handleOpenProblem}
          initialTopic={selectedTopicFilter}
          onClearInitialTopic={() => setSelectedTopicFilter("")}
        />
      )}
      {activeTab === "daily" && <DailyChallengeView onOpenProblem={handleOpenProblem} />}
      {activeTab === "contests" && <ContestsView onOpenProblem={handleOpenProblem} />}
      {activeTab === "topics" && <TopicsView onPracticeTopic={handlePracticeTopic} />}
      {activeTab === "companies" && <CompanyPrepView onOpenProblem={handleOpenProblem} onNavigate={setActiveTab} />}
      {activeTab === "bookmarks" && <BookmarksView onOpenProblem={handleOpenProblem} />}
      {activeTab === "submissions" && <SubmissionsView onOpenProblem={handleOpenProblem} />}
      {activeTab === "analytics" && <AnalyticsView />}
      {activeTab === "leaderboard" && <LeaderboardView />}
    </DashboardPageShell>
  );
}
