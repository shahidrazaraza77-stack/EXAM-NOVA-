"use client";

import React, { useState } from "react";
import { useAdmin, MockTest } from "@/context/AdminContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  Check,
  FileText,
  Clock,
  HelpCircle,
  Building,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MockTestsView() {
  const { mockTests, addMockTest, editMockTest, deleteMockTest, companies } = useAdmin();

  // AI Generator states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiTestType, setAiTestType] = useState<"aptitude" | "coding" | "interview">("aptitude");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Expert">("Medium");
  const [aiDuration, setAiDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTitle.trim()) {
      setAiError("Please provide a title for the mock test.");
      return;
    }
    
    setIsGenerating(true);
    setAiError(null);
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
          module: "mock-test",
          title: aiTitle,
          testType: aiTestType,
          difficulty: aiDifficulty,
          durationMinutes: aiDuration
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      const payload = await res.json();
      const generatedTest = payload?.data?.bank;
      if (generatedTest) {
        addMockTest({
          title: generatedTest.title,
          duration: generatedTest.duration_minutes || aiDuration,
          questionCount: Array.isArray(generatedTest.questions) ? generatedTest.questions.length : 20,
          difficulty: generatedTest.difficulty || aiDifficulty,
          type: generatedTest.test_type === "aptitude" ? "Aptitude" : generatedTest.test_type === "coding" ? "Coding" : "Company",
          targetCompany: generatedTest.test_type === "interview" ? "General" : undefined
        });
      }

      setIsAIModalOpen(false);
      setAiTitle("");
    } catch (err: any) {
      console.error("AI Mock Test Generation error:", err);
      setAiError(err.message || "Failed to generate AI Mock Test.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"edit" | "add" | null>(null);
  const [selectedT, setSelectedT] = useState<MockTest | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formQuestionCount, setFormQuestionCount] = useState<number>(20);
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Expert">("Medium");
  const [formType, setFormType] = useState<"Aptitude" | "Coding" | "Company">("Aptitude");
  const [formTargetCompany, setFormTargetCompany] = useState("");

  // Filter list
  const filteredTests = mockTests.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.targetCompany && t.targetCompany.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "All" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const openAddModal = () => {
    setFormTitle("");
    setFormDuration(60);
    setFormQuestionCount(30);
    setFormDifficulty("Medium");
    setFormType("Aptitude");
    setFormTargetCompany("");
    setModalType("add");
  };

  const openEditModal = (t: MockTest) => {
    setSelectedT(t);
    setFormTitle(t.title);
    setFormDuration(t.duration);
    setFormQuestionCount(t.questionCount);
    setFormDifficulty(t.difficulty);
    setFormType(t.type);
    setFormTargetCompany(t.targetCompany || "");
    setModalType("edit");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || formDuration <= 0 || formQuestionCount <= 0) return;

    addMockTest({
      title: formTitle,
      duration: formDuration,
      questionCount: formQuestionCount,
      difficulty: formDifficulty,
      type: formType,
      targetCompany: formType === "Company" ? formTargetCompany : undefined
    });
    setModalType(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedT || !formTitle || formDuration <= 0 || formQuestionCount <= 0) return;

    editMockTest(selectedT.id, {
      title: formTitle,
      duration: formDuration,
      questionCount: formQuestionCount,
      difficulty: formDifficulty,
      type: formType,
      targetCompany: formType === "Company" ? formTargetCompany : undefined
    });
    setModalType(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this mock test paper?")) {
      deleteMockTest(id);
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200/50 dark:border-green-900/30",
    Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
    Hard: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
    Expert: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30",
  };

  const typeBadgeColors: Record<string, string> = {
    Aptitude: "bg-blue-50 text-blue-750 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200/30",
    Coding: "bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/30",
    Company: "bg-violet-50 text-violet-750 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200/30"
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search test paper title or company..." 
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="Aptitude">Aptitude Tests</option>
              <option value="Coding">Coding Tests</option>
              <option value="Company">Company Specific Tests</option>
            </select>
          </div>

          <button onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2 px-4 h-10 bg-violet-50 dark:bg-violet-950/30 text-violet-750 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-sm font-semibold rounded-xl hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-all cursor-pointer">
            <Sparkles className="h-4 w-4 text-violet-500" /> AI Generator
          </button>
          <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ml-auto md:ml-0">
            <Plus className="h-4 w-4" /> Create Mock Test
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <Card key={test.id} className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${typeBadgeColors[test.type]}`}>
                    {test.type}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${difficultyColors[test.difficulty]}`}>
                    {test.difficulty}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base group-hover:text-violet-650 dark:group-hover:text-violet-400 transition-colors">
                    {test.title}
                  </h4>
                  {test.type === "Company" && test.targetCompany && (
                    <p className="text-xs text-zinc-500 font-bold flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" /> Mapped to: <span className="capitalize">{test.targetCompany}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span>Duration: {test.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-zinc-400" />
                    <span>{test.questionCount} Questions</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-5">
                <button 
                  onClick={() => openEditModal(test)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-150 dark:hover:bg-zinc-850/50 transition-colors cursor-pointer"
                  title="Edit Test Paper"
                >
                  <Edit3 className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={() => handleDelete(test.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  title="Delete Test Paper"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            No mock tests listed matching your filter. Click &ldquo;Create Mock Test&rdquo; to add one.
          </div>
        )}
      </div>

      {/* CRUD MODAL */}
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
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Create Mock Test Paper"}
                  {modalType === "edit" && "Edit Mock Test Details"}
                </h3>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                <div className="p-6 space-y-4">
                  {/* Test Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Test Paper Title</label>
                    <input 
                      type="text" 
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. TCS Quantitative Reasoning Paper"
                      className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Test Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Test Scope</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      >
                        <option value="Aptitude">Aptitude Test</option>
                        <option value="Coding">Coding Test</option>
                        <option value="Company">Company Test</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty Level</label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value as any)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Company (Visible only for Company Tests) */}
                  {formType === "Company" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target Company Mapping</label>
                      <select
                        value={formTargetCompany}
                        onChange={(e) => setFormTargetCompany(e.target.value)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 outline-none focus:border-violet-500 transition-all font-semibold"
                      >
                        <option value="">Choose Company...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration (Minutes)</label>
                      <input 
                        type="number" 
                        required
                        min={5}
                        max={300}
                        value={formDuration}
                        onChange={(e) => setFormDuration(parseInt(e.target.value))}
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                      />
                    </div>

                    {/* Question Count */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No. of Questions</label>
                      <input 
                        type="number" 
                        required
                        min={1}
                        max={100}
                        value={formQuestionCount}
                        onChange={(e) => setFormQuestionCount(parseInt(e.target.value))}
                        className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                      />
                    </div>
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
                    <Check className="h-4 w-4" /> Save Mock Paper
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIModalOpen(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI Mock Test Generator
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Auto-generate a placement mock test with questions</p>
                </div>
                <button 
                  onClick={() => setIsAIModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {aiError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{aiError}</span>
                </div>
              )}

              <form onSubmit={handleAIGenerate}>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Test Paper Title</label>
                    <input 
                      type="text" 
                      required
                      value={aiTitle}
                      onChange={(e) => setAiTitle(e.target.value)}
                      placeholder="e.g. Google Intermediate Coding Mock Exam"
                      className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Test Type</label>
                      <select
                        value={aiTestType}
                        onChange={(e) => setAiTestType(e.target.value as any)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      >
                        <option value="aptitude">Aptitude Test</option>
                        <option value="coding">Coding Test</option>
                        <option value="interview">Interview Test</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty Level</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      required
                      min={5}
                      max={300}
                      value={aiDuration}
                      onChange={(e) => setAiDuration(parseInt(e.target.value) || 60)}
                      className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    onClick={() => setIsAIModalOpen(false)} 
                    variant="secondary" 
                    className="text-xs h-9 px-4"
                  >
                    Cancel
                  </Button>
                  <button 
                    type="submit" 
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-xs h-9 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-violet-600/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Generate Mock Test
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
