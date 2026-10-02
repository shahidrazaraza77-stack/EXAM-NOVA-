"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  Activity, Search, Filter, Loader2, AlertCircle, RefreshCw,
  User, Building2, HelpCircle, Settings, Brain, Code2, Megaphone
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

const ENTITY_ICON: Record<string, React.ComponentType<any>> = {
  user: User,
  company: Building2,
  question: HelpCircle,
  aptitude: Brain,
  coding: Code2,
  interview: HelpCircle,
  settings: Settings,
  announcement: Megaphone,
  ai_content: Brain,
  notification: Megaphone,
};

const ENTITY_COLORS: Record<string, string> = {
  user:         "bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
  company:      "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  question:     "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  aptitude:     "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
  coding:       "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400",
  settings:     "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  ai_content:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  notification: "bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
};

const FALLBACK_LOGS: AdminLog[] = [
  { id: "fl-1", admin_id: "admin", action: "AI Generated 5 aptitude items", entity_type: "ai_content", created_at: new Date(Date.now() - 120000).toISOString() },
  { id: "fl-2", admin_id: "admin", action: "Added Interview Question", entity_type: "interview", created_at: new Date(Date.now() - 240000).toISOString() },
  { id: "fl-3", admin_id: "admin", action: "Sent notification: Welcome Premium Users", entity_type: "notification", created_at: new Date(Date.now() - 600000).toISOString() },
  { id: "fl-4", admin_id: "admin", action: "Updated Company: Google", entity_type: "company", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "fl-5", admin_id: "admin", action: "User Role Updated → admin", entity_type: "user", created_at: new Date(Date.now() - 7200000).toISOString() },
];

export default function AdminLogsView() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 50;

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    setUsingFallback(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLogs(FALLBACK_LOGS);
        setUsingFallback(true);
        return;
      }
      let url = `/api/admin/logs?page=${page}&limit=${LIMIT}`;
      if (entityFilter !== "all") url += `&entity_type=${entityFilter}`;
      if (searchQuery) url += `&action=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load admin logs");
      }
      const { data, total: t } = await res.json();
      setLogs(data || []);
      setTotal(t || 0);
    } catch (err: any) {
      // Fallback to local mock data if Supabase not configured
      console.error("Admin logs error:", err.message);
      setLogs(FALLBACK_LOGS);
      setUsingFallback(true);
      setTotal(FALLBACK_LOGS.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, [page, entityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const filteredLogs = usingFallback
    ? FALLBACK_LOGS.filter(l =>
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (entityFilter === "all" || l.entity_type === entityFilter)
      )
    : logs;

  const entityTypes = Array.from(new Set([...FALLBACK_LOGS.map(l => l.entity_type), "user", "company", "aptitude", "coding", "interview", "settings", "ai_content", "notification"]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Audit Trail</p>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-1 flex items-center gap-2">
            <Activity className="h-6 w-6 text-violet-500" />
            Admin Action Logs
          </h2>
        </div>
        <Button onClick={loadLogs} variant="secondary" size="sm" className="h-10 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
        </Button>
      </div>

      {/* Fallback notice */}
      {usingFallback && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Showing sample logs. Live logs from Supabase will appear after your admin session is active and SUPABASE_SERVICE_ROLE_KEY is configured.
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input type="text" placeholder="Search actions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 shadow-sm">
            <option value="all">All Entity Types</option>
            {entityTypes.map(e => <option key={e} value={e}>{e.replace("_", " ")}</option>)}
          </select>
          <Button type="submit" variant="secondary" size="sm" className="h-10 px-4 text-xs">Search</Button>
        </div>
      </form>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Logs", value: usingFallback ? FALLBACK_LOGS.length : total, color: "text-violet-600" },
          { label: "AI Content", value: filteredLogs.filter(l => l.entity_type === "ai_content").length, color: "text-emerald-600" },
          { label: "User Actions", value: filteredLogs.filter(l => l.entity_type === "user").length, color: "text-blue-600" },
          { label: "Question Changes", value: filteredLogs.filter(l => ["aptitude","coding","interview","question"].includes(l.entity_type)).length, color: "text-amber-600" },
        ].map((s, i) => (
          <Card key={i} className="p-4 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Logs Table */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
              {isLoading ? (
                <tr><td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                    <span>Loading admin logs...</span>
                  </div>
                </td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-zinc-400">No logs found for the selected filters.</td></tr>
              ) : filteredLogs.map((log, idx) => {
                const EntityIcon = ENTITY_ICON[log.entity_type] || Activity;
                const entityColor = ENTITY_COLORS[log.entity_type] || ENTITY_COLORS.settings;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{log.action}</span>
                      </div>
                      {log.entity_id && (
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono ml-4.5">ID: {log.entity_id}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${entityColor}`}>
                        <EntityIcon className="h-3 w-3" />
                        {log.entity_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.profiles ? (
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">{log.profiles.full_name}</p>
                          <p className="text-xs text-zinc-400">{log.profiles.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 font-mono">{log.admin_id === "admin" ? "System Admin" : log.admin_id?.slice(0, 12) + "..."}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!usingFallback && total > LIMIT && (
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} logs</span>
            <div className="flex gap-2">
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} variant="secondary" size="sm" className="h-8 px-3 text-xs" disabled={page === 1}>Previous</Button>
              <Button onClick={() => setPage(p => p + 1)} variant="secondary" size="sm" className="h-8 px-3 text-xs" disabled={page * LIMIT >= total}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
