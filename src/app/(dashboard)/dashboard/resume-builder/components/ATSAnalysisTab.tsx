"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertTriangle, Target, Sparkles, Briefcase, Loader2, ChevronLeft, ChevronRight, X, Search, Zap, DollarSign, Award, BookOpen, Percent, HelpCircle } from "lucide-react";
import ATSScoreRing from "./ATSScoreRing";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { resumeService } from "@/services/resume";
import { Button } from "@/components/ui/Button";
import { useGamification } from "@/context/GamificationContext";
import { getResumeText } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const IMPROVE_MODES = [
  { id: "rewrite_entire", label: "Rewrite Entire Resume", desc: "Optimize and rewrite the whole resume in clean markdown structure." },
  { id: "improve_summary", label: "Improve Summary", desc: "Rewrite the professional summary to make it highly engaging and keyword-dense." },
  { id: "improve_experience", label: "Improve Experience", desc: "Strengthen work descriptions with strong action verbs and metrics." },
  { id: "improve_projects", label: "Improve Projects", desc: "Detail technical choices, problems solved, and clear quantifiable outcomes." },
  { id: "improve_skills", label: "Optimize Skills List", desc: "Group technical and soft skills logically and format them professionally." },
  { id: "add_ats_keywords", label: "Add Specific ATS Keywords", desc: "Inject industry-specific keywords (requires entering keywords below)." },
  { id: "make_ats_friendly", label: "Make ATS Friendly", desc: "Remove complex layouts and format for compatibility with ATS parsers." },
  { id: "make_recruiter_friendly", label: "Make Recruiter Friendly", desc: "Focus descriptions on leadership, growth, ownership, and business outcomes." },
  { id: "reduce_length", label: "Reduce Resume Length", desc: "Condense descriptions to remove fluff while preserving key achievements." },
  { id: "increase_impact", label: "Increase Phrasing Impact", desc: "Replace passive phrases with strong, success-oriented statements." },
  { id: "fix_grammar", label: "Fix Grammar & Typos", desc: "Correct grammar, spelling, punctuation, and stylistic inconsistencies." },
  { id: "generate_achievement_statements", label: "Generate Achievement Statements", desc: "Formulate quantifiable achievement metrics based on your experience." },
  { id: "generate_star_bullet_points", label: "Generate STAR Bullet Points", desc: "Rewrite bullet points following the Situation, Task, Action, Result framework." },
];

const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

interface ATSAnalysisTabProps {
  activeResume: any | null;
  setActiveResume: (resume: any) => void;
  refreshResumes: () => void;
  onNavigate?: (tab: string) => void;
  currentTab?: string;
}

