"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, Roadmap } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Search,
  Filter,
  Map,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Building2,
  Calendar,
  Code,
  Brain,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";

const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "TCS", "Infosys", "Wipro"];

export default function RoadmapsView() {
  const { roadmaps, addRoadmap, editRoadmap, deleteRoadmap } = useAdmin();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Roadmap | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // AI Generator states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [dbCompanies, setDbCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchDbCompanies = async () => {
      try {
        const { data, error } = await (supabase.from("companies") as any).select("id, name");
        if (!error && data) {
          setDbCompanies(data as any);
          if (data.length > 0) setSelectedCompanyId((data as any)[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch database companies:", e);
      }
    };
    fetchDbCompanies();
  }, []);

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const companyObj = dbCompanies.find(c => c.id === selectedCompanyId);
      if (!companyObj) throw new Error("Selected company not found.");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          module: "roadmap",
          companyName: companyObj.name,
          companyId: selectedCompanyId
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      const payload = await res.json();
      const generatedWeeks = payload?.data?.roadmaps || [];

      // Clean up old local roadmap weeks for this company
      const companyName = companyObj.name;
      for (const w of generatedWeeks) {
        addRoadmap({
          company: companyName,
          week: w.week_number,
          topics: w.topics || [],
          codingTasks: w.coding_tasks || [],
          aptitudeTasks: w.aptitude_tasks || [],
          interviewTasks: w.interview_tasks || []
        });
      }

      setIsAIModalOpen(false);
    } catch (err: any) {
      console.error("AI Roadmap Generation error:", err);
      setGenerationError(err.message || "Failed to generate AI roadmap.");
    } finally {
      setIsGenerating(false);
    }
  };

  const [form, setForm] = useState({
    company: "Google",
    week: 1,
    topics: "",
    codingTasks: "",
    aptitudeTasks: "",
    interviewTasks: "",
  });

  const filtered = roadmaps.filter((r) => {
    const matchesSearch =
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCompany = companyFilter === "All" || r.company === companyFilter;
    return matchesSearch && matchesCompany;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ company: "Google", week: roadmaps.filter(r => r.company === "Google").length + 1, topics: "", codingTasks: "", aptitudeTasks: "", interviewTasks: "" });
    setShowModal(true);
  };

  const openEdit = (r: Roadmap) => {
    setEditing(r);
    setForm({
      company: r.company,
      week: r.week,
      topics: r.topics.join(", "),
      codingTasks: r.codingTasks.join(", "),
      aptitudeTasks: r.aptitudeTasks.join(", "),
      interviewTasks: r.interviewTasks.join(", "),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      company: form.company,
      week: form.week,
      topics: form.topics.split(",").map((s) => s.trim()).filter(Boolean),
      codingTasks: form.codingTasks.split(",").map((s) => s.trim()).filter(Boolean),
      aptitudeTasks: form.aptitudeTasks.split(",").map((s) => s.trim()).filter(Boolean),
      interviewTasks: form.interviewTasks.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (editing) {
      editRoadmap(editing.id, data);
    } else {
      addRoadmap(data);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Map className="h-6 w-6 text-violet-500" />
            Weekly Roadmaps
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Manage company-wise weekly preparation plans</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-sm font-medium rounded-xl hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-all cursor-pointer">
            <Sparkles className="h-4 w-4 text-violet-500" /> AI Generator
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 aurora-gradient-primary text-white text-sm font-medium rounded-xl transition-all cursor-pointer">
            <Plus className="h-4 w-4" /> Add Roadmap
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input type="text" placeholder="Search roadmaps..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 appearance-none cursor-pointer transition-all">
            <option value="All">All Companies</option>
            {companies.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      </div>

      {/* Roadmap Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((roadmap) => (
            <motion.div key={roadmap.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all hover:shadow-md hover:border-violet-200 dark:hover:border-violet-900/50">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{roadmap.company}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                          Week {roadmap.week}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1.5">Topics: {roadmap.topics.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => openEdit(roadmap)} className="p-2 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete this roadmap?")) deleteRoadmap(roadmap.id); }} className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"><Trash2 className="h-4 w-4" /></button>
                    <button onClick={() => setExpanded(expanded === roadmap.id ? null : roadmap.id)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                      {expanded === roadmap.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {expanded === roadmap.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: Code, label: "Coding Tasks", items: roadmap.codingTasks, color: "text-emerald-500" },
                      { icon: Brain, label: "Aptitude Tasks", items: roadmap.aptitudeTasks, color: "text-amber-500" },
                      { icon: MessageSquare, label: "Interview Tasks", items: roadmap.interviewTasks, color: "text-blue-500" },
                    ].map((section) => (
                      <div key={section.label} className="bg-white dark:bg-zinc-900/60 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                          <section.icon className={`h-4 w-4 ${section.color}`} />
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{section.label}</span>
                        </div>
                        {section.items.length > 0 ? (
                          <ul className="space-y-1">
                            {section.items.map((task, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <Check className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No tasks listed</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Map className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 font-medium">No roadmaps found</p>
            <p className="text-sm text-zinc-400 mt-1">Create your first weekly roadmap</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {editing ? "Edit Roadmap" : "Add Roadmap"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Company</label>
                    <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer">
                      {companies.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Week</label>
                    <input type="number" min={1} max={52} value={form.week} onChange={(e) => setForm({ ...form, week: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                  </div>
                </div>
                {(["topics", "codingTasks", "aptitudeTasks", "interviewTasks"] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 capitalize">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input type="text" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={`Comma-separated ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2.5 rounded-xl aurora-gradient-primary text-white text-sm font-medium cursor-pointer transition-all">
                    {editing ? "Update" : "Create"} Roadmap
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAIModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsAIModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI Roadmap Generator
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Generate a comprehensive multi-week roadmap for a company</p>
                </div>
                <button onClick={() => setIsAIModalOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {generationError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{generationError}</span>
                </div>
              )}

              <form onSubmit={handleAIGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Select Company</label>
                  <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer">
                    <option value="" disabled>Select a company</option>
                    {dbCompanies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAIModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">Cancel</button>
                  <button type="submit" disabled={isGenerating || !selectedCompanyId} className="px-4 py-2.5 rounded-xl aurora-gradient-primary text-white text-sm font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Generate Roadmap
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
