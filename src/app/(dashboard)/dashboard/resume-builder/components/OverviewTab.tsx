"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Sparkles, Clock, Target, TrendingUp, ChevronRight, CheckCircle2, AlertCircle, Loader2, Award, Zap, BookOpen, Trash2, ShieldAlert, History as HistoryIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resumeService, validateResumeFile } from "@/services/resume";
import { supabase } from "@/lib/supabase";
import ATSScoreRing from "./ATSScoreRing";
import { useToast } from "@/context/ToastContext";

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

interface OverviewTabProps {
  resumes: any[];
  onNavigate: (tab: string) => void;
  setActiveResume: (resume: any) => void;
  loading?: boolean;
  refreshResumes?: () => void;
}

export default function OverviewTab({ resumes, onNavigate, setActiveResume, loading = false, refreshResumes }: OverviewTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Card 2: Import Resume State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Quick Tips Tab State
  const [activeTipsTab, setActiveTipsTab] = useState<"writing" | "ats" | "ai">("writing");

  // Dynamic resume analysis state
  const [analysis, setAnalysis] = useState<any>(null);

  const latestResumeId = resumes[0]?.id;
  const latestResumeFeedback = resumes[0]?.feedback;

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      if (!latestResumeId) {
        setAnalysis(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("resume_analysis")
          .select("*")
          .eq("resume_id", latestResumeId)
          .single();
        if (!error && data) {
          setAnalysis(data);
        } else {
          // Check feedback column fallback (for text builder resumes)
          const firstResume = resumes[0];
          if (firstResume?.feedback) {
            try {
              const parsed = typeof firstResume.feedback === "string"
                ? JSON.parse(firstResume.feedback)
                : firstResume.feedback;
              if (parsed.strengths || parsed.weaknesses || parsed.section_scores) {
                setAnalysis({
                  ats_score: firstResume.ats_score || firstResume.score || 0,
                  section_scores: parsed.section_scores || {},
                  strengths: parsed.strengths || [],
                  weaknesses: parsed.weaknesses || [],
                  missing_keywords: parsed.missing_keywords || parsed.missingKeywords || [],
                  suggestions: parsed.improvements || parsed.suggestions || [],
                  overall_feedback: parsed.overall_feedback || parsed.overallFeedback || ""
                });
                return;
              }
            } catch (e) {
              console.error("Error parsing feedback in overview:", e);
            }
          }
          setAnalysis(null);
        }
      } catch (err) {
        console.error("Error loading latest analysis in overview:", err);
      }
    };
    fetchLatestAnalysis();
  }, [latestResumeId, latestResumeFeedback]);

  // Format date helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      if (diff < 60000) return "just now";
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return "recently";
    }
  };

  // Handle file drop/select for Card 2 (Import Resume)
  const handleImportFile = async (file: File) => {
    if (!user?.id) {
      setUploadError("You must be logged in to import resumes.");
      return;
    }
    
    setUploadError(null);
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Unsupported file format.");
      return;
    }

    setIsUploading(true);
    try {
      setUploadProgressText("Uploading document to storage...");
      const newResume = await resumeService.uploadResume(user.id, file);

      setUploadProgressText("Running Google Gemini text extraction...");
      await resumeService.analyzeResume(newResume.id);

      setUploadProgressText("Generating ATS Score & analysis details...");
      // Fetch latest updated resume row
      const { data: updatedResume, error } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("id", newResume.id)
        .single();

      if (error || !updatedResume) throw error || new Error("Analyzed resume not found.");

      setUploadProgressText("Analysis complete! Redirecting to preview...");
      
      // Refresh listings
      if (refreshResumes) refreshResumes();

      // Set active and navigate
      setActiveResume(updatedResume);
      onNavigate("ats");
    } catch (err: any) {
      console.error("Import/Extraction failed:", err);
      setUploadError(err.message || "Upload or Gemini extraction failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImportFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleEditResume = (item: any) => {
    setActiveResume(item);
    // If it was created via structured wizard (has content, no storage path), route to create
    if (item.content && !item.file_path) {
      onNavigate("create");
    } else {
      // Otherwise route to ATS comparison & analysis view
      onNavigate("ats");
    }
  };

  const handleDeleteResume = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    try {
      await resumeService.deleteResume(item.id, item.file_path || "");
      if (refreshResumes) refreshResumes();
      toast.success(`Resume "${item.file_name || 'resume'}" deleted.`);
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete resume: " + err.message);
    }
  };

  // Skeleton loading view
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-72 bg-zinc-150 dark:bg-zinc-900 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40 h-64" />
          ))}
        </div>
        <div className="h-44 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40" />
      </div>
    );
  }

  const hasResumes = resumes.length > 0;
  const latestResume = hasResumes ? resumes[0] : null;

  // Compute analytics if resumes exist
  const averageATS = hasResumes 
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.ats_score || curr.score || 0), 0) / resumes.length) 
    : 0;

  const baseScore = latestResume ? (latestResume.ats_score || latestResume.score || 0) : 0;

  const totalSizeBytes = resumes.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  const getCompleteness = (resume: any) => {
    if (!resume) return 0;
    let score = 0;
    const content = typeof resume.content === 'string' ? JSON.parse(resume.content) : resume.content;
    if (content) {
      if (content.personalInfo?.fullName) score += 15;
      if (content.personalInfo?.email) score += 10;
      if (content.personalInfo?.phone) score += 10;
      if (content.personalInfo?.location) score += 5;
      if (content.personalInfo?.summary) score += 10;
      if (content.education && content.education.length > 0) score += 15;
      if (content.experience && content.experience.length > 0) score += 15;
      if (content.projects && content.projects.length > 0) score += 10;
      if (content.skills) score += 10;
    } else {
      // If no structured form, but text content exists, default to 50% completeness
      if (resume.parsed_content) score += 50;
    }
    return Math.min(100, score);
  };
  const completeness = getCompleteness(latestResume);

  const getSectionScore = (categoryKey: string, fallbackMultiplier: number) => {
    if (analysis?.section_scores && typeof analysis.section_scores === "object") {
      const scores = analysis.section_scores as Record<string, number>;
      if (typeof scores[categoryKey] === "number") {
        return scores[categoryKey];
      }
    }
    return Math.min(100, Math.max(0, Math.round(baseScore * fallbackMultiplier)));
  };

  let atsBreakdown = [
    { label: "Formatting", score: 0, color: "from-indigo-500 to-purple-500" },
    { label: "Keywords", score: 0, color: "from-amber-500 to-orange-500" },
    { label: "Projects", score: 0, color: "from-violet-500 to-indigo-500" },
    { label: "Skills Match", score: 0, color: "from-blue-500 to-cyan-500" }
  ];

  if (latestResume) {
    atsBreakdown = [
      { label: "Formatting", score: getSectionScore("formatting", 1.02), color: "from-indigo-500 to-purple-500" },
      { label: "Keywords", score: getSectionScore("keywords", 0.95), color: "from-amber-500 to-orange-500" },
      { label: "Projects", score: getSectionScore("projects", 1.01), color: "from-violet-500 to-indigo-500" },
      { label: "Skills", score: getSectionScore("skills", 0.98), color: "from-emerald-500 to-teal-500" },
      { label: "Education", score: getSectionScore("education", 1.0), color: "from-sky-500 to-blue-500" },
      { label: "Experience", score: getSectionScore("experience", 0.92), color: "from-blue-500 to-cyan-500" },
      { label: "Achievements", score: getSectionScore("achievements", 0.90), color: "from-rose-500 to-pink-500" },
      { label: "Grammar", score: getSectionScore("grammar", 1.04), color: "from-teal-500 to-emerald-500" }
    ];
  }

  // Quick Tips details
  const tips = {
    writing: [
      { title: "Use Strong Action Verbs", desc: "Start every single bullet point with punchy verbs like 'Led', 'Optimized', 'Designed', or 'Executed'. Avoid passive phrases like 'Responsible for'." },
      { title: "Quantify Accomplishments", desc: "Add measurable numbers, percentages, or timeline values (e.g. 'boosted sales by 22% in 3 months') to demonstrate scale and impact." },
      { title: "Tailor Your Summary", desc: "Keep your professional summary under 4 sentences. Make sure it directly highlights your key skills matching the job you target." }
    ],
    ats: [
      { title: "Avoid Tables & Textboxes", desc: "Many ATS parsers convert resumes to plain text. Tables and floating graphics confuse their algorithms, causing data to skip." },
      { title: "Match Keyword Spellings", desc: "Ensure your technical skills spellings match the job description (e.g., write both 'Amazon Web Services' and 'AWS' if listed)." },
      { title: "Use Standard Headers", desc: "Use explicit, simple headings such as 'Work Experience', 'Skills', and 'Education'. Custom headings like 'My Journey' get ignored." }
    ],
    ai: [
      { title: "Let Gemini Optimize Details", desc: "Use the built-in AI rewrite feature to automatically strengthen descriptions, improve vocabulary, and structure project details." },
      { title: "Check Job Matching Scores", desc: "Paste targeted job requirements in our JD Matcher to extract key skill gaps and keyword recommendations before sending." },
      { title: "Version Control Each Role", desc: "Create multiple copies and iterations targeted for different industries. Track improvements dynamically over time." }
    ]
  };

  return (
    <motion.div 
      className="space-y-8" 
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} 
      initial="hidden" 
      animate="visible"
    >
      {/* Title Header */}
      <motion.div className="space-y-1" variants={itemVariants}>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
          {hasResumes ? "Resume Builder Overview" : "Welcome to AI Resume Builder"}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">v3.0</span>
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {hasResumes 
            ? "Track your score details, manage variants, and optimize resumes." 
            : "Create an ATS-optimized, high-impact resume with Google Gemini in minutes."}
        </p>
      </motion.div>

      {/* KPI Stats (Only visible if the user has resumes) */}
      {hasResumes && (
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={itemVariants}>
          {[
            { label: "Resumes Created", value: resumes.length, icon: FileText, color: "text-violet-500" },
            { label: "Active ATS Score", value: latestResume ? (latestResume.ats_score || latestResume.score || 0) : 0, suffix: "%", icon: Target, color: "text-emerald-500" },
            { label: "Completeness", value: completeness, suffix: "%", icon: Sparkles, color: "text-indigo-500" },
            { label: "Storage Used", value: totalSizeMB, suffix: " MB", icon: Award, color: "text-amber-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2 shadow-xs">
                <div className={`w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">{stat.value}{stat.suffix || ""}</p>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Columns: Action Cards (New User takes full width, Existing User splits with ATS breakdown) */}
        <div className={hasResumes ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
          
          {/* Action Cards Grid */}
          <motion.div 
            className={`grid grid-cols-1 ${hasResumes ? "sm:grid-cols-1" : "md:grid-cols-3"} gap-6`} 
            variants={itemVariants}
          >
            {/* CARD 1: Create New Resume */}
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className="p-7 rounded-[28px] border border-[#FF2E8B]/35 bg-gradient-to-br from-[#FF2E8B]/18 via-[#7C5CFF]/12 to-[#060816] flex flex-col justify-between min-h-[300px] shadow-xl shadow-[#FF2E8B]/10 hover:border-[#FF2E8B]/60 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FF2E8B]/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF2E8B] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-[#FF2E8B]/30 mb-5 text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-zinc-900 dark:text-white mb-2 tracking-tight">Create New Resume</h3>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Start a new professional resume from scratch. Complete our guided multi-step wizard to build a structured, ATS-compliant profile.
                </p>
              </div>
              <button 
                onClick={() => onNavigate("create")}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] text-white text-xs font-black transition-all duration-200 border-none cursor-pointer shadow-lg shadow-[#FF2E8B]/25 hover:opacity-95"
              >
                <span>Start Resume Wizard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* CARD 2: Import Resume */}
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className="p-7 rounded-[28px] border border-[#00D9FF]/35 bg-gradient-to-br from-[#00D9FF]/18 via-[#00FFC6]/12 to-[#060816] flex flex-col justify-between min-h-[300px] shadow-xl shadow-[#00D9FF]/10 hover:border-[#00D9FF]/60 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#00D9FF]/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div 
                    key="uploading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 p-6 rounded-[28px] bg-white/95 dark:bg-[#060816]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-4 z-10"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-4 border-[#00D9FF]/20 border-t-[#00D9FF] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-[#00D9FF]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-zinc-900 dark:text-white">Processing Import</p>
                      <p className="text-[10px] text-[#00D9FF] animate-pulse font-extrabold">{uploadProgressText}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="uploader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col justify-between h-full w-full"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D9FF] to-[#00FFC6] flex items-center justify-center shadow-lg shadow-[#00D9FF]/30 mb-5 text-white">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-lg text-zinc-900 dark:text-white mb-2 tracking-tight">Import Resume</h3>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                        Upload your PDF or DOCX file. Gemini will parse layout structures, extract details, and build a preview profile.
                      </p>
                      {uploadError && (
                        <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/30 text-xs font-bold mb-3">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="truncate">{uploadError}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative w-full">
                      <input 
                        type="file" 
                        accept=".pdf,.docx" 
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-[#00D9FF]/40 hover:bg-[#00D9FF]/10 text-[#00D9FF] dark:text-[#00D9FF] text-xs font-black transition-all duration-200 text-center">
                        <Upload className="w-4 h-4" /> Drag & drop or browse
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CARD 3: My Saved Resumes */}
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              className={`p-7 rounded-[28px] border border-amber-500/35 bg-gradient-to-br from-[#F59E0B]/18 via-[#7C5CFF]/12 to-[#060816] shadow-xl shadow-amber-500/10 flex flex-col justify-between ${hasResumes ? "sm:h-auto min-h-[300px]" : "min-h-[300px]"} hover:border-amber-500/60 transition-all duration-300 relative overflow-hidden group`}
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              <div className="w-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FF2E8B] flex items-center justify-center shadow-lg shadow-amber-500/30 text-white shrink-0">
                      <HistoryIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-zinc-900 dark:text-white tracking-tight">My Saved Resumes</h3>
                      <p className="text-xs font-bold text-amber-500 dark:text-amber-400">Total documents: {resumes.length}</p>
                    </div>
                  </div>
                  {hasResumes && (
                    <button 
                      onClick={() => onNavigate("history")} 
                      className="text-xs font-black text-amber-500 hover:text-amber-400 bg-transparent border-none cursor-pointer hover:underline"
                    >
                      View All
                    </button>
                  )}
                </div>

                {!hasResumes ? (
                  <div className="text-center py-6">
                    <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 mb-2">No saved resumes found.</p>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-normal max-w-[200px] mx-auto">
                      Build your first resume or upload a document file to list them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                    {resumes.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shadow-3xs"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">{item.file_name || "AI Resume Profile"}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-5xs text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTimeAgo(item.updated_at || item.created_at)}</span>
                            <span>•</span>
                            <span>v{item.version || 1}.0 {user?.target_company ? `(${user.target_company})` : ""}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {item.score !== null && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                              item.score >= 80 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/40" :
                              item.score >= 60 ? "text-amber-600 bg-amber-50 dark:text-amber-450 dark:bg-amber-950/40" :
                              "text-red-600 bg-red-50 dark:text-red-450 dark:bg-red-950/40"
                            }`}>{item.score}%</span>
                          )}
                          <button 
                            onClick={() => handleEditResume(item)}
                            className="p-1 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 text-[10px] font-bold text-zinc-650 dark:text-zinc-300 hover:text-indigo-650 dark:hover:text-indigo-400 transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => handleDeleteResume(e, item)}
                            className="p-1 text-zinc-400 hover:text-red-650 dark:hover:text-red-450 transition-colors border-none bg-transparent cursor-pointer"
                            title="Delete resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* AI INSIGHTS CARD */}
          {hasResumes && analysis && (
            <motion.div className="p-7 rounded-[28px] border border-purple-500/20 dark:border-white/15 bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl shadow-xl space-y-5" variants={itemVariants}>
              <h3 className="font-black text-base text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                <Sparkles className="w-5 h-5 text-[#FF2E8B]" /> Active AI Insights & Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Top Strengths</h4>
                  <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-200 pl-0 list-none font-bold">
                    {analysis.strengths?.slice(0, 3).map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-extrabold">✓</span> <span>{s}</span>
                      </li>
                    ))}
                    {(!analysis.strengths || analysis.strengths.length === 0) && (
                      <li className="italic text-zinc-400">No strengths extracted yet.</li>
                    )}
                  </ul>
                </div>
                
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Critical Gaps</h4>
                  <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-200 pl-0 list-none font-bold">
                    {analysis.weaknesses?.slice(0, 3).map((w: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-extrabold">!</span> <span>{w}</span>
                      </li>
                    ))}
                    {(!analysis.weaknesses || analysis.weaknesses.length === 0) && (
                      <li className="italic text-zinc-400">No critical weaknesses identified.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 space-y-2">
                <h4 className="text-[10px] font-black text-[#7C5CFF] uppercase tracking-widest">AI Recommendations</h4>
                <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-200 pl-0 list-none font-bold">
                  {analysis.suggestions?.slice(0, 3).map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#7C5CFF] font-extrabold">•</span> <span>{s}</span>
                    </li>
                  ))}
                  {(!analysis.suggestions || analysis.suggestions.length === 0) && (
                    <li className="italic text-zinc-400">No active AI suggestions. Click Analyze to generate.</li>
                  )}
                </ul>
              </div>
            </motion.div>
          )}

          {/* RECENT ACTIVITY SECTION */}
          <motion.div className="p-7 rounded-[28px] border border-purple-500/20 dark:border-white/15 bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl shadow-xl space-y-5" variants={itemVariants}>
            <h3 className="font-black text-base text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <Clock className="w-5 h-5 text-[#7C5CFF]" /> Recent Activity
            </h3>
            
            {!hasResumes ? (
              <div className="text-center py-8 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                No recent activity. Get started by building a resume.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Edited panel */}
                <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-white/[0.03] border border-purple-500/10 dark:border-white/10 space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Recently Edited</h4>
                  <div className="space-y-2">
                    {resumes.slice(0, 2).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-[150px]">{r.file_name}</span>
                        <span className="text-[10px] text-zinc-400 shrink-0 font-extrabold">{formatTimeAgo(r.updated_at || r.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Analyzed panel */}
                <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-white/[0.03] border border-purple-500/10 dark:border-white/10 space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Recently Analyzed</h4>
                  <div className="space-y-2">
                    {resumes.filter(r => r.score !== null).slice(0, 2).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-900 dark:text-zinc-200 truncate max-w-[150px]">{r.file_name}</span>
                        <span className="text-[10px] text-emerald-500 font-black shrink-0">{r.score}% ATS</span>
                      </div>
                    ))}
                    {resumes.filter(r => r.score !== null).length === 0 && (
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">No resumes analyzed yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Columns: ATS Score & Breakdown (Only shown if the user has created at least one resume) */}
        {hasResumes && (
          <motion.div className="lg:col-span-5 space-y-6" variants={itemVariants}>
            <div className="p-7 rounded-[28px] border border-purple-500/20 dark:border-white/15 bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl shadow-xl flex flex-col justify-between">
              <div className="flex flex-col items-center text-center">
                <h3 className="font-black text-base text-zinc-900 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
                  <Target className="w-5 h-5 text-[#FF2E8B]" /> Active ATS Score
                </h3>
                <ATSScoreRing 
                  score={latestResume ? (latestResume.ats_score || latestResume.score || 0) : 0} 
                  size={140} 
                  strokeWidth={9} 
                />
                <div className="mt-4 space-y-0.5">
                  <p className="font-black text-sm text-zinc-900 dark:text-white">Active Version Analysis</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                    {latestResume 
                      ? `Last updated ${formatTimeAgo(latestResume.updated_at || latestResume.created_at)}` 
                      : "No active resume profile"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 w-full space-y-3">
                {atsBreakdown.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-600 dark:text-zinc-300">{cat.label}</span>
                      <span className="font-black text-[#7C5CFF] dark:text-[#00D9FF] tabular-nums">{cat.score}%</span>
                    </div>
                    <div className="h-2 bg-purple-500/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} 
                        initial={{ width: 0 }} 
                        animate={{ width: `${cat.score}%` }} 
                        transition={{ duration: 1.2, delay: i * 0.05 }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Active Resume Quick Actions */}
            {latestResume && (
              <div className="p-5 rounded-2xl border border-purple-500/20 dark:border-white/15 bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl shadow-lg flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <p className="text-[10px] font-black text-[#7C5CFF] uppercase tracking-widest">Active Profile</p>
                  <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{latestResume.file_name}</p>
                </div>
                <button 
                  onClick={() => handleEditResume(latestResume)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E8B] to-[#7C5CFF] text-white text-xs font-black transition-all duration-150 border-none cursor-pointer shadow-md shadow-[#FF2E8B]/20"
                >
                  <span>Optimize</span>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* QUICK TIPS SECTION */}
      <motion.div className="p-7 rounded-[28px] border border-purple-500/20 dark:border-white/15 bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl shadow-xl space-y-6" variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-black text-base text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <BookOpen className="w-5 h-5 text-[#7C5CFF]" /> Resume Optimization Tips
          </h3>
          
          {/* Tips Navigation Tabs */}
          <div className="flex p-1 rounded-xl bg-purple-500/10 dark:bg-white/10 border border-purple-500/20 dark:border-white/15 shrink-0 self-start sm:self-auto">
            {[
              { id: "writing", label: "Writing Tips", icon: FileText },
              { id: "ats", label: "ATS Guidelines", icon: Target },
              { id: "ai", label: "AI Suggestions", icon: Zap }
            ].map(tab => {
              const isActive = activeTipsTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTipsTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black border-none transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-gradient-to-r from-[#FF2E8B] to-[#7C5CFF] text-white shadow-md" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips Render Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tips[activeTipsTab].map((tip, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl border border-purple-500/15 dark:border-white/10 bg-purple-500/5 dark:bg-white/[0.03] space-y-2 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <h4 className="font-black text-xs text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF2E8B] shrink-0 shadow-sm shadow-[#FF2E8B]" />
                {tip.title}
              </h4>
              <p className="text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>


      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-8">
        <button
          onClick={() => onNavigate("create")}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/10 transition-all border-none cursor-pointer"
        >
          Next: Create Resume <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
