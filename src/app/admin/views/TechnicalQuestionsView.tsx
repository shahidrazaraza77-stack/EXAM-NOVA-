"use client";

import React, { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { TechnicalQuestion } from "@/data/technical/questions";
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
  Database,
  Terminal,
  HelpCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUBJECTS = ["DBMS", "Operating System", "Computer Networks", "OOP", "SQL", "Java", "JavaScript"];

export default function TechnicalQuestionsView() {
  const { technicalQs, addTechnicalQ, editTechnicalQ, deleteTechnicalQ } = useAdmin();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"preview" | "edit" | "add" | null>(null);
  const [selectedQ, setSelectedQ] = useState<TechnicalQuestion | null>(null);

  // AI Generator states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSubject, setAiSubject] = useState("DBMS");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Expert">("Medium");
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
          category: "Technical",
          difficulty: aiDifficulty === "Expert" ? "Hard" : aiDifficulty, // Gemini uses standard diff
          count: aiCount,
          company: aiSubject // Use subject as topic in interview generator
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
        addTechnicalQ({
          question: q.question,
          answer: q.expected_answer || "Detailed technical answer.",
          subject: aiSubject,
          difficulty: aiDifficulty,
          companies: q.company ? [q.company.toLowerCase()] : []
        });
      }

      setIsAIModalOpen(false);
    } catch (err: any) {
      console.error("AI Technical Question Generation error:", err);
      setGenerationError(err.message || "Failed to generate AI questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formSubject, setFormSubject] = useState("DBMS");
  const [formDifficulty, setFormDifficulty] = useState("Medium");
  const [formCompanies, setFormCompanies] = useState("");

  // Filter list
  const filteredQs = technicalQs.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = activeSubject === "All" || q.subject === activeSubject || 
      (activeSubject === "Operating System" && q.subject === "Operating System") ||
      (activeSubject === "Computer Networks" && q.subject === "Computer Networks");
    const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const openAddModal = () => {
    setFormQuestion("");
    setFormAnswer("");
    setFormSubject(activeSubject !== "All" ? activeSubject : "DBMS");
    setFormDifficulty("Medium");
    setFormCompanies("");
    setModalType("add");
  };

  const openEditModal = (q: TechnicalQuestion) => {
    setSelectedQ(q);
    setFormQuestion(q.question);
    setFormAnswer(q.answer);
    setFormSubject(q.subject);
    setFormDifficulty(q.difficulty);
    setFormCompanies(q.companies.join(", "));
    setModalType("edit");
  };

  const openPreviewModal = (q: TechnicalQuestion) => {
    setSelectedQ(q);
    setModalType("preview");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion || !formAnswer) return;

    addTechnicalQ({
      question: formQuestion,
      answer: formAnswer,
      subject: formSubject,
      difficulty: formDifficulty,
      companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
    });
    setModalType(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQ || !formQuestion || !formAnswer) return;

    editTechnicalQ(selectedQ.id, {
      question: formQuestion,
      answer: formAnswer,
      subject: formSubject,
      difficulty: formDifficulty,
      companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
    });
    setModalType(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this technical question?")) {
      deleteTechnicalQ(id);
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-50 text-green-750 dark:bg-green-950/20 dark:text-green-400 border-green-200/50 dark:border-green-900/30",
    Medium: "bg-amber-50 text-amber-750 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
    Hard: "bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
    Expert: "bg-purple-50 text-purple-750 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30",
  };

  return (
    <div className="space-y-6">
      {/* Subjects Selection Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit max-w-full">
        <button
          onClick={() => setActiveSubject("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubject === "All"
              ? "bg-white dark:bg-zinc-950 text-violet-600 dark:text-violet-400 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          All Subjects
        </button>
        {SUBJECTS.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubject === sub
                ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {sub}
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
            placeholder={`Search ${activeSubject === "All" ? "technical" : activeSubject} questions...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <Button 
            onClick={() => setIsAIModalOpen(true)} 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 gap-1.5 border-violet-300 dark:border-violet-850 text-violet-655 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-955/20 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" /> AI Generator
          </Button>

          <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ml-auto md:ml-0">
            <Plus className="h-4 w-4" /> Add Technical Q
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
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Companies</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
              {filteredQs.length > 0 ? (
                filteredQs.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-150 line-clamp-1">
                        {q.question}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                      {q.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyColors[q.difficulty] || "bg-zinc-100 text-zinc-700"}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-500 capitalize">
                      {q.companies.join(", ") || "General"}
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">
                    No technical questions found in this category.
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
                  <Database className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Add Technical Question"}
                  {modalType === "edit" && "Edit Technical Question"}
                  {modalType === "preview" && "Technical Question Model Answer"}
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
                      Subject: {selectedQ.subject}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyColors[selectedQ.difficulty] || "bg-zinc-100"}`}>
                      {selectedQ.difficulty}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-base leading-relaxed">
                      {selectedQ.question}
                    </h4>

                    {/* Model Answer Card */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Terminal className="h-4 w-4 text-violet-500" /> Ideal Model Answer
                      </h5>
                      <div className="p-5 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-zinc-800 shadow-inner">
                        {selectedQ.answer}
                      </div>
                    </div>
                  </div>

                  {/* Metadata footer */}
                  <div className="text-xs text-zinc-500 flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <span>ID: tech-q-{selectedQ.id}</span>
                    <span>Mapped to: {selectedQ.companies.join(", ") || "General"}</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">
                      Close Answer
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    
                    {/* Subject & Difficulty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">CS Subject Area</label>
                        <select
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          {SUBJECTS.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty Level</label>
                        <select
                          value={formDifficulty}
                          onChange={(e) => setFormDifficulty(e.target.value)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
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
                        placeholder="e.g. What is the difference between processes and threads?"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
                      />
                    </div>

                    {/* Model Answer */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Terminal className="h-4 w-4 text-violet-500" /> Model Answer
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formAnswer}
                        onChange={(e) => setFormAnswer(e.target.value)}
                        placeholder="Write model answer code/text to display to students..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 text-zinc-900 dark:text-zinc-150 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner font-mono text-xs resize-none"
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
                      <Check className="h-4 w-4" /> Save Question
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
                  AI Technical Question Generator
                </h3>
                <button 
                  onClick={() => !isGenerating && setIsAIModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-455 dark:text-zinc-550 cursor-pointer"
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

                  {/* Subject Area */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">CS Subject Area</label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      disabled={isGenerating}
                    >
                      {SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

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
                        <option value="Expert">Expert</option>
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
