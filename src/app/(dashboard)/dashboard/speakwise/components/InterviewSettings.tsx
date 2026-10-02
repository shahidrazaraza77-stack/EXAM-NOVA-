"use client";

import { Settings, Mic, Code, Blend, Sliders } from "lucide-react";

interface InterviewSettingsProps {
  mode: "hr" | "technical" | "mixed";
  difficulty: string;
  onModeChange: (mode: "hr" | "technical" | "mixed") => void;
  onDifficultyChange: (d: string) => void;
  onStart: () => void;
}

export default function InterviewSettings({ mode, difficulty, onModeChange, onDifficultyChange, onStart }: InterviewSettingsProps) {
  const modes = [
    { id: "hr" as const, label: "HR Interview", icon: Mic, desc: "Behavioral & communication focused", color: "pink" },
    { id: "technical" as const, label: "Technical Interview", icon: Code, desc: "DSA, system design & concepts", color: "blue" },
    { id: "mixed" as const, label: "Mixed Interview", icon: Blend, desc: "HR + Technical combined", color: "violet" },
  ];

  const colorMap: Record<string, string> = {
    pink: "from-pink-500 to-rose-600",
    blue: "from-blue-500 to-cyan-600",
    violet: "from-violet-500 to-indigo-600",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <Settings className="h-3.5 w-3.5" /> Interview Setup
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Mock Interview</h1>
        <p className="text-sm text-zinc-500">Practice real interview conversations with AI-powered evaluation</p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button key={m.id} onClick={() => onModeChange(m.id)}
              className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${isActive ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200 dark:hover:border-violet-900/50"}`}>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorMap[m.color]} flex items-center justify-center text-white mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{m.label}</p>
              <p className="text-[11px] text-zinc-500 mt-1">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Difficulty */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-violet-500" /> Difficulty Level
        </h3>
        <div className="flex gap-2">
          {["easy", "medium", "hard"].map((d) => (
            <button key={d} onClick={() => onDifficultyChange(d)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${difficulty === d ? "bg-violet-600 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button onClick={onStart}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2">
        <Mic className="h-5 w-5" /> Start Interview
      </button>
    </div>
  );
}
