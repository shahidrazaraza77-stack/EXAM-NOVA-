import { motion, Variants } from "framer-motion";
import {
  Brain,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Dices,
  Award,
  ArrowUpRight,
  Crown,
  BarChart3,
  GitBranch,
  Play,
} from "lucide-react";
import {
  mockWeakTopics,
  mockAIRecommendations,
  mockAchievements,
} from "../mockData";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <span className="tabular-nums font-extrabold tracking-tight">
      {value}
      {suffix}
    </span>
  );
}

function extractTopicFromRecommendation(title: string): string | null {
  // e.g. "Improve Probability" -> "Probability"
  // e.g. "Practice Data Interpretation" -> "Data Interpretation"
  // e.g. "Review Time & Work" -> "Time & Work"
  return title.replace(/^(Improve|Practice|Review)\s+/i, "").trim();
}

interface OverviewViewProps {
  analyticsData: any;
  onNavigateToTab?: (tabId: string, topicName?: string | null) => void;
}

export default function OverviewView({ analyticsData, onNavigateToTab }: OverviewViewProps) {
  const stats = {
    totalSolved: analyticsData?.totalSolved ?? 0,
    accuracy: analyticsData?.accuracy ?? 0,
    averageScore: analyticsData?.averageScore ?? 0,
    dailyStreak: analyticsData?.dailyStreak ?? 5,
    timeSpent: analyticsData?.timeSpent || "0m",
  };

  const categories = analyticsData?.categories || [];

  const weakTopics = analyticsData?.weakTopics && analyticsData.weakTopics.length > 0
    ? analyticsData.weakTopics
    : mockWeakTopics;

  const recommendations = analyticsData?.weakTopics && analyticsData.weakTopics.length > 0
    ? analyticsData.weakTopics.map((wt: any) => ({
        title: `Improve ${wt.name}`,
        desc: `Your accuracy in ${wt.name} is ${wt.score}%. Practice 10 medium-level questions to improve.`,
        action: "Start Practice",
        priority: wt.score < 40 ? "high" : "medium"
      }))
    : mockAIRecommendations;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header section with ambient glow */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
          Aptitude Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Your preparation hub — track progress, identify weak areas, and ace your tests.
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Brain}
          label="Questions Solved"
          value={stats.totalSolved}
          color="from-violet-500 to-purple-600"
          glowColor="rgba(139, 92, 246, 0.15)"
          onClick={() => onNavigateToTab?.("analytics")}
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={stats.accuracy}
          suffix="%"
          color="from-emerald-500 to-teal-600"
          glowColor="rgba(16, 185, 129, 0.15)"
          onClick={() => onNavigateToTab?.("analytics")}
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={stats.dailyStreak}
          color="from-orange-500 to-amber-600"
          glowColor="rgba(249, 115, 22, 0.15)"
          onClick={() => onNavigateToTab?.("leaderboard")}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={stats.averageScore}
          suffix="%"
          color="from-blue-500 to-cyan-600"
          glowColor="rgba(59, 130, 246, 0.15)"
          onClick={() => onNavigateToTab?.("mocktests")}
        />
      </motion.div>

      {/* Categories & AI Recommendations */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
              <BookOpen className="size-4.5 text-violet-500" />
              Categories
            </h2>
            <button 
              onClick={() => onNavigateToTab?.("topics")}
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline cursor-pointer"
            >
              View All Topics
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat: any) => (
              <CategoryCard 
                key={cat.id} 
                category={cat} 
                onStartPractice={(topic) => onNavigateToTab?.("practice", topic)}
                onExploreCategory={() => onNavigateToTab?.("topics")}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
              <Sparkles className="size-4.5 text-amber-500" />
              AI Recommendations
            </h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec: any, i: number) => (
              <RecommendationCard 
                key={i} 
                rec={rec} 
                onClick={() => {
                  if (rec.action.toLowerCase().includes("test")) {
                    onNavigateToTab?.("mocktests");
                  } else {
                    const topic = extractTopicFromRecommendation(rec.title);
                    onNavigateToTab?.("practice", topic);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Weak Areas & Achievements */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
            <AlertTriangle className="size-4.5 text-red-500 animate-pulse" />
            Weak Areas
          </h2>
          <div className="space-y-3">
            {weakTopics.map((wt: any, i: number) => (
              <WeakTopicCard 
                key={i} 
                topic={wt} 
                onPractice={() => onNavigateToTab?.("practice", wt.name)}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
            <Award className="size-4.5 text-yellow-500" />
            Achievements
          </h2>
          <div className="space-y-3">
            {mockAchievements.filter((a: any) => a.unlocked).map((badge: any) => (
              <AchievementCard key={badge.id} badge={badge} />
            ))}
            {mockAchievements.filter((a: any) => !a.unlocked).slice(0, 2).map((badge: any) => (
              <AchievementCard key={badge.id} badge={badge} />
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
  color,
  glowColor,
  onClick,
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  glowColor: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2, boxShadow: `0 8px 30px ${glowColor}` }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all duration-300 group cursor-pointer w-full"
    >
      <div className={`absolute inset-0 opacity-[0.015] group-hover:opacity-[0.04] transition-opacity duration-300 bg-gradient-to-br ${color}`} />
      <div className="relative flex items-center justify-between">
        <div>
          <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${color} text-white mb-4 shadow-md shadow-violet-500/10`}>
            <Icon className="size-4.5" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white leading-none">
            <AnimatedNumber value={value} suffix={suffix} />
          </p>
          <p className="text-xs text-muted-foreground font-semibold mt-2">{label}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 text-zinc-400 dark:text-zinc-500">
          <ArrowUpRight className="size-4.5" />
        </div>
      </div>
    </motion.button>
  );
}

function CategoryCard({ 
  category, 
  onStartPractice,
  onExploreCategory 
}: { 
  category: any; 
  onStartPractice: (topicName: string) => void;
  onExploreCategory: () => void;
}) {
  const progress = Math.round((category.completedCount / category.questionsCount) * 100);
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/10 transition-colors duration-300" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 
            onClick={onExploreCategory}
            className="font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors cursor-pointer text-sm"
          >
            {category.name}
          </h3>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">{category.topics.length} topics available</p>
        </div>
        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-full border border-violet-100 dark:border-violet-900/30">
          {category.completedCount}/{category.questionsCount}
        </span>
      </div>
      
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[10px] font-bold text-zinc-500">
          <span>Completion</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {category.topics.slice(0, 3).map((t: any) => (
          <button
            key={t.name}
            onClick={() => onStartPractice(t.name)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-50 hover:bg-violet-50 dark:bg-zinc-900 dark:hover:bg-violet-950/40 text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 border border-zinc-200/60 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-900/40 transition-all font-semibold cursor-pointer"
          >
            {t.name}
          </button>
        ))}
        {category.topics.length > 3 && (
          <button
            onClick={onExploreCategory}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800 transition-colors font-semibold cursor-pointer"
          >
            +{category.topics.length - 3} more
          </button>
        )}
      </div>
    </motion.div>
  );
}

function RecommendationCard({ rec, onClick }: { rec: typeof mockAIRecommendations[0]; onClick: () => void }) {
  const iconMap: Record<string, any> = { dices: Dices, "bar-chart": BarChart3, target: Target, "git-branch": GitBranch };
  const Icon = iconMap[rec.action.toLowerCase().includes("test") ? "target" : "dices"] || Brain;
  
  const priorityClass = rec.priority === "high" 
    ? "border-l-4 border-l-red-500 hover:border-red-200 dark:hover:border-red-900" 
    : rec.priority === "medium"
      ? "border-l-4 border-l-amber-500 hover:border-amber-200 dark:hover:border-amber-900"
      : "border-l-4 border-l-blue-500 hover:border-blue-200 dark:hover:border-blue-900";

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 2 }}
      className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950 transition-all duration-300 shadow-sm hover:shadow-md ${priorityClass} group`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          rec.priority === "high"
            ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
            : rec.priority === "medium"
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        }`}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{rec.title}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">{rec.desc}</p>
          <button 
            onClick={onClick}
            className="mt-3 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1 cursor-pointer bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 px-3 py-1.5 rounded-lg border border-violet-100 dark:border-violet-900/40 transition-colors"
          >
            {rec.action} <Play className="size-2.5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function WeakTopicCard({ topic, onPractice }: { topic: typeof mockWeakTopics[0]; onPractice: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 2 }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all duration-300 shadow-sm hover:shadow-md group"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{topic.name}</p>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{topic.category}</p>
        </div>
        <span className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-900/30">{topic.score}% accuracy</span>
      </div>
      
      <div className="space-y-1.5">
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${topic.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between gap-4 mt-3">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal flex-1">{topic.recommendation}</p>
          <button
            onClick={onPractice}
            className="text-[10px] font-extrabold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Fix Weakness
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementCard({ badge }: { badge: typeof mockAchievements[0] }) {
  const iconMap: Record<string, any> = { Flame, Award, Target, Crown, Briefcase: BookOpen };
  const Icon = iconMap[badge.icon] || Award;
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 2 }}
      className={`rounded-2xl border p-4 bg-white dark:bg-zinc-950 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between ${
        badge.unlocked 
          ? "border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-br from-white to-yellow-50/10 dark:from-zinc-950 dark:to-yellow-950/5" 
          : "opacity-60 border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          badge.unlocked
            ? "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-950/60 dark:to-amber-950/60 text-yellow-600"
            : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500"
        }`}>
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{badge.title}</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">{badge.description}</p>
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-[9px] font-bold text-yellow-600 dark:text-yellow-400 mt-1 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-md border border-yellow-100 dark:border-yellow-900/20 w-fit">
              Unlocked: {badge.unlockedAt}
            </p>
          )}
        </div>
      </div>
      {badge.unlocked && <Trophy className="size-4.5 text-yellow-500 shrink-0 ml-3" />}
    </motion.div>
  );
}