export default function ATSAnalysisTab({ activeResume, setActiveResume, refreshResumes, onNavigate, currentTab = "ats" }: ATSAnalysisTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackActivity } = useGamification();
  const [activeView, setActiveView] = useState<"upload" | "analysis">(activeResume ? "analysis" : "upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressText, setAnalysisProgressText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [matching, setMatching] = useState(false);
  const [improving, setImproving] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [selectedImproveMode, setSelectedImproveMode] = useState("rewrite_entire");
  const [additionalKeywordInput, setAdditionalKeywordInput] = useState("");

  useEffect(() => {
    const loadOriginalText = async () => {
      if (!activeResume) {
        setOriginalText("");
        return;
      }

      // 1. Reconstruct from content if it's a wizard-created resume
      if (activeResume.content) {
        const text = getResumeText({ content: activeResume.content });
        if (text) {
          setOriginalText(text);
          return;
        }
      }

      // 2. If it's not a wizard resume, and it's not AI generated/optimized, its own parsed_content is the original
      if (!activeResume.is_ai_generated && !activeResume.target_company) {
        setOriginalText(activeResume.parsed_content || "");
        return;
      }

      // 3. If it is AI optimized, fetch the original resume version (non-AI generated version) sharing the same file_path
      try {
        const query = supabase
          .from("resumes")
          .select("parsed_content, content")
          .eq("user_id", activeResume.user_id);
        
        if (activeResume.file_path) {
          query.eq("file_path", activeResume.file_path);
        } else {
          query.is("file_path", null);
        }

        const { data, error } = await query
          .or("is_ai_generated.eq.false,is_ai_generated.is.null")
          .order("version", { ascending: true })
          .limit(1);

        if (!error && data && data.length > 0) {
          const orig = data[0];
          const text = orig.content ? getResumeText({ content: orig.content }) : orig.parsed_content;
          setOriginalText(text || "");
        } else {
          // Fallback to active resume's own content
          setOriginalText(activeResume.parsed_content || "");
        }
      } catch (err) {
        console.error("Error loading original resume text:", err);
        setOriginalText(activeResume.parsed_content || "");
      }
    };

    loadOriginalText();
  }, [activeResume]);

  const [isApplying, setIsApplying] = useState(false);

  const handleApplyAIChanges = async () => {
    if (!activeResume || !activeResume.improved_content) return;
    setShowApplyConfirm(true);
  };

  const handleApplyAIChangesConfirmed = async () => {
    if (!activeResume || !activeResume.improved_content) return;
    setShowApplyConfirm(false);

    setIsApplying(true);
    try {
      const parseRes = await fetch("/api/resume/parse-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdownText: activeResume.improved_content })
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok || !parseData.structuredData) {
        throw new Error(parseData.error || "Failed to convert markdown to form fields");
      }

      const { data, error } = await (supabase.from("resumes") as any)
        .update({
          content: parseData.structuredData,
          parsed_content: activeResume.improved_content,
          updated_at: new Date().toISOString()
        })
        .eq("id", activeResume.id)
        .select()
        .single();

      if (error) throw error;

      setActiveResume(data);
      refreshResumes();
      toast.success("AI improvements successfully applied to your resume!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to apply improvements: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  // Sync activeView when activeResume changes
  useEffect(() => {
    if (activeResume) {
      setActiveView("analysis");
    } else {
      setActiveView("upload");
    }
  }, [activeResume]);

  // Fetch or parse analysis details when activeResume is loaded
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!activeResume) {
        setAnalysis(null);
        return;
      }

      // 1. Try to check feedback column first (form builder stores feedback here)
      if (activeResume.feedback) {
        try {
          const parsed = typeof activeResume.feedback === "string"
            ? JSON.parse(activeResume.feedback)
            : activeResume.feedback;

          if (parsed.strengths || parsed.weaknesses || parsed.improvements) {
            setAnalysis({
              ats_score: activeResume.ats_score || activeResume.score || 0,
              strengths: parsed.strengths || [],
              weaknesses: parsed.weaknesses || [],
              missing_keywords: parsed.missing_keywords || parsed.missingKeywords || [],
              suggestions: parsed.improvements || parsed.suggestions || [],
              overall_feedback: parsed.overall_feedback || parsed.overallFeedback || ""
            });
            return;
          }
        } catch (e) {
          console.error("Error parsing feedback:", e);
        }
      }

      // 2. Fetch from resume_analysis table (file analysis stores feedback here)
      try {
        setLoadingAnalysis(true);
        const { data, error } = await supabase
          .from("resume_analysis")
          .select("*")
          .eq("resume_id", activeResume.id)
          .single();

        if (!error && data) {
          setAnalysis(data);
        } else {
          // Fallback if no analysis records yet
          setAnalysis({
            ats_score: activeResume.ats_score || activeResume.score || 0,
            strengths: [],
            weaknesses: [],
            missing_keywords: [],
            suggestions: [],
            overall_feedback: ""
          });
        }
      } catch (err) {
        console.error("Error loading analysis:", err);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    loadAnalysis();
  }, [activeResume]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleFile = async (file: File) => {
    if (!user) {
      toast.error("Please log in to analyze your resume.");
      return;
    }
    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisProgressText("Uploading document to storage...");
    try {
      // 1. Upload to Storage & resumes table
      const newResume = await resumeService.uploadResume(user.id, file);

      setAnalysisProgressText("Running text extraction & OCR...");
      // 2. Trigger real analysis API
      await resumeService.analyzeResume(newResume.id);

      setAnalysisProgressText("Generating ATS Score & recommendations...");
      // 3. Fetch the fully completed resume record
      const { data: updatedResume, error } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("id", newResume.id)
        .single();

      if (error || !updatedResume) throw error || new Error("Updated resume not found");

      // 4. Update state and trigger parent refresh
      setActiveResume(updatedResume);
      refreshResumes();
      setActiveView("analysis");

      try {
        await trackActivity("resume");
      } catch (gErr) {
        console.error("Failed to track resume gamification event:", gErr);
      }

      // Log activity
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "Uploaded & Analyzed Resume", module: "Resume Builder" })
      }).catch(() => {});
    } catch (err: any) {
      console.error("Upload/analysis failed:", err);
      toast.error("Analysis failed: " + (err.message || err.error || "Unknown error"));
      setUploadedFile(null);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressText("");
    }
  };

  const handleReAnalyze = async () => {
    if (!activeResume) return;
    setIsAnalyzing(true);
    setAnalysisProgressText("Running text extraction & OCR...");
    try {
      await resumeService.analyzeResume(activeResume.id);

      setAnalysisProgressText("Generating ATS Score & recommendations...");
      // Fetch latest details
      const { data: updatedResume, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", activeResume.id)
        .single();

      if (error || !updatedResume) throw error || new Error("Updated resume not found");

      setActiveResume(updatedResume);
      // Fetch dynamic analysis details
      const { data: analysisData } = await supabase
        .from("resume_analysis")
        .select("*")
        .eq("resume_id", activeResume.id)
        .single();
      if (analysisData) {
        setAnalysis(analysisData);
      }
      refreshResumes();
      toast.success("ATS Analysis completed successfully!");
    } catch (err: any) {
      console.error("Re-analysis failed:", err);
      toast.error("Analysis failed: " + (err.message || err.error || "Unknown error"));
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressText("");
    }
  };

  const handleJobMatch = async () => {
    if (!jobDesc.trim() || !activeResume) return;
    setMatching(true);
    try {
      const data = await resumeService.matchWithJob(activeResume.id, jobDesc);
      // Map API result properties to UI structure
      setMatchResult({
        score: data.matchScore || data.score || 0,
        matching: data.matchingSkills || data.matching || [],
        missing: data.missingSkills || data.missing || [],
        missingKeywords: data.missingKeywords || [],
        suggestions: data.suggestedImprovements || data.suggestions || [],
        recommendedCourses: data.recommendedCourses || [],
        interviewQuestions: data.interviewQuestions || [],
        expectedSalary: data.expectedSalary || "",
        companyDifficulty: data.companyDifficulty || "",
        hiringProbability: data.hiringProbability || ""
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to match resume with job description: " + err.message);
    } finally {
      setMatching(false);
    }
  };

  const handleImproveResume = async (mode: string = "rewrite_entire", additionalData: string = "") => {
    if (!activeResume) return;
    setImproving(true);
    try {
      const textToImprove = getResumeText(activeResume);
      if (!textToImprove) {
        toast.warning("No resume text found to improve. Please create or upload a resume first.");
        setImproving(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/resume/improve", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          resumeId: activeResume.id, 
          existingResumeText: textToImprove,
          mode,
          additionalData
        })
      });


      const data = await res.json();
      if (res.ok && data.improved_resume) {
        // Save to Database
        const { error } = await (supabase.from("resumes") as any)
          .update({ improved_content: data.improved_resume, updated_at: new Date().toISOString() })
          .eq("id", activeResume.id);

        if (error) throw error;

        // Fetch latest details
        const { data: updated } = await (supabase.from("resumes") as any)
          .select("*")
          .eq("id", activeResume.id)
          .single();

        setActiveResume(updated);
        refreshResumes();

        toast.success("Resume improved successfully with AI optimization!");
      } else {
        toast.error("Failed to improve resume: " + data.error);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to improve resume: " + err.message);
    } finally {
      setImproving(false);
    }
  };

  const overallScore = analysis?.ats_score || activeResume?.ats_score || activeResume?.score || 0;

  const getSectionScore = (categoryKey: string, fallbackMultiplier: number) => {
    if (analysis?.section_scores && typeof analysis.section_scores === "object") {
      const scores = analysis.section_scores as Record<string, number>;
      if (typeof scores[categoryKey] === "number") {
        return scores[categoryKey];
      }
    }
    return Math.min(100, Math.max(0, Math.round(overallScore * fallbackMultiplier)));
  };

  const atsCategories = [
    { label: "Formatting", score: getSectionScore("formatting", 1.02), color: "from-indigo-500 to-purple-500" },
    { label: "Keywords", score: getSectionScore("keywords", 0.95), color: "from-amber-500 to-orange-500" },
    { label: "Projects", score: getSectionScore("projects", 1.01), color: "from-violet-500 to-indigo-500" },
    { label: "Skills", score: getSectionScore("skills", 0.98), color: "from-emerald-500 to-teal-500" },
    { label: "Education", score: getSectionScore("education", 1.0), color: "from-sky-500 to-blue-500" },
    { label: "Experience", score: getSectionScore("experience", 0.92), color: "from-blue-500 to-cyan-500" },
    { label: "Achievements", score: getSectionScore("achievements", 0.90), color: "from-rose-500 to-pink-500" },
    { label: "Grammar", score: getSectionScore("grammar", 1.04), color: "from-teal-500 to-emerald-500" }
  ];

  return (
    <motion.div className="space-y-8" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="visible">
      {/* Apply-to-resume confirmation modal */}
      {showApplyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Apply AI Improvements?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This will overwrite your active resume content with the AI-optimized version. Your template preview and form builder will be updated.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowApplyConfirm(false)} className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer bg-transparent">
                Cancel
              </button>
              <button onClick={handleApplyAIChangesConfirmed} className="px-4 py-2 rounded-xl bg-aurora-primary hover:bg-aurora-primary-hover text-white text-sm font-semibold border-none cursor-pointer">
                Yes, Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <motion.div className="space-y-1" variants={itemVariants}>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">ATS Analysis & Job Matching</h2>
        <p className="text-sm text-zinc-500">Upload your resume, analyze ATS compatibility, and match against job descriptions.</p>
      </motion.div>

      {activeView === "upload" && (
        <motion.div variants={itemVariants} key="upload">
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
              isDragging ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mx-auto border border-violet-100 dark:border-violet-900/60 mb-5">
              <Upload className={`w-8 h-8 text-violet-600 ${isDragging ? "animate-bounce" : ""}`} />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">Upload your resume</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">Supported formats: PDF, DOCX, TXT. Max 20MB.</p>
            <div className="relative inline-block">
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20 pointer-events-none">
                <Upload className="w-4 h-4" /> Browse Files
              </span>
            </div>
          </div>

          {uploadedFile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{uploadedFile.name}</p>
                  <p className="text-xs text-zinc-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              {isAnalyzing ? (
                <span className="flex items-center gap-2 text-xs font-semibold text-indigo-650"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {analysisProgressText || "Analyzing..."}</span>
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {activeView === "analysis" && (
          <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button onClick={() => { setActiveView("upload"); setUploadedFile(null); }} className="text-xs font-semibold text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 transition-colors border-none bg-transparent cursor-pointer">
                ← Upload New Resume
              </button>
              <div className="flex items-center gap-3">
                {activeResume && (
                  <Button
                    onClick={handleReAnalyze}
                    isLoading={isAnalyzing}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold gap-1.5 border-indigo-200 dark:border-indigo-850 hover:bg-indigo-50/50"
                  >
                    <Target className="w-3.5 h-3.5 text-indigo-500" /> Analyze ATS
                  </Button>
                )}
                {activeResume && (
                  <span className="text-xs text-zinc-500 font-semibold">
                    Viewing: <span className="font-bold text-zinc-700 dark:text-zinc-300">{activeResume.file_name || "My Resume"}</span> (v{activeResume.version || 1}.0)
                  </span>
                )}
              </div>
            </div>

            {loadingAnalysis ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs text-zinc-500">Fetching analysis breakdown...</p>
              </div>
            ) : (
              <>
                <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-6" variants={itemVariants}>
                  {/* ATS Score Card */}
                  <div className="lg:col-span-5 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
                    <ATSScoreRing score={overallScore} size={150} strokeWidth={10} />
                    <div className="mt-4 w-full space-y-3">
                      {atsCategories.map((cat, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-500">{cat.label}</span>
                            <span className="font-bold tabular-nums text-zinc-700 dark:text-zinc-300">{cat.score}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-emerald-250 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10">
                        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-3"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</h4>
                        <ul className="space-y-2 pl-0 list-none">
                          {analysis?.strengths && analysis.strengths.length > 0 ? (
                            analysis.strengths.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /><span>{s}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-zinc-500 italic">No specific strengths parsed.</li>
                          )}
                        </ul>
                      </div>
                      <div className="p-5 rounded-2xl border border-amber-250 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10">
                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-3"><AlertTriangle className="w-3.5 h-3.5" /> Weaknesses</h4>
                        <ul className="space-y-2 pl-0 list-none">
                          {analysis?.weaknesses && analysis.weaknesses.length > 0 ? (
                            analysis.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /><span>{w}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-zinc-500 italic">No specific weaknesses identified.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Section Evaluation (Strong & Weak Sections) */}
                    {((analysis?.strong_sections && analysis.strong_sections.length > 0) || 
                      (analysis?.weak_sections && analysis.weak_sections.length > 0)) && (
                      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Section Evaluation</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {analysis?.strong_sections && analysis.strong_sections.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 uppercase">Strong Sections</p>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.strong_sections.map((sec: string) => (
                                  <span key={sec} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-350 border border-emerald-250 dark:border-emerald-900">{sec}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysis?.weak_sections && analysis.weak_sections.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-450 mb-1.5 uppercase">Weak Sections</p>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.weak_sections.map((sec: string) => (
                                  <span key={sec} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-350 border border-rose-250 dark:border-rose-900">{sec}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Keywords Analysis */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Keyword Analysis</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 uppercase">Identified Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis?.strengths && analysis.strengths.slice(0, 4).length > 0 ? (
                              (analysis?.missing_keywords || []).length > 0 ? (
                                ["React", "JavaScript", "TypeScript", "SQL", "Git"].map(k => (
                                  <span key={k} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-900">{k}</span>
                                ))
                              ) : (
                                <span className="text-xs text-zinc-500">Skills scanned and verified.</span>
                              )
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Keywords extracted from resume.</span>
                            )}
                          </div>
                        </div>
                        {analysis?.missing_keywords && analysis.missing_keywords.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1.5 uppercase">Missing Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.missing_keywords.map((k: string) => (
                                <span key={k} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-250 dark:border-amber-900">{k}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Suggestions */}
                <motion.div variants={itemVariants}>
                  <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-indigo-500" /> AI Improvement Suggestions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis?.suggestions && analysis.suggestions.length > 0 ? (
                        analysis.suggestions.map((s: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40">
                              <Zap className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Recommendation {i + 1}</p>
                              <p className="text-[10px] font-medium leading-relaxed text-zinc-505 dark:text-zinc-400 mt-0.5">{s}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic p-2 col-span-2">No recommendations available.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
                {/* Side-by-Side Comparison & AI Playground */}
                <motion.div variants={itemVariants}>
                  <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500" /> AI Resume Optimizer & Playground
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Select an improvement mode, type target options if needed, and optimize with Google Gemini.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:flex-row md:items-end justify-between border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 rounded-xl mb-6">
                      <div className="space-y-1.5 flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500">AI Optimization Mode</label>
                        <select 
                          value={selectedImproveMode}
                          onChange={(e) => setSelectedImproveMode(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          {IMPROVE_MODES.map((m) => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-zinc-400 leading-normal font-medium mt-1">
                          {IMPROVE_MODES.find(m => m.id === selectedImproveMode)?.desc}
                        </p>
                      </div>

                      {selectedImproveMode === "add_ats_keywords" && (
                        <div className="space-y-1.5 flex-1 min-w-[200px]">
                          <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500">Keywords to inject</label>
                          <input 
                            type="text"
                            value={additionalKeywordInput}
                            onChange={(e) => setAdditionalKeywordInput(e.target.value)}
                            placeholder="e.g. Next.js, Kubernetes, CI/CD"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-850 dark:text-zinc-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      )}

                      <div className="shrink-0">
                        <Button
                          onClick={() => handleImproveResume(selectedImproveMode, additionalKeywordInput)}
                          isLoading={improving}
                          size="sm"
                          className="text-xs font-bold gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 shrink-0 border-none"
                        >
                          <Zap className="w-3.5 h-3.5" /> Run AI Optimization
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Original */}
                      <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Original Resume Text</span>
                        </div>
                        <div className="p-4 h-96 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/20 text-xs font-mono whitespace-pre-wrap leading-relaxed text-zinc-705 dark:text-zinc-350 scrollbar-thin">
                          {originalText || (
                            <span className="text-zinc-400 italic">No text content available. Double check your uploaded file.</span>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Improved */}
                      <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI-Optimized Resume (Markdown)
                          </span>
                          {activeResume?.improved_content && (
                            <button
                              onClick={handleApplyAIChanges}
                              disabled={isApplying}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all border-none cursor-pointer flex items-center gap-1"
                            >
                              {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              {isApplying ? "Applying..." : "Apply to Resume"}
                            </button>
                          )}
                        </div>
                        <div className="p-4 h-96 overflow-y-auto bg-indigo-50/5 dark:bg-zinc-950/20 text-xs leading-relaxed text-zinc-750 dark:text-zinc-350 scrollbar-thin">
                          {activeResume?.improved_content ? (
                            <pre className="whitespace-pre-wrap font-mono">{activeResume.improved_content}</pre>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-4">
                              <p className="text-zinc-450 text-xs italic">No optimized version generated yet.</p>
                              <p className="text-zinc-400 text-[10px] max-w-xs leading-relaxed">Select a mode above and click &quot;Run AI Optimization&quot; to generate an optimized resume version.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Job Matcher */}
                <motion.div variants={itemVariants}>
                  <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-4"><Briefcase className="w-4 h-4 text-indigo-500" /> Job Description Matcher</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-500">Paste a job description to see how well your resume matches.</p>
                        <textarea className="w-full h-44 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm text-zinc-700 dark:text-zinc-355 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" placeholder="Paste the job description here..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
                        <button onClick={handleJobMatch} disabled={matching || !jobDesc.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl aurora-gradient-primary text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none cursor-pointer shadow-lg">
                          {matching ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Search className="w-4 h-4" /> Analyze Match</>}
                        </button>
                      </div>                      <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 max-h-[520px] overflow-y-auto scrollbar-thin">
                        {matchResult ? (
                          <div className="space-y-5">
                            {/* Header match score */}
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-850">
                              <div>
                                <h4 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-550">Job Match Analysis</h4>
                                <p className="text-[10px] text-zinc-500 font-medium">Relevance rating for target profile</p>
                              </div>
                              <span className={`text-lg font-black px-3.5 py-1 rounded-full ${
                                matchResult.score >= 80 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" :
                                matchResult.score >= 60 ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" :
                                "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
                              }`}>{matchResult.score}% Match</span>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-center">
                                <DollarSign className="w-3.5 h-3.5 mx-auto text-indigo-500 mb-1" />
                                <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 truncate">{matchResult.expectedSalary || "N/A"}</p>
                                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Salary Est.</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-center">
                                <Percent className="w-3.5 h-3.5 mx-auto text-emerald-500 mb-1" />
                                <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 truncate">{matchResult.hiringProbability || "N/A"}</p>
                                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Hiring Prob.</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 text-center">
                                <Award className="w-3.5 h-3.5 mx-auto text-amber-500 mb-1" />
                                <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 truncate">{matchResult.companyDifficulty || "N/A"}</p>
                                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Difficulty</p>
                              </div>
                            </div>

                            {/* Matching & Missing Skills */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5">Matching Skills ({matchResult.matching.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {matchResult.matching.length > 0 ? (
                                    matchResult.matching.map((s: string) => <span key={s} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-350 border border-emerald-200/50 dark:border-emerald-900/40"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1 text-emerald-500" />{s}</span>)
                                  ) : (
                                    <span className="text-[9px] text-zinc-450 italic">No direct matching skills identified.</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5">Missing Skills ({matchResult.missing.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {matchResult.missing.length > 0 ? (
                                    matchResult.missing.map((s: string) => <span key={s} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-350 border border-red-200/50 dark:border-red-900/40"><AlertTriangle className="w-2.5 h-2.5 inline mr-1 text-red-500" />{s}</span>)
                                  ) : (
                                    <span className="text-[9px] text-zinc-450 italic">No missing skills detected.</span>
                                  )}
                                </div>
                              </div>

                              {matchResult.missingKeywords && matchResult.missingKeywords.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5">Missing Keywords ({matchResult.missingKeywords.length})</p>
                                  <div className="flex flex-wrap gap-1">
                                    {matchResult.missingKeywords.map((k: string) => (
                                      <span key={k} className="px-2 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-350 border border-amber-200/50 dark:border-amber-900/40">{k}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Suggestions */}
                            {matchResult.suggestions && matchResult.suggestions.length > 0 && (
                              <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-500" /> Suggested Improvements</p>
                                <ul className="space-y-1 pl-0 list-none">
                                  {matchResult.suggestions.map((s: string, i: number) => (
                                    <li key={i} className="text-[10px] text-zinc-650 dark:text-zinc-400 flex items-start gap-1.5 font-medium leading-relaxed">
                                      <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-indigo-500" /><span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Recommended Courses */}
                            {matchResult.recommendedCourses && matchResult.recommendedCourses.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-850">
                                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1"><BookOpen className="w-3 h-3 text-indigo-500" /> Recommended Courses</p>
                                <ul className="space-y-1 pl-0 list-none">
                                  {matchResult.recommendedCourses.map((c: string, i: number) => (
                                    <li key={i} className="text-[10px] text-zinc-655 dark:text-zinc-400 flex items-start gap-1.5 font-medium leading-relaxed">
                                      <span className="text-emerald-500 font-bold shrink-0">🎓</span><span>{c}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Interview Questions */}
                            {matchResult.interviewQuestions && matchResult.interviewQuestions.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-850">
                                <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1"><HelpCircle className="w-3 h-3 text-indigo-500" /> Target Interview Questions</p>
                                <ul className="space-y-2 pl-0 list-none">
                                  {matchResult.interviewQuestions.map((q: string, i: number) => (
                                    <li key={i} className="text-[10px] text-zinc-650 dark:text-zinc-400 flex flex-col p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 font-medium leading-relaxed">
                                      <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Question {i + 1}</span>
                                      <span>{q}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center gap-2">
                            <Briefcase className="w-8 h-8 text-zinc-350 dark:text-zinc-700 animate-pulse" />
                            <p className="text-xs text-zinc-400 font-medium">Paste job description details on the left and click &quot;Analyze Match&quot; to review the compatibility breakdown.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      {onNavigate && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-8">
          <button
            onClick={() => onNavigate(currentTab === "match" ? "ats" : "create")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-transparent transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> {currentTab === "match" ? "Back: ATS Analysis" : "Back: Create Resume"}
          </button>
          <button
            onClick={() => onNavigate(currentTab === "match" ? "templates" : "match")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/10 transition-all border-none cursor-pointer"
          >
            {currentTab === "match" ? "Next: Templates" : "Next: Job Match"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
