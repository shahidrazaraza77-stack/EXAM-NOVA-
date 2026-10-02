"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { COMPANY_LOGOS } from "../components/mockData";
import { BarChart3, TrendingUp, ArrowUp, ArrowDown, Minus, Download, Share2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mockPlacementService } from "@/services/mock-placement.service";

export default function ReportsView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const uid: string = userId;
    async function loadData() {
      setLoading(true);
      try {
        const data = await mockPlacementService.getHistory(uid);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load reports history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const sortedByDate = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  const latest = sortedByDate[0];
  const previous = sortedByDate[1];

  const comparison = useMemo(() => {
    if (!latest || !previous) return null;
    const diff = (latest.score || 0) - (previous.score || 0);
    const roundDiffs = {
      aptitude: (latest.rounds?.aptitude || 0) - (previous.rounds?.aptitude || 0),
      coding: (latest.rounds?.coding || 0) - (previous.rounds?.coding || 0),
      interview: (latest.rounds?.interview || 0) - (previous.rounds?.interview || 0),
    };
    return { diff, roundDiffs, latest, previous };
  }, [latest, previous]);

  const getTrendIcon = (v: number) => v > 0 ? <ArrowUp className="w-3.5 h-3.5 text-emerald-500" /> : v < 0 ? <ArrowDown className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-zinc-400" />;

  const getScoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";

  const overallTrend = useMemo(() => {
    if (sortedByDate.length < 2) return [];
    return sortedByDate.slice().reverse().map((h, i) => ({ attempt: i + 1, score: h.score || 0 }));
  }, [sortedByDate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-zinc-400">Loading performance reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Performance Reports</h2>
          <p className="text-xs text-zinc-500">Compare your attempts and track score improvements.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-aurora-border text-xs font-bold text-aurora-text-secondary hover:bg-aurora-card-hover cursor-pointer"><Download className="w-3.5 h-3.5" /> Report</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-aurora-border text-xs font-bold text-aurora-text-secondary hover:bg-aurora-card-hover cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Share</button>
        </div>
      </div>

      {comparison ? (
        <>
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Attempt Comparison</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black ${COMPANY_LOGOS[previous.company] || "bg-zinc-500"}`}>{previous.company[0]}</div>
                    <div>
                      <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block">{previous.company}</span>
                      <span className="text-[9px] text-zinc-400">{previous.date} • {previous.status}</span>
                    </div>
                  </div>
                  <span className={`text-lg font-black ${getScoreColor(previous.score)}`}>{previous.score}%</span>
                </div>
                <div className="flex gap-2">
                  {previous.rounds && Object.entries(previous.rounds).filter(([, v]) => v !== null).map(([k, v]) => (
                    <span key={k} className={`text-[9px] font-bold ${getScoreColor(Number(v))}`}>{k.charAt(0).toUpperCase() + k.slice(1, 4)}: {String(v)}%</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black ${COMPANY_LOGOS[latest.company] || "bg-zinc-500"}`}>{latest.company[0]}</div>
                    <div>
                      <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block">{latest.company}</span>
                      <span className="text-[9px] text-zinc-400">{latest.date} • {latest.status}</span>
                    </div>
                  </div>
                  <span className={`text-lg font-black ${getScoreColor(latest.score)}`}>{latest.score}%</span>
                </div>
                <div className="flex gap-2">
                  {latest.rounds && Object.entries(latest.rounds).filter(([, v]) => v !== null).map(([k, v]) => (
                    <span key={k} className={`text-[9px] font-bold ${getScoreColor(Number(v))}`}>{k.charAt(0).toUpperCase() + k.slice(1, 4)}: {String(v)}%</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-900">
              <span className="text-xs font-bold text-zinc-500">Score Change:</span>
              <div className="flex items-center gap-1.5">
                {getTrendIcon(comparison.diff)}
                <span className={`text-lg font-black ${comparison.diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {comparison.diff >= 0 ? "+" : ""}{comparison.diff}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Score Growth Trend</h3>
            </div>
            <div className="flex items-end gap-3 h-32 pt-4">
              {overallTrend.map((p, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${p.score}%` }}
                    className={`w-full rounded-lg transition-all ${p.score >= 80 ? "bg-emerald-500" : p.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ height: `${p.score}%`, maxHeight: `100%` }}
                  />
                  <span className="text-[8px] font-bold text-zinc-400">#{p.attempt}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <div className="text-center py-16 text-zinc-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-bold">Not enough data for comparison</p>
          <p className="text-xs mt-1">Complete at least 2 placement drives to see comparison.</p>
        </div>
      )}
    </div>
  );
}
