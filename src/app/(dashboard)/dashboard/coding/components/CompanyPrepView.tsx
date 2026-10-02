"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Building2, ChevronRight, Play } from "lucide-react";
import { codingService, FrontendCodingProblem } from "@/services/coding";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CompanyPrepView({
  onOpenProblem,
  onNavigate,
}: {
  onOpenProblem: (id: string) => void;
  onNavigate: (tab: string) => void;
}) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyProblems, setCompanyProblems] = useState<FrontendCodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company progress from analytics
  useEffect(() => {
    async function loadCompaniesData() {
      try {
        setLoading(true);
        const data = await codingService.getAnalytics("");
        
        // Enrich backend analytics companyProgress with UI attributes
        const enriched = (data.companyProgress || []).map((cp: any) => {
          const nameLower = cp.name.toLowerCase();
          let difficulty = "Medium";
          let topics = ["Arrays", "Strings"];
          
          if (nameLower.includes("amazon") || nameLower.includes("google") || nameLower.includes("microsoft")) {
            difficulty = "Advanced";
            topics = ["Dynamic Programming", "Graphs", "Trees"];
          } else if (nameLower.includes("tcs") || nameLower.includes("infosys") || nameLower.includes("wipro")) {
            difficulty = "Easy";
            topics = ["Arrays", "Recursion", "Searching"];
          } else {
            difficulty = "Medium";
            topics = ["Linked Lists", "Hashing", "Sorting"];
          }

          return {
            ...cp,
            difficulty,
            topics,
          };
        });

        setCompanies(enriched);
        setError(null);
      } catch (err) {
        console.error("Failed to load company stats:", err);
        setError("Unable to load company prep tracks.");
      } finally {
        setLoading(false);
      }
    }
    loadCompaniesData();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setCompanyProblems([]);
      return;
    }

    async function loadCompanyProblems(companyName: string) {
      try {
        setLoadingProblems(true);
        // Normalize name to fetch matching problems (e.g. "Amazon SDE" -> "Amazon")
        const queryName = companyName.split(" ")[0];
        const data = await codingService.getProblems({ companyName: queryName });
        setCompanyProblems(data);
      } catch (err) {
        console.error("Failed to load company problems:", err);
      } finally {
        setLoadingProblems(false);
      }
    }

    loadCompanyProblems(selectedCompany);
  }, [selectedCompany]);



  const filtered = useMemo(() => {
    if (!search) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [companies, search]);

  const activeCompanyObj = useMemo(() => {
    if (!selectedCompany) return null;
    return companies.find((c) => c.name === selectedCompany) || null;
  }, [companies, selectedCompany]);

  if (selectedCompany && activeCompanyObj) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.button
          variants={item}
          onClick={() => setSelectedCompany(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 border-none bg-transparent cursor-pointer font-medium"
        >
          <ChevronRight className="size-3 rotate-180" /> Back to companies
        </motion.button>
        <motion.div variants={item} className="rounded-xl border bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{activeCompanyObj.name} Preparation</h1>
              <p className="text-sm text-muted-foreground mt-1">{activeCompanyObj.topics.join(", ")}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                activeCompanyObj.difficulty === "Advanced"
                  ? "bg-red-50 text-red-600 dark:bg-red-950/30"
                  : activeCompanyObj.difficulty === "Medium"
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
              }`}
            >
              {activeCompanyObj.difficulty}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-lg font-bold">{activeCompanyObj.questionsCount}</p>
              <p className="text-xs text-muted-foreground">Solved Problems</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-lg font-bold">{companyProblems.length}</p>
              <p className="text-xs text-muted-foreground">Available Problems</p>
            </div>
          </div>
          
          <h3 className="font-semibold text-sm mb-3">Problems List</h3>
          
          {loadingProblems ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {companyProblems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/55 transition-colors border bg-zinc-50/20 dark:bg-zinc-900/10"
                >
                  <div className="flex items-center gap-3">
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
                    <span className="text-sm font-semibold text-zinc-950 dark:text-white">{p.title}</span>
                  </div>
                  <button
                    onClick={() => onOpenProblem(p.id)}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
                  >
                    Solve <Play className="size-3 fill-current" />
                  </button>
                </div>
              ))}
              {companyProblems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No problems registered under this track yet.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="size-5 text-indigo-500" /> Company Preparation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Prepare for company-specific coding rounds with curated problem sets.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl border bg-card p-5 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded-full" />
              </div>
              <div className="h-6 w-16 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-lg" />
            </div>
          ))
        ) : (
          filtered.map((company) => (
            <motion.div
              key={company.name}
              whileHover={{ scale: 1.02, y: -2 }}
              className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{company.name}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    company.difficulty === "Advanced"
                      ? "bg-red-50 text-red-600 dark:bg-red-950/30"
                      : company.difficulty === "Medium"
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                  }`}
                >
                  {company.difficulty}
                </span>
              </div>
              <p className="text-2xl font-bold mb-1">{company.questionsCount}</p>
              <p className="text-xs text-muted-foreground mb-3">Questions Solved</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {company.topics.slice(0, 3).map((t: string) => (
                  <span
                    key={t}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-zinc-600 dark:text-zinc-300 font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelectedCompany(company.name)}
                className="w-full h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors text-sm font-semibold flex items-center justify-center gap-1.5 border-none cursor-pointer"
              >
                Start Preparation <ChevronRight className="size-3.5" />
              </button>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}

