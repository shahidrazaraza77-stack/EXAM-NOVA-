"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Sparkles, CheckCircle2, AlertTriangle, Target, Loader2, Zap, ArrowRight, BookOpen, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import ATSScoreRing from "./ATSScoreRing";
import { Button } from "@/components/ui/Button";
import { getResumeText } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

interface CompanyOptimizeTabProps {
  activeResume: any | null;
  setActiveResume: (resume: any) => void;
  refreshResumes: () => void;
  onNavigate: (tab: string) => void;
}

const companiesList = [
  {
    name: "Google",
    slug: "google",
    color: "from-blue-500 via-red-500 to-yellow-500",
    hoverBg: "hover:border-blue-400 dark:hover:border-blue-800",
    desc: "Focuses on algorithm efficiency, system design scalability, clean code quality, and Googleyness qualities."
  },
  {
    name: "Amazon",
    slug: "amazon",
    color: "from-orange-500 to-amber-600",
    hoverBg: "hover:border-orange-400 dark:hover:border-orange-850",
    desc: "Prioritizes Leadership Principles ( STAR method achievements ), customer scale, and results delivery."
  },
  {
    name: "Microsoft",
    slug: "microsoft",
    color: "from-teal-500 to-indigo-500",
    hoverBg: "hover:border-teal-400 dark:hover:border-teal-850",
    desc: "Emphasizes growth mindset, cloud architecture integration, developer productivity tools, and OOP patterns."
  },
  {
    name: "Meta",
    slug: "meta",
    color: "from-blue-600 to-blue-800",
    hoverBg: "hover:border-blue-500 dark:hover:border-blue-900",
    desc: "Focuses on quick iteration, product impact, data-driven decisions, and large-scale product engineering."
  },
  {
    name: "Adobe",
    slug: "adobe",
    color: "from-red-500 to-rose-600",
    hoverBg: "hover:border-red-400 dark:hover:border-red-800",
    desc: "Emphasizes UI/UX quality, creativity systems, performance optimization, and creative cloud architecture."
  },
  {
    name: "Oracle",
    slug: "oracle",
    color: "from-red-600 to-red-800",
    hoverBg: "hover:border-red-700 dark:hover:border-red-900",
    desc: "Prioritizes enterprise databases, Java system engineering, cloud infrastructure scale, and solid middleware design."
  },
  {
    name: "Goldman Sachs",
    slug: "goldman-sachs",
    color: "from-yellow-600 to-amber-700",
    hoverBg: "hover:border-yellow-500 dark:hover:border-yellow-900",
    desc: "Focuses on risk analysis, financial systems scaling, security compliance, and analytical problem-solving."
  },
  {
    name: "IBM",
    slug: "ibm",
    color: "from-blue-700 to-sky-800",
    hoverBg: "hover:border-blue-600 dark:hover:border-blue-900",
    desc: "Values enterprise consulting, hybrid cloud solutions, artificial intelligence research, and global software delivery architectures."
  },
  {
    name: "TCS",
    slug: "tcs",
    color: "from-blue-600 to-indigo-650",
    hoverBg: "hover:border-blue-500 dark:hover:border-blue-900",
    desc: "Hiring criteria assesses logical reasoning, enterprise tech frameworks ( Java, Spring ), and SDLC methods."
  },
  {
    name: "Infosys",
    slug: "infosys",
    color: "from-sky-500 to-indigo-500",
    hoverBg: "hover:border-sky-450 dark:hover:border-sky-900",
    desc: "Values global cloud transformation skills, business workflow automation, and multi-technology versatility."
  },
  {
    name: "Accenture",
    slug: "accenture",
    color: "from-purple-600 to-indigo-650",
    hoverBg: "hover:border-purple-500 dark:hover:border-purple-900",
    desc: "Focuses on large-scale technology consulting solutions, systems integration architectures, and delivery."
  }
];

