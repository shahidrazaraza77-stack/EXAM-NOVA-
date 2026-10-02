"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, Brain, Code2, Mic, FileText, Bell, Map, ClipboardList,
  Loader2, AlertCircle, CheckCircle2, XCircle, Clock, Eye,
  ChevronRight, RefreshCw, Zap, TrendingUp, Filter, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GenerationModule = "aptitude" | "coding" | "interview" | "mock-test" | "roadmap" | "notification";
type StatusType = "pending" | "completed" | "failed" | "draft" | "review" | "approved" | "published";

interface AILog {
  id: string;
  module_type: GenerationModule;
  generation_prompt?: string;
  generation_params?: any;
  generation_count: number;
  generation_status: StatusType;
  generated_content?: any;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

const MODULES: { id: GenerationModule; label: string; icon: React.ComponentType<any>; color: string; desc: string }[] = [
  { id: "aptitude", label: "Aptitude Questions", icon: Brain, color: "text-violet-500", desc: "Generate MCQ aptitude questions with explanations" },
  { id: "coding", label: "Coding Problems", icon: Code2, color: "text-blue-500", desc: "Generate DSA problems with test cases and editorial" },
  { id: "interview", label: "Interview Questions", icon: Mic, color: "text-rose-500", desc: "Generate HR/Technical interview Q&A" },
  { id: "mock-test", label: "Mock Test", icon: ClipboardList, color: "text-amber-500", desc: "Auto-assemble a full mock placement test" },
  { id: "roadmap", label: "Company Roadmap", icon: Map, color: "text-emerald-500", desc: "Generate a weekly prep roadmap for any company" },
  { id: "notification", label: "Notification", icon: Bell, color: "text-indigo-500", desc: "AI-draft platform notifications and alerts" },
];

const STATUS_CONFIG: Record<StatusType, { label: string; icon: React.ComponentType<any>; cls: string }> = {
  pending:   { label: "Pending",   icon: Clock,         cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700" },
  completed: { label: "Completed", icon: CheckCircle2,   cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50" },
  failed:    { label: "Failed",    icon: XCircle,        cls: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50" },
  draft:     { label: "Draft",     icon: FileText,       cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50" },
  review:    { label: "In Review", icon: Eye,            cls: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200/50" },
  approved:  { label: "Approved",  icon: CheckCircle2,   cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50" },
  published: { label: "Published", icon: Sparkles,       cls: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50" },
};

const PARAM_FIELDS: Record<GenerationModule, { key: string; label: string; type: string; options?: string[]; required?: boolean }[]> = {
  aptitude:     [{ key: "topic", label: "Topic", type: "text", required: true }, { key: "subtopic", label: "Subtopic", type: "text" }, { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"], required: true }, { key: "count", label: "Count (1-20)", type: "number", required: true }],
  coding:       [{ key: "topics", label: "Topics (comma-separated)", type: "text", required: true }, { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Mixed"], required: true }, { key: "count", label: "Count (1-10)", type: "number", required: true }],
  interview:    [{ key: "company", label: "Company", type: "select", options: ["Amazon","Google","Microsoft","TCS","Infosys","Wipro","Accenture","Cognizant","Capgemini"] }, { key: "category", label: "Category", type: "select", options: ["technical","hr","behavioral","resume"], required: true }, { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy","Medium","Hard"], required: true }, { key: "count", label: "Count (1-15)", type: "number", required: true }],
  "mock-test":  [{ key: "testType", label: "Test Type", type: "select", options: ["Aptitude","Coding","Company","Full"], required: true }, { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy","Medium","Hard","Mixed"], required: true }, { key: "title", label: "Test Title", type: "text", required: true }, { key: "durationMinutes", label: "Duration (minutes)", type: "number", required: true }],
  roadmap:      [{ key: "companyName", label: "Company Name", type: "select", options: ["Amazon","Google","Microsoft","TCS","Infosys","Wipro"], required: true }, { key: "companyId", label: "Company ID (slug)", type: "text", required: true }],
  notification: [{ key: "userId", label: "User ID (or 'all')", type: "text", required: true }, { key: "triggerType", label: "Trigger Type", type: "select", options: ["achievement","reminder","system","motivation"], required: true }, { key: "details", label: "Context / Details", type: "text", required: true }],
};

export default function AIContentCenterView() {
  const [activeTab, setActiveTab] = useState<"generate" | "logs" | "pending">("generate");
  const [logs, setLogs] = useState<AILog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Generate form state
  const [selectedModule, setSelectedModule] = useState<GenerationModule>("aptitude");
  const [params, setParams] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  // Preview modal
  const [previewLog, setPreviewLog] = useState<AILog | null>(null);

  // KPI counters
  const [kpis, setKpis] = useState({ total: 0, pending: 0, approved: 0, published: 0, failed: 0 });

  const loadLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    setLogsError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let url = "/api/admin/ai-logs?limit=50";
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (moduleFilter !== "all") url += `&module_type=${moduleFilter}`;
      const res = await fetch(url, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if (!res.ok) throw new Error("Failed to load generation logs");
      const { data, total } = await res.json();
      setLogs(data || []);
      // Compute KPIs
      const allRes = await fetch("/api/admin/ai-logs?limit=500", {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      });
      if (allRes.ok) {
        const { data: allData } = await allRes.json();
        const all = allData || [];
        setKpis({
          total: all.length,
          pending: all.filter((l: AILog) => l.generation_status === "review" || l.generation_status === "draft").length,
          approved: all.filter((l: AILog) => l.generation_status === "approved").length,
          published: all.filter((l: AILog) => l.generation_status === "published").length,
          failed: all.filter((l: AILog) => l.generation_status === "failed").length,
        });
      }
    } catch (err: any) {
      setLogsError(err.message);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [statusFilter, moduleFilter]);

  useEffect(() => { if (activeTab !== "generate") loadLogs(); }, [activeTab, loadLogs]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);
    setGenSuccess(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload: Record<string, any> = { module: selectedModule };
      // Convert comma-separated topics to array
      for (const [k, v] of Object.entries(params)) {
        if (k === "topics" && typeof v === "string") {
          payload[k] = v.split(",").map(s => s.trim()).filter(Boolean);
        } else if (k === "count" || k === "durationMinutes") {
          payload[k] = Number(v);
        } else {
          payload[k] = v;
        }
      }

      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Generation failed");

      // Log to ai_generation_logs
      const count = result.data?.count !== undefined 
        ? result.data.count 
        : (Array.isArray(result.data) 
            ? result.data.length 
            : (result.data ? 1 : 0));
      await fetch("/api/admin/ai-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({
          module_type: selectedModule, generation_params: payload,
          generation_count: count, generation_status: "completed", generated_content: result.data
        })
      });

      // Also log admin action
      await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ action: `AI Generated ${count} ${selectedModule} items`, entity_type: "ai_content", metadata: payload })
      });

      setGenSuccess(`✅ Successfully generated ${count} ${selectedModule} item(s)!`);
      setParams({});
    } catch (err: any) {
      setGenError(err.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusUpdate = async (logId: string, newStatus: StatusType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/ai-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ id: logId, status: newStatus })
      });
      if (res.ok) await loadLogs();
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const fields = PARAM_FIELDS[selectedModule] || [];

  const kpiCards = [
    { label: "Total Generations", value: kpis.total, icon: Sparkles, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30" },
    { label: "Pending Review", value: kpis.pending, icon: Clock, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
    { label: "Approved", value: kpis.approved, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Published", value: kpis.published, icon: Zap, color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent border border-violet-100 dark:border-violet-900/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-violet-500" />
              AI Content Center
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Generate, review, and publish AI-powered content using Gemini. All generations are logged and require admin approval.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-100/60 dark:bg-violet-950/30 px-3 py-1.5 rounded-xl border border-violet-200/30">
            <TrendingUp className="h-4 w-4" />
            Gemini 2.5 Flash
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        {[
          { id: "generate", label: "Generate Content" },
          { id: "logs", label: `Generation Logs ${kpis.total > 0 ? `(${kpis.total})` : ""}` },
          { id: "pending", label: `Pending Approval ${kpis.pending > 0 ? `(${kpis.pending})` : ""}` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-bold tracking-tight transition-all relative cursor-pointer ${activeTab === tab.id ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"}`}>
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="ai-center-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400" />}
          </button>
        ))}
      </div>

      {/* GENERATE TAB */}
      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Module Selector */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Select Content Type</p>
            {MODULES.map(mod => {
              const Icon = mod.icon;
              const isSelected = selectedModule === mod.id;
              return (
                <button key={mod.id} onClick={() => { setSelectedModule(mod.id); setParams({}); setGenError(null); setGenSuccess(null); }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? "border-violet-400 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/20 shadow-sm shadow-violet-100 dark:shadow-violet-900/10" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"}`}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                    <Icon className={`h-4.5 w-4.5 ${isSelected ? "text-white" : mod.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isSelected ? "text-violet-700 dark:text-violet-300" : "text-zinc-900 dark:text-zinc-100"}`}>{mod.label}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{mod.desc}</p>
                  </div>
                  {isSelected && <ChevronRight className="h-4 w-4 text-violet-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Generation Form */}
          <div className="lg:col-span-3">
            <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                {React.createElement(MODULES.find(m => m.id === selectedModule)!.icon, { className: `h-5 w-5 ${MODULES.find(m => m.id === selectedModule)!.color}` })}
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Generate {MODULES.find(m => m.id === selectedModule)!.label}</h3>
              </div>
              <form onSubmit={handleGenerate}>
                <div className="p-6 space-y-4">
                  {/* Success / Error banners */}
                  <AnimatePresence>
                    {genSuccess && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {genSuccess}
                      </motion.div>
                    )}
                    {genError && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {genError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dynamic Fields */}
                  {fields.map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "select" ? (
                        <select value={params[field.key] || ""} onChange={e => setParams(p => ({ ...p, [field.key]: e.target.value }))}
                          required={field.required} disabled={isGenerating}
                          className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                          <option value="">Select {field.label}</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={field.type} value={params[field.key] || ""} onChange={e => setParams(p => ({ ...p, [field.key]: e.target.value }))}
                          required={field.required} disabled={isGenerating}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
                  <Button type="submit" variant="primary" className="w-full h-11 gap-2 text-sm font-bold" disabled={isGenerating}>
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating with Gemini AI...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate {MODULES.find(m => m.id === selectedModule)!.label}</>
                    )}
                  </Button>
                  <p className="text-center text-xs text-zinc-400 mt-2">Content will be automatically saved after generation</p>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* LOGS & PENDING TABS */}
      {(activeTab === "logs" || activeTab === "pending") && (
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpiCards.map((k, i) => {
              const Icon = k.icon;
              return (
                <Card key={i} className="p-4 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${k.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{k.value}</p>
                      <p className="text-xs text-zinc-500">{k.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          {activeTab === "logs" && (
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }}
                className="h-9 px-3 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500">
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
                className="h-9 px-3 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500">
                <option value="all">All Modules</option>
                {MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <Button onClick={loadLogs} variant="secondary" size="sm" className="h-9 gap-1.5 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          )}

          {/* Table */}
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Module</th>
                    <th className="px-6 py-4">Count</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Generated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                  {isLoadingLogs ? (
                    <tr><td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                        <span>Loading generation logs...</span>
                      </div>
                    </td></tr>
                  ) : logsError ? (
                    <tr><td colSpan={5} className="py-10 text-center text-red-500">{logsError}</td></tr>
                  ) : (logs.filter(l => activeTab === "pending" ? (l.generation_status === "review" || l.generation_status === "draft") : true)).length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-zinc-400">
                      {activeTab === "pending" ? "No content pending approval." : "No generation logs yet. Use the Generate tab to create content."}
                    </td></tr>
                  ) : (
                    logs
                      .filter(l => activeTab === "pending" ? (l.generation_status === "review" || l.generation_status === "draft") : true)
                      .map(log => {
                        const mod = MODULES.find(m => m.id === log.module_type);
                        const status = STATUS_CONFIG[log.generation_status];
                        const StatusIcon = status.icon;
                        return (
                          <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                {mod && React.createElement(mod.icon, { className: `h-4 w-4 ${mod.color}` })}
                                <div>
                                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{log.module_type.replace("-", " ")}</p>
                                  {log.profiles?.full_name && <p className="text-xs text-zinc-400">{log.profiles.full_name}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">{log.generation_count}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${status.cls}`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-500">
                              {new Date(log.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setPreviewLog(log)}
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="View Content">
                                  <Eye className="h-4 w-4" />
                                </button>
                                {(log.generation_status === "completed" || log.generation_status === "draft" || log.generation_status === "review") && (
                                  <button onClick={() => handleStatusUpdate(log.id, "approved")}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200/50">
                                    Approve
                                  </button>
                                )}
                                {log.generation_status === "approved" && (
                                  <button onClick={() => handleStatusUpdate(log.id, "published")}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 hover:bg-violet-100 transition-colors cursor-pointer border border-violet-200/50">
                                    Publish
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewLog(null)} className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10 max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Eye className="h-5 w-5 text-violet-500" />
                  Generated Content Preview
                </h3>
                <button onClick={() => setPreviewLog(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${STATUS_CONFIG[previewLog.generation_status].cls}`}>
                    {STATUS_CONFIG[previewLog.generation_status].label}
                  </span>
                  <span className="text-xs text-zinc-400 capitalize">{previewLog.module_type} • {previewLog.generation_count} items</span>
                </div>
                <pre className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(previewLog.generated_content, null, 2)}
                </pre>
              </div>
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
                <Button onClick={() => setPreviewLog(null)} variant="secondary" className="text-xs h-9 px-4">Close</Button>
                {previewLog.generation_status === "completed" && (
                  <Button onClick={() => { handleStatusUpdate(previewLog.id, "approved"); setPreviewLog(null); }}
                    variant="primary" className="text-xs h-9 px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Approve Content
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
