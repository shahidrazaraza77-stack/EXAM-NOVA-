import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { aptitudeService } from "@/services/aptitude";
import { motion, Variants } from "framer-motion";
import {
  BookmarkCheck,
  Search,
  Trash2,
  Lightbulb,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Calculator,
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

export default function BookmarksView() {
  const { user } = useAuth();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedQ, setSelectedQ] = useState<string | null>(null);

  const loadBookmarks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await aptitudeService.getBookmarks(user.id);
      setBookmarkedQuestions(data);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return bookmarkedQuestions;
    return bookmarkedQuestions.filter(
      (q) =>
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase())
    );
  }, [bookmarkedQuestions, search]);

  const removeBookmark = async (id: string) => {
    if (!user) return;
    try {
      await aptitudeService.removeBookmark(user.id, id);
      setBookmarkedQuestions((prev) => prev.filter((q) => q.id !== id));
      if (selectedQ === id) setSelectedQ(null);
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  const selectedQuestion = selectedQ ? bookmarkedQuestions.find((q) => q.id === selectedQ) : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading bookmarked items...</p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title Header with ambient decoration */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
          Bookmarked Questions
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Review saved exercises, trace detailed explanations, and re-test yourself on complex problems.
        </p>
      </motion.div>

      {/* Search Filter */}
      <motion.div variants={item} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search saved bookmarks by topic or question content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>
      </motion.div>

      {/* Split grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 max-w-lg mx-auto">
              <BookmarkCheck className="size-8 mx-auto mb-3 text-zinc-400 opacity-60" />
              <p className="font-bold text-zinc-900 dark:text-white">No bookmarks yet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                Bookmark questions during practice sessions to save them for later review here.
              </p>
            </div>
          ) : (
            filtered.map((q) => {
              const isSelected = selectedQ === q.id;
              const diffLower = (q.difficulty || "Medium").toLowerCase();
              const diffColor =
                diffLower === "easy" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20" :
                diffLower === "medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20" :
                "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20";

              return (
                <motion.div
                  key={q.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={`rounded-2xl border p-4.5 transition-all cursor-pointer flex items-start justify-between gap-4.5 ${
                    isSelected
                      ? "border-violet-500 bg-violet-500/[0.03] shadow-xs"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:shadow-2xs"
                  }`}
                  onClick={() => setSelectedQ(isSelected ? null : q.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-205 line-clamp-2 leading-relaxed">{q.question}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-450 border border-zinc-150 dark:border-zinc-800/80">
                        {q.topic}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(q.id);
                      }}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <ChevronRight className={`size-4 text-zinc-400 transition-transform ${isSelected ? "rotate-90 text-violet-500" : ""}`} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Selected View details */}
        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5 h-fit sticky top-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <div className="flex items-center gap-2 text-amber-500">
                <BookmarkCheck className="size-5" />
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Bookmark Review</span>
              </div>
              <button
                onClick={() => removeBookmark(selectedQuestion.id)}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" /> Remove Bookmark
              </button>
            </div>

            <p className="font-extrabold text-zinc-900 dark:text-white text-base leading-relaxed">{selectedQuestion.question}</p>

            <div className="grid grid-cols-1 gap-3">
              {selectedQuestion.options.map((opt: string, idx: number) => {
                const isCorrect = idx === selectedQuestion.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-sm transition-all ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500/[0.03] dark:bg-emerald-950/20"
                        : "border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isCorrect
                          ? "bg-emerald-500 border-transparent text-white"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-450"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 font-semibold text-zinc-850 dark:text-zinc-200">{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 ml-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/[0.02] border border-amber-500/15">
              <Lightbulb className="size-4.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Solution Explanation:</p>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-450 leading-relaxed mt-1">{selectedQuestion.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