export default function CompanyOptimizeTab({ activeResume, setActiveResume, refreshResumes, onNavigate }: CompanyOptimizeTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [originalText, setOriginalText] = useState("");

  useEffect(() => {
    const loadOriginalText = async () => {
      if (!activeResume) {
        setOriginalText("");
        return;
      }

      // 1. Reconstruct from content if it's a wizard-created resume
      if (activeResume.content) {
        const text = getResumeText({ content: activeResume.content });
        if (text) {
          setOriginalText(text);
          return;
        }
      }

      // 2. If it's not a wizard resume, and it's not AI generated/optimized, its own parsed_content is the original
      if (!activeResume.is_ai_generated && !activeResume.target_company) {
        setOriginalText(activeResume.parsed_content || "");
        return;
      }

      // 3. If it is AI optimized, fetch the original resume version (non-AI generated version) sharing the same file_path
      try {
        const query = supabase
          .from("resumes")
          .select("parsed_content, content")
          .eq("user_id", activeResume.user_id);
        
        if (activeResume.file_path) {
          query.eq("file_path", activeResume.file_path);
        } else {
          query.is("file_path", null);
        }

        const { data, error } = await query
          .or("is_ai_generated.eq.false,is_ai_generated.is.null")
          .order("version", { ascending: true })
          .limit(1);

        if (!error && data && data.length > 0) {
          const orig = data[0];
          const text = orig.content ? getResumeText({ content: orig.content }) : orig.parsed_content;
          setOriginalText(text || "");
        } else {
          // Fallback to active resume's own content
          setOriginalText(activeResume.parsed_content || "");
        }
      } catch (err) {
        console.error("Error loading original resume text:", err);
        setOriginalText(activeResume.parsed_content || "");
      }
    };

    loadOriginalText();
  }, [activeResume]);

  const [isApplying, setIsApplying] = useState(false);

  const handleApplyAIChanges = async () => {
    if (!activeResume || !result?.optimizedResume) return;
    if (!confirm("Are you sure you want to overwrite your active resume content with the AI-optimized version? This will update your template preview and form builder.")) return;

    setIsApplying(true);
    try {
      const parseRes = await fetch("/api/resume/parse-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdownText: result.optimizedResume })
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok || !parseData.structuredData) {
        throw new Error(parseData.error || "Failed to convert markdown to form fields");
      }

      const { data, error } = await (supabase.from("resumes") as any)
        .update({
          content: parseData.structuredData,
          parsed_content: result.optimizedResume,
          updated_at: new Date().toISOString()
        })
        .eq("id", activeResume.id)
        .select()
        .single();

      if (error) throw error;

      setActiveResume(data);
      refreshResumes();
      toast.success("AI optimization successfully applied to your resume!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to apply optimization: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  // Synchronize result view when activeResume is already optimized
  useEffect(() => {
    if (activeResume && activeResume.feedback) {
      try {
        const parsed = typeof activeResume.feedback === "string"
          ? JSON.parse(activeResume.feedback)
          : activeResume.feedback;
        if (parsed.company_name) {
          setSelectedCompany(parsed.company_name);
          setResult({
            companyAtsScore: activeResume.ats_score || activeResume.score || 0,
            matchPercentage: parsed.match_percentage || 0,
            missingSkills: parsed.missing_skills || [],
            interviewTips: parsed.interview_tips || [],
            companyKeywords: parsed.company_keywords || parsed.companyKeywords || [],
            recommendedProjects: parsed.recommended_projects || parsed.recommendedProjects || [],
            preparationRoadmap: parsed.preparation_roadmap || parsed.preparationRoadmap || [],
            interviewPattern: parsed.interview_pattern || parsed.interviewPattern || [],
            expectedQuestions: parsed.expected_questions || parsed.expectedQuestions || [],
            optimizedResume: activeResume.parsed_content || ""
          });
        } else {
          setResult(null);
        }
      } catch (e) {
        console.error("Error parsing optimized resume feedback:", e);
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [activeResume]);

  const handleOptimize = async () => {
    if (!activeResume) {
      toast.warning("Please upload or create a resume first.");
      return;
    }
    if (!selectedCompany) {
      toast.warning("Please select a target company.");
      return;
    }

    setIsOptimizing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch("/api/resume/optimize-company", {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeId: activeResume.id,
          companyName: selectedCompany
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to optimize resume");
      }

      const data = await response.json();
      setResult(data);

      // Fetch the newly created resume row
      const { data: updatedResume, error: fetchErr } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("id", data.newResumeId)
        .single();

      if (fetchErr || !updatedResume) throw fetchErr || new Error("New resume row not found");

      setActiveResume(updatedResume);
      refreshResumes();

      // Log activity
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: `Optimized Resume for ${selectedCompany}`,
          module: "Resume Builder"
        })
      }).catch(() => {});

      toast.success(`Resume successfully optimized for ${selectedCompany}! It has been saved as a new version.`);
    } catch (err: any) {
      console.error(err);
      toast.error("Optimization failed: " + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div className="space-y-1" variants={itemVariants}>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          Company Resume Optimizer
        </h2>
        <p className="text-sm text-zinc-500">
          Optimize your resume formatting, objective, experience metrics, and keywords for a specific company's hiring preferences.
        </p>
      </motion.div>

      {!activeResume ? (
        <motion.div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" variants={itemVariants}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 font-semibold">No active resume loaded. Please upload or build a resume first.</p>
          <button onClick={() => onNavigate("create")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors border-none cursor-pointer">
            <FileText className="w-4 h-4" /> Create Resume
          </button>
        </motion.div>
      ) : (
        <>
          {/* Company Selection Grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={itemVariants}>
            {companiesList.map((company) => {
              const isSelected = selectedCompany === company.name;
              return (
                <div
                  key={company.slug}
                  onClick={() => !isOptimizing && setSelectedCompany(company.name)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-[210px] bg-white dark:bg-zinc-950 shadow-3xs ${company.hoverBg} ${
                    isSelected
                      ? `ring-2 ring-indigo-500 border-indigo-350 dark:border-indigo-800 shadow-lg shadow-indigo-500/10`
                      : "border-zinc-200 dark:border-zinc-850 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white mb-4 shadow-sm`}>
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white mb-2">{company.name}</h3>
                    <p className="text-4xs font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">{company.desc}</p>
                  </div>
                  <div className="flex items-center justify-end text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {isSelected ? "Selected" : "Select Target"}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Trigger Button */}
          <motion.div className="flex justify-center" variants={itemVariants}>
            <Button
              onClick={handleOptimize}
              isLoading={isOptimizing}
              disabled={!selectedCompany || isOptimizing}
              size="lg"
              className="px-8 py-3 rounded-xl text-sm font-bold gap-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-white" />
              {selectedCompany ? `Optimize Resume for ${selectedCompany}` : "Select Company to Optimize"}
            </Button>
          </motion.div>

          {/* Results Analysis View */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Stats Ring Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Company ATS Score */}
                  <div className="md:col-span-6 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-2">
                    <h3 className="font-black text-xs text-zinc-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Target className="w-4 h-4 text-indigo-500" /> ATS Compatibility
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center w-full">
                      <ATSScoreRing score={result.companyAtsScore} size={130} strokeWidth={9} label="Company ATS" />
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-lg font-black text-zinc-850 dark:text-white">{selectedCompany} Match</p>
                        <p className="text-4xs font-bold text-zinc-400 uppercase tracking-wider">Candidate readiness evaluation</p>
                        <div className="flex gap-1.5 mt-2 justify-center sm:justify-start">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            result.companyAtsScore >= 80 ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20" :
                            result.companyAtsScore >= 65 ? "text-amber-700 bg-amber-50 dark:bg-amber-950/20" :
                            "text-red-700 bg-red-50 dark:bg-red-950/20"
                          }`}>{result.companyAtsScore >= 80 ? "Highly Compatible" : result.companyAtsScore >= 65 ? "Adequate Fit" : "Critical Gaps"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Match Percentage */}
                  <div className="md:col-span-6 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-2">
                    <h3 className="font-black text-xs text-zinc-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-500" /> Match Percentage
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center w-full">
                      <ATSScoreRing score={result.matchPercentage} size={130} strokeWidth={9} label="Match %" />
                      <div className="space-y-2 max-w-xs text-center sm:text-left">
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                          Your profile aligns with <span className="font-black text-indigo-600 dark:text-indigo-400">{result.matchPercentage}%</span> of {selectedCompany}'s core skill expectations and target qualifications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gaps & Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Missing Skills */}
                  <div className="p-5 rounded-2xl border border-rose-250 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/5">
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-450 flex items-center gap-1.5 mb-3"><AlertTriangle className="w-3.5 h-3.5" /> Missing Skills / Gaps</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills && result.missingSkills.length > 0 ? (
                        result.missingSkills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900">{skill}</span>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No critical missing skills detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Interview Preparation Tips */}
                  <div className="p-5 rounded-2xl border border-indigo-250 dark:border-indigo-900/40 bg-indigo-50/10 dark:bg-indigo-950/5">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-3"><BookOpen className="w-3.5 h-3.5" /> Interview Readiness Tips</h4>
                    <ul className="space-y-2 pl-0 list-none">
                      {result.interviewTips && result.interviewTips.length > 0 ? (
                        result.interviewTips.map((tip: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" /><span>{tip}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No specific interview tips generated.</p>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Company Keywords */}
                {result.companyKeywords && result.companyKeywords.length > 0 && (
                  <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-indigo-500" /> Target Company Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.companyKeywords.map((k: string) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-750 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/60">{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roadmap & Interview Pattern */}
                {((result.preparationRoadmap && result.preparationRoadmap.length > 0) || 
                  (result.interviewPattern && result.interviewPattern.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preparation Roadmap */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-500" /> Preparation Roadmap
                      </h4>
                      <div className="space-y-3 pl-1">
                        {result.preparationRoadmap && result.preparationRoadmap.length > 0 ? (
                          result.preparationRoadmap.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">{i + 1}</div>
                              <p className="leading-relaxed">{step}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No roadmap available.</p>
                        )}
                      </div>
                    </div>

                    {/* Interview Pattern */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-violet-500" /> Typical Interview Rounds
                      </h4>
                      <div className="space-y-3 pl-1">
                        {result.interviewPattern && result.interviewPattern.length > 0 ? (
                          result.interviewPattern.map((pattern: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              <div className="w-5 h-5 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 flex items-center justify-center text-[10px] font-black text-violet-600 dark:text-violet-400 shrink-0 mt-0.5">{i + 1}</div>
                              <p className="leading-relaxed">{pattern}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No pattern available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Projects & Expected Questions */}
                {((result.recommendedProjects && result.recommendedProjects.length > 0) || 
                  (result.expectedQuestions && result.expectedQuestions.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recommended Projects */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-500" /> Recommended Stand-out Projects
                      </h4>
                      <ul className="space-y-2.5 pl-0 list-none">
                        {result.recommendedProjects && result.recommendedProjects.length > 0 ? (
                          result.recommendedProjects.map((proj: string, idx: number) => (
                            <li key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-850 flex items-start gap-3">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 font-bold shrink-0 mt-0.5">💡</div>
                              <div>
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Project Recommendation {idx + 1}</p>
                                <p className="text-[10px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 mt-0.5">{proj}</p>
                              </div>
                            </li>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No project recommendations available.</p>
                        )}
                      </ul>
                    </div>

                    {/* Expected Questions */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowRight className="w-4 h-4 text-blue-505" /> Expected Technical & Behavioral Questions
                      </h4>
                      <ul className="space-y-2 pl-0 list-none">
                        {result.expectedQuestions && result.expectedQuestions.length > 0 ? (
                          result.expectedQuestions.map((q: string, idx: number) => (
                            <li key={idx} className="flex flex-col p-3 rounded-xl bg-zinc-50/55 dark:bg-zinc-900/40 border border-zinc-150/80 dark:border-zinc-850 text-xs font-medium leading-relaxed">
                              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Interview Question {idx + 1}</span>
                              <span>{q}</span>
                            </li>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No expected questions available.</p>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Side-by-Side Comparison */}
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Side-by-Side Optimized Text Comparison
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Original */}
                    <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Original Resume Text</span>
                      </div>
                      <div className="p-4 h-96 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/20 text-xs font-mono whitespace-pre-wrap leading-relaxed text-zinc-505 dark:text-zinc-400 scrollbar-thin">
                        {originalText || (
                          <span className="text-zinc-450 italic">No text content available.</span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Optimized */}
                    <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Company-Optimized Resume (Markdown)
                        </span>
                        {result?.optimizedResume && (
                          <button
                            onClick={handleApplyAIChanges}
                            disabled={isApplying}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all border-none cursor-pointer flex items-center gap-1"
                          >
                            {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isApplying ? "Applying..." : "Apply to Resume"}
                          </button>
                        )}
                      </div>
                      <div className="p-4 h-96 overflow-y-auto bg-indigo-50/5 dark:bg-zinc-950/20 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 scrollbar-thin">
                        {result.optimizedResume ? (
                          <pre className="whitespace-pre-wrap font-mono text-zinc-800 dark:text-zinc-350">{result.optimizedResume}</pre>
                        ) : (
                          <span className="text-zinc-450 italic">No optimized version generated yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
