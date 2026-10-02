import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Target, Zap, LayoutTemplate, Briefcase, Loader2, ChevronRight } from "lucide-react";
import { resumeService } from "@/services/resume";
import type { Database } from "@/types/supabase";

type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"];
type ResumeAnalysisRow = Database["public"]["Tables"]["resume_analysis"]["Row"];

interface AnalysisStepProps {
  onNext: () => void;
  resume: ResumeRow;
}

export default function AnalysisStep({ onNext, resume }: AnalysisStepProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "optimizer" | "jobMatch">("overview");
  const [analysis, setAnalysis] = useState<ResumeAnalysisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrCreateAnalysis() {
      setLoading(true);
      setError(null);
      try {
        let existing = await resumeService.getAnalysis(resume.id);
        if (!existing) {
          existing = await resumeService.analyzeResume(resume.id);
        }
        setAnalysis(existing);
      } catch (err: any) {
        setError(err.message || "Analysis failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadOrCreateAnalysis();
  }, [resume.id]);

  const score = analysis?.ats_score ?? 0;
  const strengths: string[] = analysis?.strengths ? (analysis.strengths as string[]) : [];
  const weaknesses: string[] = analysis?.weaknesses ? (analysis.weaknesses as string[]) : [];
  const missingKeywords: string[] = analysis?.missing_keywords ? (analysis.missing_keywords as string[]) : [];
  const suggestions: string[] = analysis?.suggestions ? (analysis.suggestions as string[]) : [];
  const overallFeedback = analysis?.overall_feedback ?? "";

  const getSectionScore = (categoryKey: string, fallbackMultiplier: number) => {
    const sectionScores = (analysis as any)?.section_scores;
    if (sectionScores && typeof sectionScores === "object") {
      if (typeof sectionScores[categoryKey] === "number") {
        return sectionScores[categoryKey];
      }
    }
    return Math.min(100, Math.max(0, Math.round(score * fallbackMultiplier)));
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

  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-red-600";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-in fade-in">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-medium text-zinc-500">Analyzing your resume...</p>
          <p className="text-xs text-zinc-400">Using Gemini AI to evaluate ATS compatibility</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 animate-in fade-in">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header & Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-100 dark:text-zinc-900"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * score) / 100}
                className="text-indigo-600 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${scoreColor}`}>{score}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ATS Score</span>
            </div>
          </div>
          <p className={`text-center text-sm font-medium mt-6 ${scoreColor}`}>
            {overallFeedback ? overallFeedback.slice(0, 60) + (overallFeedback.length > 60 ? "..." : "") : ""}
          </p>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {weaknesses.map((weak, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Internal Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === "overview" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          Detailed Analysis
        </button>
        <button
          onClick={() => setActiveTab("optimizer")}
          className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === "optimizer" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          AI Optimizer
        </button>
        <button
          onClick={() => setActiveTab("jobMatch")}
          className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
            activeTab === "jobMatch" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          Job Matching
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {/* Section Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-indigo-600" />
                Section Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {atsCategories.map((cat, i) => (
                  <Card key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <span className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">{cat.label}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-zinc-850 dark:text-zinc-250">{cat.score}%</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        cat.score >= 80 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-450 dark:bg-emerald-950/20" :
                        cat.score >= 70 ? "text-amber-600 bg-amber-50 dark:text-amber-450 dark:bg-amber-950/20" :
                        "text-red-655 bg-red-50/50 dark:text-red-400 dark:bg-red-950/20"
                      }`}>{cat.score >= 80 ? "Strong" : cat.score >= 70 ? "Good" : "Weak"}</span>
                    </div>
                    <div className="h-1 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${cat.score}%` }} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Keyword Analysis
              </h3>
              <div className="space-y-4">
                <Card className="p-4 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.length > 0 ? missingKeywords.map(k => (
                      <span key={k} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                        {k}
                      </span>
                    )) : (
                      <span className="text-xs text-zinc-500">No missing keywords detected</span>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Suggestions
              </h3>
              <div className="space-y-3">
                {suggestions.length > 0 ? suggestions.map((sug, i) => (
                  <Card key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mt-0.5">
                        <Zap className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{sug}</p>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <p className="text-xs text-zinc-500">No suggestions available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "optimizer" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Resume Optimizer</h3>
              <Button variant="outline" size="sm">Apply All Changes</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <Card className="border border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                  <CardTitle className="text-sm font-bold text-zinc-500">Original Resume Section</CardTitle>
                </CardHeader>
                <CardContent className="p-6 font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/50 h-full">
                  • Developed e-commerce application.<br/>
                  • Used React and Node.js to build features.<br/>
                  • Fixed bugs and improved database queries.
                </CardContent>
              </Card>

              {/* After */}
              <Card className="border border-indigo-200 dark:border-indigo-900/50 flex flex-col h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/10 pointer-events-none" />
                <CardHeader className="border-b border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/40 relative z-10">
                  <CardTitle className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Optimized Version
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 font-mono text-xs text-zinc-900 dark:text-zinc-100 h-full relative z-10 leading-relaxed">
                  <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-1 rounded">• Developed a full-stack e-commerce application supporting 10,000+ products.</span><br/><br/>
                  • <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-1 rounded">Implemented secure payment processing using Stripe API.</span><br/><br/>
                  • <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-1 rounded">Optimized database queries, reducing load times by 30%.</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "jobMatch" && (
          <JobMatchTab resumeId={resume.id} />
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button variant="primary" onClick={onNext} className="gap-2">
          Select Template <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}

function JobMatchTab({ resumeId }: { resumeId: string }) {
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<{
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    improvementSuggestions: string[];
  } | null>(null);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleAnalyzeMatch = async () => {
    if (!jobDescription.trim()) return;
    setMatching(true);
    setMatchError(null);
    try {
      const result = await resumeService.matchWithJob(resumeId, jobDescription);
      setMatchResult(result);
    } catch (err: any) {
      setMatchError(err.message || "Match analysis failed.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-indigo-600" />
        Job Description Matcher
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">Paste a job description to see how well your resume matches.</p>
          <textarea 
            className="w-full h-64 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-zinc-700 dark:text-zinc-300"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <Button 
            variant="primary" 
            className="w-full" 
            onClick={handleAnalyzeMatch}
            disabled={matching || !jobDescription.trim()}
          >
            {matching ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</> : "Analyze Match"}
          </Button>
          {matchError && (
            <p className="text-xs text-red-500">{matchError}</p>
          )}
        </div>
        
        <div>
          <Card className="border border-zinc-200 dark:border-zinc-800 h-full p-6 space-y-6">
            {matchResult ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">Match Analysis</h4>
                  <span className={`text-lg font-black px-3 py-1 rounded-full ${
                    matchResult.matchScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      : matchResult.matchScore >= 60
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                      : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40"
                  }`}>
                    {matchResult.matchScore}%
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-500 uppercase mb-2">Matching Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchingSkills.map(s => (
                        <span key={s} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />{s}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-bold text-zinc-500 uppercase mb-2">Missing Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingSkills.length > 0 ? matchResult.missingSkills.map(s => (
                        <span key={s} className="px-2 py-1 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs font-medium">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />{s}
                        </span>
                      )) : (
                        <span className="text-xs text-zinc-500">All key skills matched!</span>
                      )}
                    </div>
                    {matchResult.missingSkills.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-2">Consider adding these skills if you have experience with them.</p>
                    )}
                  </div>

                  {matchResult.improvementSuggestions.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-zinc-500 uppercase mb-2">Suggestions</h5>
                      <ul className="space-y-1">
                        {matchResult.improvementSuggestions.map((s, i) => (
                          <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-indigo-500" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-500">Paste a job description and click analyze to see match results.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
