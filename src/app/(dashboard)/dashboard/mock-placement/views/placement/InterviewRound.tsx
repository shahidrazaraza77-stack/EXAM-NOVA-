"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Clock, Send, Loader2, Video, User, HelpCircle, Activity, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import MockWebcam from "@/app/(dashboard)/dashboard/interview-coach/components/MockWebcam";
import AnalysisOverlay from "@/app/(dashboard)/dashboard/interview-coach/components/AnalysisOverlay";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/context/AuthContext";

interface InterviewRoundProps {
  companyName: string;
  difficulty: string;
  onComplete: (score: number, attempts: any[]) => void;
}

export default function InterviewRound({ companyName, difficulty, onComplete }: InterviewRoundProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [feedbackResults, setFeedbackResults] = useState<any[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [attemptsList, setAttemptsList] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const QUESTION_COUNT = 3; // 3 questions for placement simulation interview round
  const activeQuestion = questions[currentIdx];
  const progress = Math.min(100, ((currentIdx + 1) / QUESTION_COUNT) * 100);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start interview session on mount
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const uid: string = userId;
    async function startSession() {
      try {
        const sess = await interviewService.startSession(
          uid,
          "mixed",
          "Software Engineer",
          difficulty,
          companyName
        );
        setSession(sess);

        const firstQ = await interviewService.generateQuestion(
          sess.id,
          "mixed",
          "Software Engineer",
          difficulty,
          []
        );
        setQuestions([firstQ]);
      } catch (err) {
        console.error("Failed to start placement interview:", err);
      }
    }
    startSession();
  }, [user?.id, companyName, difficulty]);

  // Handle timer
  useEffect(() => {
    if (isFinalizing || showAnalysis) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx, isFinalizing, showAnalysis]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting || !session) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const savedAnswer = await interviewService.submitAnswer(
        session.id,
        activeQuestion.id,
        activeQuestion.question,
        answer
      );

      const evaluation = await interviewService.evaluateAnswer(
        session.id,
        savedAnswer.id,
        activeQuestion.question,
        answer
      );

      const feedbackWithMeta = { 
        ...evaluation, 
        questionText: activeQuestion.question, 
        questionType: activeQuestion.mode 
      };

      setCurrentFeedback(feedbackWithMeta);
      setFeedbackResults((prev) => [...prev, feedbackWithMeta]);
      
      // Save attempt mapping
      setAttemptsList((prev) => [...prev, {
        question_id: activeQuestion.id,
        answer: answer,
        is_correct: evaluation.score >= 65,
        score: evaluation.score
      }]);

      setShowAnalysis(true);
    } catch (e) {
      console.error("Failed to evaluate answer:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setShowAnalysis(false);
    setAnswer("");

    if (currentIdx < QUESTION_COUNT - 1) {
      try {
        const prevTexts = questions.map(q => q.question);
        const question = await interviewService.generateQuestion(
          session.id,
          "mixed",
          "Software Engineer",
          difficulty,
          prevTexts
        );
        setQuestions((prev) => [...prev, question]);
        setCurrentIdx((prev) => prev + 1);
      } catch {
        handleEndInterview();
      }
    } else {
      handleEndInterview();
    }
  };

  const handleEndInterview = async () => {
    setShowAnalysis(false);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsFinalizing(true);
    try {
      let finalScore = 0;
      if (session) {
        const result = await interviewService.completeSession(session.id, timerSeconds);
        finalScore = result.report.score;
      } else {
        const avg = Math.round(feedbackResults.reduce((acc, f) => acc + (f.score || 0), 0) / Math.max(1, feedbackResults.length));
        finalScore = avg;
      }
      onComplete(finalScore, attemptsList);
    } catch (e) {
      console.error("Error finalizing interview:", e);
      const avg = Math.round(feedbackResults.reduce((acc, f) => acc + (f.score || 0), 0) / Math.max(1, feedbackResults.length));
      onComplete(avg, attemptsList);
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isFinalizing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Analyzing Interview Performance</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
            Running speech structures and technical concepts verification...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-zinc-400">Waking up AI Interviewer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-500 animate-pulse" />
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">AI Interview (HR + Technical)</h2>
            <span className="text-[10px] text-zinc-500">Question {currentIdx + 1} of {QUESTION_COUNT}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold tabular-nums text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border">
          <Clock className="w-3.5 h-3.5 text-violet-500" />
          {formatTime(timerSeconds)}
        </div>
      </div>

      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-5 text-center flex-1 flex flex-col justify-center">
            <div className="mx-auto w-24 h-24 rounded-full border-2 border-dashed border-violet-500/30 flex items-center justify-center relative">
              <div className="absolute inset-1.5 rounded-full bg-violet-600/10 flex items-center justify-center shadow-lg border border-violet-500/25">
                <Brain className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="absolute inset-0 border-2 border-violet-500/60 rounded-full border-t-transparent border-r-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">AI INTERVIEWER</span>
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                <span className="px-2 py-0.5 rounded-full font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">Mixed Round</span>
                <span className="text-zinc-400 capitalize">{difficulty}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 mt-4">
            <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1.5">Question</span>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-relaxed">{activeQuestion.question}</p>
          </div>
        </Card>

        <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col shadow-sm">
          <MockWebcam isRecording={false} />

          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <User className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold tracking-tight text-zinc-600 dark:text-zinc-300">Your Response</span>
            </div>
          </div>

          <div className="mt-3 flex-1">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be detailed and articulate for the best score."
              className="w-full min-h-[160px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isSubmitting}
              className="bg-aurora-primary hover:bg-aurora-primary-hover text-white font-bold text-xs py-3 px-5 rounded-xl cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                : <><Send className="w-3.5 h-3.5" /> Submit Response</>}
            </Button>
            <Button variant="outline" onClick={handleEndInterview} className="text-xs font-bold text-aurora-danger border-aurora-danger/20 hover:bg-aurora-danger/10 cursor-pointer">
              End Interview
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col shadow-sm justify-between">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Answer Preview
            </span>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex-1 overflow-y-auto text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[120px]">
              {answer ? answer : <p className="text-zinc-400 italic">Type your response to see a live preview.</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
              <span>Completed: {feedbackResults.length} / {QUESTION_COUNT}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500" style={{ width: `${(feedbackResults.length / QUESTION_COUNT) * 100}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <AnalysisOverlay
        isOpen={showAnalysis}
        onNext={handleNextQuestion}
        onEndInterview={handleEndInterview}
        isLastQuestion={currentIdx >= QUESTION_COUNT - 1}
        questionText={activeQuestion.question}
        feedback={currentFeedback}
        isLoading={isSubmitting}
      />
    </div>
  );
}
