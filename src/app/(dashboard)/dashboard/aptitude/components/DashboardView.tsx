"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  BrainCircuit, 
  Languages, 
  BarChart3, 
  Flame, 
  Award, 
  Target, 
  Zap,
  BookOpen,
  ChevronDown, 
  ChevronUp, 
  Play, 
  HelpCircle, 
  Building2, 
  ArrowUpRight, 
  Trophy, 
  Clock, 
  Sparkles,
  Crown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { aptitudeService } from "@/services/aptitude";
import { MockTest, mockCompanyPractice, mockAchievements, mockLeaderboard } from "../mockData";

interface DashboardViewProps {
  onSelectTopic: (categoryId: string, topicName: string) => void;
  onSelectTest: (test: MockTest) => void;
}

export default function DashboardView({ onSelectTopic, onSelectTest }: DashboardViewProps) {
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [totalDatabaseQuestions, setTotalDatabaseQuestions] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Fetch topics
        const fetchedTopics = await aptitudeService.getTopics();

        // 2. Fetch mock tests
        const fetchedTests = await aptitudeService.getMockTests();
        setMockTests(fetchedTests);

        // 3. Fetch analytics
        const fetchedAnalytics = await aptitudeService.getAnalytics(user.id);
        setAnalytics(fetchedAnalytics);

        const { data: qCounts } = await supabase
          .from("aptitude_questions")
          .select("topic_id, id");
        
        const topicQCountMap: Record<string, number> = {};
        (qCounts || []).forEach((q: any) => {
          if (q.topic_id) {
            topicQCountMap[q.topic_id] = (topicQCountMap[q.topic_id] || 0) + 1;
          }
        });
        setTotalDatabaseQuestions((qCounts || []).length);

        const { data: userAttempts } = await supabase
          .from("aptitude_attempts")
          .select("question_id, aptitude_questions(topic_id)")
          .eq("user_id", user.id);
        
        const topicCompletedMap: Record<string, Set<string>> = {};
        (userAttempts || []).forEach((att: any) => {
          const tId = att.aptitude_questions?.topic_id;
          if (tId) {
            if (!topicCompletedMap[tId]) {
              topicCompletedMap[tId] = new Set();
            }
            topicCompletedMap[tId].add(att.question_id);
          }
        });

        // 5. Group topics under their categories
        const mappedCategories = [
          {
            id: "quantitative",
            name: "Quantitative Aptitude",
            icon: "Calculator",
            description: "Master arithmetic operations, algebra, geometry, and number word problems.",
            questionsCount: 0,
            completedCount: 0,
            topics: [] as any[]
          },
          {
            id: "logical",
            name: "Logical Reasoning",
            icon: "BrainCircuit",
            description: "Enhance cognitive skills with logic patterns, blood relations, and spatial puzzles.",
            questionsCount: 0,
            completedCount: 0,
            topics: [] as any[]
          },
          {
            id: "verbal",
            name: "Verbal Ability",
            icon: "Languages",
            description: "Refine language elements, comprehension, vocabulary, and semantic structuring.",
            questionsCount: 0,
            completedCount: 0,
            topics: [] as any[]
          },
          {
            id: "data-interpretation",
            name: "Data Interpretation",
            icon: "BarChart3",
            description: "Analyze, deduce and solve questions using charts, tables, and numerical models.",
            questionsCount: 0,
            completedCount: 0,
            topics: [] as any[]
          }
        ];

        fetchedTopics.forEach(topic => {
          const cat = mappedCategories.find(c => c.id === topic.category);
          if (cat) {
            const totalQs = topicQCountMap[topic.id] || 0;
            const completedQs = topicCompletedMap[topic.id]?.size || 0;
            
            cat.questionsCount += totalQs;
            cat.completedCount += completedQs;
            
            cat.topics.push({
              id: topic.id,
              name: topic.name,
              questionsCount: totalQs,
              completedCount: completedQs
            });
          }
        });

        setCategories(mappedCategories.filter(c => c.topics.length > 0));
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  // Match icon strings to Lucide components
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Calculator": return <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "BrainCircuit": return <BrainCircuit className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
      case "Languages": return <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "BarChart3": return <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame": return <Flame className="w-6 h-6 text-orange-500" />;
      case "Award": return <Award className="w-6 h-6 text-indigo-500" />;
      case "Target": return <Target className="w-6 h-6 text-rose-500" />;
      case "Crown": return <Crown className="w-6 h-6 text-amber-500" />;
      default: return <Award className="w-6 h-6 text-zinc-500" />;
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-semibold animate-pulse">Loading aptitude analytics...</p>
      </div>
    );
  }

  const solvedCount = analytics?.totalSolved || 0;
  const accuracyRate = analytics?.accuracy || 0;
  const avgTestScore = analytics?.averageScore || 0;
  const streakDays = analytics?.dailyStreak || 5;
  const weakTopicsList = analytics?.weakTopics || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. TOP CARDS (Stats Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverEffect className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Questions Solved</p>
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {solvedCount}
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-600 ml-1">/ {totalDatabaseQuestions}</span>
            </h3>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalDatabaseQuestions > 0 ? (solvedCount / totalDatabaseQuestions) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Accuracy</p>
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{accuracyRate}%</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" /> High performing score
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{avgTestScore}%</h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">Top 15% of candidates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Zap className="w-6 h-6" />
          </div>
        </Card>

        <Card hoverEffect className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daily Streak</p>
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
              {streakDays} <span className="text-lg font-medium text-zinc-400">days</span>
            </h3>
            <p className="text-[11px] text-orange-600 dark:text-orange-450 font-medium flex items-center gap-1 mt-1 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current" /> Keep the streak hot!
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-500">
            <Flame className="w-6 h-6 fill-current" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Categories & Company Wise Prep (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 2. APTITUDE CATEGORIES & TOPICS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Aptitude Categories</h2>
              <span className="text-xs text-zinc-500">Select a topic inside a category to practice</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => {
                const progressPercentage = category.questionsCount > 0 
                  ? Math.round((category.completedCount / category.questionsCount) * 100) 
                  : 0;
                const isExpanded = expandedCategory === category.id;

                return (
                  <Card 
                    key={category.id} 
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-center">
                          {getCategoryIcon(category.icon)}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {category.questionsCount} Questions
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{category.name}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">{category.description}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-550 dark:text-zinc-350">
                          <span>Progress</span>
                          <span>{progressPercentage}% ({category.completedCount}/{category.questionsCount})</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-3">
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleCategory(category.id)}
                          className="flex-1 justify-between items-center text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer px-3"
                        >
                          <span className="text-xs font-semibold">View Topics</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => onSelectTopic(category.id, category.topics[0]?.name || "Practice")}
                          className="flex-1 text-xs font-bold cursor-pointer rounded-xl text-white py-1.5 px-4"
                        >
                          Start Practice
                        </Button>
                      </div>

                      {/* Expandable Topics List */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 gap-2 pt-2 animate-in slide-in-from-top-2 duration-200">
                          {category.topics.map((topic: any) => (
                            <div 
                              key={topic.name}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all duration-200"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{topic.name}</span>
                                <span className="text-[10px] text-zinc-400">{topic.completedCount} solved / {topic.questionsCount} total</span>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => onSelectTopic(topic.id, topic.name)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-xl text-[10px] font-bold"
                              >
                                <Play className="w-3 h-3 fill-current" /> Practice
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 3. COMPANY-WISE PRACTICE */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Company-wise Prep Hub
              </h2>
              <span className="text-xs text-zinc-500">Practice questions aligned to specific company hiring tests</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mockCompanyPractice.map((comp) => (
                <Card 
                  key={comp.id} 
                  hoverEffect 
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between h-48 relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                        {comp.difficulty}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{comp.questionsCount} Qs</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white tracking-tight">{comp.name}</h4>
                    
                    {/* Tiny Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                        <span>Completion</span>
                        <span>{comp.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${comp.progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectTopic("quantitative", `Company Prep: ${comp.name.split(" ")[0]}`)}
                    className="w-full justify-between items-center text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800 hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span>Start Practice</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mock Tests, Achievements, Weak Topics, Leaderboard (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 4. MOCK TEST SECTION */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Full Mock Tests
            </h2>
            <div className="space-y-4">
              {mockTests.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No mock tests available.</p>
              ) : (
                mockTests.map((test) => (
                  <Card 
                    key={test.id} 
                    hoverEffect 
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          test.difficulty === "Hard" 
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600" 
                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-600"
                        }`}>
                          {test.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{test.duration_minutes} mins</span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">{test.title}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{test.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-zinc-400">Mock MCQ Test</span>
                      <Button 
                        size="sm" 
                        onClick={() => onSelectTest(test)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold cursor-pointer rounded-xl py-1.5 px-4 shadow-md"
                      >
                        Start Test
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* 5. WEAK TOPICS SECTION */}
          {weakTopicsList.length > 0 && (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Need Improvement
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                We identified these topics as having low accuracy in your recent sessions. Focus on practicing these to boost score stability.
              </p>
              <div className="space-y-3.5">
                {weakTopicsList.map((topic: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{topic.name}</span>
                      <span className="text-xs font-bold text-rose-500">{topic.score}% Acc</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rec:</span> {topic.recommendation}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSelectTopic("quantitative", topic.name)}
                      className="w-full text-[10px] py-1.5 cursor-pointer border-zinc-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600"
                    >
                      Practice Now
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 6. ACHIEVEMENTS CABINET */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Unlocked Achievements
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {mockAchievements.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center relative overflow-hidden transition-all duration-300 ${
                    badge.unlocked 
                      ? "bg-zinc-50/50 dark:bg-zinc-955 border-zinc-200 dark:border-zinc-800/80 shadow-2xs" 
                      : "bg-zinc-100/40 dark:bg-zinc-900/20 border-zinc-100 dark:border-zinc-900/50 opacity-40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner ${
                    badge.unlocked 
                      ? "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 scale-105" 
                      : "bg-zinc-200 dark:bg-zinc-800"
                  }`}>
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight block">{badge.title}</span>
                  <span className="text-[8px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">{badge.description}</span>
                  {badge.unlocked && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* 7. LEADERBOARD */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Prep Leaderboard
              </h3>
              <span className="text-[9px] font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">Weekly</span>
            </div>

            <div className="space-y-2">
              {mockLeaderboard.map((userItem) => {
                const isMe = userItem.name.includes("(You)");
                const displayName = isMe && user?.full_name ? `${user.full_name} (You)` : userItem.name;
                return (
                  <div 
                    key={userItem.rank} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isMe 
                        ? "bg-indigo-50/50 dark:bg-indigo-955/20 border-indigo-200 dark:border-indigo-800/80 font-bold" 
                        : "bg-transparent border-transparent text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-center font-bold ${
                        userItem.rank === 1 ? "text-amber-500" : userItem.rank === 2 ? "text-zinc-400" : userItem.rank === 3 ? "text-amber-700" : ""
                      }`}>
                        #{userItem.rank}
                      </span>
                      <span className={`${isMe ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-300"}`}>
                        {displayName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-zinc-400">{userItem.accuracy}% Acc</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-150">{userItem.score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
