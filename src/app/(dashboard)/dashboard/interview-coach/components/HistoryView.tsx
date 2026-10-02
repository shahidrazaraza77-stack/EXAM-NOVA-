"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  History, Search, Clock, Video, Code2, Users,
  ArrowUp, ArrowDown, Minus, Loader2, Building2, Briefcase
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interview.service";

export default function HistoryView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    async function loadData() {
      try {
        const data = await interviewService.getSessions(userId);
        const items = data.map((s) => ({
          id: s.id,
          date: s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : "",
          type: s.mode === "hr" ? "HR" : s.mode === "technical" ? "Technical" : s.mode === "mixed" ? "Mixed" : s.mode === "company" ? "Company" : "Resume",
          role: s.role || "Software Engineer",
          level: s.difficulty ? s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1) : "Medium",
          score: s.score || 0,
          duration: s.duration ? `${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, "0")}` : "0:00",
          feedbackCount: s.score ? 1 : 0,
          breakdown: {
            communication: s.communication_score || 0,
            technical: s.technical_score || 0,
            confidence: s.confidence_score || 0,
          },
        }));
        setSessions(items);
      } catch (err) {
        console.error("Failed to load sessions history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const filtered = sessions.filter(s => {
    if (typeFilter !== "All" && s.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.role.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
    }
    return true;
  });

  const getTrendIcon = (score: number, index: number) => {
    if (index === sessions.length - 1) return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
    const nextChronological = sessions[index + 1]?.score || 0; // Since sorted descending by date
    if (score > nextChronological) return <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (score < nextChronological) return <ArrowDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
  };

  const typeColors: Record<string, string> = {
    HR: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    Technical: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    Mixed: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    Company: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    Resume: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  };

  const typeIcons: Record<string, any> = {
    HR: Users,
    Technical: Code2,
    Mixed: Video,
    Company: Building2,
    Resume: Briefcase,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {["All", "HR", "Technical", "Mixed", "Company", "Resume"].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all border-none cursor-pointer",
                typeFilter === t ? "bg-white dark:bg-zinc-955 text-violet-600 dark:text-violet-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-12 text-center space-y-3">
            <History className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-zinc-500 dark:text-zinc-400">No sessions found</h3>
            <p className="text-sm text-zinc-400">Complete an interview to see it here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((session, i) => {
            const TypeIcon = typeIcons[session.type] || Video;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  <CardContent className="p-5">
                     <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", (typeColors[session.type] || "bg-zinc-100").split(" ")[0])}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{session.role}</h4>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", typeColors[session.type] || "bg-zinc-100 text-zinc-600")}>
                              {session.type}
                            </span>
                            <span className="text-[10px] text-zinc-400">{session.level}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}</span>
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {[
                              { label: "Comm", value: session.breakdown.communication },
                              { label: "Tech", value: session.breakdown.technical },
                              { label: "Conf", value: session.breakdown.confidence },
                            ].map(b => (
                              <span key={b.label} className="text-[10px] font-semibold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                                {b.label}: {b.value}%
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {getTrendIcon(session.score, i)}
                          <div className={cn(
                            "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-extrabold",
                            session.score >= 80 ? "border-emerald-500 text-emerald-600" :
                            session.score >= 60 ? "border-amber-500 text-amber-600" :
                            "border-red-500 text-red-600"
                          )}>
                            {session.score}
                          </div>
                        </div>
                        <span className="text-[9px] font-semibold text-zinc-400">Score</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
