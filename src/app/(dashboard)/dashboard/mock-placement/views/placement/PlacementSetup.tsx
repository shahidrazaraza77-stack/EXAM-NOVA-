"use client";

import React from "react";
import { motion } from "framer-motion";
import { COMPANY_WEIGHTAGES, COMPANY_LOGOS } from "../../components/mockData";
import { Play, Zap, Timer, Target, Clock } from "lucide-react";

interface PlacementSetupProps {
  selectedCompany: string;
  selectedMode: string;
  resumes: any[];
  selectedResumeId: string | null;
  onCompanyChange: (c: string) => void;
  onModeChange: (m: string) => void;
  onResumeChange: (id: string | null) => void;
  onStart: () => void;
}

const MODES = [
  { id: "Quick", label: "Quick Placement", desc: "Aptitude + Coding", time: "~20 min", icon: Zap, color: "from-emerald-500 to-teal-500" },
  { id: "Standard", label: "Standard Placement", desc: "Aptitude + Coding + Technical", time: "~45 min", icon: Timer, color: "from-violet-500 to-purple-500" },
  { id: "Full", label: "Full Placement Drive", desc: "All 4 rounds", time: "~60-90 min", icon: Target, color: "from-amber-500 to-orange-500" },
];

export default function PlacementSetup({
  selectedCompany, selectedMode, resumes, selectedResumeId,
  onCompanyChange, onModeChange, onResumeChange, onStart
}: PlacementSetupProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Configure Your Placement</h2>
        <p className="text-xs text-zinc-500">Select a target company, placement mode, and resume to begin your mock drive.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Target Company</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {COMPANY_WEIGHTAGES.map((cw) => {
            const isActive = selectedCompany === cw.company;
            return (
              <button
                key={cw.company}
                onClick={() => onCompanyChange(cw.company)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? "border-violet-600 bg-violet-500/5 shadow-md shadow-violet-500/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-black ${COMPANY_LOGOS[cw.company] || "bg-zinc-500"}`}>
                  {cw.company[0]}
                </div>
                <span className={`text-2xs font-bold block ${isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-700 dark:text-zinc-300"}`}>{cw.company}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Placement Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-violet-600 bg-violet-500/5 shadow-md shadow-violet-500/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">{mode.label}</h4>
                <p className="text-[10px] text-zinc-500 mb-2">{mode.desc}</p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                  <Clock className="w-3 h-3" />
                  {mode.time}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Target Resume</h3>
        {resumes.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-950/20">
            No resumes found. Please create a resume in the Resume Builder first.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resumes.map((res) => {
              const isSelected = selectedResumeId === res.id;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => onResumeChange(res.id)}
                  className={`p-4 rounded-xl text-left cursor-pointer border transition-all flex items-start gap-3 w-full ${
                    isSelected
                      ? "border-violet-600 bg-violet-500/5 shadow-md shadow-violet-500/10 text-violet-750 dark:text-violet-400 font-extrabold"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-605 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isSelected ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 border-violet-200 dark:border-violet-850" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 border-zinc-200 dark:border-zinc-850"
                  }`}>
                    {res.name?.[0]?.toUpperCase() || "R"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold block truncate">{res.name || res.file_name}</span>
                    <span className="text-[10px] text-zinc-405 block font-medium mt-0.5">Score: {res.score || "N/A"} | Version: v{res.version || 1}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        disabled={!selectedCompany || !selectedResumeId}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Play className="w-4 h-4" />
        Start Placement Drive
      </motion.button>
    </div>
  );
}
