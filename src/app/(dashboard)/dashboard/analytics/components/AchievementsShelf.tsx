"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Award, Lock, Unlock, Sparkles, Trophy, ShieldCheck, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AchievementsShelfProps {
  resumeScore: number;
  aptitudeScore: number;
  codingScore: number;
  interviewScore: number;
  overall: number;
}

export default function AchievementsShelf({
  resumeScore, aptitudeScore, codingScore, interviewScore, overall
}: AchievementsShelfProps) {
  const badges = useMemo(() => [
    { id: "b-1", title: "Resume Expert", description: "ATS Score of 70+ achieved on Resume builder.", earned: resumeScore >= 70, category: "resume" },
    { id: "b-2", title: "Aptitude Champion", description: "Achieved 70%+ accuracy in aptitude practice.", earned: aptitudeScore >= 70, category: "aptitude" },
    { id: "b-3", title: "Coding Warrior", description: "Scored 70%+ in coding proficiency.", earned: codingScore >= 70, category: "coding" },
    { id: "b-4", title: "Interview Pro", description: "Scored 70%+ in mock interview rounds.", earned: interviewScore >= 70, category: "interview" },
    { id: "b-5", title: "Placement Ready", description: "Overall Readiness Score above 75%.", earned: overall >= 75, category: "placement" },
  ], [resumeScore, aptitudeScore, codingScore, interviewScore, overall]);

  const getBadgeConfig = (category: string) => {
    switch (category) {
      case "resume":
        return { icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-500/10", textColor: "text-emerald-600 dark:text-emerald-400", borderColor: "border-emerald-500/20" };
      case "aptitude":
        return { icon: Trophy, gradient: "from-blue-500 to-indigo-500", bgColor: "bg-blue-500/10", textColor: "text-blue-600 dark:text-blue-400", borderColor: "border-blue-500/20" };
      case "coding":
        return { icon: Zap, gradient: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", textColor: "text-amber-600 dark:text-amber-400", borderColor: "border-amber-500/20" };
      case "interview":
        return { icon: Award, gradient: "from-pink-500 to-rose-500", bgColor: "bg-pink-500/10", textColor: "text-pink-600 dark:text-pink-400", borderColor: "border-pink-500/20" };
      case "placement":
      default:
        return { icon: Sparkles, gradient: "from-violet-500 to-purple-500", bgColor: "bg-violet-500/10", textColor: "text-violet-600 dark:text-violet-400", borderColor: "border-violet-500/20" };
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm text-zinc-905 dark:text-white flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-violet-500" /> Achievements & Badges
          </h3>
          <p className="text-[10px] text-zinc-555">Showcasing earned preparation credentials and milestones.</p>
        </div>
        
        <span className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 bg-violet-500/5 px-2.5 py-1 rounded-lg border border-violet-500/10">
          {badges.filter(b => b.earned).length} / {badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-1">
        {badges.map((badge) => {
          const config = getBadgeConfig(badge.category);
          const Icon = config.icon;

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 } as const}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all select-none ${
                badge.earned
                  ? "bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800"
                  : "bg-zinc-50/30 dark:bg-zinc-900/5 border-zinc-150 dark:border-zinc-900 opacity-60"
              }`}
            >
              <div className="absolute top-2 right-2">
                {badge.earned ? (
                  <Unlock className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Lock className="w-3 h-3 text-zinc-400" />
                )}
              </div>

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                badge.earned 
                  ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                  : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              } mb-3 shadow-inner`}>
                <Icon className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className={`text-2xs font-extrabold block ${
                  badge.earned ? "text-zinc-850 dark:text-zinc-200" : "text-zinc-400"
                }`}>
                  {badge.title}
                </span>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-555 leading-tight font-medium max-w-[120px]">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
