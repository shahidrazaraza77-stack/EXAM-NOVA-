"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  Code2,
  Trophy,
  Flame,
  Target,
  Zap,
  BookOpen,
  Building2,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Play,
  BarChart3,
  Award,
  Brain,
  Crown,
  TrendingUp,
} from "lucide-react";
import { codingService } from "@/services/coding";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 16 } },
};

export default function OverviewView({
  onOpenProblem,
  onNavigate,
}: {
  onOpenProblem: (id: string) => void;
  onNavigate: (tab: string) => void;
}) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await codingService.getAnalytics("");
        setAnalytics(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load coding analytics:", err);
        setError("Could not retrieve dashboard statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return <OverviewSkeleton />;

  if (error || !analytics) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl p-8 text-center space-y-4 border"
        style={{
          background: "var(--aurora-card)",
          borderColor: "var(--aurora-border)",
        }}
      >
        <div
          className="p-3 rounded-full"
          style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--aurora-danger)" }}
        >
          <Code2 className="size-8 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-lg" style={{ color: "var(--aurora-text)" }}>Failed to Load Dashboard</h3>
          <p className="text-sm mt-1 max-w-md" style={{ color: "var(--aurora-text-secondary)" }}>
            {error || "An unexpected error occurred while fetching your progress."}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            codingService.getAnalytics("").then(setAnalytics).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }}
          className="px-5 py-2 rounded-xl text-white font-semibold text-sm transition-all"
          style={{ background: "var(--aurora-primary)" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalSolved = analytics.solvedEasy + analytics.solvedMedium + analytics.solvedHard;
  const totalQuestions = analytics.totalEasy + analytics.totalMedium + analytics.totalHard;

  const achievements = [
    {
      id: "badge-1",
      title: "Hello Code World",
      description: "Successfully solve your first DSA challenge.",
      icon: "CheckCircle",
      unlocked: totalSolved > 0,
    },
    {
      id: "badge-2",
      title: "Centurion Coder",
      description: "Solve 100 coding challenges in practice panels.",
      icon: "Trophy",
      unlocked: totalSolved >= 100,
    },
    {
      id: "badge-3",
      title: "Streak Master",
      description: "Maintain a 7-day preparation coding streak.",
      icon: "Flame",
      unlocked: analytics.streak >= 7,
    },
    {
      id: "badge-4",
      title: "Complexity Guru",
      description: "Achieve an overall accuracy rate above 80%.",
      icon: "Network",
      unlocked: analytics.accuracy >= 80 && totalSolved >= 5,
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Daily Challenge Hero */}
      {analytics.dailyChallenge && (
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-3xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, rgba(109,93,246,0.12) 0%, rgba(0,212,255,0.06) 100%)",
            borderColor: "rgba(109,93,246,0.3)",
            boxShadow: "0 8px 40px rgba(109,93,246,0.15)",
          }}
        >
          {/* Glowing blobs */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
            style={{ background: "rgba(109,93,246,0.15)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(0,212,255,0.08)" }}
          />

          <div className="space-y-3.5 max-w-xl relative">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
              style={{
                background: "rgba(109,93,246,0.15)",
                borderColor: "rgba(109,93,246,0.3)",
                color: "var(--aurora-accent)",
              }}
            >
              <Sparkles className="size-3 animate-pulse" />
              Daily Challenge
            </span>
            <h2 className="text-2xl font-black tracking-tight leading-tight" style={{ color: "var(--aurora-text)" }}>
              {analytics.dailyChallenge.title}
            </h2>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--aurora-text-secondary)" }}>
              {analytics.dailyChallenge.description?.replace(/<[^>]+>/g, "")}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span
                className="px-2.5 py-0.5 rounded-lg font-bold border"
                style={{
                  background: analytics.dailyChallenge.difficulty === "Easy"
                    ? "rgba(34,197,94,0.12)"
                    : analytics.dailyChallenge.difficulty === "Medium"
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(239,68,68,0.12)",
                  color: analytics.dailyChallenge.difficulty === "Easy"
                    ? "var(--aurora-success)"
                    : analytics.dailyChallenge.difficulty === "Medium"
                    ? "var(--aurora-warning)"
                    : "var(--aurora-danger)",
                  borderColor: analytics.dailyChallenge.difficulty === "Easy"
                    ? "rgba(34,197,94,0.25)"
                    : analytics.dailyChallenge.difficulty === "Medium"
                    ? "rgba(245,158,11,0.25)"
                    : "rgba(239,68,68,0.25)",
                }}
              >
                {analytics.dailyChallenge.difficulty}
              </span>
              <span
                className="font-semibold px-2 py-0.5 rounded-lg border"
                style={{
                  color: "var(--aurora-text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--aurora-border)",
                }}
              >
                Topic: {analytics.dailyChallenge.topic}
              </span>
              <span
                className="font-bold px-2.5 py-0.5 rounded-lg border"
                style={{
                  color: "#A78BFA",
                  background: "rgba(139,92,246,0.12)",
                  borderColor: "rgba(139,92,246,0.25)",
                }}
              >
                +{analytics.dailyChallenge.xpReward} XP
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenProblem(analytics.dailyChallenge.id)}
            className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-7 h-12 rounded-2xl text-white font-extrabold text-sm border-none cursor-pointer relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-accent) 200%)",
              boxShadow: "0 8px 28px var(--aurora-glow-primary)",
            }}
          >
            <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity" style={{ background: "rgba(255,255,255,0.2)" }} />
            <Play className="size-4 fill-current" />
            Solve Challenge
          </motion.button>
        </motion.div>
      )}

      {/* Section Title */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl p-5 border"
        style={{
          background: "linear-gradient(135deg, rgba(109,93,246,0.07), rgba(0,212,255,0.03))",
          borderColor: "var(--aurora-border)",
        }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" style={{ background: "rgba(109,93,246,0.08)" }} />
        <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--aurora-primary)] to-[var(--aurora-accent)] bg-clip-text text-transparent">
          Coding Dashboard
        </h2>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: "var(--aurora-text-secondary)" }}>
          Track your DSA progress, identify weak areas, and ace coding interviews.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Code2} label="Problems Solved" value={totalSolved} suffix={`/${totalQuestions}`} fromColor="#6D5DF6" toColor="#00D4FF" glowColor="rgba(109,93,246,0.2)" />
        <StatCard icon={Flame} label="Daily Streak" value={analytics.streak} suffix=" days" fromColor="#F97316" toColor="#EF4444" glowColor="rgba(249,115,22,0.2)" isStreak />
        <StatCard icon={Target} label="Accuracy" value={analytics.accuracy} suffix="%" fromColor="#3B82F6" toColor="#06B6D4" glowColor="rgba(59,130,246,0.2)" />
        <StatCard icon={Zap} label="Easy Solved" value={analytics.solvedEasy} suffix={`/${analytics.totalEasy}`} fromColor="#22C55E" toColor="#10B981" glowColor="rgba(34,197,94,0.15)" />
        <StatCard icon={BarChart3} label="Medium Solved" value={analytics.solvedMedium} suffix={`/${analytics.totalMedium}`} fromColor="#F59E0B" toColor="#F97316" glowColor="rgba(245,158,11,0.15)" />
        <StatCard icon={Crown} label="Hard Solved" value={analytics.solvedHard} suffix={`/${analytics.totalHard}`} fromColor="#EF4444" toColor="#EC4899" glowColor="rgba(239,68,68,0.15)" />
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
              <BookOpen className="size-4.5" style={{ color: "var(--aurora-primary)" }} /> Topics Progress
            </h2>
            <button
              onClick={() => onNavigate("topics")}
              className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
              style={{ color: "var(--aurora-primary)" }}
            >
              View All <ChevronRight className="size-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(analytics.topicProgress || []).slice(0, 6).map((topic: any) => (
              <TopicCard key={topic.name} topic={topic} onPractice={() => onNavigate("problems")} />
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-base flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
            <Sparkles className="size-4.5" style={{ color: "var(--aurora-warning)" }} /> AI Recommendations
          </h2>
          <div className="space-y-3">
            {(analytics.recommendations || []).slice(0, 4).map((rec: any, i: number) => (
              <RecCard key={i} rec={rec} onPractice={() => onNavigate("problems")} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Company Prep & Achievements */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-extrabold text-base flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
            <Building2 className="size-4.5" style={{ color: "#6366F1" }} /> Company Prep
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(analytics.companyProgress || []).slice(0, 4).map((company: any) => (
              <CompanyCard key={company.name} company={company} onStart={() => onNavigate("companies")} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-extrabold text-base flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
            <Award className="size-4.5" style={{ color: "var(--aurora-warning)" }} /> Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((badge: any) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  fromColor,
  toColor,
  glowColor,
  isStreak = false,
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  fromColor: string;
  toColor: string;
  glowColor: string;
  isStreak?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{
        background: "var(--aurora-card)",
        borderColor: "var(--aurora-border)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: glowColor }}
      />
      <div className="relative">
        <div
          className="inline-flex p-2.5 rounded-xl mb-4"
          style={{
            background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
            boxShadow: `0 4px 16px ${glowColor}`,
          }}
        >
          {isStreak && value > 0 ? (
            <div className="animate-pulse">
              <Icon className="size-4.5 text-white fill-current" />
            </div>
          ) : (
            <Icon className="size-4.5 text-white" />
          )}
        </div>
        <p className="text-2xl font-black leading-none tabular-nums" style={{ color: "var(--aurora-text)" }}>
          {value}
          <span className="text-xs font-bold ml-0.5" style={{ color: "var(--aurora-text-muted)" }}>{suffix}</span>
        </p>
        <p className="text-[10px] font-bold uppercase mt-2 tracking-wider" style={{ color: "var(--aurora-text-muted)" }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function TopicCard({ topic, onPractice }: { topic: any; onPractice: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-2xl border p-5 transition-all duration-300"
      style={{
        background: "var(--aurora-card)",
        borderColor: "var(--aurora-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-sm truncate" style={{ color: "var(--aurora-text)" }}>{topic.name}</h3>
        <span
          className="text-[10px] font-bold px-2 py-0.5 border rounded-md shrink-0"
          style={{
            color: "var(--aurora-text-muted)",
            background: "rgba(255,255,255,0.03)",
            borderColor: "var(--aurora-border)",
          }}
        >
          {topic.questionsCount} problems
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-3.5" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${topic.completedPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--aurora-primary), var(--aurora-accent))" }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold mb-4">
        <span style={{ color: "var(--aurora-primary)" }}>Completed: {topic.completedPercentage}%</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={onPractice}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-extrabold h-9 rounded-xl border-none cursor-pointer transition-all"
        style={{
          background: "rgba(109,93,246,0.12)",
          color: "var(--aurora-primary)",
        }}
      >
        <Play className="size-3 fill-current" /> Practice Topic
      </motion.button>
    </motion.div>
  );
}

function RecCard({ rec, onPractice }: { rec: any; onPractice: () => void }) {
  const priority = rec.priority || "medium";
  const priorityColor =
    priority === "high" ? "var(--aurora-danger)" : priority === "medium" ? "var(--aurora-warning)" : "var(--aurora-accent)";

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="rounded-2xl border p-4 transition-all duration-200"
      style={{
        background: "var(--aurora-card)",
        borderColor: "var(--aurora-border)",
        borderLeftWidth: 3,
        borderLeftColor: priorityColor,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{
            background: `${priorityColor}15`,
            color: priorityColor,
          }}
        >
          <Brain className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold" style={{ color: "var(--aurora-text)" }}>{rec.topic}</p>
          <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--aurora-text-secondary)" }}>{rec.description}</p>
          <button
            onClick={onPractice}
            className="mt-2 text-xs font-bold hover:underline flex items-center gap-0.5 border-none bg-transparent cursor-pointer"
            style={{ color: "var(--aurora-primary)" }}
          >
            Practice Topic <ArrowUpRight className="size-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyCard({ company, onStart }: { company: any; onStart: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="rounded-2xl border p-4 transition-all duration-300"
      style={{
        background: "var(--aurora-card)",
        borderColor: "var(--aurora-border)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-extrabold text-sm truncate" style={{ color: "var(--aurora-text)" }}>{company.name}</h3>
      </div>
      <p className="text-xs font-bold mb-3" style={{ color: "var(--aurora-text-muted)" }}>{company.questionsCount} problems</p>
      <div className="h-1.5 rounded-full overflow-hidden mb-3.5" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${company.progressPercentage}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={onStart}
        className="w-full text-xs font-extrabold h-8.5 rounded-xl border-none cursor-pointer transition-all"
        style={{
          background: "rgba(99,102,241,0.12)",
          color: "#818CF8",
        }}
      >
        Start Prep
      </motion.button>
    </motion.div>
  );
}

function BadgeCard({ badge }: { badge: any }) {
  const iconMap: Record<string, any> = { Flame, Trophy, Box: BookOpen, Network: BarChart3, Building2, CheckCircle: Award };
  const Icon = iconMap[badge.icon] || Award;
  return (
    <motion.div
      whileHover={{ x: 3 }}
      className="rounded-2xl border p-4 transition-all duration-200"
      style={{
        background: "var(--aurora-card)",
        borderColor: "var(--aurora-border)",
        opacity: badge.unlocked ? 1 : 0.45,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl shrink-0 border"
          style={
            badge.unlocked
              ? {
                  background: "rgba(245,158,11,0.1)",
                  color: "var(--aurora-warning)",
                  borderColor: "rgba(245,158,11,0.25)",
                }
              : {
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--aurora-text-muted)",
                  borderColor: "var(--aurora-border)",
                }
          }
        >
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold" style={{ color: "var(--aurora-text)" }}>{badge.title}</p>
          <p className="text-[10px] font-bold mt-0.5 leading-snug" style={{ color: "var(--aurora-text-muted)" }}>{badge.description}</p>
        </div>
        {badge.unlocked && (
          <TrendingUp className="size-4 shrink-0" style={{ color: "var(--aurora-warning)" }} />
        )}
      </div>
    </motion.div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 rounded-3xl" style={{ background: "var(--aurora-card)" }} />
      <div className="space-y-2">
        <div className="h-6 w-48 rounded" style={{ background: "var(--aurora-card)" }} />
        <div className="h-4 w-80 rounded" style={{ background: "var(--aurora-card)" }} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: "var(--aurora-card)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl" style={{ background: "var(--aurora-card)" }} />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl" style={{ background: "var(--aurora-card)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
