"use client";

import React from "react";
import CompanyReadiness from "../components/CompanyReadiness";
import { Card } from "@/components/ui/Card";
import { COMPANY_COMPARISON } from "../components/mockData";
import { Building2, TrendingUp } from "lucide-react";

interface CompanyReadinessViewProps {
  scores: {
    overall: number;
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
  };
  skillGaps?: any;
}

export default function CompanyReadinessView({ scores, skillGaps }: CompanyReadinessViewProps) {
  const { overall, resumeScore, aptitudeScore, codingScore, interviewScore } = scores;

  return (
    <div className="space-y-8">
      <CompanyReadiness
        resumeScore={resumeScore}
        aptitudeScore={aptitudeScore}
        codingScore={codingScore}
        interviewScore={interviewScore}
        overall={overall}
        skillGaps={skillGaps}
      />

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Detailed Company Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Company</th>
                <th className="text-center py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Overall</th>
                <th className="text-center py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Aptitude</th>
                <th className="text-center py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Coding</th>
                <th className="text-center py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Interview</th>
                <th className="text-center py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Resume</th>
                <th className="text-center py-3 px-2 font-extrabold text-zinc-500 dark:text-zinc-400">Match</th>
              </tr>
            </thead>
            <tbody>
              {COMPANY_COMPARISON.map((c, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">{c.company}</td>
                  {[c.overall, c.aptitude, c.coding, c.interview, c.resume, c.match].map((v, j) => (
                    <td key={j} className="text-center py-3 px-2">
                      <span className={`font-extrabold ${v >= 80 ? "text-emerald-600 dark:text-emerald-400" : v >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{v}%</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
