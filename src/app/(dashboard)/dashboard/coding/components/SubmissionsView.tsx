"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { codingService } from "@/services/coding";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SubmissionsView({ onOpenProblem }: { onOpenProblem: (id: string) => void }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setLoading(true);
        const data = await codingService.getSubmissions("");
        setSubmissions(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load submissions:", err);
        setError("Failed to fetch submission logs.");
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const title = s.coding_questions?.title || "Coding Challenge";
      if (search && !title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [submissions, search, filterStatus]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your coding submission history.</p>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by problem name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 rounded-xl border bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="Accepted">Accepted</option>
          <option value="Wrong Answer">Wrong Answer</option>
          <option value="Time Limit Exceeded">TLE</option>
          <option value="Compile Error">Compile Error</option>
        </select>
        {filterStatus && (
          <button
            onClick={() => setFilterStatus("")}
            className="h-10 px-3 rounded-xl border hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCcw className="size-4 text-muted-foreground" />
          </button>
        )}
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <motion.div variants={item} className="rounded-xl border bg-card divide-y">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="size-4 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))
        ) : (
          <>
            {filtered.map((sub) => {
              const statusIcon =
                sub.status === "Accepted" ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : sub.status === "Wrong Answer" ? (
                  <XCircle className="size-4 text-red-500 shrink-0" />
                ) : sub.status === "Time Limit Exceeded" ? (
                  <Clock className="size-4 text-orange-500 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-red-500 shrink-0" />
                );

              const title = sub.coding_questions?.title || "Coding Challenge";
              const submittedAt = sub.submitted_at || sub.submittedAt || new Date().toISOString();

              return (
                <div key={sub.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  {statusIcon}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onOpenProblem(sub.question_id || sub.problemId)}
                      className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      {title}
                    </button>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5 font-medium">
                      <span>{sub.language}</span>
                      <span>{sub.execution_time ?? sub.executionTime ?? 0}ms</span>
                      <span>
                        {sub.test_cases_passed ?? sub.testCasesPassed ?? 0}/
                        {sub.total_test_cases ?? sub.totalTestCases ?? 0} tests passed
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0 font-medium">
                    <p>{new Date(submittedAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="size-6 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-base">No submissions found</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

