"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { CHART_WEEKLY, CHART_MONTHLY, CHART_QUARTERLY } from "./mockData";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ProgressChartsProps {
  overall: number;
  aptitude: number;
  coding: number;
  interview: number;
  skillGaps: any;
}

export default function ProgressCharts({
  overall, aptitude, coding, interview, skillGaps
}: ProgressChartsProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "quarterly">("weekly");

  const buildChartData = (base: typeof CHART_WEEKLY) => {
    if (base.length === 0) return [];
    const data = base.map(p => ({ ...p }));
    const last = data[data.length - 1];
    last.Overall = overall || last.Overall;
    last.Aptitude = aptitude || last.Aptitude;
    last.Coding = coding || last.Coding;
    last.Interview = interview || last.Interview;
    return data;
  };

  const getActiveData = () => {
    switch (activeTab) {
      case "monthly": return buildChartData(CHART_MONTHLY);
      case "quarterly": return buildChartData(CHART_QUARTERLY);
      default: return buildChartData(CHART_WEEKLY);
    }
  };

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm min-h-[350px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm text-zinc-905 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-violet-500" /> Preparation Progress Trend
          </h3>
          <p className="text-[10px] text-zinc-555">Tracks score curves over time across distinct drive parameters.</p>
        </div>

        <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 text-[10px] font-bold p-1 rounded-xl w-fit">
          {[
            { id: "weekly" as const, label: "Weekly" },
            { id: "monthly" as const, label: "Monthly" },
            { id: "quarterly" as const, label: "Quarterly" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                  isActive 
                    ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 font-extrabold shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-650"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-64 w-full select-none text-[9px] mt-6 font-semibold">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getActiveData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
            <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 9 }} domain={[40, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Overall" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Aptitude" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Coding" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Interview" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {skillGaps && (
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-850">
          <p className="text-2xs font-bold text-zinc-700 dark:text-zinc-300">
            <span className="text-emerald-500">Strongest:</span> {skillGaps.strongest_skill} &middot;{" "}
            <span className="text-red-500">Weakest:</span> {skillGaps.weakest_skill}
          </p>
        </div>
      )}
    </Card>
  );
}
