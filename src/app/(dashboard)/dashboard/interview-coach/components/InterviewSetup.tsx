"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ChevronRight, ArrowLeft, UserCheck, 
  Code2, Sparkles, Briefcase, Award, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";

interface InterviewSetupProps {
  initialType?: "HR" | "Technical" | "Mixed";
  onStart: (role: string, level: string, type: "HR" | "Technical" | "Mixed") => void;
  onCancel: () => void;
}

export default function InterviewSetup({ 
  initialType = "HR", 
  onStart, 
  onCancel 
}: InterviewSetupProps) {
  const [level, setLevel] = useState<string>("Intermediate");
  const [role, setRole] = useState<string>("Frontend Developer");
  const [type, setType] = useState<"HR" | "Technical" | "Mixed">(initialType);

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const roles = [
    "Frontend Developer", 
    "Backend Developer", 
    "Full Stack Developer", 
    "Data Analyst", 
    "Software Engineer"
  ];
  
  const types: { value: "HR" | "Technical" | "Mixed"; label: string; desc: string; icon: any }[] = [
    { 
      value: "HR", 
      label: "HR Interview", 
      desc: "Behavioral, leadership, and culture fit questions",
      icon: UserCheck 
    },
    { 
      value: "Technical", 
      label: "Technical Interview", 
      desc: "Core concepts, design, and programming questions",
      icon: Code2 
    },
    { 
      value: "Mixed", 
      label: "Mixed Interview", 
      desc: "Combination of technical knowledge and behavior",
      icon: Sparkles 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button and title */}
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel} 
          className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 gap-1.5 cursor-pointer -ml-2 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Coach Home
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Interview Configurator
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Customize the experience level, role guidelines, and topics for your simulated session.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Interview Type */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500" />
            1. Select Interview Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.value;
              return (
                <Card 
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`p-5 cursor-pointer border relative overflow-hidden transition-all duration-300 ${
                    isSelected 
                      ? "border-violet-600 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 shadow-md shadow-violet-500/5" 
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-violet-600 dark:text-violet-400">
                      <CheckCircle2 className="w-4 h-4 fill-current text-white dark:text-zinc-950" />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isSelected 
                        ? "bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800" 
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-905 dark:text-white leading-tight">{t.label}</h4>
                      <p className="text-3xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 2. Experience Level */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-4 h-4 text-violet-500" />
            2. Choose Experience Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            {levels.map((l) => {
              const isSelected = level === l;
              return (
                <div 
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`p-3.5 rounded-xl text-center cursor-pointer border text-xs font-bold transition-all duration-200 ${
                    isSelected 
                      ? "border-violet-600 dark:border-violet-500 bg-violet-600 text-white dark:bg-violet-500 shadow-md shadow-violet-500/15" 
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {l}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Job Role */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-violet-500" />
            3. Select Job Role Focus
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roles.map((r) => {
              const isSelected = role === r;
              return (
                <div 
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl text-center cursor-pointer border text-2xs font-semibold leading-snug flex items-center justify-center h-14 transition-all duration-200 ${
                    isSelected 
                      ? "border-violet-600 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-extrabold shadow-sm" 
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {r}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-zinc-150 dark:border-zinc-900 flex justify-end">
          <Button 
            onClick={() => onStart(role, level, type)}
            className="px-6 py-5 rounded-xl cursor-pointer text-xs font-bold bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white shadow-lg shadow-violet-500/15 gap-2 flex items-center justify-center"
          >
            Start Mock Session <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
