import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { aptitudeService } from "@/services/aptitude";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Zap,
  ArrowLeft,
  BarChart3,
  RefreshCw,
  Flag,
  Loader2,
  Calculator,
  BrainCircuit,
  Languages,
  BookOpen,
} from "lucide-react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } },
};

const categoryIcons: Record<string, any> = {
  quantitative: Calculator,
  logical: BrainCircuit,
  verbal: Languages,
  "data-interpretation": BarChart3,
};

type PracticePhase = "select" | "practice" | "results";

interface PracticeSession {
  topic: string;
  questions: any[];
  answers: Record<string, number>;
  bookmarks: Set<string>;
  startTime: number;
  elapsed: number;
}

interface PracticeViewProps {
  topics: any[];
  questions: any[];
  initialTopicName?: string | null;
  onClearTopic?: () => void;
  onRefreshData?: () => void;
}

export default function PracticeView({
  topics,
  questions,
  initialTopicName,
  onClearTopic,
  onRefreshData,
}: PracticeViewProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<PracticePhase>("select");
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [questionShownTime, setQuestionShownTime] = useState<number>(0);

  useEffect(() => {
    if (initialTopicName) {
      setSelectedTopic(initialTopicName);
    }
  }, [initialTopicName]);

  useEffect(() => {
    if (phase === "practice" && session) {
      setQuestionShownTime(Date.now());
    }
  }, [currentIdx, phase, session]);

  const filteredQuestions = useMemo(() => {
    if (selectedTopic === "all") return questions;
    return questions.filter((q) => q.topic === selectedTopic);
  }, [questions, selectedTopic]);

  const startPractice = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const bookmarksList = await aptitudeService.getBookmarks(user.id);
      const bookmarksSet = new Set(bookmarksList.map((b) => b.id));

      setSession({
        topic: selectedTopic === "all" ? "All Topics" : selectedTopic,
        questions: filteredQuestions,
        answers: {},
        bookmarks: bookmarksSet,
        startTime: Date.now(),
        elapsed: 0,
      });
      setCurrentIdx(0);
      setShowExplanation(false);
      setQuestionShownTime(Date.now());
      setPhase("practice");
    } catch (err) {
      console.error("Failed to start practice session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (optionIdx: number) => {
    if (!session || !user) return;
    const q = session.questions[currentIdx];
    if (session.answers[q.id] !== undefined) return;

    const isCorrect = optionIdx === q.correctAnswer;
    const timeTaken = Math.max(1, Math.round((Date.now() - questionShownTime) / 1000));

    setSession((prev) => {
      if (!prev) return prev;
      const newAnswers = { ...prev.answers, [q.id]: optionIdx };
      return { ...prev, answers: newAnswers };
    });
    setShowExplanation(true);

    try {
      await aptitudeService.submitAnswer(user.id, q.id, optionIdx, isCorrect, timeTaken);
      onRefreshData?.();
    } catch (e) {
      console.error("Failed to save attempt:", e);
    }
  };

  const toggleBookmark = useCallback(async () => {
    if (!session || !user) return;
    const q = session.questions[currentIdx];
    const isBookmarked = session.bookmarks.has(q.id);

    try {
      if (isBookmarked) {
        await aptitudeService.removeBookmark(user.id, q.id);
        setSession((prev) => {
          if (!prev) return prev;
          const newBookmarks = new Set(prev.bookmarks);
          newBookmarks.delete(q.id);
          return { ...prev, bookmarks: newBookmarks };
        });
      } else {
        await aptitudeService.addBookmark(user.id, q.id);
        setSession((prev) => {
          if (!prev) return prev;
          const newBookmarks = new Set(prev.bookmarks);
          newBookmarks.add(q.id);
          return { ...prev, bookmarks: newBookmarks };
        });
      }
    } catch (err) {
      console.error("Error toggling bookmark status:", err);
    }
  }, [session, currentIdx, user]);

  const goNext = () => {
    if (!session) return;
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowExplanation(session.answers[session.questions[currentIdx + 1]?.id] !== undefined);
    }
  };

  const goPrev = () => {
    if (!session) return;
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setShowExplanation(session.answers[session.questions[currentIdx - 1]?.id] !== undefined);
    }
  };

  const finishPractice = () => {
    setPhase("results");
  };

  const retry = () => {
    onClearTopic?.();
    setPhase("select");
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Setting up practice session...</p>
      </div>
    );
  }

  if (phase === "select") {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Title Header with ambient decoration */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
            Aptitude Practice
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Select a target topic, build consistency, and work through customizable interactive questions.
          </p>
        </motion.div>

        {/* Dynamic Selector Header */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30 p-3.5 rounded-2xl border border-zinc-150 dark:border-zinc-800/80"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Select Practice Topic:</span>
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none cursor-pointer text-zinc-800 dark:text-zinc-300"
              >
                <option value="all">All Topics ({questions.length} questions)</option>
                {topics.map((t) => {
                  const count = questions.filter((q) => q.topic_id === t.id).length;
                  if (count === 0) return null;
                  return (
                    <option key={t.id} value={t.name}>
                      {t.name} ({count} questions)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-450 pointer-events-none" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg">
            <BarChart3 className="size-3.5 text-violet-500" />
            <span>{filteredQuestions.length} practice exercises ready</span>
          </div>
        </motion.div>

        {/* Topic Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {topics.map((t) => {
            const count = questions.filter((q) => q.topic_id === t.id).length;
            if (count === 0) return null;
            const isSelected = selectedTopic === t.name;
            const Icon = categoryIcons[t.category] || BookOpen;

            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedTopic(t.name)}
                className={`text-left rounded-2xl border p-4.5 transition-all flex items-start gap-3.5 cursor-pointer relative overflow-hidden h-[85px] w-full ${
                  isSelected
                    ? "border-violet-500 bg-violet-500/[0.04] shadow-xs"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:shadow-xs hover:border-zinc-350 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isSelected 
                    ? "bg-violet-500 text-white" 
                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400"
                }`}>
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-zinc-900 dark:text-white text-sm truncate">{t.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1">{count} questions available</p>
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.button
          variants={item}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={startPractice}
          disabled={filteredQuestions.length === 0}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-extrabold hover:opacity-95 transition-opacity disabled:opacity-40 shadow-md shadow-violet-500/10 cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          <Zap className="size-4 fill-current text-white animate-pulse" />
          Start Practice ({filteredQuestions.length} questions)
        </motion.button>
      </motion.div>
    );
  }

  if (phase === "results") {
    return <ResultsView session={session!} onRetry={retry} />;
  }

  const question = session!.questions[currentIdx];
  const selectedAnswer = session!.answers[question.id];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isAnswered = selectedAnswer !== undefined;
  const total = session!.questions.length;
  const answered = Object.keys(session!.answers).length;
  const isBookmarked = session!.bookmarks.has(question.id);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Top action header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={finishPractice}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-500"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm text-zinc-900 dark:text-white">Practice: {session!.topic}</h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Question {currentIdx + 1} of {total}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-550 dark:text-zinc-400 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80">
            <BarChart3 className="size-3.5 text-violet-500" />
            <span>{answered}/{total} solved</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-550 dark:text-zinc-400 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80">
            <Clock className="size-3.5 text-amber-500" />
            <span>{Math.floor(((Date.now() - session!.startTime) / 1000 / 60) % 60)}m</span>
          </div>
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-all border cursor-pointer ${
              isBookmarked
                ? "text-amber-500 bg-amber-500/[0.06] border-amber-500/30"
                : "text-zinc-450 dark:text-zinc-500 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-200"
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="size-4.5" /> : <Bookmark className="size-4.5" />}
          </button>
        </div>
      </motion.div>

      {/* Main Question Card */}
      <motion.div variants={item} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/[0.01] rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3.5">
          <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white shrink-0 mt-0.5 shadow-xs">
            Q{currentIdx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-zinc-900 dark:text-white text-base leading-relaxed">{question.question}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-4">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400">
                {question.topic}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                question.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20" :
                question.difficulty === "Medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20" :
                "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20"
              }`}>
                {question.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
          {question.options.map((opt: string, idx: number) => {
            const isSelected = selectedAnswer === idx;
            const isCorrectOption = idx === question.correctAnswer;
            const showResult = isAnswered;

            let borderClass = "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-violet-500/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20";
            if (showResult && isCorrectOption) borderClass = "border-emerald-500 bg-emerald-500/[0.04] dark:bg-emerald-950/20 shadow-xs";
            else if (showResult && isSelected && !isCorrectOption) borderClass = "border-rose-500 bg-rose-500/[0.04] dark:bg-rose-950/20 shadow-xs";
            else if (isSelected) borderClass = "border-violet-500 bg-violet-500/[0.02]";

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`text-left p-4.5 rounded-2xl border transition-all duration-200 ${borderClass} ${
                  isAnswered ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                    showResult && isCorrectOption ? "bg-emerald-500 border-transparent text-white" :
                    showResult && isSelected && !isCorrectOption ? "bg-rose-500 border-transparent text-white" :
                    isSelected ? "bg-violet-500 border-transparent text-white" :
                    "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex-1 leading-snug">{opt}</span>
                  {showResult && isCorrectOption && (
                    <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 ml-auto" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <XCircle className="size-4.5 text-rose-500 shrink-0 ml-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation view */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden border-t border-zinc-100 dark:border-zinc-850 pt-5"
            >
              <div className={`rounded-2xl p-5 ${
                isCorrect
                  ? "bg-emerald-500/[0.02] border border-emerald-500/20"
                  : "bg-rose-500/[0.02] border border-rose-500/20"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4.5 text-rose-600 dark:text-rose-400" />
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
                        Incorrect Choice — Correct answer is {String.fromCharCode(65 + question.correctAnswer)}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-start gap-2.5 mt-3 pt-3 border-t border-zinc-105/50 dark:border-zinc-850/50">
                  <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Step-by-step Solution:</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-450 leading-relaxed mt-1 font-medium">{question.explanation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation Footer */}
      <motion.div variants={item} className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1.5 text-xs font-bold h-9 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5 max-w-[50%] overflow-x-auto pb-1 scrollbar-none">
          {session!.questions.map((q, i) => {
            const a = session!.answers[q.id];
            let color = "bg-zinc-100 dark:bg-zinc-800 text-zinc-400";
            if (a !== undefined) color = a === q.correctAnswer ? "bg-emerald-500 text-white" : "bg-rose-500 text-white";
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIdx(i);
                  setShowExplanation(session!.answers[q.id] !== undefined);
                }}
                className={`size-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 transition-all cursor-pointer ${color} ${
                  i === currentIdx ? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-zinc-950 scale-110" : ""
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {currentIdx < total - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 text-xs font-bold h-9 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={finishPractice}
              className="flex items-center gap-1.5 text-xs font-bold h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white hover:opacity-95 shadow-md shadow-violet-500/10 cursor-pointer"
            >
              <span>Finish Session</span>
              <Flag className="size-4" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ResultsView({ session, onRetry }: { session: PracticeSession; onRetry: () => void }) {
  const total = session.questions.length;
  const answered = Object.keys(session.answers).length;
  const correct = session.questions.filter(
    (q) => session.answers[q.id] === q.correctAnswer
  ).length;
  const incorrect = answered - correct;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const timeTaken = Math.floor(((Date.now() - session.startTime) / 1000 / 60) % 60);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="text-center py-8">
        <div className="inline-flex p-4.5 rounded-full bg-violet-500/[0.07] text-violet-600 mb-4 border border-violet-500/15 animate-bounce">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Practice Complete!</h1>
        <p className="text-muted-foreground text-sm font-semibold mt-1">{session.topic}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-emerald-500">{correct}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-wider">Correct Answers</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-rose-500">{incorrect}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-wider">Incorrect Answers</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-violet-500">{accuracy}%</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-wider">Accuracy Rate</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-center shadow-xs">
          <p className="text-2xl font-black text-amber-500">{timeTaken}m</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-wider">Duration</p>
        </div>
      </motion.div>

      {/* Summary Accordion */}
      <motion.div variants={item} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs">
        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white mb-4">Practice Question Breakdown</h3>
        <div className="space-y-2">
          {session.questions.map((q, i) => {
            const ans = session.answers[q.id];
            const isQCorrect = ans === q.correctAnswer;
            const isQAnswered = ans !== undefined;
            return (
              <div
                key={q.id}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl text-sm ${
                  !isQAnswered
                    ? "bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-800/80"
                    : isQCorrect
                      ? "bg-emerald-500/[0.03] border border-emerald-500/15"
                      : "bg-rose-500/[0.03] border border-rose-500/15"
                }`}
              >
                {isQAnswered ? (
                  isQCorrect ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="size-4 text-rose-500 shrink-0" />
                  )
                ) : (
                  <span className="text-zinc-400 text-xs font-extrabold w-4 text-center">-</span>
                )}
                <span className="text-xs font-bold text-zinc-450 shrink-0">Q{i + 1}.</span>
                <span className="truncate flex-1 font-semibold text-zinc-800 dark:text-zinc-200">{q.question}</span>
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/55 px-2 py-0.5 rounded-md shrink-0">
                  {q.topic}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Action Footer */}
      <motion.div variants={item} className="flex justify-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 h-10 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-xs"
        >
          <RefreshCw className="size-4" />
          <span>Select Another Topic</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
