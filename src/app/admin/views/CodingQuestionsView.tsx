"use client";

import React, { useState, useEffect } from "react";
import { codingService, FrontendCodingProblem } from "@/services/coding";
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
  Code2,
  PlusCircle,
  MinusCircle,
  Brackets,
  Zap,
  Info,
  Sparkles,
  Loader2,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CodingQuestionsView() {
  const [codingQuestions, setCodingQuestions] = useState<FrontendCodingProblem[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Switch between Active Student Questions vs. Admin Problem Bank/Drafts vs Contests
  const [activeTab, setActiveTab] = useState<"published" | "bank" | "contests">("published");
  const [bankProblems, setBankProblems] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);

  // Contests state
  const [contests, setContests] = useState<any[]>([]);
  const [contestModalOpen, setContestModalOpen] = useState(false);
  const [contestForm, setContestForm] = useState({
    title: "",
    description: "",
    rules: "",
    start_time: "",
    end_time: "",
    is_rated: false,
    max_participants: "",
    problem_ids: [] as string[],
  });
  const [contestSaving, setContestSaving] = useState(false);
  const [contestError, setContestError] = useState<string | null>(null);
  const [availableProblems, setAvailableProblems] = useState<any[]>([]);
  const [contestEditId, setContestEditId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"preview" | "edit" | "add" | null>(null);
  const [selectedQ, setSelectedQ] = useState<any | null>(null);

  // AI Generator states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("Arrays");
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Medium");
  const [aiCount, setAiCount] = useState(5);
  const [aiMode, setAiMode] = useState<"single" | "multi" | "company" | "mixed">("single");
  const [aiSelectedTopics, setAiSelectedTopics] = useState<string[]>([]);
  const [aiSelectedCompanies, setAiSelectedCompanies] = useState<string[]>([]);
  const [aiEasyCount, setAiEasyCount] = useState(1);
  const [aiMediumCount, setAiMediumCount] = useState(2);
  const [aiHardCount, setAiHardCount] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [formDescription, setFormDescription] = useState("");
  const [formConstraints, setFormConstraints] = useState<string[]>([""]);
  const [formExamples, setFormExamples] = useState<Array<{ input: string; output: string; explanation?: string }>>([
    { input: "", output: "", explanation: "" }
  ]);
  const [formTags, setFormTags] = useState("");
  const [formCompanies, setFormCompanies] = useState("");
  const [formTimeComplexity, setFormTimeComplexity] = useState("O(N)");
  const [formSpaceComplexity, setFormSpaceComplexity] = useState("O(1)");

  // Bank Specific Form states
  const [formEditorialApproach, setFormEditorialApproach] = useState("");
  const [formEditorialExplanation, setFormEditorialExplanation] = useState("");
  const [formHiddenTestcases, setFormHiddenTestcases] = useState<Array<{ input: string; output: string }>>([
    { input: "", output: "" }
  ]);
  const [formSelectedTopics, setFormSelectedTopics] = useState<string[]>([]);
  const [formSelectedCompanies, setFormSelectedCompanies] = useState<string[]>([]);

  // Tab within preview modal
  const [previewTab, setPreviewTab] = useState<"desc" | "code" | "editorial" | "tests">("desc");
  const [previewLang, setPreviewLang] = useState<string>("Python");

  // Fetch from database on mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [questions, topics, bankRows, companiesData, contestsData] = await Promise.all([
        codingService.getProblems({}),
        codingService.getTopics(),
        codingService.getBankProblems(),
        (supabase.from("companies") as any).select("id, name"),
        fetch("/api/coding/contests").then(r => r.json()).catch(() => ({ contests: [] })),
      ]);
      setCodingQuestions(questions);
      setTopicsList(topics);
      setBankProblems(bankRows);
      setAvailableProblems(questions);
      if (companiesData && companiesData.data) {
        setCompaniesList(companiesData.data);
      }
      setContests(contestsData.contests || []);
    } catch (err) {
      console.error("Error loading admin coding data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      const reqBody: any = {
        module: "coding",
        mode: aiMode,
        count: aiCount
      };

      if (aiMode === "single") {
        reqBody.topics = [aiTopic];
        reqBody.difficulty = aiDifficulty;
      } else if (aiMode === "multi") {
        reqBody.topics = aiSelectedTopics.length > 0 ? aiSelectedTopics : [aiTopic];
        reqBody.difficulty = aiDifficulty;
      } else if (aiMode === "company") {
        reqBody.topics = aiSelectedTopics.length > 0 ? aiSelectedTopics : [aiTopic];
        reqBody.companies = aiSelectedCompanies.length > 0 ? aiSelectedCompanies : ["General"];
        reqBody.difficulty = aiDifficulty;
      } else if (aiMode === "mixed") {
        reqBody.topics = aiSelectedTopics.length > 0 ? aiSelectedTopics : [aiTopic];
        reqBody.companies = aiSelectedCompanies.length > 0 ? aiSelectedCompanies : ["General"];
        reqBody.difficulty = "Mixed";
        reqBody.distribution = {
          Easy: aiEasyCount,
          Medium: aiMediumCount,
          Hard: aiHardCount
        };
        reqBody.count = aiEasyCount + aiMediumCount + aiHardCount;
      }

      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers,
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      setIsAIModalOpen(false);
      setActiveTab("bank");
      await loadData();
    } catch (err: any) {
      console.error("AI Coding Generation error:", err);
      setGenerationError(err.message || "Failed to generate AI coding problems.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openAddModal = () => {
    setFormTitle("");
    setFormTopicId("");
    setFormDifficulty("Medium");
    setFormDescription("");
    setFormConstraints([""]);
    setFormExamples([{ input: "", output: "", explanation: "" }]);
    setFormTags("");
    setFormCompanies("");
    setFormTimeComplexity("O(N)");
    setFormSpaceComplexity("O(1)");

    setFormEditorialApproach("");
    setFormEditorialExplanation("");
    setFormHiddenTestcases([{ input: "", output: "" }]);
    setFormSelectedTopics([]);
    setFormSelectedCompanies([]);

    setModalType("add");
  };

  const openEditModal = (q: any) => {
    setSelectedQ(q);
    setFormTitle(q.title);
    setFormTopicId(q.topic_id || "");
    setFormDifficulty(q.difficulty);
    setFormDescription(q.description);
    setFormConstraints(q.constraints?.length > 0 ? [...q.constraints] : [""]);
    setFormExamples(q.examples?.length > 0 ? q.examples.map((ex: any) => ({ ...ex })) : [{ input: "", output: "", explanation: "" }]);
    setFormTags(q.tags?.join(", ") || q.topics?.join(", ") || "");
    setFormCompanies(q.companies?.join(", ") || q.company_tags?.join(", ") || "");
    setFormTimeComplexity(q.complexity?.time || q.editorial?.time_complexity || "O(N)");
    setFormSpaceComplexity(q.complexity?.space || q.editorial?.space_complexity || "O(1)");

    setFormEditorialApproach(q.editorial?.approach || "");
    setFormEditorialExplanation(q.editorial?.solution_explanation || "");
    setFormHiddenTestcases(q.hidden_testcases?.length > 0 ? q.hidden_testcases.map((t: any) => ({ ...t })) : [{ input: "", output: "" }]);
    setFormSelectedTopics(q.topics || (q.topic ? [q.topic] : []));
    setFormSelectedCompanies(q.company_tags || q.companies || []);

    setModalType("edit");
  };

  const openPreviewModal = (q: any) => {
    setSelectedQ(q);
    setPreviewTab("desc");
    const boilerplates = q.starter_code || q.boilerplates || {};
    const langs = Object.keys(boilerplates);
    setPreviewLang(langs.length > 0 ? langs[0] : "Python");
    setModalType("preview");
  };

  const handleApprove = async (id: string) => {
    try {
      await codingService.updateBankProblem(id, { status: "approved" });
      await loadData();
    } catch (err) {
      console.error("Error approving problem:", err);
      alert("Failed to approve problem.");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await codingService.publishBankProblem(id);
      await loadData();
      alert("Problem published successfully! It is now visible to students.");
    } catch (err) {
      console.error("Error publishing problem:", err);
      alert("Failed to publish problem.");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription) return;

    if (activeTab === "bank") {
      try {
        await codingService.createBankProblem({
          title: formTitle,
          slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: formDescription,
          difficulty: formDifficulty,
          constraints: formConstraints.filter(Boolean),
          examples: formExamples.filter(ex => ex.input && ex.output),
          hidden_testcases: formHiddenTestcases.filter(tc => tc.input && tc.output),
          starter_code: {
            python: "class Solution:\n    def solve(self):\n        pass",
            javascript: "function solve() {\n    \n}",
            java: "class Solution {\n    public void solve() {\n        \n    }\n}",
            cpp: "class Solution {\npublic:\n    void solve() {\n        \n    }\n};"
          },
          editorial: {
            approach: formEditorialApproach,
            time_complexity: formTimeComplexity,
            space_complexity: formSpaceComplexity,
            solution_explanation: formEditorialExplanation
          },
          topics: formSelectedTopics,
          company_tags: formSelectedCompanies
        });

        setModalType(null);
        await loadData();
      } catch (err) {
        console.error("Error creating bank problem:", err);
        alert("Failed to add problem to bank.");
      }
    } else {
      if (!formTopicId) {
        alert("Please select a topic.");
        return;
      }
      const targetTopic = topicsList.find(t => t.id === formTopicId);
      const tagsArr = formTags ? formTags.split(",").map(t => t.trim()).filter(Boolean) : [targetTopic?.name || "Arrays"];

      const id = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const boilerplates = {
        Python: "class Solution:\n    def solve(self):\n        pass",
        Java: "class Solution {\n    public void solve() {\n        \n    }\n}",
        "C++": "class Solution {\npublic:\n    void solve() {\n        \n    }\n};",
        JavaScript: "function solve() {\n    \n}"
      };
      const optimalSolutions = {
        Python: `# Time: ${formTimeComplexity}\n# Space: ${formSpaceComplexity}\nclass Solution:\n    def solve(self):\n        # Return correct solution here`,
        Java: `// Time: ${formTimeComplexity}\n// Space: ${formSpaceComplexity}\nclass Solution {\n    public void solve() {\n        // Return correct solution here\n    }\n}`,
        "C++": `// Time: ${formTimeComplexity}\n// Space: ${formSpaceComplexity}\nclass Solution {\npublic:\n    void solve() {\n        // Return correct solution here\n    }\n};`,
        JavaScript: `// Time: ${formTimeComplexity}\n// Space: ${formSpaceComplexity}\nfunction solve() {\n    // Return correct solution here\n}`
      };

      try {
        await codingService.adminAddQuestion({
          title: formTitle,
          slug: id,
          topic_id: formTopicId,
          difficulty: formDifficulty,
          description: formDescription,
          constraints: formConstraints.filter(Boolean),
          sample_input: formExamples[0]?.input || "",
          sample_output: formExamples[0]?.output || "",
          explanation: "Optimal runtime logic review.",
          companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean),
          starter_code: boilerplates,
          optimal_solutions: optimalSolutions,
          complexity: { time: formTimeComplexity, space: formSpaceComplexity },
          examples: formExamples.filter(ex => ex.input && ex.output),
          acceptance_rate: "50.0%"
        } as any);

        setModalType(null);
        await loadData();
      } catch (err) {
        console.error("Error creating question:", err);
        alert("Failed to add question to database.");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQ || !formTitle || !formDescription) return;

    if (activeTab === "bank") {
      try {
        await codingService.updateBankProblem(selectedQ.id, {
          title: formTitle,
          slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: formDescription,
          difficulty: formDifficulty,
          constraints: formConstraints.filter(Boolean),
          examples: formExamples.filter(ex => ex.input && ex.output),
          hidden_testcases: formHiddenTestcases.filter(tc => tc.input && tc.output),
          editorial: {
            approach: formEditorialApproach,
            time_complexity: formTimeComplexity,
            space_complexity: formSpaceComplexity,
            solution_explanation: formEditorialExplanation
          },
          topics: formSelectedTopics,
          company_tags: formSelectedCompanies
        });

        setModalType(null);
        await loadData();
      } catch (err) {
        console.error("Error editing bank problem:", err);
        alert("Failed to save changes to bank.");
      }
    } else {
      if (!formTopicId) {
        alert("Please select a topic.");
        return;
      }
      try {
        await codingService.adminEditQuestion(selectedQ.id, {
          title: formTitle,
          topic_id: formTopicId,
          difficulty: formDifficulty,
          description: formDescription,
          constraints: formConstraints.filter(Boolean),
          sample_input: formExamples[0]?.input || "",
          sample_output: formExamples[0]?.output || "",
          companies: formCompanies.split(",").map(c => c.trim().toLowerCase()).filter(Boolean),
          complexity: { time: formTimeComplexity, space: formSpaceComplexity },
          examples: formExamples.filter(ex => ex.input && ex.output)
        } as any);

        setModalType(null);
        await loadData();
      } catch (err) {
        console.error("Error editing question:", err);
        alert("Failed to save changes.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const term = activeTab === "bank" ? "draft problem" : "coding problem";
    if (confirm(`Are you sure you want to delete this ${term}?`)) {
      try {
        if (activeTab === "bank") {
          await codingService.deleteBankProblem(id);
        } else {
          await codingService.adminDeleteQuestion(id);
        }
        await loadData();
      } catch (err) {
        console.error("Error deleting problem:", err);
        alert("Failed to delete problem.");
      }
    }
  };

  // Dynamic constraints list
  const addConstraint = () => setFormConstraints([...formConstraints, ""]);
  const removeConstraint = (idx: number) => setFormConstraints(formConstraints.filter((_, i) => i !== idx));
  const updateConstraint = (idx: number, val: string) => {
    const updated = [...formConstraints];
    updated[idx] = val;
    setFormConstraints(updated);
  };

  // Dynamic examples list
  const addExample = () => setFormExamples([...formExamples, { input: "", output: "", explanation: "" }]);
  const removeExample = (idx: number) => setFormExamples(formExamples.filter((_, i) => i !== idx));
  const updateExample = (idx: number, key: "input" | "output" | "explanation", val: string) => {
    const updated = [...formExamples];
    updated[idx][key] = val;
    setFormExamples(updated);
  };

  // Dynamic hidden testcases list
  const addHiddenTestcase = () => setFormHiddenTestcases([...formHiddenTestcases, { input: "", output: "" }]);
  const removeHiddenTestcase = (idx: number) => setFormHiddenTestcases(formHiddenTestcases.filter((_, i) => i !== idx));
  const updateHiddenTestcase = (idx: number, key: "input" | "output", val: string) => {
    const updated = [...formHiddenTestcases];
    updated[idx][key] = val;
    setFormHiddenTestcases(updated);
  };

  // Filter list of active coding problems
  const filteredQs = codingQuestions.filter((q) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Filter list of bank problems
  const filteredBank = bankProblems.filter((q) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topics || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const difficultyBadgeColors: Record<string, string> = {
    Easy: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200/50 dark:border-green-900/30",
    Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
    Hard: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-150">
      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("published")}
          className={`px-5 py-3 text-sm font-extrabold border-b-2 cursor-pointer transition-all ${
            activeTab === "published"
              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-805 dark:hover:text-zinc-300"
          }`}
        >
          Published Questions
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={`px-5 py-3 text-sm font-extrabold border-b-2 cursor-pointer transition-all ${
            activeTab === "bank"
              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-805 dark:hover:text-zinc-300"
          }`}
        >
          AI Problem Bank & Drafts
        </button>
        <button
          onClick={() => setActiveTab("contests")}
          className={`px-5 py-3 text-sm font-extrabold border-b-2 cursor-pointer transition-all ${
            activeTab === "contests"
              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-805 dark:hover:text-zinc-300"
          }`}
        >
          🏆 Contests
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder={activeTab === "bank" ? "Search drafts or topics..." : "Search problems or topics..."}
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
            <Plus className="h-4 w-4" /> Add Problem
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === "published" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-650 border-t-transparent animate-spin rounded-full" />
                        <span>Loading coding questions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredQs.length > 0 ? (
                  filteredQs.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-150 truncate">
                            {q.title}
                          </span>
                          <span className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5 capitalize truncate">
                            Companies: {q.companies.join(", ") || "None"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300">
                        {q.topic}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyBadgeColors[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px] sm:max-w-none">
                          {q.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              {tag}
                            </span>
                          ))}
                          {q.tags.length > 3 && (
                            <span className="text-[10px] font-bold text-zinc-455 self-center">+{q.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openPreviewModal(q)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-zinc-105 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Preview Coding problem"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(q)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-105 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit coding problem"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            title="Delete Coding problem"
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
                      No coding problems found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Topics</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-650 border-t-transparent animate-spin rounded-full" />
                        <span>Loading drafts and problem bank...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBank.length > 0 ? (
                  filteredBank.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-150 truncate">
                            {q.title}
                          </span>
                          <span className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5 capitalize truncate">
                            Companies: {q.company_tags?.join(", ") || "General"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {(q.topics || []).slice(0, 2).map((top: string) => (
                            <span key={top} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
                              {top}
                            </span>
                          ))}
                          {(q.topics || []).length > 2 && (
                            <span className="text-[10px] text-zinc-400 self-center">+{q.topics.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyBadgeColors[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          q.is_ai_generated 
                            ? "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400"
                        }`}>
                          {q.is_ai_generated ? "AI Generated" : "Manual"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wide text-[10px] ${
                          q.status === "published"
                            ? "bg-green-50 text-green-700 border-green-200/60 dark:bg-green-950/20 dark:text-green-400"
                            : q.status === "approved"
                            ? "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400"
                            : "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}>
                          {q.status || "draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openPreviewModal(q)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-zinc-105 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Preview Problem"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(q)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-105 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit Problem Draft"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          {q.status === "draft" && (
                            <button 
                              onClick={() => handleApprove(q.id)}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors cursor-pointer"
                              title="Approve Problem"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {q.status !== "published" && (
                            <button 
                              onClick={() => handlePublish(q.id)}
                              className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-955/20 transition-colors cursor-pointer"
                              title="Publish to Student Portal"
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            title="Delete Problem"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-zinc-500">
                      No problems in the bank. Click &ldquo;AI Generator&rdquo; or &ldquo;Add Problem&rdquo; to seed drafts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* CONTESTS TAB PANEL */}
          {activeTab === "contests" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">All Coding Contests</h3>
                <button
                  onClick={() => {
                    setContestEditId(null);
                    setContestForm({ title: "", description: "", rules: "", start_time: "", end_time: "", is_rated: false, max_participants: "", problem_ids: [] });
                    setContestError(null);
                    setContestModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Contest
                </button>
              </div>

              {contests.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No contests created yet.</p>
                  <p className="text-sm mt-1">Click "Create Contest" to set one up for students.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contests.map((c: any) => {
                    const statusColors: Record<string, string> = {
                      active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                      upcoming: "bg-amber-500/10 text-amber-600 border-amber-500/30",
                      ended: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
                    };
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[c.status] || statusColors.ended}`}>
                              {c.status}
                            </span>
                            {c.is_rated && <span className="text-xs text-amber-400">⭐ Rated</span>}
                          </div>
                          <h4 className="font-bold text-zinc-900 dark:text-white truncate">{c.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {new Date(c.start_time).toLocaleString()} → {new Date(c.end_time).toLocaleString()}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {c.problem_count} problems · {c.participant_count} participants
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete contest "${c.title}"?`)) {
                              await fetch(`/api/coding/contests/${c.id}`, { method: "DELETE" });
                              await loadData();
                            }
                          }}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Create Contest Modal */}
              {contestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setContestModalOpen(false)} />
                  <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <h3 className="font-extrabold text-zinc-900 dark:text-white">Create New Contest</h3>
                      <button onClick={() => setContestModalOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setContestSaving(true);
                        setContestError(null);
                        try {
                          const res = await fetch("/api/coding/contests", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              ...contestForm,
                              max_participants: contestForm.max_participants ? parseInt(contestForm.max_participants) : null,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Failed to create contest");
                          setContestModalOpen(false);
                          await loadData();
                        } catch (err: any) {
                          setContestError(err.message);
                        } finally {
                          setContestSaving(false);
                        }
                      }}
                      className="p-6 space-y-4"
                    >
                      {contestError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
                          {contestError}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Title *</label>
                        <input
                          required
                          value={contestForm.title}
                          onChange={e => setContestForm(f => ({ ...f, title: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-violet-500"
                          placeholder="Weekly Contest #1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                        <textarea
                          value={contestForm.description}
                          onChange={e => setContestForm(f => ({ ...f, description: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-violet-500"
                          placeholder="Brief contest description..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Start Time *</label>
                          <input
                            required
                            type="datetime-local"
                            value={contestForm.start_time}
                            onChange={e => setContestForm(f => ({ ...f, start_time: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">End Time *</label>
                          <input
                            required
                            type="datetime-local"
                            value={contestForm.end_time}
                            onChange={e => setContestForm(f => ({ ...f, end_time: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Rules</label>
                        <textarea
                          value={contestForm.rules}
                          onChange={e => setContestForm(f => ({ ...f, rules: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-violet-500"
                          placeholder="Contest rules and guidelines..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Max Participants</label>
                        <input
                          type="number"
                          value={contestForm.max_participants}
                          onChange={e => setContestForm(f => ({ ...f, max_participants: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-violet-500"
                          placeholder="Leave empty for unlimited"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_rated"
                          checked={contestForm.is_rated}
                          onChange={e => setContestForm(f => ({ ...f, is_rated: e.target.checked }))}
                          className="w-4 h-4 rounded accent-violet-600"
                        />
                        <label htmlFor="is_rated" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Rated Contest</label>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Select Problems</label>
                        <div className="max-h-40 overflow-y-auto space-y-1 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2">
                          {availableProblems.slice(0, 50).map((p: any) => (
                            <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={contestForm.problem_ids.includes(p.id)}
                                onChange={e => {
                                  const ids = e.target.checked
                                    ? [...contestForm.problem_ids, p.id]
                                    : contestForm.problem_ids.filter(id => id !== p.id);
                                  setContestForm(f => ({ ...f, problem_ids: ids }));
                                }}
                                className="w-3.5 h-3.5 accent-violet-600"
                              />
                              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 truncate">{p.title}</span>
                              <span className={`text-xs font-bold ${p.difficulty === "Easy" ? "text-emerald-500" : p.difficulty === "Medium" ? "text-amber-500" : "text-red-500"}`}>
                                {p.difficulty}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{contestForm.problem_ids.length} problems selected</p>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setContestModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={contestSaving}
                          className="px-6 py-2 rounded-lg bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors disabled:opacity-60"
                        >
                          {contestSaving ? "Creating..." : "Create Contest"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
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
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && (activeTab === "bank" ? "Create Draft Coding Problem" : "Add Coding Problem")}
                  {modalType === "edit" && (activeTab === "bank" ? "Edit Draft Coding Problem" : "Edit Coding Problem")}
                  {modalType === "preview" && "Coding Problem Details"}
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
                <div className="flex flex-col h-[75vh]">
                  {/* Tabs */}
                  <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 px-6">
                    <button 
                      onClick={() => setPreviewTab("desc")}
                      className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 mr-6 cursor-pointer ${
                        previewTab === "desc" 
                          ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400" 
                          : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                      }`}
                    >
                      Description
                    </button>
                    <button 
                      onClick={() => setPreviewTab("code")}
                      className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 mr-6 cursor-pointer ${
                        previewTab === "code" 
                          ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400" 
                          : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                      }`}
                    >
                      Optimal Solution
                    </button>
                    {(selectedQ.editorial || selectedQ.status) && (
                      <>
                        <button 
                          onClick={() => setPreviewTab("editorial")}
                          className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 mr-6 cursor-pointer ${
                            previewTab === "editorial" 
                              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400" 
                              : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                          }`}
                        >
                          Editorial & Approach
                        </button>
                        <button 
                          onClick={() => setPreviewTab("tests")}
                          className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer ${
                            previewTab === "tests" 
                              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400" 
                              : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                          }`}
                        >
                          Hidden Test Cases
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                    {previewTab === "desc" ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{selectedQ.title}</h4>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyBadgeColors[selectedQ.difficulty]}`}>
                            {selectedQ.difficulty}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Problem Description</h5>
                          <p className="text-sm text-zinc-850 dark:text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-150 dark:border-zinc-800/80 rounded-xl font-medium">
                            {selectedQ.description}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Examples</h5>
                          {selectedQ.examples && (selectedQ.examples as any[]).map((ex, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 text-xs font-mono">
                              <p className="font-bold text-zinc-700 dark:text-zinc-350">Example {idx + 1}:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-650 dark:text-zinc-400">
                                <div><span className="font-bold text-zinc-500 dark:text-zinc-600">Input: </span>{ex.input}</div>
                                <div><span className="font-bold text-zinc-500 dark:text-zinc-600">Output: </span>{ex.output}</div>
                              </div>
                              {ex.explanation && (
                                <p className="text-[11px] font-sans font-medium text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-850 pt-1.5 mt-1">
                                  <span className="font-bold">Explanation: </span>{ex.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {selectedQ.constraints && selectedQ.constraints.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Constraints</h5>
                            <ul className="list-disc list-inside space-y-1 text-xs text-zinc-605 dark:text-zinc-400 font-mono">
                              {selectedQ.constraints.map((c: string, idx: number) => (
                                <li key={idx}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : previewTab === "code" ? (
                      <div className="space-y-4 h-full flex flex-col">
                        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
                          {Object.keys(selectedQ.optimal_solutions || selectedQ.optimalSolutions || {}).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setPreviewLang(lang)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                previewLang === lang 
                                  ? "bg-white dark:bg-zinc-950 text-violet-600 dark:text-violet-400 shadow-sm" 
                                  : "text-zinc-450 hover:text-zinc-700"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>

                        <div className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-4 font-mono text-xs overflow-auto text-emerald-400 leading-relaxed max-h-[40vh]">
                          <pre>{(selectedQ.optimal_solutions || selectedQ.optimalSolutions)?.[previewLang] || "// No solution defined"}</pre>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                          <div>
                            <span className="font-bold text-zinc-400 block">Time Complexity</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-zinc-200 mt-1 block">
                              {selectedQ.complexity?.time || selectedQ.editorial?.time_complexity || "O(N)"}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-zinc-400 block">Space Complexity</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-zinc-200 mt-1 block">
                              {selectedQ.complexity?.space || selectedQ.editorial?.space_complexity || "O(1)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : previewTab === "editorial" ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Optimal Approach</h5>
                          <p className="text-sm text-zinc-800 dark:text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-150 dark:border-zinc-800/80 rounded-xl">
                            {selectedQ.editorial?.approach || "No approach details provided."}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detailed Explanation</h5>
                          <p className="text-sm text-zinc-800 dark:text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-150 dark:border-zinc-800/80 rounded-xl">
                            {selectedQ.editorial?.solution_explanation || "No solution explanation provided."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Hidden Evaluation Cases</h5>
                        {selectedQ.hidden_testcases && (selectedQ.hidden_testcases as any[]).length > 0 ? (
                          <div className="space-y-2">
                            {(selectedQ.hidden_testcases as any[]).map((tc, idx) => (
                              <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl font-mono text-xs flex justify-between">
                                <div><span className="font-bold text-zinc-400">Input:</span> {tc.input}</div>
                                <div><span className="font-bold text-zinc-400">Output:</span> {tc.output}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-550 italic">No hidden testcases seeded.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-250 dark:border-zinc-800 flex justify-end">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Problem Title</label>
                        <input 
                          type="text" 
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Reverse Linked List"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>

                      {/* Topic Dropdown (Legacy support) */}
                      {activeTab === "published" && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Topic</label>
                          <select
                            required
                            value={formTopicId}
                            onChange={(e) => setFormTopicId(e.target.value)}
                            className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                          >
                            <option value="">Select Topic</option>
                            {topicsList.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Advanced Multi-Topic & Company Checkboxes */}
                    {activeTab === "bank" && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Topics (Multi-Topic Mapping)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[140px] overflow-y-auto">
                            {topicsList.map((t) => (
                              <label key={t.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={formSelectedTopics.includes(t.name)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormSelectedTopics([...formSelectedTopics, t.name]);
                                    } else {
                                      setFormSelectedTopics(formSelectedTopics.filter(x => x !== t.name));
                                    }
                                  }}
                                  className="rounded text-violet-650 focus:ring-violet-500"
                                />
                                {t.name}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Target Companies</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[140px] overflow-y-auto">
                            {companiesList.map((c) => (
                              <label key={c.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={formSelectedCompanies.includes(c.name)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormSelectedCompanies([...formSelectedCompanies, c.name]);
                                    } else {
                                      setFormSelectedCompanies(formSelectedCompanies.filter(x => x !== c.name));
                                    }
                                  }}
                                  className="rounded text-violet-655 focus:ring-violet-500"
                                />
                                {c.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                      {/* Time complexity */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Time Complexity</label>
                        <input 
                          type="text" 
                          value={formTimeComplexity}
                          onChange={(e) => setFormTimeComplexity(e.target.value)}
                          placeholder="e.g. O(N)"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>

                      {/* Space complexity */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Space Complexity</label>
                        <input 
                          type="text" 
                          value={formSpaceComplexity}
                          onChange={(e) => setFormSpaceComplexity(e.target.value)}
                          placeholder="e.g. O(1)"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                      <textarea
                        required
                        rows={4}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Detail the problem statement, inputs, outputs, etc..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none font-medium leading-relaxed"
                      />
                    </div>

                    {/* Examples */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Examples (Sample Test Cases)</label>
                        <button 
                          type="button" 
                          onClick={addExample}
                          className="text-xs font-bold text-violet-600 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Example
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formExamples.map((ex, idx) => (
                          <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 relative">
                            {formExamples.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeExample(idx)}
                                className="absolute top-2 right-2 p-1 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                            <p className="text-xs font-bold text-zinc-500 font-mono">Example {idx + 1}</p>
                            <div className="grid grid-cols-2 gap-2 font-mono">
                              <input 
                                type="text" 
                                required
                                value={ex.input}
                                onChange={(e) => updateExample(idx, "input", e.target.value)}
                                placeholder="Input (e.g. nums=[2,7], target=9)"
                                className="px-3 h-8.5 text-xs rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all text-zinc-900 dark:text-zinc-100"
                              />
                              <input 
                                type="text" 
                                required
                                value={ex.output}
                                onChange={(e) => updateExample(idx, "output", e.target.value)}
                                placeholder="Output (e.g. [0,1])"
                                className="px-3 h-8.5 text-xs rounded-lg bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all text-zinc-900 dark:text-zinc-100"
                              />
                            </div>
                            <input 
                              type="text" 
                              value={ex.explanation || ""}
                              onChange={(e) => updateExample(idx, "explanation", e.target.value)}
                              placeholder="Explanation (Optional)"
                              className="w-full px-3 h-8.5 text-xs rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all text-zinc-900 dark:text-zinc-100"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Constraints */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Constraints</label>
                        <button 
                          type="button" 
                          onClick={addConstraint}
                          className="text-xs font-bold text-violet-600 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Constraint
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formConstraints.map((c, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              value={c}
                              onChange={(e) => updateConstraint(idx, e.target.value)}
                              placeholder="e.g. 1 <= nums.length <= 10^4"
                              className="flex-1 px-3.5 h-9.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner font-mono"
                            />
                            {formConstraints.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeConstraint(idx)}
                                className="p-1 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editorial Details & Hidden Testcases (Visible only in Bank mode) */}
                    {activeTab === "bank" && (
                      <>
                        {/* Hidden Test Cases */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hidden Evaluation Test Cases</label>
                            <button 
                              type="button" 
                              onClick={addHiddenTestcase}
                              className="text-xs font-bold text-violet-600 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                            >
                              <PlusCircle className="h-4 w-4" /> Add Test Case
                            </button>
                          </div>
                          <div className="space-y-3">
                            {formHiddenTestcases.map((tc, idx) => (
                              <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2 relative">
                                {formHiddenTestcases.length > 1 && (
                                  <button 
                                    type="button" 
                                    onClick={() => removeHiddenTestcase(idx)}
                                    className="absolute top-2 right-2 p-1 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                                  >
                                    <MinusCircle className="h-4 w-4" />
                                  </button>
                                )}
                                <p className="text-xs font-bold text-zinc-505 font-mono">Hidden Case {idx + 1}</p>
                                <div className="grid grid-cols-2 gap-2 font-mono">
                                  <input 
                                    type="text" 
                                    required
                                    value={tc.input}
                                    onChange={(e) => updateHiddenTestcase(idx, "input", e.target.value)}
                                    placeholder="Input (e.g. nums=[1,5], target=10)"
                                    className="px-3 h-8.5 text-xs rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all text-zinc-900 dark:text-zinc-100"
                                  />
                                  <input 
                                    type="text" 
                                    required
                                    value={tc.output}
                                    onChange={(e) => updateHiddenTestcase(idx, "output", e.target.value)}
                                    placeholder="Output (e.g. [-1,-1])"
                                    className="px-3 h-8.5 text-xs rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all text-zinc-900 dark:text-zinc-100"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Editorial Details */}
                        <div className="space-y-4 border-t border-zinc-150 dark:border-zinc-800 pt-4">
                          <h4 className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Editorial & Analysis</h4>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Optimal Approach Outline</label>
                            <textarea
                              rows={3}
                              value={formEditorialApproach}
                              onChange={(e) => setFormEditorialApproach(e.target.value)}
                              placeholder="Describe the algorithm approach (e.g., Two Pointer with Sorting, Hash map)..."
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none font-medium leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Solution Explanation Details</label>
                            <textarea
                              rows={4}
                              value={formEditorialExplanation}
                              onChange={(e) => setFormEditorialExplanation(e.target.value)}
                              placeholder="Detail the code dry-run explanation and optimization logic..."
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none font-medium leading-relaxed"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Legacy Tags (Visible only in Active mode) */}
                    {activeTab === "published" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tags (comma-separated)</label>
                          <input 
                            type="text" 
                            value={formTags}
                            onChange={(e) => setFormTags(e.target.value)}
                            placeholder="e.g. Arrays, Two Pointer, Hash Table"
                            className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Companies (comma-separated)</label>
                          <input 
                            type="text" 
                            value={formCompanies}
                            onChange={(e) => setFormCompanies(e.target.value)}
                            placeholder="e.g. amazon, google, tcs"
                            className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    )}
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
                      <Check className="h-4 w-4" /> Save Problem
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* ADVANCED AI MODAL */}
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
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/20 dark:bg-zinc-900/50">
                <div>
                  <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
                    AI Coding Problem Generator
                  </h3>
                  <p className="text-xs text-zinc-450 mt-0.5">Generate high-quality DSA questions into drafts</p>
                </div>
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
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                  {generationError && (
                    <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                      {generationError}
                    </div>
                  )}

                  {/* Mode Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Generation Mode</label>
                    <select
                      value={aiMode}
                      onChange={(e) => setAiMode(e.target.value as any)}
                      className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                      disabled={isGenerating}
                    >
                      <option value="single">Mode 1: Single Topic Generation</option>
                      <option value="multi">Mode 2: Multi Topic Generation</option>
                      <option value="company">Mode 3: Company Specific Generation</option>
                      <option value="mixed">Mode 4: Mixed Placement Round Generation</option>
                    </select>
                  </div>

                  {/* Single Topic Selection Input */}
                  {aiMode === "single" && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Topic</label>
                      <select
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 outline-none focus:border-violet-500 transition-all font-semibold"
                        disabled={isGenerating}
                      >
                        {topicsList.map((t) => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Multi Topic Checkboxes */}
                  {(aiMode === "multi" || aiMode === "company" || aiMode === "mixed") && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Target Topics (Select multiple to distribute across)</label>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[120px] overflow-y-auto">
                        {topicsList.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={aiSelectedTopics.includes(t.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAiSelectedTopics([...aiSelectedTopics, t.name]);
                                } else {
                                  setAiSelectedTopics(aiSelectedTopics.filter(x => x !== t.name));
                                }
                              }}
                              className="rounded text-violet-650 focus:ring-violet-500"
                              disabled={isGenerating}
                            />
                            {t.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Target Companies Selection */}
                  {(aiMode === "company" || aiMode === "mixed") && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Target Companies</label>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[120px] overflow-y-auto">
                        {companiesList.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={aiSelectedCompanies.includes(c.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAiSelectedCompanies([...aiSelectedCompanies, c.name]);
                                } else {
                                  setAiSelectedCompanies(aiSelectedCompanies.filter(x => x !== c.name));
                                }
                              }}
                              className="rounded text-violet-655 focus:ring-violet-500"
                              disabled={isGenerating}
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
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
                        disabled={isGenerating || aiMode === "mixed"}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        {aiMode !== "mixed" && <option value="Mixed">Mixed</option>}
                      </select>
                    </div>

                    {/* Count */}
                    {aiMode !== "mixed" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Count</label>
                        <input 
                          type="number" 
                          required
                          min={1}
                          max={50}
                          value={aiCount}
                          onChange={(e) => setAiCount(Number(e.target.value) || 5)}
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner font-semibold"
                          disabled={isGenerating}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mixed placement rounds count inputs */}
                  {(aiMode === "mixed" || aiDifficulty === "Mixed") && (
                    <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-800 pt-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Round Difficulty Distribution</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase block">Easy Count</label>
                          <input 
                            type="number"
                            min={0}
                            max={10}
                            value={aiEasyCount}
                            onChange={(e) => setAiEasyCount(Number(e.target.value) || 0)}
                            className="w-full px-2 h-9 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 outline-none text-zinc-905"
                            disabled={isGenerating}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase block">Medium Count</label>
                          <input 
                            type="number"
                            min={0}
                            max={10}
                            value={aiMediumCount}
                            onChange={(e) => setAiMediumCount(Number(e.target.value) || 0)}
                            className="w-full px-2 h-9 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-855 outline-none text-zinc-905"
                            disabled={isGenerating}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase block">Hard Count</label>
                          <input 
                            type="number"
                            min={0}
                            max={10}
                            value={aiHardCount}
                            onChange={(e) => setAiHardCount(Number(e.target.value) || 0)}
                            className="w-full px-2 h-9 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 outline-none text-zinc-905"
                            disabled={isGenerating}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                        Generate Problems
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

