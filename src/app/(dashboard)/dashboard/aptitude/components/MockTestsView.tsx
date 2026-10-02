import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { aptitudeService } from "@/services/aptitude";
import { useGamification } from "@/context/GamificationContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Flag,
  BarChart3,
  RefreshCw,
  Play,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Loader2,
  ChevronDown,
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

type Phase = "list" | "instructions" | "test" | "results";

const testColors: Record<string, string> = {
  topic: "from-blue-500 to-cyan-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/30",
  mixed: "from-violet-500 to-purple-500 text-violet-605 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/30",
  company: "from-amber-500 to-orange-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30",
  full: "from-rose-500 to-red-500 text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-955/40 border-rose-100 dark:border-rose-900/30",
};

const testLabels: Record<string, string> = {
  topic: "Topic Test",
  mixed: "Mixed Practice",
  company: "Company Test",
  full: "Full Mock",
};

export default function MockTestsView() {
  const { user } = useAuth();
  const { trackActivity } = useGamification();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("list");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const selectedTest = useMemo(
    () => tests.find((t) => t.id === selectedTestId),
    [tests, selectedTestId]
  );

  const submitTest = async () => {
    if (!selectedTest || !user) return;
    try {
      setLoading(true);
      const correct = testQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
      const total = testQuestions.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      const answersList = testQuestions.map((q) => {
        const selectedOption = answers[q.id];
        return {
          questionId: q.id,
          selectedOption: selectedOption !== undefined ? selectedOption : -1,
          isCorrect: selectedOption === q.correctAnswer,
        };
      });

      await aptitudeService.submitTestAttempt(
        user.id,
        selectedTest.id,
        accuracy,
        correct,
        total,
        answersList
      );

      trackActivity("test");

      setShowResult(true);
      setPhase("results");
    } catch (err) {
      console.error("Failed to submit test attempt:", err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    if (!selectedTest || !user) return;
    try {
      setLoading(true);
      const questionsData = await aptitudeService.getTestQuestions(selectedTest.id);
      
      const bookmarksList = await aptitudeService.getBookmarks(user.id);
      const bookmarksSet = new Set(bookmarksList.map((b) => b.id));

      setTestQuestions(questionsData);
      setAnswers({});
      setBookmarks(bookmarksSet);
      setCurrentQ(0);
      setShowResult(false);
      setStartTime(Date.now());
      setPhase("test");
    } catch (err) {
      console.error("Failed to load test questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const q = testQuestions[currentQ];
    // Removed early return to allow users to change their selected option before submitting
    setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }));
  };

  const toggleBookmark = async () => {
    if (!user) return;
    const q = testQuestions[currentQ];
    const isBookmarked = bookmarks.has(q.id);
    try {
      if (isBookmarked) {
        await aptitudeService.removeBookmark(user.id, q.id);
        setBookmarks((prev) => {
          const next = new Set(prev);
          next.delete(q.id);
          return next;
        });
      } else {
        await aptitudeService.addBookmark(user.id, q.id);
        setBookmarks((prev) => {
          const next = new Set(prev);
          next.add(q.id);
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to toggle test bookmark:", err);
    }
  };

  const exitToMenu = () => {
    setPhase("list");
    setSelectedTestId(null);
    setTestQuestions([]);
    setAnswers({});
  };

  useEffect(() => {
    async function loadTests() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await aptitudeService.getMockTests();
        setTests(data);
      } catch (err) {
        console.error("Failed to load mock tests:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, [user]);

  // Live timer countdown/countup effect
  useEffect(() => {
    if (phase !== "test" || startTime === 0) return;
    
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, startTime]);

  // Auto-submit test when time limit is reached
  useEffect(() => {
    if (phase === "test" && selectedTest && elapsed >= (selectedTest.durationMinutes || 30) * 60) {
      submitTest();
    }
  }, [elapsed, phase, selectedTest]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading assessments...</p>
      </div>
    );
  }

  if (phase === "list") {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Title Header with ambient decoration */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
            Mock Tests
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Evaluate your knowledge using timed placements mocks, mixed practice papers, and topic-specific test assessments.
          </p>
        </motion.div>

        {/* Tests Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {tests.map((test) => {
            const cat = test.category || "topic";
            const colorClass = testColors[cat] || "from-blue-500 to-cyan-500 text-blue-650 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/30";
            const diffClass =
              test.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20" :
              test.difficulty === "Medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20" :
              "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20";

            return (
              <motion.button
                key={test.id}
                whileHover={{ scale: 1.025, y: -3 }}
                onClick={() => {
                  setSelectedTestId(test.id);
                  setPhase("instructions");
                }}
                className="text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-950 dark:to-zinc-900/20 p-5 transition-all duration-350 hover:shadow-md hover:border-violet-500/25 dark:hover:border-violet-500/25 flex flex-col justify-between h-[190px] relative overflow-hidden group cursor-pointer w-full"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/[0.01] rounded-full blur-xl pointer-events-none group-hover:bg-violet-500/5 transition-colors duration-300" />
                
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
                      {testLabels[cat] || "Topic Test"}
                    </span>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${diffClass}`}>
                      {test.difficulty}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm tracking-tight mb-1.5 leading-snug line-clamp-1">
                    {test.title}
                  </h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550 line-clamp-2 leading-relaxed mb-3.5 font-medium">
                    {test.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3.5 text-[10px] font-extrabold text-zinc-450 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-850 pt-3 mt-auto w-full">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="size-3.5 text-violet-500" />
                    {test.questionsCount} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-amber-500" />
                    {test.durationMinutes} minutes
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    );
  }

  if (phase === "instructions" && selectedTest) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
        <motion.button
          variants={item}
          onClick={() => setPhase("list")}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-455 hover:text-zinc-800 dark:hover:text-white cursor-pointer bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-850 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to mock list
        </motion.button>

        <motion.div variants={item} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs space-y-5">
          <div className="text-center">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/[0.07] text-amber-500 mb-3.5 border border-amber-500/15">
              <Trophy className="size-8" />
            </div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{selectedTest.title}</h1>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1.5 max-w-md mx-auto">{selectedTest.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {[
              { label: "Questions Count", value: `${selectedTest.questionsCount} items`, icon: BarChart3, iconColor: "text-violet-500" },
              { label: "Allowed Duration", value: `${selectedTest.durationMinutes} mins`, icon: Clock, iconColor: "text-amber-500" },
              { label: "Test Difficulty", value: selectedTest.difficulty, icon: AlertTriangle, iconColor: "text-rose-500" },
              { label: "Negative Scoring", value: "No marking", icon: XCircle, iconColor: "text-zinc-450" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-800/80">
                <stat.icon className={`size-4.5 ${stat.iconColor} shrink-0`} />
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-amber-500/[0.02] dark:bg-amber-955/10 border border-amber-500/25 p-4 text-xs font-semibold">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-extrabold text-amber-800 dark:text-amber-400">Important Instructions</p>
                <p className="text-zinc-600 dark:text-zinc-450 mt-1 leading-relaxed">
                  Once started, the timer will countdown continuously. Do not close this browser tab as your progress will reset. You must verify and submit all questions before ending.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-extrabold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md shadow-violet-500/10"
          >
            <Play className="size-4 fill-current text-white" /> Start Placement Test
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (phase === "test") {
    const q = testQuestions[currentQ];
    const selectedAnswer = answers[q.id];
    const answeredCount = Object.keys(answers).length;
    const total = testQuestions.length;
    const isAnswered = selectedAnswer !== undefined;
    const durationLimit = (selectedTest?.durationMinutes || 30) * 60;
    const timerWarning = durationLimit - elapsed < 120; // Warn if < 2 mins left

    return (
      <div className="space-y-4">
        {/* Test Control Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to quit? Your assessment progress will be lost.")) exitToMenu();
              }}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-505"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <p className="font-extrabold text-sm text-zinc-900 dark:text-white">{selectedTest?.title}</p>
              <p className="text-xs text-muted-foreground font-semibold">Question {currentQ + 1} of {total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-550 dark:text-zinc-400 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80">
              <BarChart3 className="size-3.5 text-violet-500" />
              <span>{answeredCount}/{total} solved</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
              timerWarning
                ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                : "text-zinc-550 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800/80"
            }`}>
              <Clock className="size-3.5 text-amber-500" />
              <span>{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}</span>
            </div>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                bookmarks.has(q.id)
                  ? "text-amber-500 bg-amber-500/[0.06] border-amber-500/30"
                  : "text-zinc-450 dark:text-zinc-500 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-200"
              }`}
            >
              {bookmarks.has(q.id) ? <BookmarkCheck className="size-4.5" /> : <Bookmark className="size-4.5" />}
            </button>
          </div>
        </div>

        {/* Question Panel */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/[0.01] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start gap-3.5">
            <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white shrink-0 mt-0.5 shadow-xs">
              Q{currentQ + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-zinc-900 dark:text-white text-base leading-relaxed">{q.question}</p>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400">
                  {q.topic}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  q.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20" :
                  q.difficulty === "Medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20" :
                  "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20"
                }`}>
                  {q.difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
            {q.options.map((opt: string, idx: number) => {
              const isSelected = selectedAnswer === idx;
              let borderClass = "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-violet-500/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20";
              if (isSelected) borderClass = "border-violet-500 bg-violet-500/[0.02]";

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`text-left p-4.5 rounded-2xl border transition-all duration-200 ${borderClass} cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected ? "bg-violet-500 border-transparent text-white" :
                      "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-450 dark:text-zinc-500"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex-1 leading-snug">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setCurrentQ((i) => Math.max(0, i - 1)); }}
            disabled={currentQ === 0}
            className="flex items-center gap-1.5 text-xs font-bold h-9 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          
          <div className="flex items-center gap-1.5 max-w-[50%] overflow-x-auto pb-1 scrollbar-none">
            {testQuestions.map((qItem, i) => (
              <button
                key={qItem.id}
                onClick={() => setCurrentQ(i)}
                className={`size-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  answers[qItem.id] !== undefined
                    ? "bg-violet-500 text-white"
                    : bookmarks.has(qItem.id)
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                } ${i === currentQ ? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-zinc-955 scale-110" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQ < total - 1 ? (
            <button
              onClick={() => { setCurrentQ((i) => i + 1); }}
              className="flex items-center gap-1.5 text-xs font-bold h-9 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Next <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={submitTest}
              className="flex items-center gap-1.5 text-xs font-bold h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white hover:opacity-95 shadow-md shadow-violet-500/10 cursor-pointer"
            >
              Submit Test <Flag className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const total = testQuestions.length;
  const answered = Object.keys(answers).length;
  const correct = testQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const incorrect = answered - correct;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={item} className="text-center py-8">
        <div className="inline-flex p-4.5 rounded-full bg-violet-500/[0.07] text-violet-605 mb-4 border border-violet-500/15 animate-bounce">
          <Trophy className="size-10 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Test Completed!</h1>
        <p className="text-muted-foreground text-sm font-semibold mt-1">{selectedTest?.title}</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Correct Answers", value: correct, color: "text-emerald-500" },
          { label: "Incorrect Answers", value: incorrect, color: "text-rose-500" },
          { label: "Accuracy Rate", value: `${accuracy}%`, color: accuracy >= 60 ? "text-violet-500" : "text-amber-500" },
          { label: "Skipped / Unsolved", value: total - answered, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-center shadow-xs">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-wider">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex justify-center gap-3">
        <button
          onClick={exitToMenu}
          className="flex items-center gap-2 h-10 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-xs"
        >
          Back to Tests
        </button>
        <button
          onClick={() => { setPhase("instructions"); }}
          className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-extrabold hover:opacity-95 shadow-md shadow-violet-500/10 cursor-pointer text-xs"
        >
          <RefreshCw className="size-4" /> Try Again
        </button>
      </motion.div>
    </motion.div>
  );
}
