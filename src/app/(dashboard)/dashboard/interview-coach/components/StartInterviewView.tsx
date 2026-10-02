import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ChevronRight, ArrowLeft, UserCheck, Code2, Sparkles, Briefcase,
  Award, CheckCircle2, Building2, BarChart3, Clock, Zap,
  GraduationCap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { roles, difficulties, companies, interviewModes, type InterviewMode } from "./mockData";
import { useAuth } from "@/context/AuthContext";
import { resumeService } from "@/services/resume";

interface StartInterviewViewProps {
  onStart: (config: {
    type: "HR" | "Technical" | "Mixed" | "Company" | "Resume";
    role: string;
    difficulty: string;
    company: string | null;
    resumeId: string | null;
    mode: InterviewMode;
  }) => void;
  onCancel: () => void;
}

const types: { value: "HR" | "Technical" | "Mixed" | "Company" | "Resume"; label: string; desc: string; icon: any }[] = [
  { value: "HR", label: "HR Interview", desc: "Behavioral, leadership, and culture fit questions", icon: UserCheck },
  { value: "Technical", label: "Technical Interview", desc: "Core concepts, design, and programming questions", icon: Code2 },
  { value: "Mixed", label: "Mixed Interview", desc: "Combination of technical knowledge and behavior", icon: Sparkles },
  { value: "Company", label: "Company Interview", desc: "Targeted questions matching specific company processes", icon: Building2 },
  { value: "Resume", label: "Resume-based", desc: "Personalized questions testing your resume achievements", icon: Briefcase },
];

const stepLabels = ["Type", "Role", "Difficulty", "Company", "Mode"];

