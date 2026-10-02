"use client";

import React, { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { HRQuestion } from "@/data/hr/questions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  X,
  Check,
  UserCheck,
  Lightbulb,
  HelpCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HR_CATEGORIES = [
  { id: "Self Introduction", label: "Self Introduction", dbCategory: "Introduction" },
  { id: "Strengths", label: "Strengths", dbCategory: "Self Assessment" },
  { id: "Weaknesses", label: "Weaknesses", dbCategory: "Self Assessment" },
  { id: "Career Goals", label: "Career Goals", dbCategory: "Career Goals" },
  { id: "Teamwork", label: "Teamwork", dbCategory: "Behavioral" }
];

export default function HRQuestionsView() {
  const { hrQs, addHRQ, editHRQ, deleteHRQ } = useAdmin();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Modal states
  const [modalType, setModalType] = useState<"preview" | "edit" | "add" | null>(null);
  const [selectedQ, setSelectedQ] = useState<HRQuestion | null>(null);

  // AI Generator states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError(null);
    try {
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
          module: "interview",
          category: "HR",
          difficulty: aiDifficulty,
          count: aiCount,
          company: "General"
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      const payload = await res.json();
      const generatedQs = payload?.data?.bank || [];

      // Add to local admin context state so it updates CMS table instantly
      for (const q of generatedQs) {
        addHRQ({
          question: q.question,
          tip: q.expected_answer || "Think of a structured story using STAR method.",
          category: q.topic || "Behavioral",
          companies: q.company ? [q.company.toLowerCase()] : []
        });
      }

      setIsAIModalOpen(false);
    } catch (err: any) {
      console.error("AI HR Question Generation error:", err);
      setGenerationError(err.message || "Failed to generate AI questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formTip, setFormTip] = useState("");
  const [formCategory, setFormCategory] = useState("Self Introduction");
  const [formCompanies, setFormCompanies] = useState("");

  // Map database categories to UI tabs
  const getMappedCategory = (q: HRQuestion): string => {
    const qLower = q.question.toLowerCase();
    if (q.category === "Introduction" || qLower.includes("introduce") || qLower.includes("tell me about yourself")) {
      return "Self Introduction";
    }
    if (qLower.includes("strength")) {
      return "Strengths";
    }
    if (qLower.includes("weakness")) {
      return "Weaknesses";
    }
    if (q.category === "Career Goals" || qLower.includes("5 years") || qLower.includes("future")) {
      return "Career Goals";
    }
    if (qLower.includes("team") || qLower.includes("conflict") || qLower.includes("disagree") || qLower.includes("collaborate")) {
      return "Teamwork";
    }
    // Fallback based on database categories
    if (q.category === "Behavioral") return "Teamwork";
    if (q.category === "Self Assessment") return "Strengths";
    return "Self Introduction";
  };

  // Filter list
  const filteredQs = hrQs.filter((q) => {
    const uiCategory = getMappedCategory(q);
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || uiCategory === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setFormQuestion("");
    setFormTip("");
    setFormCategory(activeCategory !== "All" ? activeCategory : "Self Introduction");
    setFormCompanies("");
    setModalType("add");
  };

  const openEditModal = (q: HRQuestion) => {
    setSelectedQ(q);
    setFormQuestion(q.question);
    setFormTip(q.tip);
    setFormCategory(getMappedCategory(q));
    setFormCompanies(q.companies.join(", "));
    setModalType("edit");
  };

  const openPreviewModal = (q: HRQuestion) => {
    setSelectedQ(q);
    setModalType("preview");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion || !formTip) return;

    // Database category mapping for storage
    const matched = HR_CATEGORIES.find(c => c.id === formCategory);
    const dbCategory = matched ? matched.dbCategory : "Introduction";

    addHRQ({
      question: formQuestion,
      tip: formTip,
      category: dbCategory,
      companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
    });
    setModalType(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQ || !formQuestion || !formTip) return;

    const matched = HR_CATEGORIES.find(c => c.id === formCategory);
    const dbCategory = matched ? matched.dbCategory : "Introduction";

    editHRQ(selectedQ.id, {
      question: formQuestion,
      tip: formTip,
      category: dbCategory,
      companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
    });
    setModalType(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this HR question?")) {
      deleteHRQ(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit max-w-full">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === "All"
              ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          All Categories
        </button>
        {HR_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeCategory === "All" ? "HR" : activeCategory} questions...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAIModalOpen(true)} 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 gap-1.5 border-violet-300 dark:border-violet-850 text-violet-655 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-955/20 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" /> AI Generator
          </Button>

          <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ml-auto md:ml-0">
            <Plus className="h-4 w-4" /> Add HR Question
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Assigned Category</th>
                <th className="px-6 py-4">Companies Mapped</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
              {filteredQs.length > 0 ? (
                filteredQs.map((q) => {
                  const uiCat = getMappedCategory(q);
                  return (
                    <tr key={q.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-150 line-clamp-1">
                            {q.question}
                          </span>
                          <span className="text-xs text-zinc-450 mt-0.5 line-clamp-1">
                            Tip: {q.tip}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 px-2.5 py-1 rounded-lg">
                          {uiCat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-500 capitalize">
                        {q.companies.slice(0, 4).join(", ") || "General"}
                        {q.companies.length > 4 && "..."}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openPreviewModal(q)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Preview Question"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(q)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-zinc-500">
                    No HR questions found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CRUD MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Add HR Question"}
                  {modalType === "edit" && "Edit HR Question"}
                  {modalType === "preview" && "HR Question Coach Tip"}
                </h3>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview Content */}
              {modalType === "preview" && selectedQ && (
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 capitalize bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      Category: {getMappedCategory(selectedQ)}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 capitalize">
                      Mapped to: {selectedQ.companies.join(", ") || "General placement guidelines"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-base leading-relaxed">
                      {selectedQ.question}
                    </h4>

                    {/* Tip Card */}
                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 space-y-2">
                      <h5 className="text-xs font-bold text-amber-850 dark:text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="h-4.5 w-4.5" /> Preparation & Strategy Tip
                      </h5>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {selectedQ.tip}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">
                      Close Tip
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    
                    {/* Category Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">HR Topic Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      >
                        {HR_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle className="h-4 w-4 text-violet-500" /> Question Prompt
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formQuestion}
                        onChange={(e) => setFormQuestion(e.target.value)}
                        placeholder="e.g. Tell me about a time you worked under a tight deadline."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
                      />
                    </div>

                    {/* Tip Text */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb className="h-4 w-4 text-amber-500" /> Coaching Tip / Suggested Response Strategy
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formTip}
                        onChange={(e) => setFormTip(e.target.value)}
                        placeholder="Provide tips for the student (e.g. Use STAR method. Highlight collaboration...)"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
                      />
                    </div>

                    {/* Companies Mapped */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Companies Mapped</label>
                      <input 
                        type="text" 
                        value={formCompanies}
                        onChange={(e) => setFormCompanies(e.target.value)}
                        placeholder="e.g. amazon, google, microsoft (comma-separated)"
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setModalType(null)} 
                      variant="secondary" 
                      className="text-xs h-9 px-4"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="text-xs h-9 px-4 gap-1"
                    >
                      <Check className="h-4 w-4" /> Save HR Question
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGenerating && setIsAIModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
                  AI HR Question Generator
                </h3>
                <button 
                  onClick={() => !isGenerating && setIsAIModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                  disabled={isGenerating}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAIGenerate}>
                <div className="p-6 space-y-4">
                  {generationError && (
                    <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                      {generationError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Difficulty */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        disabled={isGenerating}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    {/* Count */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Questions Count</label>
                      <input 
                        type="number" 
                        required
                        min={1}
                        max={10}
                        value={aiCount}
                        onChange={(e) => setAiCount(Number(e.target.value))}
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    onClick={() => setIsAIModalOpen(false)} 
                    variant="secondary" 
                    className="text-xs h-9 px-4"
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="text-xs h-9 px-4 gap-1.5"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Questions
                      </>
                    )}
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
