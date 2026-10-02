"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Upload, Target, Briefcase, LayoutTemplate, History, ChevronRight, Sparkles, Building2, Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import OverviewTab from "./components/OverviewTab";
import CreateResumeTab from "./components/CreateResumeTab";
import ATSAnalysisTab from "./components/ATSAnalysisTab";
import TemplatesTab from "./components/TemplatesTab";
import HistoryTab from "./components/HistoryTab";
import CompanyOptimizeTab from "./components/CompanyOptimizeTab";
import { useAuth } from "@/context/AuthContext";
import { resumeService } from "@/services/resume";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "create", label: "Create Resume", icon: FileText },
  { id: "ats", label: "ATS Analysis", icon: Target },
  { id: "company-optimize", label: "Company Match", icon: Building2 },
  { id: "match", label: "Job Match", icon: Briefcase },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "history", label: "History", icon: History },
];

function ResumeBuilderContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const resumeIdParam = searchParams.get("resumeId");

  const [activeTab, setActiveTab] = useState("overview");
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any | null>(null);
  const [viewAnalysisForResume, setViewAnalysisForResume] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync tab with URL parameter if valid
  useEffect(() => {
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync active resume with URL parameter if valid and resumes loaded
  useEffect(() => {
    if (resumeIdParam && resumes.length > 0) {
      const selected = resumes.find(r => r.id === resumeIdParam);
      if (selected) {
        setActiveResume(selected);
        setViewAnalysisForResume(selected);
      }
    }
  }, [resumeIdParam, resumes]);

  const updateActiveResume = (resume: any) => {
    setActiveResume(resume);
    setViewAnalysisForResume(resume);
  };

  const fetchResumes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await resumeService.getResumes(user.id);
      setResumes(data);
      if (data.length > 0) {
        setActiveResume((prev: any) => {
          if (prev) {
            const updated = data.find(r => r.id === prev.id);
            return updated || data[0];
          }
          return data[0];
        });
      } else {
        setActiveResume(null);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">AI Resume Builder</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Create, analyze, and optimize resumes that stand out.</p>
          </div>
        </div>
        <Link href="/dashboard/resume-preview">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all border-none cursor-pointer">
            <Eye className="w-4 h-4" /> Live A4 Preview & Editor
          </button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-52 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setViewAnalysisForResume(activeResume);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap border-none cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
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
              transition={{ duration: 0.25 }}
            >
              {activeTab === "overview" && (
                <OverviewTab
                  resumes={resumes}
                  onNavigate={setActiveTab}
                  setActiveResume={updateActiveResume}
                  loading={loading}
                  refreshResumes={fetchResumes}
                />
              )}
              {activeTab === "create" && (
                <CreateResumeTab
                  onNavigate={setActiveTab}
                  setActiveResume={updateActiveResume}
                  refreshResumes={fetchResumes}
                />
              )}
              {activeTab === "ats" && (
                <ATSAnalysisTab
                  activeResume={viewAnalysisForResume}
                  setActiveResume={updateActiveResume}
                  refreshResumes={fetchResumes}
                  onNavigate={setActiveTab}
                  currentTab="ats"
                />
              )}
              {activeTab === "company-optimize" && (
                <CompanyOptimizeTab
                  activeResume={viewAnalysisForResume}
                  setActiveResume={updateActiveResume}
                  refreshResumes={fetchResumes}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "match" && (
                <ATSAnalysisTab
                  activeResume={viewAnalysisForResume}
                  setActiveResume={updateActiveResume}
                  refreshResumes={fetchResumes}
                  onNavigate={setActiveTab}
                  currentTab="match"
                />
              )}
              {activeTab === "templates" && (
                <TemplatesTab 
                  activeResume={activeResume} 
                  setActiveResume={updateActiveResume}
                  refreshResumes={fetchResumes}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === "history" && (
                <HistoryTab
                  resumes={resumes}
                  onNavigate={setActiveTab}
                  setActiveResume={updateActiveResume}
                  refreshResumes={fetchResumes}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-zinc-500">Loading Resume Builder...</p>
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  );
}
