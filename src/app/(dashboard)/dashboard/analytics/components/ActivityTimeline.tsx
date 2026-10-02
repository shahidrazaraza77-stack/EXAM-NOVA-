"use client";

import React from "react";
import { History, FileText, Code2, User, HelpCircle, ChevronRight } from "lucide-react";
import { ACTIVITY_TIMELINE, ActivityLog } from "./mockData";

export default function ActivityTimeline() {
  const getTimelineConfig = (type: ActivityLog["type"]) => {
    switch (type) {
      case "resume":
        return {
          icon: FileText,
          bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        };
      case "coding":
        return {
          icon: Code2,
          bgColor: "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/30",
        };
      case "interview":
        return {
          icon: User,
          bgColor: "bg-[#FF2E8B]/10 text-[#FF2E8B] border-[#FF2E8B]/30",
        };
      case "aptitude":
      default:
        return {
          icon: HelpCircle,
          bgColor: "bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30",
        };
    }
  };

  return (
    <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 rounded-[28px] shadow-xl flex flex-col justify-between h-full space-y-5">
      <div className="space-y-1 border-b border-purple-500/10 dark:border-white/10 pb-3">
        <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
          <History className="w-4 h-4 text-[#7C5CFF]" /> 
          Recent Preparation Activity
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Live timeline of recent challenges & practice modules
        </p>
      </div>

      <div className="relative border-l-2 border-purple-500/20 dark:border-white/10 ml-4 pl-6 space-y-6 my-2 flex-1">
        {ACTIVITY_TIMELINE.map((log) => {
          const config = getTimelineConfig(log.type);
          const Icon = config.icon;

          return (
            <div key={log.id} className="relative flex items-start justify-between group">
              {/* Timeline bubble */}
              <div className={`absolute -left-[37px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center border ${config.bgColor} shadow-sm transition-transform group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block group-hover:text-[#7C5CFF] dark:group-hover:text-[#00D9FF] transition-colors">
                  {log.title}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 block">
                  {log.date}
                </span>
              </div>

              <button className="p-1.5 rounded-xl hover:bg-purple-500/10 text-zinc-400 hover:text-[#7C5CFF] transition-colors cursor-pointer border-none bg-transparent">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