export default function StartInterviewView({ onStart, onCancel }: StartInterviewViewProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"HR" | "Technical" | "Mixed" | "Company" | "Resume">("HR");
  const [role, setRole] = useState(roles[0]);
  const [difficulty, setDifficulty] = useState(difficulties[1]);
  const [company, setCompany] = useState<string | null>(null);
  const [mode, setMode] = useState<InterviewMode>(interviewModes[0]);
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    const userId = user?.id;
    if (type === "Resume" && userId) {
      const activeId: string = userId;
      async function fetchResumes() {
        try {
          setLoadingResumes(true);
          const list = await resumeService.getResumes(activeId);
          setResumes(list);
          if (list.length > 0) {
            setSelectedResumeId(list[0].id);
          }
        } catch (err) {
          console.error("Failed to fetch resumes:", err);
        } finally {
          setLoadingResumes(false);
        }
      }
      fetchResumes();
    }
  }, [type, user?.id]);

  const canProceed = () => {
    switch (step) {
      case 0: return !!type;
      case 1: return !!role;
      case 2: return !!difficulty;
      case 3: 
        if (type === "Company") return !!company;
        if (type === "Resume") return !!selectedResumeId;
        return true;
      case 4: return !!mode;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else onCancel();
  };

  const handleStart = () => {
    onStart({ type, role, difficulty, company, resumeId: selectedResumeId, mode });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-aurora-text-muted hover:text-aurora-text gap-1.5 cursor-pointer -ml-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> {step === 0 ? "Back" : "Previous Step"}
        </Button>
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                i < step ? "bg-emerald-500 text-white" : i === step ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
              )}>
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[10px] font-semibold hidden sm:inline", i === step ? "text-violet-600 dark:text-violet-400" : "text-zinc-400")}>{label}</span>
              {i < stepLabels.length - 1 && <span className="text-zinc-300 dark:text-zinc-700 text-xs mx-0.5">→</span>}
            </div>
          ))}
        </div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Select Interview Type</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {types.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.value;
                return (
                  <Card
                    key={t.value}
                    hoverEffect
                    onClick={() => setType(t.value)}
                    className={cn(
                      "p-5 cursor-pointer border transition-all",
                      isSelected ? "border-violet-600 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 shadow-md" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className="space-y-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        isSelected ? "bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{t.label}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.desc}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Select Role</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "p-4 rounded-xl text-left cursor-pointer border transition-all",
                      isSelected ? "border-violet-600 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-extrabold shadow-sm" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <GraduationCap className={cn("w-5 h-5 mb-2", isSelected ? "text-violet-600" : "text-zinc-400")} />
                    <span className="text-sm font-semibold">{r}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Select Difficulty</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {difficulties.map((d) => {
                const isSelected = difficulty === d;
                const colors: Record<string, string> = {
                  Easy: "from-emerald-500 to-teal-500",
                  Medium: "from-amber-500 to-orange-500",
                  Hard: "from-red-500 to-rose-500",
                };
                return (
                  <div
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "p-6 rounded-2xl text-center cursor-pointer border transition-all",
                      isSelected
                        ? "border-transparent shadow-lg text-white"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                    style={isSelected ? { background: `linear-gradient(135deg, ${colors[d].split(" ")[0].replace("from-", "")}, ${colors[d].split(" ")[1].replace("to-", "")})` } : {}}
                  >
                    <Award className={cn("w-8 h-8 mx-auto mb-2", isSelected ? "text-white" : "text-zinc-400")} />
                    <span className="text-base font-extrabold block">{d}</span>
                    <span className="text-xs opacity-80 mt-1 block">
                      {d === "Easy" ? "Basic questions" : d === "Medium" ? "Moderate complexity" : "Advanced topics"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}        {step === 3 && type === "Resume" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Select Resume</h3>
              <span className="text-[10px] font-semibold text-zinc-450 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full animate-pulse">Mandatory</span>
            </div>
            {loadingResumes ? (
              <div className="text-center py-8 text-sm text-zinc-550 font-semibold flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full" />
                Loading your resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-zinc-50 dark:bg-zinc-950/50">
                <p className="text-sm text-zinc-500 font-medium">No resumes found. Please upload a resume first.</p>
                <Link href="/dashboard/resume" className="inline-block mt-3">
                  <Button variant="primary" size="sm" className="text-xs">
                    Upload Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resumes.map((res) => {
                  const isSelected = selectedResumeId === res.id;
                  return (
                    <button
                      key={res.id}
                      onClick={() => setSelectedResumeId(res.id)}
                      className={cn(
                        "p-4 rounded-xl text-left cursor-pointer border transition-all flex items-start gap-3 w-full",
                        isSelected ? "border-violet-600 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-955/20 text-violet-750 dark:text-violet-400 font-extrabold shadow-sm" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-605 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <UserCheck className={cn("w-5 h-5 shrink-0 mt-0.5", isSelected ? "text-violet-600" : "text-zinc-400")} />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold block truncate">{res.name || res.file_name}</span>
                        <span className="text-[10px] text-zinc-405 block font-medium mt-0.5">Score: {res.score || "N/A"} | Version: v{res.version || 1}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 3 && type !== "Resume" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {type === "Company" ? "Select Target Company" : "Select Company (Optional)"}
              </h3>
              <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full">
                {type === "Company" ? "Mandatory" : "Skip for general"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {type !== "Company" && (
                <button
                  onClick={() => setCompany(null)}
                  className={cn(
                    "p-4 rounded-xl text-center cursor-pointer border transition-all flex flex-col items-center gap-2",
                    !company ? "border-violet-600 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-955/40 shadow-sm" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <Zap className={cn("w-6 h-6", !company ? "text-violet-600" : "text-zinc-400")} />
                  <span className="text-xs font-semibold">General</span>
                </button>
              )}
              {companies.map((c) => {
                const isSelected = company === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCompany(c.id)}
                    className={cn(
                      "p-4 rounded-xl text-center cursor-pointer border transition-all flex flex-col items-center gap-2",
                      isSelected ? "border-violet-600 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-955/40 shadow-sm" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Building2 className={cn("w-6 h-6", isSelected ? "text-violet-600" : "text-zinc-400")} />
                    <span className="text-xs font-semibold">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Select Interview Mode</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewModes.map((m) => {
                const isSelected = mode.id === m.id;
                const Icon = m.id === "quick" ? Zap : m.id === "standard" ? Clock : BarChart3;
                return (
                  <Card
                    key={m.id}
                    hoverEffect
                    onClick={() => setMode(m)}
                    className={cn(
                      "p-6 cursor-pointer border transition-all",
                      isSelected ? "border-violet-600 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 shadow-md" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    )}
                  >
                    <div className="space-y-4 text-center">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto",
                        isSelected ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                      )}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-zinc-900 dark:text-white">{m.label}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{m.description}</p>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs font-semibold text-zinc-400">
                        <span>{m.questionCount} questions</span>
                        <span>{m.duration}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2.5 rounded-xl cursor-pointer text-xs font-bold bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white shadow-lg shadow-violet-500/15 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleStart}
            className="px-8 py-2.5 rounded-xl cursor-pointer text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 gap-2"
          >
            <Sparkles className="w-4 h-4" /> Start Interview
          </Button>
        )}
      </div>
    </div>
  );
}
