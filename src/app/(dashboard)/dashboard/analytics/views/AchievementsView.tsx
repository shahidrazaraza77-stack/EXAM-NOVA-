"use client";

import React from "react";
import AchievementsShelf from "../components/AchievementsShelf";
import { Card } from "@/components/ui/Card";
import { LEARNING_METRICS, ACHIEVEMENTS_BADGES } from "../components/mockData";
import { Award, Flame, Star, Code2, Trophy } from "lucide-react";

interface AchievementsViewProps {
  scores: {
    overall: number;
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
  };
}

export default function AchievementsView({ scores }: AchievementsViewProps) {
  const { overall, resumeScore, aptitudeScore, codingScore, interviewScore } = scores;

  const statsCards = [
    { label: "Study Streak", value: `${LEARNING_METRICS.streakDays} days`, icon: Flame, color: "text-orange-500" },
    { label: "Total XP", value: "12,450", icon: Star, color: "text-amber-500" },
    { label: "Badges Earned", value: `${ACHIEVEMENTS_BADGES.filter(b => b.earned).length}/${ACHIEVEMENTS_BADGES.length}`, icon: Trophy, color: "text-violet-500" },
    { label: "Problems Solved", value: LEARNING_METRICS.problemsSolved.toString(), icon: Code2, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-955 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-black text-zinc-900 dark:text-white">{stat.value}</div>
                <div className="text-[9px] font-semibold text-zinc-500">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <AchievementsShelf
        resumeScore={resumeScore}
        aptitudeScore={aptitudeScore}
        codingScore={codingScore}
        interviewScore={interviewScore}
        overall={overall}
      />
    </div>
  );
}
