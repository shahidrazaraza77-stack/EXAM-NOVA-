"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "skill" | "consistency" | "placement" | "special";
  condition: (state: GamificationState) => boolean;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeDef["category"];
  progress: number;
  unlockedAt: string | null;
  xpReward: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: "aptitude" | "coding" | "interview" | "login";
  target: number;
  progress: number;
  completed: boolean;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: "questions" | "coding" | "interviews" | "mock_placement";
  target: number;
  progress: number;
  completed: boolean;
}

export interface PlacementMission {
  id: string;
  company: string;
  title: string;
  targets: { label: string; current: number; target: number }[];
  xpReward: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  title: string;
}

export interface AISuggestion {
  id: string;
  message: string;
  type: "badge" | "streak" | "improvement" | "milestone";
  priority: number;
}

export interface GamificationState {
  totalXP: number;
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  loginStreak: number;
  practiceStreak: number;
  codingStreak: number;
  interviewStreak: number;
  lastActivityDate: string;
  totalQuestionsSolved: number;
  totalTestsCompleted: number;
  totalInterviewsCompleted: number;
  totalMockPlacements: number;
  totalCodingProblems: number;
  dailyLoginCount: number;
  badges: Badge[];
  dailyChallenges: DailyChallenge[];
  weeklyMissions: WeeklyMission[];
  placementMissions: PlacementMission[];
  leaderboard: LeaderboardEntry[];
  aiSuggestions: AISuggestion[];
  recentActivity: { action: string; xp: number; timestamp: string }[];
}

// ─── Level Formula ───────────────────────────────────────────────────

export function getLevel(totalXP: number): number {
  // cumulativeXP(L) = 50 * L * (L - 1)
  // Solve for L given totalXP
  let L = 1;
  while (50 * L * (L + 1) <= totalXP) L++;
  return L;
}

export function getXPForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function getXPToNextLevel(totalXP: number, level: number): number {
  return 50 * level * (level + 1) - 50 * level * (level - 1);
}

export function getXPInCurrentLevel(totalXP: number, level: number): number {
  return totalXP - getXPForLevel(level);
}

export function getLevelTitle(level: number): string {
  if (level >= 100) return "Placement Master";
  if (level >= 50) return "Interview Ready";
  if (level >= 25) return "Advanced";
  if (level >= 10) return "Intermediate";
  return "Beginner";
}

// ─── Badge Definitions ───────────────────────────────────────────────

const BADGE_DEFS: BadgeDef[] = [
  { id: "first_question", name: "First Question Solved", description: "Solve your first question", icon: "🎯", category: "milestone", condition: (s) => s.totalQuestionsSolved >= 1, xpReward: 50 },
  { id: "q100", name: "Century Club", description: "Solve 100 questions", icon: "💯", category: "milestone", condition: (s) => s.totalQuestionsSolved >= 100, xpReward: 200 },
  { id: "q500", name: "Question Machine", description: "Solve 500 questions", icon: "🤖", category: "milestone", condition: (s) => s.totalQuestionsSolved >= 500, xpReward: 500 },
  { id: "coding_beginner", name: "Coding Beginner", description: "Solve your first coding problem", icon: "👨‍💻", category: "skill", condition: (s) => s.totalCodingProblems >= 1, xpReward: 50 },
  { id: "dsa_master", name: "DSA Master", description: "Solve 50 coding problems", icon: "⚡", category: "skill", condition: (s) => s.totalCodingProblems >= 50, xpReward: 300 },
  { id: "interview_ready", name: "Interview Ready", description: "Complete 10 mock interviews", icon: "🎤", category: "skill", condition: (s) => s.totalInterviewsCompleted >= 10, xpReward: 400 },
  { id: "mock_winner", name: "Mock Placement Winner", description: "Complete a full mock placement", icon: "🏆", category: "placement", condition: (s) => s.totalMockPlacements >= 1, xpReward: 100 },
  { id: "streak7", name: "7-Day Warrior", description: "Maintain a 7-day practice streak", icon: "🔥", category: "consistency", condition: (s) => s.practiceStreak >= 7, xpReward: 150 },
  { id: "streak15", name: "15-Day Champion", description: "Maintain a 15-day practice streak", icon: "🔥", category: "consistency", condition: (s) => s.practiceStreak >= 15, xpReward: 300 },
  { id: "streak30", name: "30-Day Legend", description: "Maintain a 30-day practice streak", icon: "🔥", category: "consistency", condition: (s) => s.practiceStreak >= 30, xpReward: 600 },
  { id: "amazon_ready", name: "Amazon Ready", description: "Become Amazon placement ready (80%)", icon: "📦", category: "placement", condition: () => false, xpReward: 350 },
  { id: "level10", name: "Intermediate Achiever", description: "Reach Level 10", icon: "⭐", category: "milestone", condition: (s) => getLevel(s.totalXP) >= 10, xpReward: 200 },
  { id: "level25", name: "Advanced Achiever", description: "Reach Level 25", icon: "🌟", category: "milestone", condition: (s) => getLevel(s.totalXP) >= 25, xpReward: 500 },
  { id: "level50", name: "Interview Ready Elite", description: "Reach Level 50", icon: "💎", category: "milestone", condition: (s) => getLevel(s.totalXP) >= 50, xpReward: 1000 },
  { id: "perfect_day", name: "Perfect Day", description: "Complete all daily challenges", icon: "📅", category: "special", condition: (s) => s.dailyChallenges.length > 0 && s.dailyChallenges.every((c) => c.completed), xpReward: 100 },
];

