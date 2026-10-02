"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight, Ban, Sparkles, Volume2, Mic, MicOff, Activity, Send, Loader2,
  ArrowLeft, ChevronRight, Clock, HelpCircle, MessageSquare, User,
  Brain, Target, Zap, BarChart3
} from "lucide-react";
import { InterviewQuestionItem } from "./mockData";
import MockWebcam from "./MockWebcam";
import AnalysisOverlay from "./AnalysisOverlay";
import { interviewService } from "@/services/interview.service";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface LiveInterviewProps {
  role: string;
  difficulty: string;
  interviewType: "HR" | "Technical" | "Mixed" | "Company" | "Resume";
  questions: InterviewQuestionItem[];
  sessionId: string;
  questionCount: number;
  company: string | null;
  onAddQuestion: (previousQAs: { question: string; answer: string }[]) => Promise<InterviewQuestionItem | null>;
  onComplete: (sessionData: {
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
  }) => void;
  onCancel: () => void;
}

export default function LiveInterview({
  role, difficulty, interviewType, questions, sessionId, questionCount, company,
  onAddQuestion, onComplete, onCancel
}: LiveInterviewProps) {
  const { toast } = useToast();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [feedbackResults, setFeedbackResults] = useState<any[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [previousQAs, setPreviousQAs] = useState<{ question: string; answer: string }[]>([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<InterviewQuestionItem[]>(questions);
  const [startTime] = useState<number>(Date.now());
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setSpeechSupported(false);
        toast.warning("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setAnswer((prev) => (prev ? prev + " " + transcript : transcript));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone access was denied. Please allow microphone permissions in your browser settings.");
        } else if (event.error === "network") {
          toast.error("Speech recognition failed due to a network connection error.");
        } else {
          toast.error(`Speech recognition failed: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e: any) {
      console.error("Failed to start speech recognition:", e);
      toast.error("Could not access your microphone. Please verify permission settings.");
      setSpeechSupported(false);
    }
  }, [isListening, toast]);

  const activeQuestion = localQuestions[currentQuestionIdx];
  const totalQuestions = Math.max(questionCount, localQuestions.length);
  const progress = Math.min(100, ((currentQuestionIdx + 1) / totalQuestions) * 100);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQuestionIdx]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const savedAnswer = await interviewService.submitAnswer(sessionId, activeQuestion.id, activeQuestion.text, answer);

      const evaluation = await interviewService.evaluateAnswer(sessionId, savedAnswer.id, activeQuestion.text, answer);

      const feedbackWithMeta = { ...evaluation, questionText: activeQuestion.text, questionType: activeQuestion.type };
      setCurrentFeedback(feedbackWithMeta);
      setFeedbackResults((prev) => [...prev, feedbackWithMeta]);
      setPreviousQAs((prev) => [...prev, { question: activeQuestion.text, answer }]);
      setShowAnalysis(true);
    } catch (e) {
      console.error("Failed to evaluate answer", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setShowAnalysis(false);
    setAnswer("");

    if (currentQuestionIdx < localQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setIsFollowUp(false);
    } else if (currentQuestionIdx < totalQuestions - 1) {
      const newQuestion = await onAddQuestion(previousQAs);
      if (newQuestion) {
        setLocalQuestions((prev) => [...prev, newQuestion]);
        setCurrentQuestionIdx((prev) => prev + 1);
        setIsFollowUp(true);
      } else {
        handleEndInterview();
      }
    } else {
      handleEndInterview();
    }
  };

  const handleEndInterview = async () => {
    setShowAnalysis(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const answeredCount = feedbackResults.length;
    if (answeredCount === 0) {
      onComplete({ score: 0, duration: formatTime(timerSeconds), feedbackCount: 0, breakdown: { communication: 0, technical: 0, confidence: 0, clarity: 0, problemSolving: 0 } });
      return;
    }

    setIsFinalizing(true);
    try {
      let finalScore = 0;
      let finalBreakdown = {
        communication: 0,
        technical: 0,
        confidence: 0,
        clarity: 0,
        problemSolving: 0
      };
      let weakAreas: string[] = [];
      let improvementRoadmap: string[] = [];

      if (sessionId) {
        const result = await interviewService.completeSession(sessionId, timerSeconds);
        finalScore = result.report.score;
        finalBreakdown = {
          communication: result.report.communicationScore || 0,
          technical: result.report.technicalScore || 0,
          confidence: result.report.confidenceScore || 0,
          clarity: result.report.communicationScore || 0,
          problemSolving: result.report.technicalScore || 0,
        };
        weakAreas = result.report.weakAreas || [];
        improvementRoadmap = result.report.improvementRoadmap || [];
      } else {
        const avg = (key: string) => Math.round(feedbackResults.reduce((acc, f) => acc + (f[key] || 0), 0) / answeredCount);
        finalBreakdown = {
          communication: avg("communicationScore"),
          technical: avg("technicalScore"),
          confidence: avg("confidenceScore"),
          clarity: avg("clarityScore"),
          problemSolving: avg("problemSolvingScore") || Math.round((avg("technicalScore") + avg("clarityScore")) / 2),
        };
        finalScore = Math.round(
          finalBreakdown.technical * 0.40 + 
          finalBreakdown.communication * 0.30 + 
          finalBreakdown.confidence * 0.20 + 
          finalBreakdown.clarity * 0.10
        );
      }

      onComplete({
        score: finalScore,
        duration: formatTime(timerSeconds),
        feedbackCount: answeredCount,
        breakdown: finalBreakdown,
        weakAreas,
        improvementRoadmap
      } as any);
    } catch (e) {
      console.error("Error finalizing session:", e);
      const avg = (key: string) => Math.round(feedbackResults.reduce((acc, f) => acc + (f[key] || 0), 0) / answeredCount);
      const finalBreakdown = {
        communication: avg("communicationScore"),
        technical: avg("technicalScore"),
        confidence: avg("confidenceScore"),
        clarity: avg("clarityScore"),
        problemSolving: avg("problemSolvingScore") || Math.round((avg("technicalScore") + avg("clarityScore")) / 2),
      };
      const finalScore = Math.round(
        finalBreakdown.technical * 0.40 + 
        finalBreakdown.communication * 0.30 + 
        finalBreakdown.confidence * 0.20 + 
        finalBreakdown.clarity * 0.10
      );
      onComplete({
        score: finalScore,
        duration: formatTime(timerSeconds),
        feedbackCount: answeredCount,
        breakdown: finalBreakdown
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isFinalizing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Compiling AI Report</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
            Analyzing your answers, structures, and technical accuracy to generate a personalized evaluation roadmap...
          </p>
        </div>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-aurora-text-muted hover:text-aurora-text gap-1.5 cursor-pointer -ml-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Exit Interview
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-extrabold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            Q{currentQuestionIdx + 1}/{totalQuestions}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold tabular-nums text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-violet-500" />
            {formatTime(timerSeconds)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-5 text-center flex-1 flex flex-col justify-center">
            <div className="mx-auto w-24 h-24 rounded-full border-2 border-dashed border-violet-500/30 flex items-center justify-center relative">
              <div className="absolute inset-1.5 rounded-full bg-violet-600/10 flex items-center justify-center shadow-lg border border-violet-500/25">
                <Brain className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 border-2 border-violet-500/60 rounded-full border-t-transparent border-r-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">AI INTERVIEWER</span>
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                <span className={cn("px-2 py-0.5 rounded-full font-semibold",
                  interviewType === "HR" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                  interviewType === "Technical" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                  "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400"
                )}>{interviewType}</span>
                <span className="text-zinc-400">{difficulty}</span>
              </div>
              {isFollowUp && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[9px] font-bold">
                  <Zap className="w-3 h-3" /> Follow-up
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 relative overflow-hidden">
            <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1.5">Current Question</span>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-relaxed">{activeQuestion.text}</p>
          </div>
        </Card>

        <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col shadow-sm">
          <MockWebcam isRecording={false} />

          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <User className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold tracking-tight text-zinc-600 dark:text-zinc-300">Your Response</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border">
              <MessageSquare className="w-3 h-3" />
              {role}
            </div>
          </div>

          <div className="mt-3 space-y-2 flex-1">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be detailed for the best AI evaluation."
              className="w-full min-h-[180px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
              disabled={isSubmitting}
            />
            {speechSupported && (
              <button
                onClick={toggleListening}
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50",
                  isListening
                    ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 animate-pulse"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                {isListening ? "Listening..." : "Voice Input"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isSubmitting}
              className="bg-aurora-primary hover:bg-aurora-primary-hover text-white font-bold text-xs py-3 px-5 rounded-xl cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                : <><Send className="w-3.5 h-3.5" /> Submit Answer</>}
            </Button>
            <Button variant="outline" onClick={handleEndInterview} className="text-xs font-bold text-aurora-danger border-aurora-danger/20 hover:bg-aurora-danger/10 gap-1.5 cursor-pointer">
              End <Ban className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col shadow-sm">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Answer Preview
            </span>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex-1 overflow-y-auto text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[180px]">
              {answer ? (
                <div>
                  {answer}
                  {isSubmitting && <span className="inline-block w-1.5 h-3 bg-violet-500 ml-1 animate-pulse" />}
                </div>
              ) : (
                <div className="text-zinc-400 italic flex flex-col items-center justify-center h-full text-center space-y-2">
                  <HelpCircle className="w-6 h-6 text-zinc-300" />
                  <p className="text-xs">Type your answer and submit for AI evaluation.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
              <span>Answered: <span className="text-violet-600 font-bold">{feedbackResults.length}</span> / {totalQuestions}</span>
              {feedbackResults.length > 0 && (
                <span className="text-violet-600">
                  Avg: {Math.round(feedbackResults.reduce((a, f) => a + (f.communicationScore + f.technicalScore + f.confidenceScore + f.clarityScore) / 4, 0) / feedbackResults.length)}%
                </span>
              )}
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-300 rounded-full bg-violet-500" style={{ width: `${(feedbackResults.length / totalQuestions) * 100}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <AnalysisOverlay
        isOpen={showAnalysis}
        onNext={handleNextQuestion}
        onEndInterview={handleEndInterview}
        isLastQuestion={currentQuestionIdx >= totalQuestions - 1}
        questionText={activeQuestion.text}
        feedback={currentFeedback}
        isLoading={isSubmitting}
      />
    </div>
  );
}
