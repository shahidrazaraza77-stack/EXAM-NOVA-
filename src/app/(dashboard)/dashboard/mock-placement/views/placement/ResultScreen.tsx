"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Award, CheckCircle, XCircle, AlertTriangle, Download, RotateCcw, Home, TrendingUp, Brain, Star, Zap, ShieldCheck, Sparkles, Users, Loader2, FileText } from "lucide-react";
import { COMPANY_WEIGHTAGES, generateReport } from "../../components/mockData";
import { supabase } from "@/lib/supabase";
import { useGamification } from "@/context/GamificationContext";

interface ResultScreenProps {
  company: string;
  mode: string;
  roundScores: { resume: number; aptitude: number; coding: number; technical: number; hr: number };
  overallScore: number;
  result: "Selected" | "Borderline" | "Not Selected";
  onSave: () => void;
  onRestart: () => void;
  onHome: () => void;
  mockId?: string;
}

export default function ResultScreen({ company, mode, roundScores, overallScore, result: finalResult, onSave, onRestart, onHome, mockId }: ResultScreenProps) {
  const { trackActivity } = useGamification();
  const [displayScore, setDisplayScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [aiReport, setAiReport] = useState<{
    performanceAnalysis: string;
    strengths: string[];
    weaknesses: string[];
    preparationStrategy: string;
  } | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const weight = COMPANY_WEIGHTAGES.find(w => w.company === company);
  const report = generateReport(roundScores);

  useEffect(() => {
    try {
      trackActivity("mock_placement");
    } catch (e) {
      console.error("Failed to track mock placement completion:", e);
    }
  }, [trackActivity]);

  useEffect(() => {
    if (!mockId) return;
    async function loadReport() {
      setLoadingReport(true);
      try {
        const { data, error } = await (supabase as any)
          .from("mock_results")
          .select("feedback")
          .eq("mock_id", mockId)
          .single();
        if (data?.feedback) {
          const parsed = JSON.parse(data.feedback);
          if (parsed && typeof parsed === "object") {
            setAiReport(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load AI report from database:", err);
      } finally {
        setLoadingReport(false);
      }
    }
    loadReport();
  }, [mockId]);

  useEffect(() => {
    if (displayScore < overallScore) {
      const interval = setInterval(() => {
        setDisplayScore(s => Math.min(s + 1, overallScore));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [displayScore, overallScore]);

  const resultConfig = {
    Selected: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Congratulations! You've been Selected!", gradient: "from-emerald-500 to-teal-500" },
    Borderline: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Borderline - Needs Improvement", gradient: "from-amber-500 to-orange-500" },
    "Not Selected": { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/20", label: "Not Selected - Keep Preparing", gradient: "from-red-500 to-rose-500" },
  };
  const config = resultConfig[finalResult];

  const getScoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";

  const roundIcons: Record<string, React.ElementType> = { resume: FileText, aptitude: Zap, coding: TrendingUp, technical: Brain, hr: Users };

  return (
    <div className="space-y-8">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 py-8">
        <div className={`w-20 h-20 rounded-full ${config.bg} border ${config.border} flex items-center justify-center mx-auto`}>
          <config.icon className={`w-10 h-10 ${config.color}`} />
        </div>
        <div>
          <span className={`inline-block px-4 py-1 rounded-full text-xs font-extrabold ${config.color} ${config.bg} border ${config.border}`}>{finalResult}</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-3">{config.label}</h2>
          <p className="text-sm text-zinc-500">{company} - {mode} Placement Drive</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#f4f4f5" strokeWidth="12" fill="transparent" className="dark:stroke-zinc-800" />
              <motion.circle cx="80" cy="80" r="70" stroke="#8b5cf6" strokeWidth="12" fill="transparent"
                strokeDasharray={2 * Math.PI * 70} strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - overallScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-zinc-900 dark:text-white">{displayScore}%</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Overall</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-zinc-500">Company: {company}</span>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-zinc-450 dark:text-zinc-400 font-medium">
              <span>Resume: 20%</span>
              <span>Aptitude: 25%</span>
              <span>Coding: 30%</span>
              <span>Interview: 25%</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-500" /> Round-wise Performance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(roundScores).map(([key, score]) => {
              const Icon = roundIcons[key] || Star;
              const label = key === "hr" ? "HR Interview" : key === "technical" ? "Technical Interview" : key.charAt(0).toUpperCase() + key.slice(1);
              const show = key === "resume" || key === "aptitude" || key === "coding" || (key === "technical" && (mode === "Standard" || mode === "Full")) || (key === "hr" && mode === "Full");
              if (!show) return null;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 text-center space-y-2">
                  <Icon className={`w-5 h-5 mx-auto ${getScoreColor(score)}`} />
                  <div className={`text-xl font-black ${getScoreColor(score)}`}>{score}%</div>
                  <div className="text-[9px] font-semibold text-zinc-500">{label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">AI Performance Report</h3>
        </div>

        {loadingReport ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <p className="text-2xs text-zinc-400">Loading AI assessment...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiReport?.performanceAnalysis && (
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed font-medium">
                {aiReport.performanceAnalysis}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Strengths</h4>
                <div className="space-y-2">
                  {(aiReport?.strengths || report.strengths).map((s, i) => (
                    <div key={i} className="p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-2xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {s}
                    </div>
                  ))}
                  {(aiReport?.strengths || report.strengths).length === 0 && <p className="text-2xs text-zinc-400">No strengths identified yet.</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Weaknesses</h4>
                <div className="space-y-2">
                  {(aiReport?.weaknesses || report.weaknesses).map((w, i) => (
                    <div key={i} className="p-3 rounded-xl border border-red-500/10 bg-red-500/5 text-2xs font-semibold text-red-700 dark:text-red-300">
                      {w}
                    </div>
                  ))}
                  {(aiReport?.weaknesses || report.weaknesses).length === 0 && <p className="text-2xs text-zinc-400">No weaknesses identified!</p>}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Recommended Actions</h4>
                <div className="space-y-2">
                  {aiReport?.preparationStrategy ? (
                    <div className="p-3 rounded-xl border border-violet-500/10 bg-violet-500/5 text-2xs font-semibold text-violet-700 dark:text-violet-300 leading-relaxed">
                      {aiReport.preparationStrategy}
                    </div>
                  ) : (
                    report.recommendations.map((r, i) => (
                      <div key={i} className="p-3 rounded-xl border border-violet-500/10 bg-violet-500/5 text-2xs font-semibold text-violet-700 dark:text-violet-300 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[8px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {r}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Mock Placement Certificate</h3>
        </div>
        {showCertificate ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/50 dark:to-indigo-950/50 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-violet-500 mx-auto" />
            <h2 className="text-2xl font-black text-violet-900 dark:text-violet-200">Certificate of Completion</h2>
            <p className="text-sm text-zinc-500">This certifies that you have completed the</p>
            <p className="text-xl font-extrabold text-zinc-900 dark:text-white">{company} Mock Placement Drive</p>
            <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
              <span>Score: <strong className="text-zinc-900 dark:text-white">{overallScore}%</strong></span>
              <span>Mode: <strong className="text-zinc-900 dark:text-white">{mode}</strong></span>
              <span>Result: <strong className={config.color}>{finalResult}</strong></span>
            </div>
            <p className="text-[10px] text-zinc-400">Completed on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-primary hover:bg-aurora-primary-hover text-white text-xs font-bold transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Download Certificate
            </button>
          </motion.div>
        ) : (
          <button onClick={() => setShowCertificate(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-400 hover:text-violet-600 hover:border-violet-300 transition-all cursor-pointer"
          >Click to generate certificate</button>
        )}
      </Card>

      <div className="flex items-center justify-center gap-4">
        <button onClick={onSave}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all cursor-pointer"
        ><CheckCircle className="w-4 h-4" /> Save to History</button>
        <button onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
        ><RotateCcw className="w-4 h-4" /> Try Again</button>
        <button onClick={onHome}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
        ><Home className="w-4 h-4" /> Dashboard</button>
      </div>
    </div>
  );
}