// ─── Default State ───────────────────────────────────────────────────

function getDefaultState(dateStr: string): GamificationState {
  return {
    totalXP: 0,
    level: 1,
    xpInCurrentLevel: 0,
    xpToNextLevel: 100,
    loginStreak: 0,
    practiceStreak: 0,
    codingStreak: 0,
    interviewStreak: 0,
    lastActivityDate: dateStr,
    totalQuestionsSolved: 0,
    totalTestsCompleted: 0,
    totalInterviewsCompleted: 0,
    totalMockPlacements: 0,
    totalCodingProblems: 0,
    dailyLoginCount: 0,
    badges: BADGE_DEFS.map((b) => ({ id: b.id, name: b.name, description: b.description, icon: b.icon, category: b.category, progress: 0, unlockedAt: null, xpReward: b.xpReward })),
    dailyChallenges: generateDailyChallenges(dateStr),
    weeklyMissions: generateWeeklyMissions(),
    placementMissions: [
      { id: "pm_amazon", company: "Amazon", title: "Become Amazon Ready", targets: [{ label: "Aptitude Score", current: 0, target: 80 }, { label: "Coding Score", current: 0, target: 80 }, { label: "Interview Score", current: 0, target: 80 }], xpReward: 500, completed: false },
      { id: "pm_google", company: "Google", title: "Become Google Ready", targets: [{ label: "Aptitude Score", current: 0, target: 85 }, { label: "Coding Score", current: 0, target: 85 }, { label: "Interview Score", current: 0, target: 80 }], xpReward: 600, completed: false },
      { id: "pm_microsoft", company: "Microsoft", title: "Become Microsoft Ready", targets: [{ label: "Aptitude Score", current: 0, target: 80 }, { label: "Coding Score", current: 0, target: 75 }, { label: "Interview Score", current: 0, target: 80 }], xpReward: 500, completed: false },
    ],
    leaderboard: generateMockLeaderboard(),
    aiSuggestions: [
      { id: "ai_1", message: "Complete your daily challenges to build consistency!", type: "milestone", priority: 3 },
      { id: "ai_2", message: "You are close to unlocking 'Century Club' badge — solve 10 more questions!", type: "badge", priority: 2 },
    ],
    recentActivity: [],
  };
}

function generateDailyChallenges(dateStr: string): DailyChallenge[] {
  const day = new Date(dateStr).getDate();
  return [
    { id: `dc_apt_${dateStr}`, title: "Solve 5 Aptitude Questions", description: "Practice quantitative and logical reasoning", xpReward: 50, type: "aptitude", target: 5, progress: 0, completed: false },
    { id: `dc_coding_${dateStr}`, title: "Complete 1 Coding Problem", description: "Sharpen your DSA skills", xpReward: 30, type: "coding", target: 1, progress: 0, completed: false },
    { id: `dc_interview_${dateStr}`, title: "Attempt 1 Interview Question", description: "Practice your interview responses", xpReward: 25, type: "interview", target: 1, progress: 0, completed: false },
  ];
}

function generateWeeklyMissions(): WeeklyMission[] {
  return [
    { id: "wm_questions", title: "Complete 50 Questions", description: "Solve questions across all topics", xpReward: 200, type: "questions", target: 50, progress: 0, completed: false },
    { id: "wm_coding", title: "Solve 10 Coding Problems", description: "Master DSA with consistent practice", xpReward: 150, type: "coding", target: 10, progress: 0, completed: false },
    { id: "wm_interviews", title: "Attempt 3 Mock Interviews", description: "Build interview confidence", xpReward: 100, type: "interviews", target: 3, progress: 0, completed: false },
  ];
}

