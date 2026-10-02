"use client";

import React, { useState, useEffect } from "react";
import { FrontendQuestion, aptitudeService } from "@/services/aptitude";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  X,
  Check,
  Brain,
  HelpCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
const indexToLetter = ["A", "B", "C", "D"];

export default function AptitudeQuestionsView() {
  // Database states
  const [questions, setQuestions] = useState<FrontendQuestion[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"preview" | "edit" | "add" | null>(null);
  const [selectedQ, setSelectedQ] = useState<FrontendQuestion | null>(null);

  // AI Generator states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("Probability");
  const [aiSubtopic, setAiSubtopic] = useState("Permutations");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
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
          module: "aptitude",
          topic: aiTopic,
          subtopic: aiSubtopic,
          difficulty: aiDifficulty,
          count: aiCount
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      setIsAIModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setError(err.message || "Failed to generate AI questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [formCompanies, setFormCompanies] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedQuestions, fetchedTopics] = await Promise.all([
        aptitudeService.getQuestions({}),
        aptitudeService.getTopics()
      ]);
      setQuestions(fetchedQuestions);
      setTopics(fetchedTopics);
    } catch (err: any) {
      console.error("Error loading admin aptitude data:", err);
      setError(err.message || "Failed to load database content.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter list
  const filteredQs = questions.filter((q) => {
    const matchesSearch = 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === "All" || q.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const openAddModal = () => {
    setFormQuestion("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer(0);
    setFormExplanation("");
    setFormTopicId(topics.length > 0 ? topics[0].id : "");
    setFormDifficulty("Medium");
    setFormCompanies("");
    setModalType("add");
  };

  const openEditModal = (q: FrontendQuestion) => {
    setSelectedQ(q);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation);
    setFormTopicId(q.topic_id);
    setFormDifficulty(q.difficulty);
    setFormCompanies(q.companies.join(", "));
    setModalType("edit");
  };

  const openPreviewModal = (q: FrontendQuestion) => {
    setSelectedQ(q);
    setModalType("preview");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion || !formTopicId || formOptions.some(o => !o.trim())) return;

    setIsSubmitting(true);
    try {
      const newQuestion = {
        topic_id: formTopicId,
        question: formQuestion,
        option_a: formOptions[0],
        option_b: formOptions[1],
        option_c: formOptions[2],
        option_d: formOptions[3],
        correct_answer: indexToLetter[formCorrectAnswer] || "A",
        explanation: formExplanation,
        difficulty: formDifficulty,
        companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
      };

      await (aptitudeService.adminAddQuestion as any)(newQuestion);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      alert("Error adding question: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQ || !formQuestion || !formTopicId || formOptions.some(o => !o.trim())) return;

    setIsSubmitting(true);
    try {
      const updates = {
        topic_id: formTopicId,
        question: formQuestion,
        option_a: formOptions[0],
        option_b: formOptions[1],
        option_c: formOptions[2],
        option_d: formOptions[3],
        correct_answer: indexToLetter[formCorrectAnswer] || "A",
        explanation: formExplanation,
        difficulty: formDifficulty,
        companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean)
      };

      await aptitudeService.adminEditQuestion(selectedQ.id, updates);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      alert("Error saving question: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this aptitude question?")) {
      try {
        await aptitudeService.adminDeleteQuestion(id);
        await loadData();
      } catch (err: any) {
        alert("Error deleting question: " + err.message);
      }
    }
  };

  const updateOption = (idx: number, val: string) => {
    const updated = [...formOptions];
    updated[idx] = val;
    setFormOptions(updated);
  };

  const difficultyBadgeColors: Record<string, string> = {
    Easy: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200/50 dark:border-green-900/30",
    Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
    Hard: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={loadData} className="ml-auto underline font-semibold hover:text-aurora-danger">Retry</button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search questions or topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="quantitative">Quantitative</option>
              <option value="logical">Logical Reasoning</option>
              <option value="verbal">Verbal Ability</option>
              <option value="data-interpretation">Data Interpretation</option>
            </select>
            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
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
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      {/* Questions List Card */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Question Details</th>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                      <span>Loading aptitude questions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredQs.length > 0 ? (
                filteredQs.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-150 line-clamp-1">
                          {q.question}
                        </span>
                        <span className="text-xs text-zinc-400 mt-0.5 capitalize truncate">
                          Companies: {q.companies.join(", ") || "None"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {q.topic}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 capitalize">
                      {q.category.replace("-", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyBadgeColors[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
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
                    No aptitude questions found matching your filter criteria.
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
              onClick={() => !isSubmitting && setModalType(null)}
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
                  <Brain className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Add Aptitude Question"}
                  {modalType === "edit" && "Edit Aptitude Question"}
                  {modalType === "preview" && "Aptitude Question Preview"}
                </h3>
                <button 
                  onClick={() => !isSubmitting && setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview Content */}
              {modalType === "preview" && selectedQ && (
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 capitalize bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      Category: {selectedQ.category.replace("-", " ")}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyBadgeColors[selectedQ.difficulty]}`}>
                      {selectedQ.difficulty}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-relaxed">
                      {selectedQ.question}
                    </h4>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {selectedQ.options.map((opt, idx) => {
                        const isCorrect = idx === selectedQ.correctAnswer;
                        return (
                          <div 
                            key={idx} 
                            className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2.5 ${
                              isCorrect 
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500" 
                                : "bg-zinc-50 border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              isCorrect 
                                ? "bg-emerald-500 text-white" 
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                            {isCorrect && <Check className="h-4.5 w-4.5 ml-auto text-emerald-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation card */}
                  <div className="p-4 rounded-xl bg-violet-50/40 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/30 space-y-2">
                    <h5 className="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Explanation & Rationale
                    </h5>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {selectedQ.explanation || "No explanation provided for this question."}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">
                      Close Preview
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    
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
                        placeholder="Enter the question text here..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
                      />
                    </div>

                    {/* Options A & B */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formOptions.map((opt, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Option {String.fromCharCode(65 + idx)}
                          </label>
                          <input 
                            type="text" 
                            required
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                            className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Correct Option */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Correct Answer</label>
                        <select
                          value={formCorrectAnswer}
                          onChange={(e) => setFormCorrectAnswer(parseInt(e.target.value))}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>

                      {/* Topic */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Topic</label>
                        <select
                          required
                          value={formTopicId}
                          onChange={(e) => setFormTopicId(e.target.value)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="" disabled>Select a Topic</option>
                          {topics.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.category.replace("-", " ")})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Difficulty */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</label>
                        <select
                          value={formDifficulty}
                          onChange={(e) => setFormDifficulty(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      {/* Companies Mapped */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Companies Mapped</label>
                        <input 
                          type="text" 
                          value={formCompanies}
                          onChange={(e) => setFormCompanies(e.target.value)}
                          placeholder="e.g. tcs, amazon, google (comma-separated)"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Explanation</label>
                      <textarea
                        rows={3}
                        value={formExplanation}
                        onChange={(e) => setFormExplanation(e.target.value)}
                        placeholder="Provide steps/reasoning to solve the question..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
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
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="text-xs h-9 px-4 gap-1.5"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Save Question
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
                  AI Question Generator
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
                  {/* Topic */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Topic</label>
                    <input 
                      type="text" 
                      required
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Probability, Ratios, Speed"
                      className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Subtopic */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subtopic</label>
                    <input 
                      type="text" 
                      required
                      value={aiSubtopic}
                      onChange={(e) => setAiSubtopic(e.target.value)}
                      placeholder="e.g. Permutations, Coins, Percentages"
                      className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      disabled={isGenerating}
                    />
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
                      </select>
                    </div>

                    {/* Count */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Questions Count</label>
                      <input 
                        type="number" 
                        required
                        min={1}
                        max={20}
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
