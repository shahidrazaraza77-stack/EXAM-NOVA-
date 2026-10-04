"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Ban, Sparkles, Mic, MicOff, Activity, Send, Loader2,
  ArrowLeft, Clock, HelpCircle, MessageSquare, User,
  Brain, Zap, Camera, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw
} from "lucide-react";
import { InterviewQuestionItem } from "./mockData";
import MockWebcam from "./MockWebcam";
import AnalysisOverlay from "./AnalysisOverlay";
import { interviewService } from "@/services/interview.service";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermStatus = "idle" | "requesting" | "granted" | "denied" | "na";

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

// ─── Permission Row Sub-component ─────────────────────────────────────────────
function PermRow({ label, icon: Icon, status }: { label: string; icon: any; status: PermStatus }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          status === "granted" && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600",
          status === "denied"  && "bg-red-100 dark:bg-red-900/40 text-red-500",
          (status === "idle" || status === "requesting") && "bg-violet-100 dark:bg-violet-900/40 text-violet-600",
          status === "na"      && "bg-zinc-100 dark:bg-zinc-800 text-zinc-400",
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{label}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {status === "idle"       && "Waiting to request…"}
            {status === "requesting" && "Waiting for browser dialog…"}
            {status === "granted"    && "Access granted — ready!"}
            {status === "denied"     && "Denied — see instructions below"}
            {status === "na"         && "Not supported in this browser"}
          </p>
        </div>
      </div>
      <div className="shrink-0 ml-3">
        {status === "requesting" && <Loader2 className="w-5 h-5 animate-spin text-violet-500" />}
        {status === "granted"    && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        {status === "denied"     && <AlertCircle className="w-5 h-5 text-red-500" />}
        {status === "na"         && <AlertCircle className="w-5 h-5 text-zinc-400" />}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveInterview({
  role, difficulty, interviewType, questions, sessionId, questionCount, company,
  onAddQuestion, onComplete, onCancel
}: LiveInterviewProps) {
  const { toast } = useToast();

  // ── Interview state ──────────────────────────────────────────────────────
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Permission gate state ────────────────────────────────────────────────
  const [permGate, setPermGate] = useState<"pending" | "done">("pending");
  const [camPerm, setCamPerm] = useState<PermStatus>("idle");
  const [micPerm, setMicPerm] = useState<PermStatus>("idle");

  // ── Speech / Mic state ───────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);   // live mic stream for waveform
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // ── Permissions ──────────────────────────────────────────────────────────
  const requestPermissions = useCallback(async (): Promise<{ camOk: boolean; micOk: boolean }> => {
    setCamPerm("requesting");
    setMicPerm("requesting");

    let camOk = false;
    let micOk = false;

    // Try both at once first (single browser dialog)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      s.getTracks().forEach((t) => t.stop());
      camOk = true;
      micOk = true;
      setCamPerm("granted");
      setMicPerm("granted");
    } catch {
      // Try individually so we know which one failed
      try {
        const vs = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        vs.getTracks().forEach((t) => t.stop());
        camOk = true;
        setCamPerm("granted");
      } catch {
        setCamPerm("denied");
      }
      try {
        const as = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        as.getTracks().forEach((t) => t.stop());
        micOk = true;
        setMicPerm("granted");
      } catch {
        setMicPerm("denied");
      }
    }
    return { camOk, micOk };
  }, []);

  // On mount: check mediaDevices support then request
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamPerm("na");
      setMicPerm("na");
      setPermGate("done");
      return;
    }
    requestPermissions().then(({ camOk, micOk }) => {
      // Auto-advance if both granted
      if (camOk && micOk) setPermGate("done");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Speech recognition ───────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    // Stop the mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setMicStream(null);
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const startListening = useCallback(async () => {
    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechAPI) {
      setSpeechSupported(false);
      toast.warning("Speech recognition is not supported. Please use Chrome or Edge.");
      return;
    }

    // Get mic stream for waveform visualisation
    let liveStream: MediaStream | null = null;
    try {
      liveStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = liveStream;
      setMicStream(liveStream);
    } catch (err) {
      console.warn("Mic stream for visualiser failed (non-fatal):", err);
    }

    try {
      const recognition = new SpeechAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      // finalBuffer must live OUTSIDE of onresult closure to persist across calls
      let finalBuffer = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalBuffer += (finalBuffer ? " " : "") + text.trim();
          } else {
            interim += text;
          }
        }
        setInterimText(interim);

        if (finalBuffer) {
          const captured = finalBuffer;
          finalBuffer = "";
          setAnswer((prev) => {
            const base = prev.trimEnd();
            return base ? base + " " + captured : captured;
          });
        }
      };

      recognition.onerror = (event: any) => {
        const { error } = event;
        if (error === "not-allowed" || error === "service-not-allowed") {
          toast.error("Microphone access denied. Allow it in your browser address bar, then retry.");
          setSpeechSupported(false);
          stopListening();
        } else if (error === "no-speech") {
          // No-speech is normal during pauses — do nothing, recognition will continue
          return;
        } else if (error === "network") {
          toast.error("Speech recognition lost network connection.");
        } else if (error !== "aborted") {
          toast.warning(`Voice paused (${error}). Mic is still open — keep speaking.`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if we're still in listening mode (handles the browser's ~60s session limit)
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already started — ignore
          }
        } else {
          setIsListening(false);
          setInterimText("");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      toast.error("Could not start voice recognition. Please try again.");
      liveStream?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setMicStream(null);
    }
  }, [stopListening, toast]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQuestionIdx]);

  // ── Derived values ───────────────────────────────────────────────────────
  const activeQuestion = localQuestions[currentQuestionIdx];
  const totalQuestions = Math.max(questionCount, localQuestions.length);
  const progress = Math.min(100, ((currentQuestionIdx + 1) / totalQuestions) * 100);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    stopListening();
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
      console.error("Failed to evaluate answer:", e);
      toast.error("Failed to evaluate your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setShowAnalysis(false);
    setAnswer("");
    setInterimText("");

    if (currentQuestionIdx < localQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setIsFollowUp(false);
    } else if (currentQuestionIdx < totalQuestions - 1) {
      const newQ = await onAddQuestion(previousQAs);
      if (newQ) {
        setLocalQuestions((prev) => [...prev, newQ]);
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
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);

    const answeredCount = feedbackResults.length;
    if (answeredCount === 0) {
      onComplete({ score: 0, duration: formatTime(timerSeconds), feedbackCount: 0, breakdown: { communication: 0, technical: 0, confidence: 0, clarity: 0, problemSolving: 0 } });
      return;
    }

    setIsFinalizing(true);
    try {
      let finalScore = 0;
      let finalBreakdown = { communication: 0, technical: 0, confidence: 0, clarity: 0, problemSolving: 0 };
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
        const avg = (key: string) => Math.round(feedbackResults.reduce((a, f) => a + (f[key] || 0), 0) / answeredCount);
        finalBreakdown = {
          communication: avg("communicationScore"),
          technical: avg("technicalScore"),
          confidence: avg("confidenceScore"),
          clarity: avg("clarityScore"),
          problemSolving: avg("problemSolvingScore") || Math.round((avg("technicalScore") + avg("clarityScore")) / 2),
        };
        finalScore = Math.round(finalBreakdown.technical * 0.40 + finalBreakdown.communication * 0.30 + finalBreakdown.confidence * 0.20 + finalBreakdown.clarity * 0.10);
      }

      onComplete({ score: finalScore, duration: formatTime(timerSeconds), feedbackCount: answeredCount, breakdown: finalBreakdown, weakAreas, improvementRoadmap } as any);
    } catch (e) {
      console.error("Error finalizing session:", e);
      const avg = (key: string) => Math.round(feedbackResults.reduce((a, f) => a + (f[key] || 0), 0) / answeredCount);
      const bd = { communication: avg("communicationScore"), technical: avg("technicalScore"), confidence: avg("confidenceScore"), clarity: avg("clarityScore"), problemSolving: avg("problemSolvingScore") || 0 };
      onComplete({ score: Math.round(bd.technical * 0.4 + bd.communication * 0.3 + bd.confidence * 0.2 + bd.clarity * 0.1), duration: formatTime(timerSeconds), feedbackCount: answeredCount, breakdown: bd });
    } finally {
      setIsFinalizing(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // PERMISSION GATE SCREEN
  // ════════════════════════════════════════════════════════════════
  if (permGate === "pending") {
    const anyDenied = camPerm === "denied" || micPerm === "denied";
    const allGranted = camPerm === "granted" && micPerm === "granted";
    const requesting = camPerm === "requesting" || micPerm === "requesting";

    return (
      <div className="max-w-md mx-auto py-10 px-4 space-y-7">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/10">
            <ShieldCheck className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">Allow Camera &amp; Microphone</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            ExamNova needs your camera and mic for the AI Mock Interview. Your video and audio are{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">never recorded or stored</span>.
          </p>
        </div>

        {/* Permission rows */}
        <div className="space-y-3">
          <PermRow label="Camera (Video)" icon={Camera} status={camPerm} />
          <PermRow label="Microphone (Voice)" icon={Mic} status={micPerm} />
        </div>

        {/* Fix instructions */}
        {anyDenied && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">How to fix blocked permissions:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-amber-700 dark:text-amber-400">
              <li>Click the <strong>🔒 lock icon</strong> in your browser&apos;s address bar</li>
              <li>Set <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong></li>
              <li>Click <strong>Retry</strong> below (no page refresh needed)</li>
            </ol>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {allGranted ? (
            <Button
              onClick={() => setPermGate("done")}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Start Interview
            </Button>
          ) : anyDenied ? (
            <Button
              onClick={() => requestPermissions().then(({ camOk, micOk }) => { if (camOk && micOk) setPermGate("done"); })}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Permissions
            </Button>
          ) : (
            <Button disabled className="w-full py-3.5 rounded-2xl font-bold text-sm bg-violet-500/60 text-white gap-2 cursor-not-allowed">
              <Loader2 className="w-4 h-4 animate-spin" />
              {requesting ? "Waiting for browser permission dialog…" : "Checking permissions…"}
            </Button>
          )}

          <button
            onClick={() => setPermGate("done")}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2 cursor-pointer transition-colors text-center"
          >
            Skip — use Simulator Mode (no camera / mic)
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-zinc-500 cursor-pointer transition-colors text-center"
          >
            ← Cancel and go back
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // FINALIZING SCREEN
  // ════════════════════════════════════════════════════════════════
  if (isFinalizing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Compiling AI Report</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mt-1">
            Analyzing your answers and generating a personalized evaluation…
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

  // ════════════════════════════════════════════════════════════════
  // LIVE INTERVIEW
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Top bar */}
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

      {/* Progress bar */}
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

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT — AI Interviewer */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-5 text-center flex-1 flex flex-col justify-center">
            <div className="mx-auto w-24 h-24 rounded-full border-2 border-dashed border-violet-500/30 flex items-center justify-center relative">
              <div className="absolute inset-1.5 rounded-full bg-violet-600/10 flex items-center justify-center border border-violet-500/25">
                <Brain className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 border-2 border-violet-500/60 rounded-full border-t-transparent border-r-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">AI INTERVIEWER</span>
              <div className="flex items-center justify-center gap-2 text-[10px]">
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
          <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 mt-4">
            <span className="text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1.5">Current Question</span>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-relaxed">{activeQuestion.text}</p>
          </div>
        </Card>

        {/* CENTRE — Webcam + Answer */}
        <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col shadow-sm">
          {/* Pass real micStream so waveform shows actual audio level */}
          <MockWebcam isRecording={isListening} micStream={micStream} />

          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Your Response</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <MessageSquare className="w-3 h-3" />
              {role}
            </div>
          </div>

          <div className="mt-3 space-y-2 flex-1">
            {/* Answer textarea */}
            <div className="relative">
              <textarea
                value={answer + (interimText ? " " + interimText : "")}
                onChange={(e) => { if (!isListening) setAnswer(e.target.value); }}
                placeholder={isListening ? "Speak now — I'm listening…" : "Type your answer or click Voice Input to speak."}
                readOnly={isListening}
                disabled={isSubmitting}
                className={cn(
                  "w-full min-h-[160px] p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-900/40 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-colors",
                  isListening
                    ? "border-violet-500/50 dark:border-violet-500/40 bg-violet-50/30 dark:bg-violet-900/10"
                    : "border-zinc-200 dark:border-zinc-800"
                )}
              />
              {isListening && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </div>
              )}
            </div>

            {/* Voice button */}
            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  disabled={isSubmitting}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50",
                    isListening
                      ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-violet-600 border-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20"
                  )}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      Stop Voice Input
                      <span className="inline-flex gap-0.5 ml-1">
                        {[0, 0.1, 0.2].map((d, i) => (
                          <span key={i} className="w-0.5 h-3 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: `${d}s` }} />
                        ))}
                      </span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      Voice Input
                    </>
                  )}
                </button>
              )}
              {isListening && (
                <span className="text-[10px] text-violet-500 dark:text-violet-400 font-semibold animate-pulse">
                  🎤 Listening continuously — speak naturally
                </span>
              )}
            </div>
          </div>

          {/* Submit / End */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || isSubmitting}
              className="bg-aurora-primary hover:bg-aurora-primary-hover text-white font-bold text-xs py-3 px-5 rounded-xl cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</> : <><Send className="w-3.5 h-3.5" /> Submit Answer</>}
            </Button>
            <Button variant="outline" onClick={handleEndInterview} className="text-xs font-bold text-aurora-danger border-aurora-danger/20 hover:bg-aurora-danger/10 gap-1.5 cursor-pointer">
              End <Ban className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>

        {/* RIGHT — Answer Preview */}
        <Card className="lg:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col shadow-sm">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Answer Preview
            </span>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex-1 overflow-y-auto text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[200px]">
              {answer ? (
                <div>
                  {answer}
                  {isListening && interimText && (
                    <span className="text-violet-400 italic"> {interimText}</span>
                  )}
                  {isSubmitting && <span className="inline-block w-1.5 h-3 bg-violet-500 ml-1 animate-pulse" />}
                </div>
              ) : (
                <div className="text-zinc-400 italic flex flex-col items-center justify-center h-full text-center space-y-2">
                  <HelpCircle className="w-6 h-6 text-zinc-300" />
                  <p className="text-xs">Your answer will appear here as you type or speak.</p>
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
