"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, BookmarkCheck, Bookmark, Trash2, Play } from "lucide-react";
import { codingService, FrontendCodingProblem } from "@/services/coding";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function BookmarksView({ onOpenProblem }: { onOpenProblem: (id: string) => void }) {
  const [bookmarked, setBookmarked] = useState<FrontendCodingProblem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await codingService.getBookmarks("");
      setBookmarked(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
      setError("Failed to retrieve bookmarked coding questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const removeBookmark = async (id: string) => {
    // Optimistic UI update
    setBookmarked((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);

    try {
      await codingService.removeBookmark("", id);
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
      // Revert if error
      loadBookmarks();
    }
  };

  const filtered = useMemo(() => {
    if (!search) return bookmarked;
    return bookmarked.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase())
    );
  }, [bookmarked, search]);

  const selected = useMemo(() => {
    return bookmarked.find((p) => p.id === selectedId) || null;
  }, [bookmarked, selectedId]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Bookmarked Problems</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {bookmarked.length} problem{bookmarked.length !== 1 ? "s" : ""} saved for review.
        </p>
      </motion.div>

      <motion.div variants={item} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <BookmarkCheck className="size-8 mx-auto mb-3 opacity-40 text-emerald-500" />
              <p className="font-semibold text-base">No bookmarks found</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Bookmark problems from the Problems tab for later review.
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ x: 2 }}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  selectedId === p.id
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10 shadow-sm"
                    : "bg-card hover:shadow-sm"
                }`}
                onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-600"
                            : p.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">{p.topic}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(p.id);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors shrink-0 border-none bg-transparent cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border bg-card p-5 space-y-4 h-fit sticky top-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-zinc-950 dark:text-white">{selected.title}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    selected.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-600"
                      : selected.difficulty === "Medium"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {selected.difficulty}
                </span>
              </div>
              <button
                onClick={() => removeBookmark(selected.id)}
                className="text-xs text-red-500 hover:underline border-none bg-transparent cursor-pointer font-semibold"
              >
                Remove
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-4">
              {selected.description}
            </p>
            <div className="p-3 rounded-xl bg-muted/50 border font-mono text-xs space-y-1">
              {(selected.examples || []).slice(0, 1).map((ex, i) => (
                <div key={i}>
                  <p>
                    <span className="text-emerald-600 font-semibold">Input:</span> {ex.input}
                  </p>
                  <p>
                    <span className="text-emerald-600 font-semibold">Output:</span> {ex.output}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onOpenProblem(selected.id)}
              className="w-full h-9 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              <Play className="size-3.5 fill-current" /> Solve Problem
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

