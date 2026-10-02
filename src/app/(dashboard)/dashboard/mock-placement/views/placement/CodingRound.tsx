"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Clock, Play, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { MOCK_CODING_CHALLENGES, formatTime, DIFFICULTY_COLORS } from "../../components/mockData";

interface CodingRoundProps {
  timeLimit: number;
  onComplete: (solution: string, testResults: boolean[]) => void;
}

export default function CodingRound({ timeLimit, onComplete }: CodingRoundProps) {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [code, setCode] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [testResults, setTestResults] = useState<boolean[] | null>(null);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const challenge = MOCK_CODING_CHALLENGES[challengeIdx];

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

  useEffect(() => {
    if (challenge && !code) setCode(challenge.starterCode);
  }, [challenge]);

  const simulateTestResults = (): boolean[] => {
    const total = challenge.testCases.length;
    const hasFunction = code.includes("function") || code.includes("=>") || code.includes("class");
    const hasReturn = code.includes("return");
    const hasBrackets = code.includes("{") && code.includes("}");
    const hasParams = code.includes("(") && code.includes(")");
    const codeQuality = [hasFunction, hasReturn, hasBrackets, hasParams].filter(Boolean).length;
    const passCount = Math.min(total, Math.max(0, codeQuality - 1 + Math.round(Math.random())));
    return Array.from({ length: total }, (_, i) => i < passCount);
  };

  const handleRunTests = () => {
    setRunning(true);
    setTimeout(() => {
      setTestResults(simulateTestResults());
      setRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const results = testResults || simulateTestResults();
    onComplete(code, results);
  };

  if (submitted) {
    const passed = testResults?.filter(Boolean).length || 0;
    const total = challenge.testCases.length;
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <Code2 className="w-16 h-16 text-violet-500 mx-auto" />
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">Coding Round Complete</h3>
          <p className="text-sm text-zinc-500">Passed {passed}/{total} test cases</p>
        </motion.div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-violet-500" />
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Coding Round</h2>
            <span className="text-[10px] text-zinc-500">Challenge {challengeIdx + 1} of {MOCK_CODING_CHALLENGES.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[challenge.difficulty] || ""}`}>{challenge.difficulty}</span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm ${timeRemaining < 120 ? "bg-red-500/10 text-red-600" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"}`}>
            <Clock className="w-4 h-4" />{formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {MOCK_CODING_CHALLENGES.length > 1 && (
        <div className="flex gap-2">
          {MOCK_CODING_CHALLENGES.map((c, i) => (
            <button key={c.id} onClick={() => { setChallengeIdx(i); setTestResults(null); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                i === challengeIdx ? "bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800"
              }`}>{c.title}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-2">{challenge.title}</h4>
            <p className="text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{challenge.description}</p>
          </div>
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Test Cases</h5>
            {challenge.testCases.map((tc, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 text-2xs font-mono text-zinc-600 dark:text-zinc-400">
                <div>Input: {tc.input}</div>
                <div>Expected: {tc.expected}</div>
                {testResults !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-[9px] font-bold ${testResults[i] ? "text-emerald-600" : "text-red-600"}`}>
                    {testResults[i] ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {testResults[i] ? "Passed" : "Failed"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Solution</span>
              <button
                onClick={handleRunTests}
                disabled={running || !code.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                {running ? "Running..." : <><Play className="w-3 h-3" /> Run Tests</>}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 bg-zinc-950 text-zinc-100 font-mono text-xs leading-relaxed resize-none focus:outline-none border-none"
              spellCheck={false}
            />
          </div>
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!code.trim()}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 cursor-pointer disabled:opacity-40 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Submit Coding Round
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
