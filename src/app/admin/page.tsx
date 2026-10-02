"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import DashboardView from "./views/DashboardView";
import UsersView from "./views/UsersView";
import AptitudeQuestionsView from "./views/AptitudeQuestionsView";
import CodingQuestionsView from "./views/CodingQuestionsView";
import TechnicalQuestionsView from "./views/TechnicalQuestionsView";
import HRQuestionsView from "./views/HRQuestionsView";
import CompaniesView from "./views/CompaniesView";
import MockTestsView from "./views/MockTestsView";
import ContentLibraryView from "./views/ContentLibraryView";
import AnalyticsView from "./views/AnalyticsView";
import SettingsView from "./views/SettingsView";
import RoadmapsView from "./views/RoadmapsView";
import AnnouncementsView from "./views/AnnouncementsView";
import ActivityLogsView from "./views/ActivityLogsView";
import BulkImportView from "./views/BulkImportView";
// Phase 9 new views
import InterviewBankView from "./views/InterviewBankView";
import AIContentCenterView from "./views/AIContentCenterView";
import GamificationView from "./views/GamificationView";
import NotificationsView from "./views/NotificationsView";

export default function AdminPage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  switch (currentTab) {
    case "dashboard":
      return <DashboardView />;
    case "users":
      return <UsersView />;
    case "aptitude":
      return <AptitudeQuestionsView />;
    case "coding":
      return <CodingQuestionsView />;
    // Keep old routes accessible (not in sidebar but backward-compat)
    case "technical":
      return <TechnicalQuestionsView />;
    case "hr":
      return <HRQuestionsView />;
    case "content-library":
      return <ContentLibraryView />;
    case "announcements":
      return <AnnouncementsView />;
    case "bulk-import":
      return <BulkImportView />;
    // Core routes
    case "companies":
      return <CompaniesView />;
    case "mock-tests":
      return <MockTestsView />;
    case "roadmaps":
      return <RoadmapsView />;
    case "activity-logs":
      return <ActivityLogsView />;
    case "analytics":
      return <AnalyticsView />;
    case "settings":
      return <SettingsView />;
    // Phase 9 new views
    case "interview-bank":
      return <InterviewBankView />;
    case "ai-content-center":
      return <AIContentCenterView />;
    case "gamification":
      return <GamificationView />;
    case "notifications":
      return <NotificationsView />;
    default:
      return <DashboardView />;
  }
}
