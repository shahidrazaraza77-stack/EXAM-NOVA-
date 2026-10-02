"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, CheckCircle2, Target, Layers, ChevronDown, Loader2, Brain, Code2, Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { companyService, type FrontendCompany, type RoadmapWeek } from "@/services/company.service";
import { useAuth } from "@/context/AuthContext";

export default function RoadmapsView() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<FrontendCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [roadmapWeeks, setRoadmapWeeks] = useState<RoadmapWeek[]>([]);
  const [progressRecord, setProgressRecord] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // 1. Fetch initial companies list
  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const data = await companyService.getCompanies();
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompany(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  // 2. Fetch weekly roadmap and progress when company is selected
  useEffect(() => {
    if (!selectedCompany) return;
    async function loadRoadmapData() {
      try {
        setLoadingRoadmap(true);
        const weeks = await companyService.getRoadmap(selectedCompany);
        setRoadmapWeeks(weeks);

        if (user?.id) {
          const prog = await companyService.getProgress(user.id, selectedCompany);
          setProgressRecord(prog);
          setCompletedTasks(prog?.completed_tasks || []);
        } else {
          setProgressRecord(null);
          setCompletedTasks([]);
        }
      } catch (err) {
        console.error("Failed to load roadmap or progress:", err);
      } finally {
        setLoadingRoadmap(false);
      }
    }
    loadRoadmapData();
  }, [selectedCompany, user?.id]);

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  // Compute total tasks and checked tasks to calculate percent completion
  const totalTasksCount = roadmapWeeks.reduce((acc, week) => {
    return acc + 
      (week.aptitude_tasks?.length || 0) + 
      (week.coding_tasks?.length || 0) + 
      (week.interview_tasks?.length || 0);
  }, 0);

  const completedTasksCount = roadmapWeeks.reduce((acc, week) => {
    const allWeekTasks = [
      ...(week.aptitude_tasks || []),
      ...(week.coding_tasks || []),
      ...(week.interview_tasks || [])
    ];
    const compInWeek = completedTasks.filter(t => allWeekTasks.includes(t)).length;
    return acc + compInWeek;
  }, 0);

  const progressPercent = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  const handleTaskToggle = async (taskText: string, isChecked: boolean) => {
    if (!user || !selectedCompany) return;
    try {
      // Optimistic update
      setCompletedTasks(prev =>
        isChecked 
          ? [...prev, taskText] 
          : prev.filter(t => t !== taskText)
      );

      const updated = await companyService.updateTaskCompletion(
        user.id,
        selectedCompany,
        taskText,
        isChecked
      );

      if (updated) {
        setProgressRecord(updated);
      }
    } catch (err) {
      console.error("Error toggling task completion:", err);
      // Revert optimistic update
      setCompletedTasks(prev =>
        isChecked 
          ? prev.filter(t => t !== taskText) 
          : [...prev, taskText]
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-zinc-500 font-medium">Loading weekly roadmaps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Selector Card */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-650" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Weekly Preparation Roadmap</h3>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border-none cursor-pointer"
              >
                {selectedCompanyData?.name || "Select Company"}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl z-20 py-1 max-h-64 overflow-y-auto">
                    {companies.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCompany(c.id); setShowDropdown(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors border-none cursor-pointer",
                          c.id === selectedCompany
                            ? "text-violet-650 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40"
                            : "text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {roadmapWeeks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  Overall Tasks Completed: {completedTasksCount}/{totalTasksCount}
                </span>
                <span className="text-sm font-black text-violet-600 dark:text-violet-400">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-650"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Weekly Roadmap */}
      {loadingRoadmap ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-violet-650" />
          <p className="text-xs text-zinc-500 font-medium">Fetching weekly details...</p>
        </div>
      ) : roadmapWeeks.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <p className="text-xs text-zinc-400 italic font-semibold">No weekly roadmap structured for this company yet.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-500 via-indigo-400 to-violet-200 dark:from-violet-600 dark:via-indigo-500 dark:to-violet-850" />
          <div className="space-y-6">
            {roadmapWeeks.map((week, i) => {
              // Calculate completions in this week
              const weekTasks = [
                ...(week.aptitude_tasks || []),
                ...(week.coding_tasks || []),
                ...(week.interview_tasks || [])
              ];
              const weekCompletedCount = completedTasks.filter(t => weekTasks.includes(t)).length;
              const isWeekCompleted = weekTasks.length > 0 && weekCompletedCount === weekTasks.length;

              return (
                <motion.div
                  key={week.id || week.week_number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pl-16"
                >
                  <div className={cn(
                    "absolute left-[18px] w-[26px] h-[26px] rounded-full border-4 border-white dark:border-zinc-950 z-10 flex items-center justify-center transition-all",
                    isWeekCompleted ? "bg-emerald-500" : "bg-violet-500"
                  )}>
                    {isWeekCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  
                  <Card className={cn(
                    "border overflow-hidden transition-all",
                    isWeekCompleted
                      ? "border-emerald-250 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-50/20 to-transparent dark:from-emerald-950/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  )}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center",
                            isWeekCompleted ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-zinc-50 dark:bg-zinc-900"
                          )}>
                            <Layers className={cn("w-4 h-5", isWeekCompleted ? "text-emerald-600" : "text-violet-650")} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Week {week.week_number} Plan</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase">Progress: {weekCompletedCount}/{weekTasks.length} Tasks</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
                          isWeekCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-zinc-50 text-zinc-500 border-zinc-250 dark:bg-zinc-900 dark:text-zinc-400"
                        )}>
                          {isWeekCompleted ? "Week Completed" : "Weekly Preparation"}
                        </span>
                      </div>

                      {/* Topics list */}
                      {week.topics?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {week.topics.map(topic => (
                            <span key={topic} className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-[10px] font-bold text-violet-700 dark:text-violet-400">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tasks Sections: Aptitude, Coding, Interview */}
                      <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                        {/* Aptitude Tasks */}
                        {week.aptitude_tasks?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Brain className="w-3.5 h-3.5" /> Aptitude Tasks
                            </p>
                            <div className="grid grid-cols-1 gap-2 pl-1">
                              {week.aptitude_tasks.map((task) => {
                                const isChecked = completedTasks.includes(task);
                                return (
                                  <label key={task} className="flex items-start gap-2.5 text-xs text-zinc-705 dark:text-zinc-350 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleTaskToggle(task, e.target.checked)}
                                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 mt-0.5 shrink-0"
                                    />
                                    <span className={cn(isChecked && "line-through text-zinc-400 dark:text-zinc-500")}>
                                      {task}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Coding Tasks */}
                        {week.coding_tasks?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5" /> Coding & DSA Tasks
                            </p>
                            <div className="grid grid-cols-1 gap-2 pl-1">
                              {week.coding_tasks.map((task) => {
                                const isChecked = completedTasks.includes(task);
                                return (
                                  <label key={task} className="flex items-start gap-2.5 text-xs text-zinc-750 dark:text-zinc-350 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleTaskToggle(task, e.target.checked)}
                                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 mt-0.5 shrink-0"
                                    />
                                    <span className={cn(isChecked && "line-through text-zinc-400 dark:text-zinc-500")}>
                                      {task}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interview Tasks */}
                        {week.interview_tasks?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" /> HR & Interview Tasks
                            </p>
                            <div className="grid grid-cols-1 gap-2 pl-1">
                              {week.interview_tasks.map((task) => {
                                const isChecked = completedTasks.includes(task);
                                return (
                                  <label key={task} className="flex items-start gap-2.5 text-xs text-zinc-750 dark:text-zinc-350 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleTaskToggle(task, e.target.checked)}
                                      className="rounded border-zinc-300 text-pink-600 focus:ring-pink-500 h-3.5 w-3.5 mt-0.5 shrink-0"
                                    />
                                    <span className={cn(isChecked && "line-through text-zinc-400 dark:text-zinc-500")}>
                                      {task}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
