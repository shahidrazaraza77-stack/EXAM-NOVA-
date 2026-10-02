"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Play, Terminal, RotateCcw, CheckCircle2, AlertCircle, Copy, Check,
  BookOpen, Code, History, Star, Clock, Maximize2, Minimize2, Bookmark, BookmarkCheck,
  Sparkles, Brain, Award, AlertTriangle, Lightbulb, ChevronUp, ChevronDown, X
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { codingService, FrontendCodingProblem } from "@/services/coding";
import { useGamification } from "@/context/GamificationContext";

const languages = ["Python", "C++", "Java", "JavaScript"];

export default function ProblemDetailView({
  problemId,
  onBack,
  contestId,
  dailyChallengeId,
  onDailyChallengeComplete,
  isStandalone = false,
}: {
  problemId: string;
  onBack: () => void;
  contestId?: string;
  dailyChallengeId?: string;
  onDailyChallengeComplete?: () => void;
  isStandalone?: boolean;
}) {
  const { trackActivity } = useGamification();
  const [problem, setProblem] = useState<FrontendCodingProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leftTab, setLeftTab] = useState<"description" | "solution" | "submissions" | "coach">("description");
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"input" | "result">("input");
  const [customInput, setCustomInput] = useState("");
  
  // Execution Output state
  const [output, setOutput] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // AI Coach state
  const [hint, setHint] = useState<string | null>(null);
  const [review, setReview] = useState<any | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  // Fetch problem on mount
  useEffect(() => {
    async function loadProblemDetail() {
      try {
        setLoading(true);
        const data = await codingService.getProblem(problemId);
        setProblem(data);
        
        // Setup initial custom input
        if (data.examples && data.examples.length > 0) {
          setCustomInput(data.examples[0].input);
        }

        // Fetch submissions
        const subsList = await codingService.getSubmissions("", problemId);
        setSubmissions(subsList);

        // Fetch bookmarks
        const bookmarks = await codingService.getBookmarks("");
        const isMarked = (bookmarks || []).some((b) => b.id === problemId);
        setIsBookmarked(isMarked);

        setError(null);
      } catch (err: any) {
        console.error("Failed to load problem:", err);
        setError("Problem not found or database connection failed.");
      } finally {
        setLoading(false);
      }
    }
    loadProblemDetail();
  }, [problemId]);

  // Load saved draft when language or problem changes
  useEffect(() => {
    if (!problem) return;
    
    async function loadSavedDraft(currProblem: FrontendCodingProblem) {
      try {
        const savedDraft = await codingService.getDraft("", problemId, language);
        if (savedDraft && savedDraft.code) {
          setCode(savedDraft.code);
        } else {
          const bp = currProblem.boilerplates[language] || currProblem.boilerplates["Python"] || "";
          setCode(bp);
        }
      } catch (err) {
        const bp = currProblem.boilerplates[language] || currProblem.boilerplates["Python"] || "";
        setCode(bp);
      }
    }

    loadSavedDraft(problem);
  }, [problem, language, problemId]);

  // Save draft on code change
  useEffect(() => {
    if (!problem || !code) return;
    const timer = setTimeout(() => {
      codingService.saveDraft("", problemId, language, code).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [code, language, problemId, problem]);

  const toggleBookmark = async () => {
    try {
      const nextState = !isBookmarked;
      setIsBookmarked(nextState);
      if (nextState) {
        await codingService.addBookmark("", problemId);
      } else {
        await codingService.removeBookmark("", problemId);
      }
    } catch (err) {
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setShowConsole(true);
    setConsoleTab("result");
    setOutput(null);

    try {
      const runInput = customInput || (problem.examples && problem.examples[0] ? problem.examples[0].input : "");
      const res = await codingService.runCode(problemId, code, language, runInput);
      setOutput(res);
    } catch (err: any) {
      console.error("Code run error:", err);
      setOutput({
        success: false,
        errorMessage: err.message || "Execution engine timed out or threw a runtime error.",
        overallStatus: "Runtime Error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setShowConsole(true);
    setConsoleTab("result");
    setOutput(null);

    try {
      const runResult = await codingService.runCode(problemId, code, language, customInput);
      setOutput(runResult);

      const isAccepted = runResult.overallStatus === "Accepted";
      
      const savedSub = await codingService.submitCode({
        userId: "",
        questionId: problemId,
        language,
        code,
        status: runResult.overallStatus,
        executionTime: runResult.executionTime || 0,
        memoryUsed: runResult.memoryUsed || 0,
        testCasesPassed: (runResult.testCases || []).filter((tc: any) => tc.passed).length,
        totalTestCases: (runResult.testCases || []).length,
      });

      if (dailyChallengeId && isAccepted && onDailyChallengeComplete) {
        onDailyChallengeComplete();
      }

      setSubmissions((prev) => [
        {
          id: savedSub.id || Date.now().toString(),
          status: runResult.overallStatus,
          language,
          execution_time: runResult.executionTime || 0,
          submitted_at: new Date().toISOString()
        },
        ...prev
      ]);

      if (isAccepted) {
        try {
          trackActivity("coding");
        } catch (gErr) {
          console.error("Gamification context trigger failed:", gErr);
        }
      }
    } catch (err: any) {
      console.error("Code submit error:", err);
      setOutput({
        success: false,
        errorMessage: err.message || "Failed to log solution attempt.",
        overallStatus: "Runtime Error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    setLoadingHint(true);
    setHint(null);
    try {
      const guidance = await codingService.getHint(problemId, code, language);
      setHint(guidance);
    } catch (err: any) {
      console.error("Hint retrieval failed:", err);
      setHint("Failed to contact AI Coach. Please check code or retry.");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleGetReview = async () => {
    setLoadingReview(true);
    setReview(null);
    try {
      const audit = await codingService.getCodeReview(problemId, code, language);
      setReview(audit);
    } catch (err: any) {
      console.error("Code review failed:", err);
      setReview({
        qualityScore: 0,
        reviewSummary: "Failed to generate review. Please try again.",
        edgeCases: [],
        suggestions: []
      });
    } finally {
      setLoadingReview(false);
    }
  };

  const resetCode = () => {
    if (!problem) return;
    if (confirm("Reset current editor code to starter boilerplate?")) {
      const bp = problem.boilerplates[language] || problem.boilerplates["Python"] || "";
      setCode(bp);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFF] dark:bg-[#060816] text-[#111827] dark:text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#7C5CFF] border-t-transparent animate-spin" />
          <span className="text-xs font-black tracking-wider text-[#7C5CFF]">Loading LeetCode AI IDE...</span>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFF] dark:bg-[#060816] text-[#111827] dark:text-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <div>
          <h3 className="font-black text-xl">Problem Not Available</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{error || "This coding question could not be retrieved."}</p>
        </div>
        <button onClick={onBack} className="px-6 py-2.5 bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border-0 shadow-lg">
          Back to Problems
        </button>
      </div>
    );
  }

  return (
    <div className={`${
      isFullscreen 
        ? "fixed inset-0 z-[999999] w-screen h-screen bg-[#F8FAFF] dark:bg-[#060816] p-4 sm:p-6 shadow-2xl" 
        : "w-full h-full min-h-[550px] p-2 sm:p-3 bg-transparent"
    } text-[#111827] dark:text-white flex flex-col overflow-hidden font-sans select-none transition-all duration-200`}>
      
      {/* ─── TOP IDE HEADER BAR ─── */}
      <div className="flex items-center justify-between pb-3 px-2 border-b border-purple-500/15 dark:border-white/10 shrink-0">
        
        {/* Left: Back + Title + Badges */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-purple-500/15 dark:border-white/15 text-xs font-black text-zinc-700 dark:text-zinc-200 hover:text-[#FF2E8B] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 text-[#FF2E8B]" />
            <span>Problems</span>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-[#111827] dark:text-white tracking-tight">
              {problem.title}
            </h1>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              problem.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
              problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" :
              "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
            }`}>
              {problem.difficulty}
            </span>
          </div>

          <span className="hidden md:inline-block text-xs font-bold text-zinc-400 dark:text-zinc-500">
            {problem.topic} · Acceptance: {problem.acceptanceRate}
          </span>
        </div>

        {/* Right Controls: Bookmark, Fullscreen & Close */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleBookmark} 
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                : "bg-white/80 dark:bg-white/[0.08] border-purple-500/15 dark:border-white/15 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
            title="Bookmark Problem"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-purple-500/15 dark:border-white/15 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button 
            onClick={onBack} 
            className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.08] border border-purple-500/15 dark:border-white/15 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Close IDE"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ─── MAIN IDE SPLIT PANE GRID ─── */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 pt-3 overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════
           LEFT COLUMN (DESCRIPTION, SOLUTION, SUBMISSIONS, COACH)
        ═══════════════════════════════════════════════════ */}
        <div className="w-full md:w-[46%] lg:w-[42%] flex flex-col rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 overflow-hidden shadow-xl min-h-0 shrink-0">
          
          {/* Header Tabs */}
          <div className="flex items-center border-b border-purple-500/15 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.03] shrink-0 px-2 pt-2">
            {(["description", "solution", "submissions", "coach"] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setLeftTab(tab)} 
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                  leftTab === tab 
                    ? "border-[#7C5CFF] text-[#7C5CFF] dark:text-[#00D9FF]" 
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab === "description" && <BookOpen className="w-3.5 h-3.5" />}
                {tab === "solution" && <Code className="w-3.5 h-3.5" />}
                {tab === "submissions" && <History className="w-3.5 h-3.5" />}
                {tab === "coach" && <Sparkles className="w-3.5 h-3.5 text-[#FF2E8B]" />}
                <span>{tab === "coach" ? "AI Coach" : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin select-text">
            
            {/* 1. DESCRIPTION TAB */}
            {leftTab === "description" && (
              <>
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-zinc-900 dark:text-zinc-100 font-semibold space-y-3">
                  {problem.description ? (
                    problem.description.replace(/\\n/g, "\n")
                  ) : (
                    <p className="text-zinc-500 italic">No description provided for this question.</p>
                  )}
                </div>

                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-3 pt-3">
                    <h4 className="font-extrabold text-[10px] uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Examples</h4>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-white/[0.05] border border-purple-500/15 dark:border-white/10 space-y-2 font-mono text-xs shadow-xs">
                        <p className="font-extrabold text-purple-600 dark:text-purple-400 text-[10px] uppercase tracking-wider">Example {i + 1}</p>
                        <p className="text-zinc-900 dark:text-zinc-100"><span className="text-[#7C5CFF] dark:text-[#00D9FF] font-black">Input:</span> {ex.input}</p>
                        <p className="text-zinc-900 dark:text-zinc-100"><span className="text-[#FF2E8B] font-black">Output:</span> {ex.output}</p>
                        {ex.explanation && <p className="text-zinc-600 dark:text-zinc-400 font-sans font-medium text-xs pt-1.5 border-t border-purple-500/10 dark:border-white/5">{ex.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="pt-3">
                    <h4 className="font-extrabold text-[10px] uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-2">Constraints</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono font-medium">
                      {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {problem.tags && problem.tags.length > 0 && (
                  <div className="pt-3">
                    <h4 className="font-extrabold text-[10px] uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-2">Topic Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.map((t) => (
                        <span key={t} className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-purple-500/10 dark:bg-white/[0.08] border border-purple-500/20 dark:border-white/10 text-[#7C5CFF] dark:text-purple-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. SOLUTION TAB */}
            {leftTab === "solution" && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200 font-medium">
                  {problem.explanation?.replace(/\\n/g, "\n")}
                </p>
                <div className="p-4 rounded-2xl bg-purple-500/10 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/10 space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-[#7C5CFF] dark:text-[#00D9FF]">Complexity Analysis</h4>
                  <p className="text-xs font-semibold"><span className="font-bold text-zinc-700 dark:text-zinc-300">Time Complexity:</span> {problem.complexity?.time}</p>
                  <p className="text-xs font-semibold"><span className="font-bold text-zinc-700 dark:text-zinc-300">Space Complexity:</span> {problem.complexity?.space}</p>
                </div>
                {problem.optimalSolutions && problem.optimalSolutions[language] && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-extrabold text-[10px] uppercase text-zinc-400 tracking-wider">Optimal Solution ({language})</h4>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(problem.optimalSolutions[language]!); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                        className="text-xs text-[#7C5CFF] hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer font-bold"
                      >
                        {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                      </button>
                    </div>
                    <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto"><code>{problem.optimalSolutions[language]}</code></pre>
                  </div>
                )}
              </div>
            )}

            {/* 3. SUBMISSIONS TAB */}
            {leftTab === "submissions" && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-8 font-semibold">No submissions yet. Write code and click Submit Solution.</p>
                ) : (
                  submissions.map((s, i) => (
                    <div key={i} className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs ${
                      s.status === "Accepted" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                    }`}>
                      <div>
                        <span className={`font-black text-xs uppercase tracking-wider ${s.status === "Accepted" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{s.status}</span>
                        <p className="text-xs text-zinc-500 font-bold mt-1">{s.language} · {s.execution_time}ms</p>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">{new Date(s.submitted_at).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. AI COACH TAB */}
            {leftTab === "coach" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5 text-amber-500 mb-2">
                    <Lightbulb className="w-4 h-4" /> AI Logical Hint
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mb-3">
                    Stuck on conceptual implementation? Click below to request a smart hint without spoiling the code.
                  </p>
                  {hint && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-semibold mb-3">
                      {hint}
                    </div>
                  )}
                  <button
                    onClick={handleGetHint}
                    disabled={loadingHint}
                    className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 border-none cursor-pointer disabled:opacity-50"
                  >
                    {loadingHint ? "Asking AI..." : "Request Logic Hint"}
                  </button>
                </div>

                <hr className="border-t border-purple-500/10 dark:border-white/10" />

                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5 text-[#7C5CFF] mb-2">
                    <Brain className="w-4 h-4" /> AI Code Auditor
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mb-3">
                    Run an algorithmic audit of your code for complexity metrics and optimization tips.
                  </p>
                  
                  {review && (
                    <div className="p-4 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 text-xs space-y-3 font-semibold mb-3">
                      <div className="flex items-center justify-between border-b border-[#7C5CFF]/20 pb-2">
                        <span className="font-extrabold text-zinc-700 dark:text-zinc-300">Design Quality Score:</span>
                        <span className="text-sm font-black text-[#7C5CFF] dark:text-[#00D9FF]">{review.qualityScore} / 10</span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{review.reviewSummary}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGetReview}
                    disabled={loadingReview}
                    className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF] dark:text-purple-300 hover:bg-[#7C5CFF]/30 border-none cursor-pointer disabled:opacity-50"
                  >
                    {loadingReview ? "Auditing Code..." : "Run AI Review"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
           RIGHT COLUMN (MONACO EDITOR & PERMANENT ACTION BAR)
        ═══════════════════════════════════════════════════ */}
        <div className="w-full md:w-[54%] lg:w-[58%] flex-1 flex flex-col rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 overflow-hidden shadow-xl min-h-0 relative">
          
          {/* Top Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-500/15 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.03] shrink-0">
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">Language:</span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)} 
                className="h-8 rounded-xl border border-purple-500/20 dark:border-white/15 bg-white dark:bg-zinc-900 text-xs font-black px-3 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/20 cursor-pointer"
              >
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <button 
              onClick={resetCode} 
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#FF2E8B] dark:text-zinc-400 dark:hover:text-white px-3 py-1 rounded-xl hover:bg-purple-500/10 transition-colors border-none bg-transparent cursor-pointer font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 
              <span>Reset Boilerplate</span>
            </button>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 min-h-[350px] relative bg-[#1E1E1E]">
            <Editor
              height="100%"
              language={language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase() === "javascript" ? "javascript" : language.toLowerCase() === "python" ? "python" : "java"}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 13, 
                lineHeight: 22, 
                fontFamily: "'Fira Code', monospace", 
                scrollBeyondLastLine: false, 
                automaticLayout: true, 
                padding: { top: 12, bottom: 12 } 
              }}
            />
          </div>

          {/* Expandable Compiler Console Panel */}
          <AnimatePresence>
            {showConsole && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 210 }} 
                exit={{ height: 0 }} 
                className="border-t border-purple-500/15 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 overflow-hidden shrink-0 flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-purple-500/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setConsoleTab("input")} 
                      className={`px-3 py-1 text-xs font-black rounded-lg cursor-pointer border-none ${
                        consoleTab === "input" ? "bg-[#7C5CFF] text-white shadow-sm" : "bg-transparent text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      Testcase Input
                    </button>
                    <button 
                      onClick={() => setConsoleTab("result")} 
                      className={`px-3 py-1 text-xs font-black rounded-lg cursor-pointer border-none ${
                        consoleTab === "result" ? "bg-[#7C5CFF] text-white shadow-sm" : "bg-transparent text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      Execution Result
                    </button>
                  </div>

                  <button onClick={() => setShowConsole(false)} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin select-text">
                  {consoleTab === "input" ? (
                    <textarea 
                      value={customInput} 
                      onChange={(e) => setCustomInput(e.target.value)} 
                      className="w-full h-full bg-zinc-50 dark:bg-zinc-900 border border-purple-500/20 dark:border-white/15 rounded-xl p-3 font-mono text-xs text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/20 resize-none" 
                      placeholder="Enter test input parameters..." 
                    />
                  ) : (
                    <div className="font-mono text-xs space-y-2">
                      {isRunning || isSubmitting ? (
                        <div className="flex flex-col items-center gap-2 text-zinc-400 h-full justify-center py-6">
                          <div className="w-6 h-6 border-3 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                          <span className="font-black text-xs text-[#7C5CFF] animate-pulse">Running code through Gemini Sandboxed Compiler...</span>
                        </div>
                      ) : output ? (
                        <>
                          <div className="flex items-center gap-3">
                            <span className={`font-black px-3 py-1 rounded-full text-xs ${
                              output.overallStatus === "Accepted" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                            }`}>
                              {output.overallStatus}
                            </span>
                            <span className="text-zinc-500 font-bold">Runtime: {output.executionTime ?? 0} ms</span>
                          </div>

                          {output.errorMessage && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                              {output.errorMessage}
                            </div>
                          )}

                          {output.testCases && output.testCases.map((tc: any, i: number) => (
                            <div key={i} className="border border-purple-500/15 dark:border-white/10 rounded-xl p-3 space-y-1 bg-zinc-50 dark:bg-zinc-900/60">
                              <div className="flex items-center justify-between text-[10px] font-black">
                                <span>TEST CASE {i + 1}</span>
                                <span className={tc.passed ? "text-emerald-500" : "text-red-500"}>{tc.passed ? "PASSED ✓" : "FAILED ✗"}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                  <span className="text-[9px] text-zinc-400 font-bold">INPUT</span>
                                  <pre className="p-2 bg-white dark:bg-zinc-950 rounded-xl border border-purple-500/10 text-[10px] text-zinc-800 dark:text-zinc-200">{tc.input}</pre>
                                </div>
                                <div>
                                  <span className="text-[9px] text-zinc-400 font-bold">EXPECTED</span>
                                  <pre className="p-2 bg-white dark:bg-zinc-950 rounded-xl border border-purple-500/10 text-[10px] text-zinc-800 dark:text-zinc-200">{tc.expected}</pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="text-zinc-400 h-full flex items-center justify-center py-6 font-bold">
                          Run code or click Submit Solution to evaluate test cases.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ALWAYS VISIBLE BOTTOM ACTION BAR (RUN & SUBMIT BUTTONS) */}
          <div className="px-4 py-3 border-t border-purple-500/15 dark:border-white/10 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
            
            <button 
              onClick={() => setShowConsole(!showConsole)} 
              className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-[#7C5CFF] font-black border-none bg-transparent cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#7C5CFF]" />
              <span>Compiler Console</span>
              {showConsole ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleRun} 
                disabled={isRunning || isSubmitting} 
                className="flex items-center gap-2 text-xs font-black px-5 h-10 rounded-2xl border border-purple-500/20 dark:border-white/20 bg-white dark:bg-white/10 text-[#111827] dark:text-white hover:border-[#7C5CFF] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current text-[#7C5CFF]" />
                )}
                <span>Run Code</span>
              </button>

              <button 
                onClick={handleSubmit} 
                disabled={isRunning || isSubmitting} 
                className="flex items-center gap-2 text-xs font-black px-6 h-10 rounded-2xl bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] text-white hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer border-0 shadow-lg shadow-[#FF2E8B]/25"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Submit Solution</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
