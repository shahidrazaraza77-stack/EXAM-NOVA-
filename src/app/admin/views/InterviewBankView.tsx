"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  Search, Filter, Plus, Eye, Edit3, Trash2, X, Check, Sparkles,
  Loader2, AlertCircle, Mic, Code2, Heart, FileText, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type InterviewType = "technical" | "hr" | "behavioral" | "resume";

interface InterviewQuestion {
  id: string;
  question: string;
  type: InterviewType;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  expected_answer?: string;
  evaluation_criteria?: string;
  company?: string;
  status: "draft" | "published";
  created_at?: string;
}

const TYPE_TABS: { id: InterviewType; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { id: "technical", label: "Technical", icon: Code2, color: "text-blue-500" },
  { id: "hr", label: "HR", icon: Heart, color: "text-rose-500" },
  { id: "behavioral", label: "Behavioral", icon: Mic, color: "text-violet-500" },
  { id: "resume", label: "Resume-Based", icon: FileText, color: "text-amber-500" },
];

const COMPANIES = ["Amazon", "Google", "Microsoft", "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini"];

const diffBadge: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50",
  Hard: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50",
};

const statusBadge: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50",
};

export default function InterviewBankView() {
  const [activeTab, setActiveTab] = useState<InterviewType>("technical");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"add" | "edit" | "preview" | null>(null);
  const [selectedQ, setSelectedQ] = useState<InterviewQuestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formQ, setFormQ] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCriteria, setFormCriteria] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [formCompany, setFormCompany] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("published");

  // AI Generator
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiCompany, setAiCompany] = useState("Amazon");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [aiCount, setAiCount] = useState(5);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await (supabase.from("interview_questions") as any)
        .select("*")
        .eq("type", activeTab)
        .order("created_at", { ascending: false });
      if (dbErr) throw dbErr;
      setQuestions(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load interview questions");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, [activeTab]);

  const filteredQs = questions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiff = diffFilter === "All" || q.difficulty === diffFilter;
    const matchCompany = companyFilter === "All" || q.company?.toLowerCase() === companyFilter.toLowerCase();
    return matchSearch && matchDiff && matchCompany;
  });

  const resetForm = () => {
    setFormQ(""); setFormAnswer(""); setFormCriteria(""); setFormCategory("");
    setFormDifficulty("Medium"); setFormCompany(""); setFormStatus("published");
  };

  const openAddModal = () => { resetForm(); setModalType("add"); };
  const openEditModal = (q: InterviewQuestion) => {
    setSelectedQ(q);
    setFormQ(q.question); setFormAnswer(q.expected_answer || "");
    setFormCriteria(q.evaluation_criteria || ""); setFormCategory(q.category || "");
    setFormDifficulty(q.difficulty); setFormCompany(q.company || "");
    setFormStatus(q.status); setModalType("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQ.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        question: formQ, type: activeTab, category: formCategory,
        difficulty: formDifficulty, expected_answer: formAnswer,
        evaluation_criteria: formCriteria, company: formCompany || null,
        status: formStatus
      };
      if (modalType === "add") {
        await (supabase.from("interview_questions") as any).insert(payload);
      } else if (selectedQ) {
        await (supabase.from("interview_questions") as any).update(payload).eq("id", selectedQ.id);
      }
      setModalType(null);
      await loadQuestions();
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this interview question?")) return;
    await (supabase.from("interview_questions") as any).delete().eq("id", id);
    await loadQuestions();
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ module: "interview", category: activeTab, difficulty: aiDifficulty, count: aiCount, company: aiCompany })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Generation failed"); }
      setIsAIOpen(false);
      await loadQuestions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentTabInfo = TYPE_TABS.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={loadQuestions} className="ml-auto underline font-semibold">Retry</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TYPE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold whitespace-nowrap relative cursor-pointer transition-all ${isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
            >
              <Icon className={`h-4 w-4 ${isActive ? tab.color : ""}`} />
              {tab.label}
              {isActive && <motion.div layoutId="interview-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400" />}
            </button>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text" placeholder={`Search ${currentTabInfo.label} questions...`}
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 shadow-sm">
            <option value="All">All Difficulties</option>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 shadow-sm">
            <option value="All">All Companies</option>
            {COMPANIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <Button onClick={() => setIsAIOpen(true)} variant="outline" size="sm" className="h-10 px-4 gap-1.5 border-violet-300 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 cursor-pointer">
            <Sparkles className="h-4 w-4 animate-pulse" /> AI Generate
          </Button>
          <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5">
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Loader2 className="h-7 w-7 text-violet-500 animate-spin" />
                    <span>Loading questions...</span>
                  </div>
                </td></tr>
              ) : filteredQs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-400">
                  No {currentTabInfo.label} questions found. Add one or use AI Generate.
                </td></tr>
              ) : filteredQs.map(q => (
                <tr key={q.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">{q.question}</p>
                    {q.category && <span className="text-xs text-zinc-400 mt-0.5 block">{q.category}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                    {q.company || <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${diffBadge[q.difficulty]}`}>{q.difficulty}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${statusBadge[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelectedQ(q); setModalType("preview"); }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Preview">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(q)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CRUD + Preview Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setModalType(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  {React.createElement(currentTabInfo.icon, { className: `h-5 w-5 ${currentTabInfo.color}` })}
                  {modalType === "add" ? `Add ${currentTabInfo.label} Question` :
                   modalType === "edit" ? `Edit ${currentTabInfo.label} Question` :
                   "Question Preview"}
                </h3>
                <button onClick={() => !isSubmitting && setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer" disabled={isSubmitting}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview */}
              {modalType === "preview" && selectedQ && (
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${diffBadge[selectedQ.difficulty]}`}>{selectedQ.difficulty}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${statusBadge[selectedQ.status]}`}>{selectedQ.status}</span>
                    {selectedQ.company && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50">{selectedQ.company}</span>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Question</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-relaxed">{selectedQ.question}</p>
                  </div>
                  {selectedQ.expected_answer && (
                    <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/30">
                      <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-2">Expected Answer</p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedQ.expected_answer}</p>
                    </div>
                  )}
                  {selectedQ.evaluation_criteria && (
                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">Evaluation Criteria</p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedQ.evaluation_criteria}</p>
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">Close</Button>
                  </div>
                </div>
              )}

              {/* Add/Edit Form */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Question *</label>
                      <textarea required rows={3} value={formQ} onChange={e => setFormQ(e.target.value)}
                        placeholder="Enter the interview question..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Expected Answer</label>
                      <textarea rows={3} value={formAnswer} onChange={e => setFormAnswer(e.target.value)}
                        placeholder="What makes a great answer to this question?"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Evaluation Criteria</label>
                      <textarea rows={2} value={formCriteria} onChange={e => setFormCriteria(e.target.value)}
                        placeholder="What criteria to evaluate the answer on?"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</label>
                        <select value={formDifficulty} onChange={e => setFormDifficulty(e.target.value as any)}
                          className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                          <option>Easy</option><option>Medium</option><option>Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company</label>
                        <select value={formCompany} onChange={e => setFormCompany(e.target.value)}
                          className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                          <option value="">— General —</option>
                          {COMPANIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Category / Tag</label>
                        <input value={formCategory} onChange={e => setFormCategory(e.target.value)}
                          placeholder="e.g. Leadership, System Design"
                          className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                        <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)}
                          className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <Button type="button" onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4" disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" variant="primary" className="text-xs h-9 px-4 gap-1.5" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Save Question
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAIOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isGenerating && setIsAIOpen(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
                  AI Interview Question Generator
                </h3>
                <button onClick={() => !isGenerating && setIsAIOpen(false)} disabled={isGenerating}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAIGenerate}>
                <div className="p-6 space-y-4">
                  <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-700 dark:text-violet-400">
                    Generating <strong className="capitalize">{activeTab}</strong> interview questions using Gemini AI. Questions will be saved as <strong>Published</strong> after generation.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target Company</label>
                    <select value={aiCompany} onChange={e => setAiCompany(e.target.value)} disabled={isGenerating}
                      className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                      {COMPANIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</label>
                      <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value as any)} disabled={isGenerating}
                        className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                        <option>Easy</option><option>Medium</option><option>Hard</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Count</label>
                      <input type="number" min={1} max={15} value={aiCount} onChange={e => setAiCount(Number(e.target.value))}
                        disabled={isGenerating}
                        className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                  <Button type="button" onClick={() => setIsAIOpen(false)} variant="secondary" className="text-xs h-9 px-4" disabled={isGenerating}>Cancel</Button>
                  <Button type="submit" variant="primary" className="text-xs h-9 px-4 gap-1.5 " disabled={isGenerating}>
                    {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
