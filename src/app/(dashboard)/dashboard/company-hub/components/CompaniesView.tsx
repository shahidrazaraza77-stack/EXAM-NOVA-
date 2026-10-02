"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, ChevronRight, Sparkles, Loader2, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { difficultyColors } from "@/lib/company-data";
import { companyService, type FrontendCompany } from "@/services/company.service";
import { useAuth } from "@/context/AuthContext";

const logoGradients: string[] = [
  "from-violet-600 to-indigo-600",
  "from-blue-600 to-blue-800",
  "from-orange-500 to-orange-700",
  "from-red-500 to-red-700",
  "from-purple-500 to-purple-700",
  "from-teal-500 to-teal-700",
  "from-green-500 to-emerald-700",
  "from-cyan-500 to-cyan-700",
  "from-amber-500 to-amber-700",
];

function getLogoGradient(index: number): string {
  return logoGradients[index % logoGradients.length];
}

export default function CompaniesView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<FrontendCompany[]>([]);
  const [readinessScores, setReadinessScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const compData = await companyService.getCompanies();
        setCompanies(compData);
        
        if (user?.id) {
          const scores = await companyService.getAllProgress(user.id).then(progressList => {
            const map: Record<string, number> = {};
            progressList.forEach((item: any) => {
              map[item.company_id] = Number(item.readiness_score) || 0;
            });
            return map;
          });
          setReadinessScores(scores);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const getReadiness = (companyId: string) => readinessScores[companyId] || 0;

  const filtered = !searchQuery.trim()
    ? companies
    : companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

  const avgReadiness = companies.length > 0
    ? Math.round(companies.reduce((sum, c) => sum + getReadiness(c.id), 0) / companies.length)
    : 0;

  const sortedByReadiness = [...companies]
    .sort((a, b) => getReadiness(b.id) - getReadiness(a.id))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-zinc-500 font-medium">Loading companies...</p>
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
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Building2 className="w-4 h-4" />
          <span className="font-semibold text-zinc-805 dark:text-zinc-300">{filtered.length}</span>
          <span className="text-xs">companies</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Building2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">No companies found</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Try a different search term</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filtered.map((company, index) => {
                  const score = getReadiness(company.id);
                  return (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card hoverEffect className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", getLogoGradient(index))}>
                              <span className="text-lg font-extrabold text-white">
                                {company.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full", difficultyColors[company.difficulty || "Easy"])}>
                              {company.difficulty}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white">{company.name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{company.package_range || "Competitive package"}</p>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-zinc-500 dark:text-zinc-400">Readiness</span>
                              <span className="text-violet-600 dark:text-violet-400">{score}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, delay: index * 0.05 }}
                                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                              />
                            </div>
                          </div>
                          <Link href={`/dashboard/company-hub/${company.slug}`} className="block">
                            <Button variant="outline" size="sm" className="w-full justify-between gap-2 cursor-pointer">
                              <span>Start Preparation</span>
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-none shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-200" />
                <h3 className="font-bold text-sm">Overall Readiness</h3>
              </div>
              <div className="text-center py-3">
                <div className="text-4xl font-black tracking-tight">{avgReadiness}%</div>
                <p className="text-xs text-indigo-200 mt-1">Average across all companies</p>
              </div>
              <div className="space-y-2.5">
                {sortedByReadiness.map((company) => {
                  const score = getReadiness(company.id);
                  return (
                    <div key={company.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-indigo-100">{company.name}</span>
                        <span className="text-white">{score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-white/60" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Quick Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Companies", value: String(companies.length), color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40" },
                  { label: "Avg Score", value: `${avgReadiness}%`, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" },
                ].map(stat => (
                  <div key={stat.label} className={cn("p-3 rounded-xl text-center", stat.color)}>
                    <div className="text-lg font-extrabold">{stat.value}</div>
                    <div className="text-[10px] font-semibold mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
