"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Download, FileSpreadsheet, Share2, FileText, Calendar, Bell, Printer } from "lucide-react";

interface ReportsViewProps {
  onExport?: (format: string) => void;
}

export default function ReportsView({ onExport }: ReportsViewProps) {
  const [scheduleWeekly, setScheduleWeekly] = useState(false);
  const [scheduleMonthly, setScheduleMonthly] = useState(false);

  const exportOptions = [
    { id: "pdf", label: "PDF Report", desc: "Full readiness report with charts and summaries", icon: FileText },
    { id: "csv", label: "CSV Export", desc: "Raw performance data for external analysis", icon: FileSpreadsheet },
    { id: "share", label: "Share Link", desc: "Generate a secure shareable report URL", icon: Share2 },
    { id: "print", label: "Print View", desc: "Printer-friendly report format for offline use", icon: Printer },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {exportOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => onExport?.(opt.id)}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-955 hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-4 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">{opt.label}</h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Scheduled Reports</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-2xs font-extrabold text-zinc-800 dark:text-zinc-200 block">Weekly Readiness Summary</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Every Monday at 9:00 AM</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={scheduleWeekly} onChange={() => setScheduleWeekly(!scheduleWeekly)} />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-2xs font-extrabold text-zinc-800 dark:text-zinc-200 block">Monthly Progress Report</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Every 1st of the month</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={scheduleMonthly} onChange={() => setScheduleMonthly(!scheduleMonthly)} />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
