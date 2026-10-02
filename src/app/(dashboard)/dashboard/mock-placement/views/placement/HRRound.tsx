"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { MOCK_HR_QUESTIONS, formatTime } from "../../components/mockData";

interface HRRoundProps {
  timeLimit: number;
  onComplete: (answers: Record<string, string>) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Behavioral: "text-violet-600 bg-violet-500/10 border-violet-500/20",
  Situational: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  Communication: "text-blue-600 bg-blue-500/10 border-blue-500/20",
};

export default function HRRound({ timeLimit, onComplete }: HRRoundProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);

  const questions = MOCK_HR_QUESTIONS;
  const currentQ = questions[currentIdx];

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

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(answers);
  };

  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <Users className="w-16 h-16 text-violet-500 mx-auto" />
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">HR Round Complete</h3>
          <p className="text-sm text-zinc-500">Answered {answeredCount}/{questions.length} questions</p>
        </motion.div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-500" />
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">HR Interview</h2>
            <span className="text-[10px] text-zinc-500">Question {currentIdx + 1} of {questions.length}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm ${timeRemaining < 120 ? "bg-red-500/10 text-red-600" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"}`}>
          <Clock className="w-4 h-4" />{formatTime(timeRemaining)}
        </div>
      </div>

      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-2xs font-bold text-zinc-400">
        <span>{answeredCount}/{questions.length} answered</span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {questions.map((q, i) => (
          <button key={q.id} onClick={() => setCurrentIdx(i)}
            className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              i === currentIdx ? "bg-violet-600 text-white" :
              answers[q.id]?.trim() ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
              "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
            }`}>{i + 1}</button>
        ))}
      </div>

      <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[currentQ.category] || "bg-zinc-100 text-zinc-600"}`}>
              {currentQ.category}
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white leading-relaxed">{currentQ.question}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" /> Your Response
          </div>
          <p className="text-[9px] text-zinc-400 mb-2">Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
          <textarea
            value={answers[currentQ.id] || ""}
            onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
            placeholder="Type your response using the STAR method..."
            className="w-full h-36 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer disabled:opacity-30 transition-all"
        ><ChevronLeft className="w-3.5 h-3.5" /> Previous</button>

        {currentIdx < questions.length - 1 ? (
          <button onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold cursor-pointer hover:bg-violet-700 transition-all"
          >Next <ChevronRight className="w-3.5 h-3.5" /></button>
        ) : (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-violet-500/20 cursor-pointer transition-all"
          ><CheckCircle className="w-3.5 h-3.5" /> Submit HR Round</motion.button>
        )}
      </div>
    </div>
  );
}
