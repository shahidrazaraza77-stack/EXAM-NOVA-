"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Target, 
  Award, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  BarChart,
  Activity,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FrontendQuestion } from "@/services/aptitude";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  Area
} from "recharts";

interface QuestionResponse {
  question: FrontendQuestion;
  selectedOption: number | null;
  isCorrect: boolean;
}

interface ResultViewProps {
  result: {
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    percentile: number;
    questionsWithResponses: QuestionResponse[];
  };
  onBackToDashboard: () => void;
  onRetakeTest: () => void;
}

export default function ResultView({ result, onBackToDashboard, onRetakeTest }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "review">("analytics");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const totalQuestions = result.questionsWithResponses.length;
  const unansweredCount = totalQuestions - (result.correctAnswers + result.incorrectAnswers);

  // Recharts Chart Mock Data based on current results + default analytics
  const topicAccuracyData = [
    { name: "Percentage", accuracy: 80 },
    { name: "Profit & Loss", accuracy: 75 },
    { name: "Time & Work", accuracy: result.accuracy < 60 ? 40 : 65 },
    { name: "Logical Logic", accuracy: result.accuracy },
    { name: "Verbal", accuracy: 85 },
  ];

  const weeklySolvedData = [
    { day: "Mon", solved: 15 },
    { day: "Tue", solved: 22 },
    { day: "Wed", solved: 30 },
    { day: "Thu", solved: 18 },
    { day: "Fri", solved: 25 },
    { day: "Sat", solved: result.correctAnswers * 3 },
    { day: "Sun", solved: result.correctAnswers * 2 },
  ];

  const toggleQuestionReview = (idx: number) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBackToDashboard} 
            className="p-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Test Results & Insights
            </h1>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              Performance analysis and breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetakeTest}
            className="flex items-center gap-2 text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Test</span>
          </Button>
          <Button 
            onClick={onBackToDashboard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer rounded-xl py-2 px-5"
          >
            Aptitude Hub
          </Button>
        </div>
      </div>

      {/* 2. OVERALL SCORE CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 text-center relative overflow-hidden">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Overall Score</p>
          <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {result.score} <span className="text-xs text-zinc-400 font-semibold">/ {totalQuestions}</span>
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">Weighted negative score</p>
          <span className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 text-center relative overflow-hidden">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Accuracy Rating</p>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {result.accuracy}%
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">Correct attempt ratio</p>
          <span className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 text-center relative overflow-hidden">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Correct / Incorrect</p>
          <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mt-2">
            <span className="text-emerald-600">{result.correctAnswers}</span>
            <span className="text-zinc-300 dark:text-zinc-600 mx-1.5">/</span>
            <span className="text-rose-500">{result.incorrectAnswers}</span>
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1.5">{unansweredCount} unanswered Qs</p>
          <span className="absolute top-0 left-0 w-full h-1 bg-zinc-300 dark:bg-zinc-700" />
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 text-center relative overflow-hidden">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Mock Percentile</p>
          <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-2">
            {result.percentile}%
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">Ranked relative to pool</p>
          <span className="absolute top-0 left-0 w-full h-1 bg-violet-600" />
        </Card>

      </div>

      {/* 3. TABS SELECTOR */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800/80">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Activity className="w-4 h-4" />
          Performance Analytics
        </button>
        <button
          onClick={() => setActiveTab("review")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "review"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Review Questions ({totalQuestions})
        </button>
      </div>

      {/* 4. CONTENT AREA */}
      {activeTab === "analytics" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Topic accuracy Chart */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">Topic-wise Accuracy (%)</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={topicAccuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "12px", 
                      fontSize: "11px", 
                      backgroundColor: "rgba(9, 9, 11, 0.95)",
                      color: "#fff",
                      border: "none"
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {topicAccuracyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.accuracy >= 70 ? "#10b981" : entry.accuracy >= 50 ? "#f59e0b" : "#f43f5e"} 
                      />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly Progress Area Chart */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">Weekly Solved Progress</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={weeklySolvedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.15)" />
                  <XAxis dataKey="day" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "12px", 
                      fontSize: "11px", 
                      backgroundColor: "rgba(9, 9, 11, 0.95)",
                      color: "#fff",
                      border: "none"
                    }}
                  />
                  <Area type="monotone" dataKey="solved" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSolved)" />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        /* REVIEW QUESTIONS PANEL */
        <div className="space-y-4">
          {result.questionsWithResponses.map((item, idx) => {
            const isCorrect = item.selectedOption === item.question.correctAnswer;
            const isUnanswered = item.selectedOption === null;
            const isExpanded = expandedQuestion === idx;

            return (
              <Card 
                key={idx}
                className={`bg-white dark:bg-zinc-900 border p-4 sm:p-5 transition-all ${
                  isCorrect
                    ? "border-emerald-500/20 dark:border-emerald-950/40"
                    : isUnanswered
                    ? "border-zinc-200 dark:border-zinc-800"
                    : "border-rose-500/20 dark:border-rose-900/40"
                }`}
              >
                <div 
                  onClick={() => toggleQuestionReview(idx)}
                  className="flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 ${
                      isCorrect 
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" 
                        : isUnanswered 
                        ? "bg-zinc-50 dark:bg-zinc-950 text-zinc-400" 
                        : "bg-rose-50 dark:bg-rose-900/40 text-rose-600"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-200 line-clamp-2">
                        {item.question.question}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        Topic: {item.question.topic}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                      isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"
                        : isUnanswered
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-600"
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </>
                      ) : isUnanswered ? (
                        "Unanswered"
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Incorrect
                        </>
                      )}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Choices breakdown */}
                    <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
                      {item.question.options.map((opt, optIdx) => {
                        const optLetter = String.fromCharCode(65 + optIdx);
                        const isOptCorrect = item.question.correctAnswer === optIdx;
                        const isOptSelected = item.selectedOption === optIdx;

                        let optBg = "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300";
                        if (isOptCorrect) {
                          optBg = "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-bold";
                        } else if (isOptSelected) {
                          optBg = "bg-rose-50/50 dark:bg-rose-900/20 border-rose-500/50 text-rose-700 dark:text-rose-400 font-bold";
                        }

                        return (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center gap-3 ${optBg}`}
                          >
                            <span className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-2xs ${
                              isOptCorrect 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : isOptSelected 
                                ? "bg-rose-500 border-rose-500 text-white" 
                                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 text-zinc-400"
                            }`}>
                              {optLetter}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solution detail */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 space-y-2">
                      <h5 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200">Step-by-step Solution:</h5>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-line">
                        {item.question.explanation}
                      </p>
                    </div>

                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
