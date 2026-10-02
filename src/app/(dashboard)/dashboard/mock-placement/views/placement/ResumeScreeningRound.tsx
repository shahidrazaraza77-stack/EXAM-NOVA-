"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, XCircle, AlertTriangle, Sparkles, ArrowRight, RefreshCw, LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ResumeScreeningRoundProps {
  resumeId: string;
  companyId: string;
  companyName: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export default function ResumeScreeningRound({
  resumeId,
  companyId,
  companyName,
  onComplete,
  onExit,
}: ResumeScreeningRoundProps) {
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    improvementSuggestions: string[];
  } | null>(null);

  const scanSteps = [
    "Reading resume documents...",
    "Extracting academic and professional achievements...",
    "Identifying core skills and certifications...",
    "Comparing keywords with target job description...",
    "Generating ATS compatibility report...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && scanStep < scanSteps.length - 1) {
      interval = setInterval(() => {
        setScanStep((prev) => prev + 1);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading, scanStep]);

  useEffect(() => {
    const screenResume = async () => {
      try {
        const response = await apiFetch("/api/mock-placement/screen-resume", {
          method: "POST",
          body: JSON.stringify({ resumeId, companyId }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to screen resume");
        }

        const data = await response.json();
        if (data.matchResult) {
          setResult(data.matchResult);
        } else {
          throw new Error("Invalid response from screening API");
        }
      } catch (err: any) {
        console.error("Error in resume screening:", err);
        setError(err.message || "An unexpected error occurred during resume screening.");
      } finally {
        setLoading(false);
      }
    };

    screenResume();
  }, [resumeId, companyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 space-y-8 min-h-[400px]">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-violet-100 border-t-violet-600 dark:border-zinc-800 dark:border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white">
            ATS Resume Screening
          </h3>
          <div className="h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={scanStep}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-zinc-500 dark:text-zinc-400 font-medium"
              >
                {scanSteps[scanStep]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Scanning bar visualization */}
        <div className="w-64 bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-violet-600"
            initial={{ width: "0%" }}
            animate={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 space-y-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white">Screening Error</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onExit}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const isPassed = (result?.matchScore || 0) >= 60;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Result Status Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          {isPassed ? (
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
            {isPassed ? "Resume Cleared Screening!" : "Resume Failed Screening"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            {isPassed
              ? `Your resume matches ${companyName}'s target eligibility criteria. You may proceed to the next round.`
              : `Your compatibility score did not meet the minimum requirement of 60% for ${companyName}. Please refine your resume.`}
          </p>
        </div>

        {/* Score Ring */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-zinc-100 dark:text-zinc-900"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={339.292}
              initial={{ strokeDashoffset: 339.292 }}
              animate={{ strokeDashoffset: 339.292 - (339.292 * (result?.matchScore || 0)) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={isPassed ? "text-emerald-500" : "text-red-500"}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">
              {result?.matchScore || 0}%
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              ATS Match
            </span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Match / Miss Skills Card */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Skills Mapping Analysis
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-2">
                Matching Skills ({result?.matchingSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result?.matchingSkills && result.matchingSkills.length > 0 ? (
                  result.matchingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-2xs font-bold border border-emerald-100 dark:border-emerald-900/30"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-2xs text-zinc-400 italic">No matching skills identified.</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-2">
                Missing Core Skills ({result?.missingSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result?.missingSkills && result.missingSkills.length > 0 ? (
                  result.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-2xs font-bold border border-red-100 dark:border-red-900/30"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-2xs text-zinc-400 italic">No missing skills identified.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Card */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-violet-500" />
            AI Suggestions for Improvement
          </h3>
          <ul className="space-y-2.5">
            {result?.improvementSuggestions && result.improvementSuggestions.length > 0 ? (
              result.improvementSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  {suggestion}
                </li>
              ))
            ) : (
              <li className="text-2xs text-zinc-400 italic">Your resume matches the profile perfectly! No recommendations needed.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {isPassed ? (
          <button
            onClick={() => onComplete(result?.matchScore || 0)}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            Proceed to Aptitude Round
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Exit Placement
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-750 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Select Different Resume
            </button>
          </>
        )}
      </div>
    </div>
  );
}
