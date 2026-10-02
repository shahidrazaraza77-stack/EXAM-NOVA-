"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Building, Target, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface CompanyReadinessProps {
  resumeScore: number;
  aptitudeScore: number;
  codingScore: number;
  interviewScore: number;
  overall: number;
  skillGaps: any;
}

const COMPANY_LIST = [
  "TCS", "Infosys", "Wipro", "Cognizant",
  "Accenture", "Capgemini", "Amazon", "Microsoft", "Google"
];

export default function CompanyReadiness({
  resumeScore, aptitudeScore, codingScore, interviewScore, overall, skillGaps
}: CompanyReadinessProps) {
  const computeCompanyScore = (company: string): number => {
    const base = overall || 0;
    switch (company) {
      case "TCS": return Math.round(base * 0.9 + aptitudeScore * 0.1);
      case "Infosys": return Math.round(base * 0.85 + codingScore * 0.15);
      case "Wipro": return Math.round(base * 0.8 + aptitudeScore * 0.2);
      case "Cognizant": return Math.round(base * 0.85 + interviewScore * 0.15);
      case "Accenture": return Math.round(base * 0.8 + interviewScore * 0.2);
      case "Capgemini": return Math.round(base * 0.9 + aptitudeScore * 0.1);
      case "Amazon": return Math.round(base * 0.6 + codingScore * 0.4);
      case "Microsoft": return Math.round(base * 0.5 + codingScore * 0.5);
      case "Google": return Math.round(base * 0.4 + codingScore * 0.6);
      default: return base;
    }
  };

  const companyReadiness = COMPANY_LIST.map((company) => ({
    company,
    score: computeCompanyScore(company),
  })).sort((a, b) => b.score - a.score);

  const targetCompany = companyReadiness[0]?.company || "Amazon";
  const currentReadiness = companyReadiness[0]?.score || 0;
  const targetReadiness = Math.min(currentReadiness + 15, 100);

  const gapReport: any = skillGaps?.report || {};
  const skillGapsList = gapReport?.skillGaps || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
      <Card className="md:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5 flex flex-col justify-between">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm text-zinc-905 dark:text-white flex items-center gap-1.5">
            <Building className="w-4.5 h-4.5 text-violet-500" /> Company Match Meters
          </h3>
          <p className="text-[10px] text-zinc-555">Suitability scores based on round weights.</p>
        </div>

        <div className="space-y-3.5 my-2">
          {companyReadiness.slice(0, 6).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-3xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>{item.company} readiness</span>
                <span className={`font-extrabold ${item.score >= 80 ? "text-emerald-500" : item.score >= 70 ? "text-amber-500" : "text-red-500"}`}>{Math.min(100, item.score)}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.score >= 80 ? "bg-emerald-500" : item.score >= 70 ? "bg-amber-500" : "bg-red-500"}`} 
                  style={{ width: `${Math.min(100, item.score)}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4.5 h-4.5 text-violet-500" /> Best Match Goal
            </h4>
            <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">
              Top Match
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Top Company:</span>
              <span className="font-black text-zinc-900 dark:text-white">{targetCompany}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-3xs font-bold text-zinc-650">
                <span>Readiness Progression:</span>
                <span>{currentReadiness}% / Goal {targetReadiness}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-violet-600 dark:bg-violet-500 rounded-full" style={{ width: `${currentReadiness}%` }} />
                <div className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10" style={{ left: `${targetReadiness}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> Priority Skill Gaps
            </h4>
            <p className="text-[10px] text-zinc-555">Identified weaknesses prioritized by SDE placement filters.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {(skillGapsList.length > 0 ? skillGapsList : [
              { skill: "Resume Optimization", gap: "Improve ATS score", priority: "high" },
              { skill: "Aptitude Practice", gap: "Increase accuracy", priority: "high" },
              { skill: "Coding Proficiency", gap: "Solve more problems", priority: "medium" },
              { skill: "Interview Prep", gap: "Practice mock interviews", priority: "medium" },
            ]).slice(0, 4).map((gap: any, i: number) => (
              <div key={i} className="p-3 border border-zinc-150 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/5 rounded-xl flex items-center justify-between gap-3 text-3xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                <span className="font-bold truncate max-w-[120px]">{gap.skill || gap.topic}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                  (gap.priority || "").toLowerCase() === "high" 
                    ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                    : (gap.priority || "").toLowerCase() === "medium" 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}>
                  {gap.priority || "medium"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