function generateMockLeaderboard(): LeaderboardEntry[] {
  const names = [
    "Priya Sharma", "Rohan Das", "Ananya Patel", "Amit Kumar", "Sneha Gupta",
    "Vikram Singh", "Neha Verma", "Arjun Reddy", "Kavya Nair", "Rahul Joshi",
    "Ishita Mehta", "Devendra Chauhan", "Pooja Iyer", "Karan Walia", "Shreya Saxena",
  ];
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    avatar: name.split(" ").map((n) => n[0]).join(""),
    xp: Math.max(0, 15000 - i * 900 + Math.floor(Math.random() * 200)),
    level: Math.max(1, Math.floor((15000 - i * 900) / 500) + 1),
    badges: Math.max(0, 8 - i),
    streak: Math.max(0, 30 - i * 2),
    title: i < 3 ? "🔥 Top Performer" : i < 8 ? "⭐ Consistent" : "💪 Rising Star",
  }));
}

import { useAuth } from "@/context/AuthContext";

// ─── Context ─────────────────────────────────────────────────────────

interface GamificationContextType {
  state: GamificationState;
  awardXP: (amount: number, action: string) => void;
  trackActivity: (type: "aptitude" | "coding" | "interview" | "mock_placement" | "login" | "test" | "resume") => void;
  updateChallengeProgress: (type: DailyChallenge["type"], amount?: number) => void;
  updateMissionProgress: (type: WeeklyMission["type"], amount?: number) => void;
  updatePlacementTarget: (company: string, label: string, value: number) => void;
  getNewBadgeAlerts: () => Badge[];
  clearBadgeAlerts: () => void;
  refreshDailyChallenges: () => void;
  refreshLeaderboard: () => void;
  addAISuggestion: (suggestion: Omit<AISuggestion, "id">) => void;
  dismissAISuggestion: (id: string) => void;
  newBadgeAlerts: Badge[];
  currentLevelXP: number;
  nextLevelXP: number;
  levelProgress: number;
  levelTitle: string;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const [state, setState] = useState<GamificationState>(() => getDefaultState(today));
  const [newBadgeAlerts, setNewBadgeAlerts] = useState<Badge[]>([]);
  const prevLevelRef = useRef(1);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch { return null; }
  }, []);

  // Fetch data from server
  const fetchGamificationData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/gamification?userId=${user.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setState(prev => ({
          ...prev,
          totalXP: data.profile.xp || 0,
          level: data.profile.level || 1,
          loginStreak: data.profile.streak_days || 0,
          practiceStreak: data.profile.streak_days || 0,
          codingStreak: data.profile.coding_streak || 0,
          interviewStreak: data.profile.interview_streak || 0,
          lastActivityDate: data.profile.last_active_date || today,
          badges: data.badges || prev.badges,
          dailyChallenges: data.challenges || prev.dailyChallenges,
          recentActivity: (data.recentActivity || []).map((a: any) => ({
            action: a.action,
            xp: 0,
            timestamp: a.created_at
          }))
        }));
      }
    } catch (e) {
      console.error("Failed to fetch gamification data:", e);
    }
  }, [user?.id, getAccessToken, today]);

  const trackActivity = useCallback(async (type: "aptitude" | "coding" | "interview" | "mock_placement" | "login" | "test" | "resume") => {
    if (!user?.id) return;
    let action = "";
    switch (type) {
      case "aptitude":
        action = "solve_aptitude";
        break;
      case "test":
        action = "complete_aptitude_test";
        break;
      case "coding":
        action = "solve_coding";
        break;
      case "interview":
        action = "complete_mock_interview";
        break;
      case "mock_placement":
        action = "complete_mock_placement";
        break;
      case "login":
        action = "daily_login";
        break;
      case "resume":
        action = "resume_analysis";
        break;
    }

    if (!action) return;

    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/gamification", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: user.id, action })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.leveledUp) {
          setNewBadgeAlerts((prev) => [
            ...prev,
            { 
              id: `level_${data.level}`, 
              name: `Level ${data.level}`, 
              description: `You reached Level ${data.level}: ${getLevelTitle(data.level)}`, 
              icon: "⬆️", 
              category: "milestone", 
              progress: 100, 
              unlockedAt: new Date().toISOString(), 
              xpReward: 0 
            },
          ]);
        }
        
        setState(prev => ({
          ...prev,
          totalXP: data.profile.xp || 0,
          level: data.profile.level || 1,
          loginStreak: data.profile.streak_days || 0,
          practiceStreak: data.profile.streak_days || 0,
          codingStreak: data.profile.coding_streak || 0,
          interviewStreak: data.profile.interview_streak || 0,
          lastActivityDate: data.profile.last_active_date || today,
          badges: data.badges || prev.badges,
          dailyChallenges: data.challenges || prev.dailyChallenges,
          recentActivity: (data.recentActivity || []).map((a: any) => ({
            action: a.action,
            xp: 0,
            timestamp: a.created_at
          }))
        }));
      }
    } catch (e) {
      console.error("Failed to track activity on server:", e);
    }
  }, [user?.id, getAccessToken, today]);

  useEffect(() => {
    if (user?.id) {
      fetchGamificationData().then(() => {
        const lastLoginTrackKey = `examnova_login_tracked_${user.id}_${today}`;
        if (typeof window !== "undefined" && !localStorage.getItem(lastLoginTrackKey)) {
          localStorage.setItem(lastLoginTrackKey, "true");
          trackActivity("login");
        }
      });
    }
  }, [user?.id, fetchGamificationData, trackActivity, today]);

  // Sync level up notifications
  useEffect(() => {
    if (state.level > prevLevelRef.current) {
      setNewBadgeAlerts((prev) => [
        ...prev,
        { 
          id: `level_${state.level}`, 
          name: `Level ${state.level}`, 
          description: `You reached Level ${state.level}: ${getLevelTitle(state.level)}`, 
          icon: "⬆️", 
          category: "milestone", 
          progress: 100, 
          unlockedAt: new Date().toISOString(), 
          xpReward: 0 
        },
      ]);
    }
    prevLevelRef.current = state.level;
  }, [state.level]);

  // ─── Computed Values ──────────────────────────────────────────────
  const level = getLevel(state.totalXP);
  const currentLevelXP = getXPInCurrentLevel(state.totalXP, level);
  const nextLevelXP = getXPToNextLevel(state.totalXP, level);
  const levelProgress = nextLevelXP > 0 ? Math.min(100, (currentLevelXP / nextLevelXP) * 100) : 100;
  const levelTitle = getLevelTitle(level);

  // ─── Actions ──────────────────────────────────────────────────────
  const awardXP = useCallback(async (amount: number, action: string) => {
    // Optional compatibility wrapper
    console.log(`awardXP: ${amount} XP for ${action}`);
  }, []);



  const updateChallengeProgress = useCallback((type: DailyChallenge["type"], amount: number = 1) => {
    // Handled dynamically on the server side now. Keep signature for compatibility.
  }, []);

  const updateMissionProgress = useCallback((type: WeeklyMission["type"], amount: number = 1) => {
    // Keep signature for compatibility.
  }, []);

  const updatePlacementTarget = useCallback((company: string, label: string, value: number) => {
    // Keep signature for compatibility.
  }, []);

  const getNewBadgeAlerts = useCallback(() => newBadgeAlerts, [newBadgeAlerts]);
  const clearBadgeAlerts = useCallback(() => setNewBadgeAlerts([]), []);

  const refreshDailyChallenges = useCallback(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const refreshLeaderboard = useCallback(() => {
    // Handled inside leaderboard tab fetching
  }, []);

  const addAISuggestion = useCallback((suggestion: Omit<AISuggestion, "id">) => {
    const newSuggestion: AISuggestion = { ...suggestion, id: `ai_${Date.now()}` };
    setState((prev) => ({ ...prev, aiSuggestions: [newSuggestion, ...prev.aiSuggestions].slice(0, 10) }));
  }, []);

  const dismissAISuggestion = useCallback((id: string) => {
    setState((prev) => ({ ...prev, aiSuggestions: prev.aiSuggestions.filter((s) => s.id !== id) }));
  }, []);

  const value: GamificationContextType = {
    state,
    awardXP,
    trackActivity,
    updateChallengeProgress,
    updateMissionProgress,
    updatePlacementTarget,
    getNewBadgeAlerts,
    clearBadgeAlerts,
    refreshDailyChallenges,
    refreshLeaderboard,
    addAISuggestion,
    dismissAISuggestion,
    newBadgeAlerts,
    currentLevelXP,
    nextLevelXP,
    levelProgress,
    levelTitle,
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}

