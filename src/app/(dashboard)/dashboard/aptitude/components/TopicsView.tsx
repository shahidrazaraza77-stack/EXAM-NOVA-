import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  BarChart3,
  BrainCircuit,
  Languages,
  Calculator,
  BookOpen,
  Filter,
  PlayCircle,
  Trophy,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronDown,
  Info,
} from "lucide-react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } },
};

const categoryIcons: Record<string, any> = {
  quantitative: Calculator,
  logical: BrainCircuit,
  verbal: Languages,
  "data-interpretation": BarChart3,
};

const categoryTabs = [
  { id: "all", label: "All Categories", icon: BookOpen },
  { id: "quantitative", label: "Quantitative Aptitude", icon: Calculator },
  { id: "logical", label: "Logical Reasoning", icon: BrainCircuit },
  { id: "verbal", label: "Verbal Ability", icon: Languages },
  { id: "data-interpretation", label: "Data Interpretation", icon: BarChart3 },
];

interface TopicsViewProps {
  categories: any[];
  onStartPractice?: (topic: string) => void;
}

export default function TopicsView({ categories, onStartPractice }: TopicsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Determine which tabs to display based on what's available in mock/live data
  const activeCategories = useMemo(() => {
    return categoryTabs.filter(
      (tab) => tab.id === "all" || categories.some((c) => c.id === tab.id)
    );
  }, [categories]);

  // Compute stats dynamically for the selected category filter
  const computedStats = useMemo(() => {
    let totalTopics = 0;
    let completedTopicsCount = 0;
    let totalQuestions = 0;
    let completedQuestionsCount = 0;

    const targetCats = categories.filter(
      (c) => selectedCategory === "all" || c.id === selectedCategory
    );

    targetCats.forEach((cat) => {
      cat.topics.forEach((t: any) => {
        totalTopics++;
        totalQuestions += t.questionsCount;
        completedQuestionsCount += t.completedCount;
        if (t.questionsCount > 0 && t.completedCount === t.questionsCount) {
          completedTopicsCount++;
        }
      });
    });

    const completionRate =
      totalQuestions > 0 ? Math.round((completedQuestionsCount / totalQuestions) * 100) : 0;
    const masteryRate =
      totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

    return {
      totalTopics,
      completedTopicsCount,
      totalQuestions,
      completedQuestionsCount,
      completionRate,
      masteryRate,
    };
  }, [categories, selectedCategory]);

  // Filter categories and topics based on selected tab, search input, difficulty, and completion status
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => selectedCategory === "all" || cat.id === selectedCategory)
      .map((cat) => {
        const filteredTopics = cat.topics.filter((t: any) => {
          const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

          const difficulty = (t.difficulty || "Medium").toLowerCase();
          const matchesDifficulty =
            difficultyFilter === "all" || difficulty === difficultyFilter.toLowerCase();

          const isCompleted = t.completedCount === t.questionsCount && t.questionsCount > 0;
          const isStarted = t.completedCount > 0;

          let matchesStatus = true;
          if (statusFilter === "not_started") {
            matchesStatus = t.completedCount === 0;
          } else if (statusFilter === "in_progress") {
            matchesStatus = isStarted && !isCompleted;
          } else if (statusFilter === "completed") {
            matchesStatus = isCompleted;
          }

          return matchesSearch && matchesDifficulty && matchesStatus;
        });

        return {
          ...cat,
          topics: filteredTopics,
        };
      })
      .filter((cat) => cat.topics.length > 0);
  }, [categories, selectedCategory, search, difficultyFilter, statusFilter]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title Header with ambient decoration */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
          Practice Topics
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Browse and target specific aptitude topics. Filter by difficulty, track your performance rates, and practice to master.
        </p>
      </motion.div>

      {/* Category Tabs Row */}
      <motion.div
        variants={item}
        className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-100 dark:border-zinc-800/80"
      >
        {activeCategories.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-205 whitespace-nowrap cursor-pointer border ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-500/15 scale-[1.02]"
                  : "bg-white dark:bg-zinc-950 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <TabIcon className="size-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Dynamic Stats Row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Topics Mastered */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all duration-300 shadow-xs">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/[0.02] rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Topics Mastered</p>
              <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-0.5">
                {computedStats.completedTopicsCount}{" "}
                <span className="text-xs font-semibold text-zinc-400">/ {computedStats.totalTopics}</span>
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold mt-0.5">
                {computedStats.masteryRate}% mastery rate
              </p>
            </div>
          </div>
        </div>

        {/* Questions Completed */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all duration-300 shadow-xs">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/[0.02] rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Solved</p>
              <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-0.5">
                {computedStats.completedQuestionsCount}{" "}
                <span className="text-xs font-semibold text-zinc-400">/ {computedStats.totalQuestions}</span>
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold mt-0.5">
                {computedStats.totalQuestions - computedStats.completedQuestionsCount} questions left
              </p>
            </div>
          </div>
        </div>

        {/* Completion Accuracy */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all duration-300 shadow-xs">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.02] rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Progress</p>
              <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-0.5">
                {computedStats.completionRate}%
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold mt-0.5">
                Average accuracy progress
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advanced Filters */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-800/80"
      >
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search topics by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="relative sm:col-span-3">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500/50 transition-all text-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-450 pointer-events-none" />
        </div>

        {/* Completion Status Filter */}
        <div className="relative sm:col-span-3">
          <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500/50 transition-all text-zinc-800 dark:text-zinc-300"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-450 pointer-events-none" />
        </div>
      </motion.div>

      {/* Category Wise Grid Content */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-6">
          {filteredCategories.map((cat) => {
            const CatIcon = categoryIcons[cat.id] || BookOpen;
            return (
              <motion.div
                key={cat.id}
                variants={item}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mt-4 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-650 dark:text-violet-400 border border-violet-100/50 dark:border-violet-900/30">
                      <CatIcon className="size-4" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-zinc-900 dark:text-white text-sm tracking-tight">
                        {cat.name}
                      </h2>
                      <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-800">
                    {cat.completedCount} / {cat.questionsCount} Solved
                  </span>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.topics.map((topic: any) => (
                    <TopicCard
                      key={topic.name}
                      topic={topic}
                      onPractice={() => onStartPractice?.(topic.name)}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 max-w-lg mx-auto"
        >
          <div className="inline-flex p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-500 mb-4">
            <Info className="size-6" />
          </div>
          <p className="font-bold text-zinc-900 dark:text-white">No topics found</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search keyword or switching filters to see other results.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function TopicCard({ topic, onPractice }: { topic: any; onPractice: () => void }) {
  const progress =
    topic.questionsCount > 0 ? Math.round((topic.completedCount / topic.questionsCount) * 100) : 0;

  const isCompleted = topic.completedCount === topic.questionsCount && topic.questionsCount > 0;
  const isStarted = topic.completedCount > 0;

  const diffLower = (topic.difficulty || "Medium").toLowerCase();

  const diffColor =
    diffLower === "easy"
      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
      : diffLower === "medium"
        ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
        : "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-450 border-rose-100 dark:border-rose-900/30";

  const progressColor =
    progress === 100
      ? "from-emerald-500 to-teal-500"
      : progress >= 60
        ? "from-violet-500 to-indigo-500"
        : progress >= 30
          ? "from-amber-500 to-orange-500"
          : "from-rose-500 to-red-500";

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -3 }}
      className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-950 dark:to-zinc-900/20 p-4.5 transition-all duration-350 hover:shadow-md dark:hover:shadow-black/40 hover:border-violet-500/25 dark:hover:border-violet-500/25 group flex flex-col justify-between overflow-hidden h-[180px]"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/[0.015] rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/5 transition-colors duration-300" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
            {topic.difficulty || "Medium"}
          </span>

          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle2 className="size-2.5" /> Mastered
              </span>
            ) : isStarted ? (
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded-md border border-violet-100 dark:border-violet-900/25">
                In Progress
              </span>
            ) : (
              <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded-md">
                Not Started
              </span>
            )}
            <span className="text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-md">
              {topic.completedCount} / {topic.questionsCount}
            </span>
          </div>
        </div>

        <h3 className="font-extrabold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm tracking-tight mb-1.5 leading-snug line-clamp-1">
          {topic.name}
        </h3>
      </div>

      <div className="mt-auto space-y-3.5">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
            <span>Accuracy Completion</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
            />
          </div>
        </div>

        <button
          onClick={onPractice}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold h-9 rounded-xl bg-violet-50 hover:bg-violet-650 hover:text-white dark:bg-violet-950/30 dark:hover:bg-violet-600 dark:text-violet-400 dark:hover:text-white text-violet-600 border border-violet-100 hover:border-transparent dark:border-violet-900/40 transition-all duration-300 cursor-pointer shadow-3xs hover:shadow-xs group-hover:shadow-violet-500/10"
        >
          <PlayCircle className="size-3.5" />
          {isCompleted ? "Review Topic" : isStarted ? "Resume Practice" : "Start Practice"}
        </button>
      </div>
    </motion.div>
  );
}
