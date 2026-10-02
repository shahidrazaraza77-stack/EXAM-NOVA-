"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Target, Bell, ShieldCheck } from "lucide-react";

export default function SettingsView() {
  const [targetMonth, setTargetMonth] = useState("August 2026");
  const [targetRole, setTargetRole] = useState("SDE-1");
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Placement Goals</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xs font-bold text-zinc-700 dark:text-zinc-300 block">Target Placement Month</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Your expected placement timeline</span>
            </div>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <option>June 2026</option>
              <option>July 2026</option>
              <option>August 2026</option>
              <option>September 2026</option>
              <option>December 2026</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xs font-bold text-zinc-700 dark:text-zinc-300 block">Target Role</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Your desired job role</span>
            </div>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <option>SDE-1</option>
              <option>SDE-2</option>
              <option>Frontend Developer</option>
              <option>Data Analyst</option>
              <option>Product Engineer</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Notifications & Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
            <div>
              <span className="text-2xs font-bold text-zinc-700 dark:text-zinc-300 block">Weekly Readiness Report</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Get weekly summaries via email</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
            <div>
              <span className="text-2xs font-bold text-zinc-700 dark:text-zinc-300 block">Auto-Refresh Scores</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Automatically recalculate scores daily</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={autoRefresh} onChange={() => setAutoRefresh(!autoRefresh)} />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
