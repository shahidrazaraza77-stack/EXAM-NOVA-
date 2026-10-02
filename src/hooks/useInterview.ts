"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";
import { interviewService } from "@/services/interview.service";
import { interviewModes, type InterviewMode } from "@/app/(dashboard)/dashboard/interview-coach/components/mockData";

export interface InterviewConfig {
  type: "HR" | "Technical" | "Mixed";
  role: string;
  difficulty: string;
  company: string | null;
  mode: InterviewMode;
}

export interface SessionReport {
  score: number;
  duration: string;
  feedbackCount: number;
  breakdown: {
    communication: number;
    technical: number;
    confidence: number;
    clarity: number;
    problemSolving: number;
  };
  weakAreas?: string[];
  improvementRoadmap?: string[];
}

export function useInterview() {
  const { user } = useAuth();
  const { awardXP, trackActivity, updateChallengeProgress, updateMissionProgress } = useGamification();

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>({
    type: "HR",
    role: "Software Engineer",
    difficulty: "Medium",
    company: null,
    mode: interviewModes[0],
  });

  const [sessionId, setSessionId] = useState<string | null>(null);

  const startSession = useCallback(async (config: InterviewConfig) => {
    if (!user?.id) throw new Error("User not authenticated");
    setInterviewConfig(config);
    const session = await interviewService.startSession(
      user.id, config.type, config.role, config.difficulty, config.company
    );
    setSessionId(session.id);
    const firstQuestion = await interviewService.generateQuestion(
      session.id, config.type, config.role, config.difficulty, []
    );
    return {
      sessionId: session.id,
      question: {
        id: firstQuestion.id,
        text: firstQuestion.question,
        type: (firstQuestion.mode === "technical" ? "Technical" : "HR") as "HR" | "Technical",
      },
    };
  }, [user?.id]);

  const generateNextQuestion = useCallback(async (previousTexts: string[]) => {
    if (!sessionId) return null;
    try {
      const question = await interviewService.generateQuestion(
        sessionId, interviewConfig.type, interviewConfig.role, interviewConfig.difficulty, previousTexts
      );
      return {
        id: question.id,
        text: question.question,
        type: (question.mode === "technical" ? "Technical" : "HR") as "HR" | "Technical",
      };
    } catch {
      return null;
    }
  }, [sessionId, interviewConfig]);

  const completeSession = useCallback((report: SessionReport) => {
    trackActivity("interview");
    updateChallengeProgress("interview");
    updateMissionProgress("interviews");
    const xpGained = Math.max(10, Math.round(report.score * 0.8));
    awardXP(xpGained, `Completed ${interviewConfig.type} Interview`);
    if (report.score >= 80) awardXP(25, "High Score Bonus");
  }, [trackActivity, updateChallengeProgress, updateMissionProgress, awardXP, interviewConfig.type]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setInterviewConfig({
      type: "HR",
      role: "Software Engineer",
      difficulty: "Medium",
      company: null,
      mode: interviewModes[0],
    });
  }, []);

  return {
    interviewConfig,
    setInterviewConfig,
    sessionId,
    startSession,
    generateNextQuestion,
    completeSession,
    resetSession,
    user,
  };
}
