"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, LayoutDashboard, Play, History, FileSpreadsheet, 
  Award, BarChart3, ChevronRight, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import OverviewView from "./views/OverviewView";
import StartPlacementView from "./views/StartPlacementView";
import HistoryView from "./views/HistoryView";
import ReportsView from "./views/ReportsView";
import CertificatesView from "./views/CertificatesView";
import AnalyticsView from "./views/AnalyticsView";

type ViewState = "overview" | "start" | "history" | "reports" | "certificates" | "analytics";

const tabs = [
  { id: "overview" as ViewState, label: "Overview", icon: LayoutDashboard },
  { id: "start" as ViewState, label: "Start Placement", icon: Play },
  { id: "history" as ViewState, label: "History", icon: History },
  { id: "reports" as ViewState, label: "Reports", icon: FileSpreadsheet },
  { id: "certificates" as ViewState, label: "Certificates", icon: Award },
  { id: "analytics" as ViewState, label: "Analytics", icon: BarChart3 },
];

export default function MockPlacementPage() {
  const [activeTab, setActiveTab] = useState<ViewState>("overview");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 relative">
      <div className="pb-4 border-b border-zinc-250 dark:border-zinc-850 mb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Play className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Mock Placement Process
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Experience a complete placement journey and evaluate your readiness before the real placement drive.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-48 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap border-none cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">{tab.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto hidden lg:block" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <OverviewView onNavigate={(tab) => setActiveTab(tab as ViewState)} />}
              {activeTab === "start" && <StartPlacementView onNavigate={(tab) => setActiveTab(tab as ViewState)} />}
              {activeTab === "history" && <HistoryView />}
              {activeTab === "reports" && <ReportsView />}
              {activeTab === "certificates" && <CertificatesView />}
              {activeTab === "analytics" && <AnalyticsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
