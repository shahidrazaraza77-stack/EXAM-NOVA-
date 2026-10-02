"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { COMPANY_LOGOS } from "../components/mockData";
import { Clock, Filter, Search, Building2, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mockPlacementService } from "@/services/mock-placement.service";

export default function HistoryView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const uid: string = userId;
    async function loadHistory() {
      setLoading(true);
      try {
        const data = await mockPlacementService.getHistory(uid);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load placement history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user?.id]);

  const filtered = history.filter(h => {
    if (filter !== "all") {
      if (filter === "Selected" && h.result !== "Selected") return false;
      if (filter === "Not Selected" && h.result !== "Not Selected" && h.result !== "Rejected") return false;
      if (filter === "Borderline" && h.result !== "Borderline" && h.result !== "Waitlisted") return false;
    }
    if (search && !h.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getScoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";
  
  const getResultStyle = (r: string) =>
    r === "Selected" || r === "Offered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
    r === "Borderline" || r === "Waitlisted" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
    r === "Incomplete" ? "bg-zinc-500/10 text-zinc-500 border-zinc-550/20" :
    "bg-red-500/10 text-red-600 border-red-500/20";

  const getResultText = (r: string) => {
    if (r === "Selected" || r === "Offered") return "Selected";
    if (r === "Borderline" || r === "Waitlisted") return "Borderline";
    if (r === "Incomplete") return "Incomplete";
    return "Not Selected";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-zinc-400">Loading placement history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Placement History</h2>
          <p className="text-xs text-zinc-500">Track your past placement drive attempts and progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company..."
              className="w-40 pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-xs font-semibold cursor-pointer">
            <option value="all">All Results</option>
            <option value="Selected">Selected</option>
            <option value="Borderline">Borderline</option>
            <option value="Not Selected">Not Selected</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-bold">No placement history found</p>
          <p className="text-xs mt-1">Complete a mock placement to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h, idx) => (
            <motion.div
              key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black ${COMPANY_LOGOS[h.company] || "bg-zinc-500"}`}>
                  {h.company[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{h.company}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getResultStyle(h.result)}`}>
                      {getResultText(h.result)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-500">
                    <span className="capitalize">{h.status === "ongoing" ? "Ongoing" : "Completed"}</span>
                    <span>{h.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{h.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {h.rounds && Object.entries(h.rounds).filter(([, v]) => v !== null).map(([k, v]) => (
                      <span key={k} className={`text-[8px] font-bold ${getScoreColor(Number(v))}`}>
                        {k.charAt(0).toUpperCase() + k.slice(1, 3)}: {String(v)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xl font-black ${getScoreColor(h.score)}`}>{h.score}%</span>
                <p className="text-[9px] text-zinc-400">Overall</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Score Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Attempts", value: history.length },
            { label: "Best Score", value: `${history.length > 0 ? Math.max(...history.map(h => h.score || 0), 0) : 0}%` },
            { label: "Average Score", value: `${history.length > 0 ? Math.round(history.reduce((a, h) => a + (h.score || 0), 0) / history.length) : 0}%` },
            { label: "Selections", value: `${history.filter(h => h.result === "Selected" || h.result === "Offered").length}` },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 text-center">
              <div className="text-xl font-black text-zinc-900 dark:text-white">{s.value}</div>
              <div className="text-[9px] font-semibold text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
