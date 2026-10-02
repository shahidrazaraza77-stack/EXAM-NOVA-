"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, Lightbulb, Search, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { hrQuestions, hrQuestionCategories } from "@/data/hr/questions";

const categoryColors: Record<string, string> = {
  "Introduction": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  "Motivation": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  "Self Assessment": "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  "Company Knowledge": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  "Career Goals": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400",
  "Behavioral": "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  "Leadership Principle": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  "Problem Solving": "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  "Technical": "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
};

export default function HRPrepView() {
  const [expandedHR, setExpandedHR] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleHR = (id: number) => {
    setExpandedHR(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const filteredQuestions = hrQuestions.filter(q => {
    if (selectedCategory !== "All" && q.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return q.question.toLowerCase().includes(qLower);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="border border-amber-200 dark:border-amber-800/40 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Common HR Interview Questions</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Prepare for HR interviews with these commonly asked questions and expert tips.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("All")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
            selectedCategory === "All"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md"
              : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          )}
        >
          All ({hrQuestions.length})
        </button>
        {hrQuestionCategories.map(cat => {
          const count = hrQuestions.filter(q => q.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                selectedCategory === cat
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
        />
      </div>

      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No questions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleHR(q.id)}
                    className="w-full flex items-start justify-between p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", categoryColors[q.category] || "bg-zinc-100 text-zinc-600")}>
                          {q.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0 mt-1">
                      <Eye className="w-3.5 h-3.5" />
                      {expandedHR.includes(q.id) ? "Hide Tip" : "View Tip"}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedHR.includes(q.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Pro Tip</p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{q.tip}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
