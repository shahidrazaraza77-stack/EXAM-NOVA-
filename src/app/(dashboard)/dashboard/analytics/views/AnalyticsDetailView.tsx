"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import ProgressCharts from "../components/ProgressCharts";
import { PLACEMENT_PREDICTION, LEARNING_METRICS, SKILL_GAPS } from "../components/mockData";
import { TrendingUp, Target, Clock, Code2, FileText, User, HelpCircle, Zap, Award, Brain } from "lucide-react";

interface AnalyticsDetailViewProps {
  scores: {
    overall: number;
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
  };
  skillGaps?: any;
}

export default function AnalyticsDetailView({ scores, skillGaps }: AnalyticsDetailViewProps) {
  const { overall, aptitudeScore, codingScore, interviewScore } = scores;

  const metrics = [
    { label: "Hours Studied", value: LEARNING_METRICS.totalHoursStudied, icon: Clock, color: "text-violet-600", suffix: "hrs" },
    { label: "Problems Solved", value: LEARNING_METRICS.problemsSolved, icon: Code2, color: "text-emerald-600", suffix: "" },
    { label: "Mock Tests", value: LEARNING_METRICS.mockTestsTaken, icon: HelpCircle, color: "text-blue-600", suffix: "" },
    { label: "Interview Sessions", value: LEARNING_METRICS.interviewSessions, icon: User, color: "text-pink-600", suffix: "" },
    { label: "Streak Days", value: LEARNING_METRICS.streakDays, icon: Award, color: "text-amber-600", suffix: "days" },
    { label: "Resume Versions", value: LEARNING_METRICS.resumeVersions, icon: FileText, color: "text-indigo-600", suffix: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ProgressCharts
            overall={overall}
            aptitude={aptitudeScore}
            coding={codingScore}
            interview={interviewScore}
            skillGaps={skillGaps}
          />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-500" />
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Placement Prediction</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-2xs">
                <span className="text-zinc-500">Predicted Month</span>
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{PLACEMENT_PREDICTION.predictedMonth}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-zinc-500">Confidence</span>
                <span className="font-extrabold text-emerald-600">{PLACEMENT_PREDICTION.confidence}%</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-zinc-500">Target Role</span>
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{PLACEMENT_PREDICTION.targetRole}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-zinc-500">Est. Package</span>
                <span className="font-extrabold text-violet-600">{PLACEMENT_PREDICTION.estimatedPackage}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PLACEMENT_PREDICTION.predictedCompanies.map((c, i) => (
                  <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">{c}</span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Learning Analytics</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 text-center space-y-1.5">
                <Icon className={`w-5 h-5 mx-auto ${m.color}`} />
                <div className="text-lg font-black text-zinc-900 dark:text-white">{m.value}{m.suffix ? ` ${m.suffix}` : ""}</div>
                <div className="text-[9px] font-semibold text-zinc-500">{m.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Skill Gap Analysis</h3>
        </div>
        <div className="space-y-3">
          {SKILL_GAPS.map((gap, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
              <span className="text-2xs font-semibold text-zinc-700 dark:text-zinc-300">{gap.topic}</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                gap.priority === "High" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                gap.priority === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}>{gap.priority}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
