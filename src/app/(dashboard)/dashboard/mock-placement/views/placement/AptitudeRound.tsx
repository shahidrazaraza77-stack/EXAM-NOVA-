"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { MOCK_APTITUDE_QUESTIONS, formatTime } from "../../components/mockData";

interface AptitudeRoundProps {
  timeLimit: number;
  onComplete: (answers: Record<string, number>) => void;
}

export default function AptitudeRound({ timeLimit, onComplete }: AptitudeRoundProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    onComplete(answers);
  }, [answers, onComplete]);

  const questions = MOCK_APTITUDE_QUESTIONS;
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (submitted) {
    const correct = questions.filter(q => answers[q.id] === q.correctIdx).length;
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">Aptitude Round Complete</h3>
          <p className="text-sm text-zinc-500">You answered {answeredCount}/{questions.length} questions ({correct} correct)</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Aptitude Round</h2>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm ${timeRemaining < 120 ? "bg-red-500/10 text-red-600" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"}`}>
          <Clock className="w-4 h-4" />
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-2xs font-bold text-zinc-400">
        <span>{answeredCount}/{questions.length} answered</span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`p-5 rounded-2xl border transition-all ${
              answers[q.id] !== undefined
                ? "border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/10"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500">{idx + 1}</span>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{q.question}</span>
                  <span className="text-[9px] text-zinc-400 ml-2 font-semibold">({q.topic} - {q.difficulty})</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-violet-600 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                        : "border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black shrink-0 ${
                      isSelected ? "border-violet-600 bg-violet-600 text-white" : "border-zinc-300 dark:border-zinc-700"
                    }`}>{String.fromCharCode(65 + oi)}</span>
                    <span className="text-2xs font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={answeredCount === 0}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <CheckCircle className="w-4 h-4" />
        Submit Aptitude Round ({questions.length - answeredCount} unanswered)
      </motion.button>
    </div>
  );
}
