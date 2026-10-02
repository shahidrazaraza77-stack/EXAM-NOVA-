"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import PlacementSetup from "./placement/PlacementSetup";
import ResumeScreeningRound from "./placement/ResumeScreeningRound";
import AptitudeRound from "./placement/AptitudeRound";
import CodingRound from "./placement/CodingRound";
import InterviewRound from "./placement/InterviewRound";
import ResultScreen from "./placement/ResultScreen";
import { getRoundTimeLimit, MOCK_APTITUDE_QUESTIONS, MOCK_CODING_CHALLENGES } from "../components/mockData";
import { mockPlacementService } from "@/services/mock-placement.service";
import { resumeService } from "@/services/resume";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type PlacementStage = "setup" | "resume" | "aptitude" | "coding" | "interview" | "result";

interface StartPlacementViewProps {
  onNavigate?: (tab: string) => void;
}

export default function StartPlacementView({ onNavigate }: StartPlacementViewProps) {
  const { user } = useAuth();
  const [stage, setStage] = useState<PlacementStage>("setup");
  const [selectedCompany, setSelectedCompany] = useState("TCS");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState("Standard");
  const [mockId, setMockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const [roundScores, setRoundScores] = useState({ resume: 0, aptitude: 0, coding: 0, interview: 0 });
  const [overallScore, setOverallScore] = useState(0);
  const [finalResult, setFinalResult] = useState<"Selected" | "Borderline" | "Not Selected">("Not Selected");

  const stages: PlacementStage[] = ["resume", "aptitude", "coding", "interview"];
  const currentStageIndex = stages.indexOf(stage as any);
  const totalStages = stages.length;
  const progress = ((currentStageIndex >= 0 ? currentStageIndex : 0) / totalStages) * 100;

  const stageLabels: Record<string, string> = {
    resume: "Resume Screening Round",
    aptitude: "Aptitude Round",
    coding: "Coding Round",
    interview: "AI Interview (HR + Technical)",
  };

  useEffect(() => {
    if (user?.id) {
      resumeService.getResumes(user.id).then((resList) => {
        setResumes(resList);
        if (resList.length > 0) {
          setSelectedResumeId(resList[0].id);
        }
      }).catch((err) => {
        console.error("Failed to fetch resumes:", err);
      });
    }
  }, [user?.id]);

  const handleStart = async () => {
    if (!user?.id || !selectedResumeId) return;
    setLoading(true);
    try {
      // 1. Resolve companyId from companies table
      const { data: compData, error: compError } = await (supabase as any)
        .from("companies")
        .select("id")
        .eq("name", selectedCompany)
        .single();

      if (compError || !compData) {
        throw new Error(compError?.message || "Company not found in database");
      }

      setSelectedCompanyId(compData.id);

      // 2. Start mock placement simulation
      const result = await mockPlacementService.startPlacement(user.id, compData.id, selectedResumeId);
      setMockId(result.mock.id);
      setStage("resume");
    } catch (err: any) {
      console.error("Failed to start mock placement drive:", err?.message || err);
      // Fallback
      setStage("resume");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeComplete = async (score: number) => {
    setLoading(true);
    try {
      if (mockId) {
        await mockPlacementService.submitRound(mockId, "resume", score, []);
      }
      setRoundScores(prev => ({ ...prev, resume: score }));
      setStage("aptitude");
    } catch (err) {
      console.error("Resume round submit failed:", err);
      setStage("aptitude");
    } finally {
      setLoading(false);
    }
  };

  const handleAptitudeComplete = async (answers: Record<string, number>) => {
    setLoading(true);
    try {
      // 1. Calculate score
      const answered = Object.keys(answers).length;
      const correct = MOCK_APTITUDE_QUESTIONS.filter(q => answers[q.id] === q.correctIdx).length;
      const score = answered > 0 ? Math.round((correct / MOCK_APTITUDE_QUESTIONS.length) * 100) : 0;

      // 2. Map attempts
      const attempts = MOCK_APTITUDE_QUESTIONS.map(q => {
        const ansIdx = answers[q.id];
        return {
          question_id: q.id,
          answer: ansIdx !== undefined ? q.options[ansIdx] : null,
          is_correct: ansIdx === q.correctIdx,
          score: ansIdx === q.correctIdx ? 100 : 0
        };
      });

      // 3. Save to database
      if (mockId) {
        await mockPlacementService.submitRound(mockId, "aptitude", score, attempts);
      }
      setRoundScores(prev => ({ ...prev, aptitude: score }));
      setStage("coding");
    } catch (err) {
      console.error("Aptitude round submit failed:", err);
      setStage("coding");
    } finally {
      setLoading(false);
    }
  };

  const handleCodingComplete = async (solution: string, testResults: boolean[]) => {
    setLoading(true);
    try {
      // 1. Calculate score
      const passCount = testResults.filter(Boolean).length;
      const totalTests = testResults.length;
      const score = totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 0;

      // 2. Map attempts
      const challenge = MOCK_CODING_CHALLENGES[0]; // Active challenge
      const attempts = [{
        question_id: challenge.id,
        answer: solution,
        is_correct: passCount === totalTests,
        score: score
      }];

      // 3. Save to database
      if (mockId) {
        await mockPlacementService.submitRound(mockId, "coding", score, attempts);
      }
      setRoundScores(prev => ({ ...prev, coding: score }));
      setStage("interview");
    } catch (err) {
      console.error("Coding round submit failed:", err);
      setStage("interview");
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewComplete = async (score: number, attempts: any[]) => {
    setLoading(true);
    try {
      // 1. Save interview round score
      if (mockId) {
        await mockPlacementService.submitRound(mockId, "interview", score, attempts);
      }
      const updatedScores = { ...roundScores, interview: score };
      setRoundScores(updatedScores);

      // 2. Finalize Drive (re-calculates weighted score, calls Gemini feedback generator, updates status)
      if (mockId) {
        const { data: compData } = await (supabase as any)
          .from("companies")
          .select("id")
          .eq("name", selectedCompany)
          .single();

        if (compData) {
          const finalOutcome = await mockPlacementService.calculateFinalResult(mockId, compData.id);
          setOverallScore(finalOutcome.final_score);
          setFinalResult(finalOutcome.selected ? "Selected" : "Not Selected");
        }
      }
      setStage("result");
    } catch (err) {
      console.error("Interview round finalize failed:", err);
      setStage("result");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // Result saved dynamically in calculateFinalResult, but let's navigate to history
    if (onNavigate) {
      onNavigate("history");
    }
  };

  const handleRestart = () => {
    setStage("setup");
    setMockId(null);
    setRoundScores({ resume: 0, aptitude: 0, coding: 0, interview: 0 });
    setOverallScore(0);
    setFinalResult("Not Selected");
  };

  const renderStage = () => {
    if (loading && stage !== "interview" && stage !== "resume") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-xs text-zinc-400">Saving round attempt...</p>
        </div>
      );
    }

    switch (stage) {
      case "setup":
        return (
          <PlacementSetup
            selectedCompany={selectedCompany}
            selectedMode={selectedMode}
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            onCompanyChange={setSelectedCompany}
            onModeChange={setSelectedMode}
            onResumeChange={setSelectedResumeId}
            onStart={handleStart}
          />
        );
      case "resume":
        return (
          <ResumeScreeningRound
            resumeId={selectedResumeId || ""}
            companyId={selectedCompanyId || ""}
            companyName={selectedCompany}
            onComplete={handleResumeComplete}
            onExit={handleRestart}
          />
        );
      case "aptitude":
        return <AptitudeRound timeLimit={getRoundTimeLimit("aptitude", selectedMode)} onComplete={handleAptitudeComplete} />;
      case "coding":
        return <CodingRound timeLimit={getRoundTimeLimit("coding", selectedMode)} onComplete={handleCodingComplete} />;
      case "interview":
        return <InterviewRound companyName={selectedCompany} difficulty={selectedMode} onComplete={handleInterviewComplete} />;
      case "result":
        return (
          <ResultScreen 
            company={selectedCompany} 
            mode={selectedMode} 
            roundScores={{ ...roundScores, technical: roundScores.interview, hr: roundScores.interview }} 
            overallScore={overallScore} 
            result={finalResult} 
            onSave={handleSave} 
            onRestart={handleRestart} 
            onHome={() => onNavigate?.("overview")}
            mockId={mockId || undefined}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {stage !== "setup" && stage !== "result" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStageIndex > 0 && (
                <button 
                  onClick={() => setStage(stages[currentStageIndex - 1])}
                  disabled={loading}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-all disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-500" />
                </button>
              )}
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">{selectedCompany} Placement Simulation</h3>
                <p className="text-[10px] text-zinc-500">{stageLabels[stage]} ({currentStageIndex + 1}/{totalStages})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {stages.map((s, i) => (
                  <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${i < currentStageIndex ? "bg-emerald-500" : i === currentStageIndex ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          {renderStage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
