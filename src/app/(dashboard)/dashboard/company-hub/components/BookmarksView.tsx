"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkCheck, Bookmark, ExternalLink, Building2, Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { difficultyColors } from "@/lib/company-data";
import { useAuth } from "@/context/AuthContext";
import { companyService, type FrontendCompany } from "@/services/company.service";

const logoGradients: string[] = [
  "from-violet-600 to-indigo-650",
  "from-blue-600 to-blue-800",
  "from-orange-500 to-orange-700",
  "from-red-500 to-red-700",
  "from-purple-500 to-purple-700",
  "from-teal-500 to-teal-700",
  "from-green-500 to-emerald-700",
];

function getLogoGradient(name: string): string {
  const index = name.charCodeAt(0) + name.charCodeAt(name.length - 1 || 0);
  return logoGradients[index % logoGradients.length];
}

export default function BookmarksView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [companies, setCompanies] = useState<FrontendCompany[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load bookmarks from localStorage
    const saved = localStorage.getItem("examnova_company_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        setBookmarks([]);
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await companyService.getCompanies();
        setCompanies(data);

        if (user?.id) {
          const progressList = await companyService.getAllProgress(user.id);
          const map: Record<string, any> = {};
          progressList.forEach((item: any) => {
            map[item.company_id] = item;
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.error("Failed to load bookmarks data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const toggleBookmark = (slug: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(slug) ? prev.filter(id => id !== slug) : [...prev, slug];
      localStorage.setItem("examnova_company_bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  const bookmarkedData = companies
    .filter(c => bookmarks.includes(c.slug))
    .map(c => {
      const prog = progressMap[c.id];
      return {
        ...c,
        readinessScore: prog?.readiness_score || 0,
        progress: Math.round(((prog?.aptitude_progress || 0) + (prog?.coding_progress || 0) + (prog?.interview_progress || 0)) / 3) || 0,
        type: c.difficulty === "Easy" ? "IT Services" : c.difficulty === "Medium" ? "Consulting" : "Technology"
      };
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
        <p className="text-sm text-zinc-500 font-medium">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-violet-650" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
            Saved Companies ({bookmarkedData.length})
          </h3>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {bookmarkedData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <CardContent className="p-12 text-center space-y-4">
                <Bookmark className="w-14 h-14 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No bookmarked companies</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Browse companies and save them for quick access.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {bookmarkedData.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                layout
              >
                <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden h-full">
                  <CardContent className="p-5 space-y-4 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm text-white", getLogoGradient(company.name))}>
                          <span className="text-sm font-extrabold">
                            {company.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{company.name}</h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{company.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(company.slug)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <BookmarkCheck className="w-4 h-4 text-violet-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", difficultyColors[company.difficulty || "Easy"])}>
                        {company.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{company.readinessScore}% Readiness</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                        <span className="text-violet-650 dark:text-violet-400">{company.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${company.progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-650"
                        />
                      </div>
                    </div>

                    <Link href={`/dashboard/company-hub/${company.slug}`} className="block mt-auto">
                      <Button variant="outline" size="sm" className="w-full justify-between gap-2 cursor-pointer">
                        <span>Continue Prep</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
