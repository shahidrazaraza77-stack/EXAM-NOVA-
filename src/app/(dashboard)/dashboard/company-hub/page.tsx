"use client";

import { useState } from "react";
import { Building2, LayoutDashboard, Briefcase, Calendar, Monitor, Users, BookmarkCheck, BarChart3 } from "lucide-react";
import DashboardPageShell from "@/components/DashboardPageShell";
import OverviewView from "./components/OverviewView";
import CompaniesView from "./components/CompaniesView";
import RoadmapsView from "./components/RoadmapsView";
import TechnicalPrepView from "./components/TechnicalPrepView";
import HRPrepView from "./components/HRPrepView";
import BookmarksView from "./components/BookmarksView";
import AnalyticsView from "./components/AnalyticsView";

const tabs = [
  { id: "overview",   label: "Overview",       icon: LayoutDashboard },
  { id: "companies",  label: "Companies",      icon: Briefcase },
  { id: "roadmaps",   label: "Roadmaps",       icon: Calendar },
  { id: "technical",  label: "Technical Prep", icon: Monitor },
  { id: "hr",         label: "HR Interview",   icon: Users },
  { id: "bookmarks",  label: "Bookmarks",      icon: BookmarkCheck },
  { id: "analytics",  label: "Analytics",      icon: BarChart3 },
];

export default function CompanyHubPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardPageShell
      icon={Building2}
      iconGradient="from-[#6D5DF6] to-[#00D4FF]"
      iconColor="#6D5DF6"
      title="Company Preparation Hub"
      subtitle="Prepare company-wise with aptitude, coding, technical, and HR interview prep."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview"  && <OverviewView onNavigate={setActiveTab} />}
      {activeTab === "companies" && <CompaniesView />}
      {activeTab === "roadmaps"  && <RoadmapsView />}
      {activeTab === "technical" && <TechnicalPrepView />}
      {activeTab === "hr"        && <HRPrepView />}
      {activeTab === "bookmarks" && <BookmarksView />}
      {activeTab === "analytics" && <AnalyticsView />}
    </DashboardPageShell>
  );
}
