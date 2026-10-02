"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Trophy,
  Target,
  BarChart3,
  Award,
  Sparkles
} from "lucide-react";
import { codingService, FrontendCodingProblem } from "@/services/coding";
import { apiFetch } from "@/lib/api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
};

const allCompanies = ["Amazon", "Google", "Microsoft", "Facebook", "Adobe", "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini"];

export default function ProblemsView({ 
  onOpenProblem,
  initialTopic = "",
  onClearInitialTopic
}: { 
  onOpenProblem: (id: string) => void;
  initialTopic?: string;
  onClearInitialTopic?: () => void;
}) {
  const [problems, setProblems] = useState<FrontendCodingProblem[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState(initialTopic);
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20; // 20 problems per page

  // Fetch topics, bookmarks and analytics on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [topicsList, bookmarksList, analyticsData] = await Promise.all([
          codingService.getTopics(),
          codingService.getBookmarks(""),
          codingService.getAnalytics("").catch(() => null),
        ]);
        setTopics(topicsList);
        setBookmarked(new Set((bookmarksList || []).map((b) => b.id)));
        if (analyticsData) {
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    }
    loadInitialData();
  }, []);

  // Synchronize initialTopic from parent (e.g. from Topics page click)
  useEffect(() => {
    if (initialTopic) {
      setFilterTopic(initialTopic);
      if (onClearInitialTopic) {
        onClearInitialTopic();
      }
    }
  }, [initialTopic, onClearInitialTopic]);

  // Reset page to 1 when filters update
  useEffect(() => {
    setPage(1);
  }, [search, filterTopic, filterDifficulty, filterCompany, filterStatus]);

  // Fetch problems when filters or page update
  useEffect(() => {
    async function loadProblems() {
      try {
        setLoading(true);
        const queryParts: string[] = [];
        if (filterDifficulty) queryParts.push(`difficulty=${filterDifficulty}`);
        if (filterTopic) queryParts.push(`topicName=${encodeURIComponent(filterTopic)}`);
        if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
        if (filterCompany) queryParts.push(`companyName=${encodeURIComponent(filterCompany)}`);
        if (filterStatus) queryParts.push(`solvedStatus=${filterStatus}`);
        queryParts.push(`page=${page}`);
        queryParts.push(`limit=${limit}`);

        const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
        const res = await apiFetch(`/api/coding/problems${queryString}`);
        if (!res.ok) throw new Error("Failed to fetch problems");
        
        const data = await res.json();
        setProblems(data.problems || []);
        setTotalProblems(data.totalCount || 0);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load problems:", err);
        setError("Failed to load problems from database.");
      } finally {
        setLoading(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      loadProblems();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filterTopic, filterDifficulty, filterCompany, filterStatus, page]);

  const toggleBookmark = async (id: string) => {
    const isCurrentlyBookmarked = bookmarked.has(id);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isCurrentlyBookmarked) {
        await codingService.removeBookmark("", id);
      } else {
        await codingService.addBookmark("", id);
      }
    } catch (err) {
      console.error("Failed to update bookmark:", err);
      // Revert on error
      setBookmarked((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const hasFilters = search || filterTopic || filterDifficulty || filterCompany || filterStatus;

  // Safe Analytics Properties
  const solvedEasy = analytics?.solvedEasy ?? 0;
  const solvedMedium = analytics?.solvedMedium ?? 0;
  const solvedHard = analytics?.solvedHard ?? 0;
  const totalEasy = analytics?.totalEasy ?? 300;
  const totalMedium = analytics?.totalMedium ?? 600;
  const totalHard = analytics?.totalHard ?? 300;

  const totalSolved = solvedEasy + solvedMedium + solvedHard;
  const totalCount = totalEasy + totalMedium + totalHard;

  const solvePercentage = totalCount > 0 ? Math.round((totalSolved / totalCount) * 100) : 0;
  const streak = analytics?.streak ?? 0;

  const totalPages = Math.ceil(totalProblems / limit) || 1;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Top Professional Analytics Dashboard */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Progress Card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 dark:border-emerald-500/20 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="size-3.5 text-amber-500" /> Solved Progress
            </span>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white">
              {totalSolved} <span className="text-sm font-medium text-zinc-400">/ {totalCount}</span>
            </h3>
            <p className="text-xs text-muted-foreground">Solved coding challenges</p>
          </div>
          
          <div className="relative size-20 shrink-0">
            {/* SVG Radial Progress */}
            <svg className="size-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-emerald-500 transition-all duration-500"
                strokeWidth="6"
                fill="none"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * solvePercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">{solvePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Card */}
        <div className="rounded-2xl border border-zinc-150 dark:border-zinc-800/80 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 p-5 flex flex-col justify-between shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <BarChart3 className="size-3.5 text-indigo-500" /> Difficulty Breakdown
          </span>
          <div className="space-y-2">
            {/* Easy Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Easy</span>
                <span className="text-zinc-600 dark:text-zinc-300">{solvedEasy}/{totalEasy}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${totalEasy > 0 ? (solvedEasy / totalEasy) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-600 dark:text-amber-400">Medium</span>
                <span className="text-zinc-600 dark:text-zinc-300">{solvedMedium}/{totalMedium}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500" 
                  style={{ width: `${totalMedium > 0 ? (solvedMedium / totalMedium) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Hard Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-rose-600 dark:text-rose-400">Hard</span>
                <span className="text-zinc-600 dark:text-zinc-300">{solvedHard}/{totalHard}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-500" 
                  style={{ width: `${totalHard > 0 ? (solvedHard / totalHard) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak & Daily Action Panel */}
        <div className="rounded-2xl border border-zinc-150 dark:border-zinc-800/80 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="size-3.5 text-orange-500 fill-orange-500" /> Daily Streak
            </span>
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/30">
              {streak} Days Active
            </span>
          </div>

          <div className="mt-3 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                <Sparkles className="size-2.5 animate-pulse" /> Daily Challenge
              </span>
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate mt-0.5">
                {analytics?.dailyChallenge?.title || "Reversed String Lists"}
              </h4>
            </div>
            <button
              onClick={() => analytics?.dailyChallenge?.id && onOpenProblem(analytics.dailyChallenge.id)}
              className="shrink-0 flex items-center justify-center p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <Play className="size-3.5 fill-current" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Glassmorphic Search & Filters Bar */}
      <motion.div 
        variants={item} 
        className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-md flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search problems by title, keywords or slugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-200"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Topics Selector */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm font-medium px-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id || t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Difficulty Selector */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm font-medium px-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Companies Selector */}
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm font-medium px-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Companies</option>
            {allCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Solved Status Selector */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm font-medium px-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="todo">Todo</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setFilterTopic("");
                setFilterDifficulty("");
                setFilterCompany("");
                setFilterStatus("");
              }}
              className="h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              title="Reset Filters"
            >
              <RotateCcw className="size-4" />
            </button>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Styled Problems Table */}
      <motion.div variants={item} className="rounded-2xl border border-zinc-150 dark:border-zinc-800/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-5 py-3.5 w-12">Status</th>
                <th className="text-left px-5 py-3.5">Title</th>
                <th className="text-left px-5 py-3.5">Topic</th>
                <th className="text-left px-5 py-3.5">Difficulty</th>
                <th className="text-left px-5 py-3.5">Companies</th>
                <th className="text-left px-5 py-3.5">Acceptance</th>
                <th className="text-right px-5 py-3.5 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4.5 w-4.5 bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-56 bg-zinc-200 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-8.5 w-18 bg-zinc-200 dark:bg-zinc-800 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : (
                <>
                  {problems.map((problem) => (
                    <ProblemRow
                      key={problem.id}
                      problem={problem}
                      isBookmarked={bookmarked.has(problem.id)}
                      onToggleBookmark={() => toggleBookmark(problem.id)}
                      onOpen={() => onOpenProblem(problem.id)}
                    />
                  ))}
                  {problems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                        <Search className="size-8 mx-auto mb-3 opacity-30 text-zinc-400" />
                        <p className="font-bold text-zinc-700 dark:text-zinc-300">No problems found</p>
                        <p className="text-xs mt-1 text-zinc-500">Try adjusting your filters or searching for another topic.</p>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Elegant Pagination Footer */}
        {!loading && totalProblems > 0 && (
          <div className="border-t border-zinc-150 dark:border-zinc-800/80 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/20 dark:bg-zinc-900/10">
            <span className="text-xs font-semibold text-zinc-500">
              Showing <span className="text-zinc-800 dark:text-zinc-200">{Math.min(totalProblems, (page - 1) * limit + 1)}</span> to{" "}
              <span className="text-zinc-800 dark:text-zinc-200">{Math.min(totalProblems, page * limit)}</span> of{" "}
              <span className="text-zinc-800 dark:text-zinc-200">{totalProblems}</span> problems
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-background cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="size-4" />
              </button>

              {/* Render max 5 page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber = page;
                if (page <= 3) {
                  pageNumber = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = page - 2 + i;
                }

                // Guard for boundary overflow
                if (pageNumber < 1 || pageNumber > totalPages) return null;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`h-9 min-w-9 px-2 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      page === pageNumber
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 bg-background text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-background cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const ProblemRow = React.memo(function ProblemRow({
  problem,
  isBookmarked,
  onToggleBookmark,
  onOpen,
}: {
  problem: FrontendCodingProblem;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpen: () => void;
}) {
  const statusIcon =
    problem.status === "Solved" ? (
      <CheckCircle2 className="size-4.5 text-emerald-500" />
    ) : problem.status === "Attempted" ? (
      <AlertTriangle className="size-4.5 text-amber-500" />
    ) : (
      <HelpCircle className="size-4.5 text-zinc-400 opacity-60" />
    );

  const diffColor =
    problem.difficulty === "Easy"
      ? "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-450 dark:bg-emerald-950/20 dark:border-emerald-900/30"
      : problem.difficulty === "Medium"
      ? "text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-450 dark:bg-amber-950/20 dark:border-amber-900/30"
      : "text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-450 dark:bg-rose-950/20 dark:border-rose-900/30";

  return (
    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
      <td className="px-5 py-3.5 align-middle">{statusIcon}</td>
      <td className="px-5 py-3.5 align-middle">
        <button
          onClick={onOpen}
          className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left border-none bg-transparent cursor-pointer"
        >
          {problem.title}
        </button>
      </td>
      <td className="px-5 py-3.5 align-middle">
        <span className="text-xs text-zinc-500 font-bold bg-zinc-100/60 dark:bg-zinc-900/60 px-2 py-0.5 rounded-lg border border-zinc-200/20">
          {problem.topic}
        </span>
      </td>
      <td className="px-5 py-3.5 align-middle">
        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${diffColor}`}>
          {problem.difficulty}
        </span>
      </td>
      <td className="px-5 py-3.5 align-middle">
        <div className="flex flex-wrap gap-1 items-center">
          {(problem.companies || []).slice(0, 3).map((c) => (
            <span 
              key={c} 
              className="text-[9px] px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-450 font-bold uppercase tracking-wider"
            >
              {c}
            </span>
          ))}
          {(problem.companies || []).length > 3 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold ml-0.5">
              +{(problem.companies || []).length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5 align-middle text-xs font-bold text-zinc-500">{problem.acceptanceRate}</td>
      <td className="px-5 py-3.5 align-middle text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 border-none bg-transparent cursor-pointer ${
              isBookmarked
                ? "text-amber-500"
                : "text-zinc-400 hover:text-amber-500 opacity-0 group-hover:opacity-100"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
          >
            {isBookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>
          <button
            onClick={onOpen}
            className="flex items-center gap-1 text-xs font-extrabold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-650 dark:hover:bg-emerald-600 text-white hover:translate-x-0.5 shadow-xs transition-all duration-250 border-none cursor-pointer"
          >
            Solve <Play className="size-3 fill-current" />
          </button>
        </div>
      </td>
    </tr>
  );
});
