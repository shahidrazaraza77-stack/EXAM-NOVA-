"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Clock, TrendingUp, ArrowUp, BarChart3, Eye, RotateCcw, 
  Loader2, ChevronLeft, ChevronRight, FolderOpen, GitCompare, 
  Copy, Edit, Trash2, X, Sparkles, Building2, Calendar 
} from "lucide-react";
import { resumeService } from "@/services/resume";
import { getResumeText } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const itemVariants = { 
  hidden: { opacity: 0, y: 15 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } 
};

interface HistoryTabProps {
  resumes: any[];
  onNavigate: (tab: string) => void;
  setActiveResume: (resume: any) => void;
  refreshResumes: () => void;
}

export default function HistoryTab({ resumes, onNavigate, setActiveResume, refreshResumes }: HistoryTabProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  // Comparison state
  const [compareA, setCompareA] = useState<any | null>(null);
  const [compareB, setCompareB] = useState<any | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Calculations based on database records
  const totalResumes = resumes.length;
  
  // Sort chronologically (oldest first) to compute improvement changes correctly
  const chronologicalResumes = [...resumes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const scoreHistory = chronologicalResumes.map((r, i) => {
    const dateObj = new Date(r.created_at || r.updated_at || new Date());
    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    
    let changes = "Initial";
    if (i > 0) {
      const prevScore = chronologicalResumes[i - 1].ats_score || chronologicalResumes[i - 1].score || 0;
      const currentScore = r.ats_score || r.score || 0;
      const diff = currentScore - prevScore;
      changes = diff >= 0 ? `+${diff}` : `${diff}`;
    }

    return {
      id: r.id,
      date: formattedDate,
      score: r.ats_score || r.score || 0,
      changes,
      version: `v${r.version || 1}.0`
    };
  });

  // Latest first for rendering
  const renderedHistory = [...scoreHistory].reverse();

  const latestScore = totalResumes > 0 ? (resumes[0].ats_score || resumes[0].score || 0) : 0;
  const highestScore = totalResumes > 0 ? Math.max(...resumes.map(r => r.ats_score || r.score || 0)) : 0;
  const initialScore = scoreHistory.length > 0 ? scoreHistory[0].score : 0;
  const overallImprovement = latestScore - initialScore;

  // Actions
  const handleOpenResume = (resume: any) => {
    setActiveResume(resume);
    onNavigate("overview");
  };

  const handleDuplicate = async (resume: any) => {
    setLoadingId(resume.id);
    try {
      await resumeService.duplicateResume(resume.id);
      await refreshResumes();
      toast.success("Resume version duplicated successfully!");
    } catch (err: any) {
      console.error("Duplicate error:", err);
      toast.error("Failed to duplicate: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRenameClick = (resume: any) => {
    setRenameId(resume.id);
    setRenameValue(resume.name || resume.file_name || "");
  };

  const handleRenameSave = async (resumeId: string) => {
    if (!renameValue.trim()) return;
    setLoadingId(resumeId);
    try {
      await resumeService.renameResume(resumeId, renameValue.trim());
      setRenameId(null);
      await refreshResumes();
    } catch (err: any) {
      console.error("Rename error:", err);
      toast.error("Failed to rename: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (resume: any) => {
    setLoadingId(resume.id);
    try {
      await resumeService.deleteResume(resume.id, resume.file_path);
      await refreshResumes();
      toast.success("Resume version deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRestore = async (resume: any) => {
    setLoadingId(resume.id);
    try {
      const restored = await resumeService.restoreResume(resume.id);
      await refreshResumes();
      setActiveResume(restored);
      toast.success("Resume version restored as the active resume!");
      onNavigate("overview");
    } catch (err: any) {
      console.error("Restore error:", err);
      toast.error("Failed to restore: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Diff Generator Heuristic
  const getDiffLines = (textA: string, textB: string) => {
    const linesA = textA ? textA.split("\n") : [];
    const linesB = textB ? textB.split("\n") : [];
    
    const setA = new Set(linesA.map(l => l.trim()));
    const setB = new Set(linesB.map(l => l.trim()));
    
    const diffA = linesA.map(line => ({
      text: line,
      type: line.trim() && !setB.has(line.trim()) ? "removed" : "normal"
    }));
    
    const diffB = linesB.map(line => ({
      text: line,
      type: line.trim() && !setA.has(line.trim()) ? "added" : "normal"
    }));
    
    return { diffA, diffB };
  };

  const startComparison = (resume: any) => {
    setCompareA(resume);
    // Auto-select B as the latest or another version
    const otherResumes = resumes.filter(r => r.id !== resume.id);
    if (otherResumes.length > 0) {
      setCompareB(otherResumes[0]);
    }
    setIsComparing(true);
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  if (isComparing && compareA) {
    const textA = getResumeText(compareA);
    const textB = compareB ? getResumeText(compareB) : "";
    const { diffA, diffB } = getDiffLines(textA, textB);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-500 animate-pulse" /> Side-by-Side Version Comparison
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Comparing differences between selected resume versions.</p>
          </div>
          <button 
            onClick={() => {
              setIsComparing(false);
              setCompareA(null);
              setCompareB(null);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-transparent cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" /> Close Comparison
          </button>
        </div>

        {/* Dropdown selectors for side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1">Version A (Left Side)</label>
            <select 
              value={compareA.id} 
              onChange={(e) => setCompareA(resumes.find(r => r.id === e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  v{r.version || 1}.0 - {r.name || r.file_name} ({r.ats_score || r.score || 0}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 mb-1">Version B (Right Side)</label>
            <select 
              value={compareB ? compareB.id : ""} 
              onChange={(e) => setCompareB(resumes.find(r => r.id === e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="" disabled>Select Version B</option>
              {resumes.filter(r => r.id !== compareA.id).map(r => (
                <option key={r.id} value={r.id}>
                  v{r.version || 1}.0 - {r.name || r.file_name} ({r.ats_score || r.score || 0}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel header info */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  Version {compareA.version || 1}.0
                </span>
                <span className="text-lg font-black text-zinc-900 dark:text-white">{compareA.ats_score || compareA.score || 0}% ATS</span>
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{compareA.name || compareA.file_name}</h3>
              <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDateTime(compareA.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Target: {compareA.target_company || "General"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> {compareA.is_ai_generated ? "AI Generated" : "Manual"}
              </span>
            </div>
          </div>

          {/* Right panel header info */}
          {compareB ? (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    Version {compareB.version || 1}.0
                  </span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white">{compareB.ats_score || compareB.score || 0}% ATS</span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{compareB.name || compareB.file_name}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDateTime(compareB.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-bold text-zinc-500">
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Target: {compareB.target_company || "General"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> {compareB.is_ai_generated ? "AI Generated" : "Manual"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-center text-zinc-400 text-xs font-semibold">
              Select Version B to start side-by-side comparison
            </div>
          )}
        </div>

        {/* Diff Content Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Diff Pane */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black uppercase text-zinc-400">
              Version {compareA.version || 1}.0 Text View
            </div>
            <div className="h-[500px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-text selection:bg-red-200 selection:text-red-900 dark:selection:bg-red-900 dark:selection:text-red-100">
              {diffA.map((line, idx) => (
                <div 
                  key={idx} 
                  className={`py-0.5 px-1 rounded flex ${
                    line.type === "removed" 
                      ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-l-2 border-red-500" 
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="w-6 shrink-0 opacity-40 select-none">{idx + 1}</span>
                  <span className="w-4 shrink-0 opacity-40 select-none">{line.type === "removed" ? "-" : " "}</span>
                  <span className="flex-1">{line.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Diff Pane */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black uppercase text-zinc-400">
              {compareB ? `Version ${compareB.version || 1}.0 Text View` : "Version B Text View"}
            </div>
            <div className="h-[500px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-text selection:bg-emerald-200 selection:text-emerald-900 dark:selection:bg-emerald-900 dark:selection:text-emerald-100">
              {compareB ? (
                diffB.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`py-0.5 px-1 rounded flex ${
                      line.type === "added" 
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500" 
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <span className="w-6 shrink-0 opacity-40 select-none">{idx + 1}</span>
                    <span className="w-4 shrink-0 opacity-40 select-none">{line.type === "added" ? "+" : " "}</span>
                    <span className="flex-1">{line.text}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 text-xs select-none">
                  Please select Version B from the dropdown above to view text diff
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="visible">
      <motion.div className="space-y-1" variants={itemVariants}>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Resume History & Version Control</h2>
        <p className="text-sm text-zinc-500">Manage, duplicate, rename, compare, and restore previous iterations of your resume.</p>
      </motion.div>

      {totalResumes === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 font-semibold">No version history found. Go to Create Resume or Upload one first!</p>
          <button onClick={() => onNavigate("create")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors border-none cursor-pointer">
            <FileText className="w-4 h-4" /> Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* History List */}
          <motion.div className="xl:col-span-8 space-y-6" variants={itemVariants}>
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-indigo-500" /> Saved Resume Versions
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                      <th className="pb-3 pr-2">Version</th>
                      <th className="pb-3 px-2">Resume Name</th>
                      <th className="pb-3 px-2">Target Company</th>
                      <th className="pb-3 px-2">ATS Score</th>
                      <th className="pb-3 px-2">Type</th>
                      <th className="pb-3 px-2">Created Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {resumes.map((item) => {
                      const isRenaming = renameId === item.id;
                      const isLoading = loadingId === item.id;
                      const isLatest = item.id === resumes[0].id;

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-900/20 transition-colors">
                          {/* Version number badge */}
                          <td className="py-4 pr-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                              v{item.version || 1}.0
                            </span>
                          </td>
                          
                          {/* Name / Inline Rename */}
                          <td className="py-4 px-2 max-w-[200px]">
                            {isRenaming ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRenameSave(item.id)}
                                  disabled={isLoading}
                                  className="p-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold border-none cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setRenameId(null)}
                                  className="p-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 text-[10px] font-bold border-none cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                                  {item.name || item.file_name || "AI Resume Profile"}
                                </span>
                                <button 
                                  onClick={() => handleRenameClick(item)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded bg-transparent border-none cursor-pointer transition-all"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          
                          {/* Target Company */}
                          <td className="py-4 px-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              <Building2 className="w-3.5 h-3.5 opacity-60" /> {item.target_company || "General"}
                            </span>
                          </td>
                          
                          {/* ATS Score */}
                          <td className="py-4 px-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              (item.ats_score || item.score || 0) >= 80 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" :
                              (item.ats_score || item.score || 0) >= 60 ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" :
                              "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
                            }`}>{item.ats_score || item.score || 0}%</span>
                          </td>
                          
                          {/* AI Generated or Manual */}
                          <td className="py-4 px-2">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-black ${
                              item.is_ai_generated
                                ? "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}>
                              <Sparkles className="w-2.5 h-2.5" />
                              {item.is_ai_generated ? "AI" : "Manual"}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-2 text-[10px] text-zinc-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDateTime(item.created_at)}</span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open */}
                              <button 
                                onClick={() => handleOpenResume(item)}
                                title="Open / Select active"
                                disabled={isLoading}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-colors"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Compare */}
                              <button 
                                onClick={() => startComparison(item)}
                                title="Compare version"
                                disabled={isLoading}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-colors"
                              >
                                <GitCompare className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button 
                                onClick={() => handleDuplicate(item.id)}
                                title="Duplicate version"
                                disabled={isLoading}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-colors"
                              >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {/* Restore (only for non-latest active) */}
                              {!isLatest && (
                                <button 
                                  onClick={() => handleRestore(item)}
                                  title="Restore as active"
                                  disabled={isLoading}
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-colors"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button 
                                onClick={() => handleDelete(item)}
                                title="Delete version"
                                disabled={isLoading}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 bg-transparent border-none cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Stats & Charts */}
          <motion.div className="xl:col-span-4 space-y-6" variants={itemVariants}>
            {/* Chart Breakdown */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-emerald-500" /> Score Progression
              </h3>
              <div className="space-y-4">
                {renderedHistory.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-4 py-1 border-b border-zinc-50 dark:border-zinc-900 last:border-0 pb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">{entry.date} <span className="text-zinc-400 font-normal">({entry.version})</span></span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-zinc-905 dark:text-zinc-300">{entry.score}%</span>
                          {entry.changes !== "Initial" && (
                            <span className={`flex items-center gap-0.5 text-[9px] font-black ${entry.changes.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                              <ArrowUp className={`w-2 h-2 ${!entry.changes.startsWith("+") ? "rotate-180 text-red-500" : ""}`} />{entry.changes}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${entry.score}%` }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-500">Overall Improvement</span>
                  <span className={`flex items-center gap-1 ${overallImprovement >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    {overallImprovement >= 0 ? `+${overallImprovement}%` : `${overallImprovement}%`} overall
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-lg font-black text-zinc-900 dark:text-white">{totalResumes}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Versions</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-lg font-black text-zinc-900 dark:text-white">{scoreHistory.length}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Analyses Logged</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{latestScore}%</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Score</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{highestScore}%</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Highest Score</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Navigation Footer */}
      {onNavigate && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-8">
          <button
            onClick={() => onNavigate("templates")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-transparent transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back: Templates
          </button>
          <button
            onClick={() => onNavigate("overview")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/10 transition-all border-none cursor-pointer"
          >
            Back to Overview <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
