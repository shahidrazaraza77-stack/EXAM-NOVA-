"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Monitor, Network, Workflow, FileJson, BookOpen,
  Eye, Lightbulb, Search, ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { getAllCompanies } from "@/lib/company-data";
import { technicalQuestions, type TechnicalQuestion } from "@/data/technical/questions";

const subjectConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; borderColor: string }> = {
  "DBMS": {
    icon: <Database className="w-5 h-5" />,
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800/40",
  },
  "Operating System": {
    icon: <Monitor className="w-5 h-5" />,
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800/40",
  },
  "Computer Networks": {
    icon: <Network className="w-5 h-5" />,
    color: "from-cyan-500 to-cyan-700",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    borderColor: "border-cyan-200 dark:border-cyan-800/40",
  },
  "OOP": {
    icon: <Workflow className="w-5 h-5" />,
    color: "from-amber-500 to-amber-700",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800/40",
  },
  "SQL": {
    icon: <FileJson className="w-5 h-5" />,
    color: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
  },
};

const difficultyBadge: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  Expert: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
};

const subjects = ["DBMS", "Operating System", "Computer Networks", "OOP", "SQL"];

export default function TechnicalPrepView() {
  const [selectedSubject, setSelectedSubject] = useState<string>("DBMS");
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const filteredQuestions = technicalQuestions.filter(q => {
    if (q.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return q.question.toLowerCase().includes(qLower);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {subjects.map(subject => {
          const config = subjectConfig[subject];
          const count = technicalQuestions.filter(q => q.subject === subject).length;
          const isActive = selectedSubject === subject;
          return (
            <button
              key={subject}
              onClick={() => { setSelectedSubject(subject); setExpandedQuestions([]); }}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                isActive
                  ? cn("bg-gradient-to-r text-white shadow-md border-transparent", config.color)
                  : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              {config.icon}
              {subject}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isActive ? "bg-white/20" : "bg-zinc-100 dark:bg-zinc-900"
              )}>
                {count}
              </span>
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
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full flex items-start justify-between p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", difficultyBadge[q.difficulty])}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0 mt-1">
                      <Eye className="w-3.5 h-3.5" />
                      {expandedQuestions.includes(q.id) ? "Hide Answer" : "View Answer"}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedQuestions.includes(q.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{q.answer}</p>
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
