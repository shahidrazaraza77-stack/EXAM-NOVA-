"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { aptitudeService, FrontendQuestion } from "@/services/aptitude";
import { MockTest } from "../mockData";

import { useGamification } from "@/context/GamificationContext";

interface TestInterfaceViewProps {
  test: MockTest;
  onSubmit: (testResult: {
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    percentile: number;
    questionsWithResponses: Array<{
      question: FrontendQuestion;
      selectedOption: number | null;
      isCorrect: boolean;
    }>;
  }) => void;
  onCancel: () => void;
}

export default function TestInterfaceView({ test, onSubmit, onCancel }: TestInterfaceViewProps) {
  const { user } = useAuth();
  const { trackActivity } = useGamification();
  
  const [questions, setQuestions] = useState<FrontendQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track state of each question: selectedOption (null or 0-3), isVisited (boolean), isMarkedForReview (boolean)
  const [responses, setResponses] = useState<Record<number, number | null>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  
  // Timer countdown
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load test questions
  useEffect(() => {
    async function loadTestQuestions() {
      setIsLoading(true);
      try {
        const testQs = await aptitudeService.getTestQuestions(test.id);
        setQuestions(testQs);
      } catch (err) {
        console.error("Failed to load test questions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTestQuestions();
  }, [test.id]);

  // Set active question visited
  useEffect(() => {
    if (questions.length > 0) {
      setVisited((prev) => ({ ...prev, [currentIndex]: true }));
    }
  }, [currentIndex, questions.length]);

  // Timer Countdown Effect
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (optionIdx: number) => {
    setResponses((prev) => ({ ...prev, [currentIndex]: optionIdx }));
  };

  const clearResponse = () => {
    setResponses((prev) => ({ ...prev, [currentIndex]: null }));
  };

  const toggleMarkForReview = () => {
    setMarked((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    processAndSubmit();
  };

  const processAndSubmit = async () => {
    if (!user || isSubmitting || questions.length === 0) return;
    setIsSubmitting(true);

    let correctCount = 0;
    let incorrectCount = 0;

    const questionsWithResponses = questions.map((q, idx) => {
      const selected = responses[idx] !== undefined ? responses[idx] : null;
      const isCorrect = selected === q.correctAnswer;
      
      if (selected !== null) {
        if (isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      }

      return {
        question: q,
        selectedOption: selected,
        isCorrect: isCorrect && selected !== null,
      };
    });

    const rawScore = correctCount * 1.0 - incorrectCount * 0.25;
    const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    
    // Percentile - mock calculation centered around user accuracy
    const percentile = Math.min(99.8, Math.max(40, accuracy + 12 + Math.floor(Math.random() * 8)));

    const testAnswers = questions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: responses[idx] !== undefined && responses[idx] !== null ? responses[idx]! : -1,
      isCorrect: responses[idx] === q.correctAnswer,
    }));

    try {
      await aptitudeService.submitTestAttempt(
        user.id,
        test.id,
        finalScore,
        correctCount,
        questions.length,
        testAnswers
      );
      
      try {
        await trackActivity("test");
      } catch (gErr) {
        console.error("Failed to track aptitude test gamification event:", gErr);
      }
    } catch (err) {
      console.error("Failed to save test attempt:", err);
    } finally {
      setIsSubmitting(false);
      onSubmit({
        score: finalScore,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        accuracy,
        percentile: Math.round(percentile * 10) / 10,
        questionsWithResponses,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center h-screen w-screen">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-semibold mt-4 animate-pulse">Loading exam questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-955 flex flex-col items-center justify-center h-screen w-screen p-4 text-center space-y-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-zinc-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Exam Unavailable</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            There are no questions configured for mock test "{test.title}".
          </p>
        </div>
        <Button onClick={onCancel} className="cursor-pointer text-xs font-bold rounded-xl text-white bg-aurora-primary hover:bg-aurora-primary-hover py-2 px-6">
          Cancel & Return
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedOption = responses[currentIndex] !== undefined ? responses[currentIndex] : null;

  // Stat calculations for confirmation Modal
  const totalAttempted = Object.values(responses).filter((val) => val !== null).length;
  const totalMarked = Object.values(marked).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-955 flex flex-col h-screen w-screen overflow-hidden select-none animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel} 
            className="p-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl mr-1 border-zinc-200 dark:border-zinc-800"
            title="Exit Exam"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </Button>
          <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg">
            EXAM PORTAL
          </span>
          <h1 className="text-base font-extrabold text-zinc-900 dark:text-white hidden sm:block">
            {test.title}
          </h1>
        </div>

        {/* TIME & ACTIONS */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 px-4 py-2 rounded-2xl">
            <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span className="font-mono text-sm font-black text-rose-700 dark:text-rose-400">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>

          <Button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer rounded-xl py-2 px-5 shadow-md shadow-indigo-500/10"
          >
            Submit Test
          </Button>
        </div>
      </header>

      {/* 2. SPLIT LAYOUT */}
      <div className="flex-grow flex overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: QUESTION CONTENT PANEL (8/12 equivalent) */}
        <main className="flex-grow overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            
            {/* Question Info Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-bold uppercase">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-200">
                    Topic: {currentQuestion.topic}
                  </h2>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    currentQuestion.difficulty === "Easy"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"
                      : currentQuestion.difficulty === "Medium"
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-600"
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <span>+1.0 Correct</span>
                <span>/</span>
                <span className="text-rose-500">-0.25 Incorrect</span>
              </div>
            </div>

            {/* Question Statement */}
            <div className="space-y-4">
              <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700 dark:border-indigo-500/80 dark:bg-indigo-950/20 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold border shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}>
                      {letter}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="max-w-3xl mx-auto w-full pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-wrap gap-4 items-center justify-between shrink-0">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleMarkForReview}
                className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-zinc-200 dark:border-zinc-800 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-950/30"
              >
                <Bookmark className={`w-4 h-4 ${marked[currentIndex] ? "fill-violet-600 text-violet-600" : ""}`} />
                <span>{marked[currentIndex] ? "Unmark Review" : "Mark for Review"}</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                disabled={selectedOption === null}
                onClick={clearResponse}
                className="text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
              >
                Clear Response
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <Button 
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: QUESTION PALETTE SIDEBAR */}
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex flex-col justify-between shrink-0 overflow-y-auto">
          
          <div className="p-5 space-y-6">
            <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Question Palette</h3>
            
            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isSelected = currentIndex === idx;
                const isAnswered = responses[idx] !== undefined && responses[idx] !== null;
                const isVisited = visited[idx];
                const isMarked = marked[idx];

                let btnStyle = "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-indigo-600";
                
                if (isMarked) {
                  btnStyle = "bg-violet-500 border-violet-500 text-white hover:bg-violet-600";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600";
                } else if (isVisited) {
                  btnStyle = "bg-rose-500 border-rose-500 text-white hover:bg-rose-600";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center border cursor-pointer transition-all ${btnStyle} ${
                      isSelected ? "ring-4 ring-indigo-500/20 scale-105 border-indigo-600 font-black" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PALETTE LEGEND */}
          <div className="p-5 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3.5">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase">Legend</h4>
            
            <div className="grid grid-cols-2 gap-3 text-2xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 shrink-0" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500 shrink-0" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-violet-500 shrink-0" />
                <span>Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0" />
                <span>Not Visited</span>
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* 3. CONFIRM SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => !isSubmitting && setShowSubmitModal(false)} />
          
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl max-w-md w-full relative z-10 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <AlertTriangle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">Submit Exam?</h3>
              <p className="text-xs text-zinc-500">
                Are you sure you want to submit your test? You will not be able to change your responses after submitting.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-955 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Attempted</span>
                <h4 className="text-lg font-black text-zinc-800 dark:text-white">
                  {totalAttempted} <span className="text-xs font-semibold text-zinc-400">/ {questions.length}</span>
                </h4>
              </div>
              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Marked</span>
                <h4 className="text-lg font-black text-zinc-800 dark:text-white">
                  {totalMarked} <span className="text-xs font-semibold text-zinc-400">for review</span>
                </h4>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end pt-2">
              <Button 
                variant="outline" 
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800"
              >
                Resume Test
              </Button>
              <Button 
                onClick={processAndSubmit}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit Test"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
