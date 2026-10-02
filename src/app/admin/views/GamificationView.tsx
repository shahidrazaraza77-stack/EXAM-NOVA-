"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  Trophy, Star, Zap, Target, Gift, Shield, Plus, Edit3, Trash2,
  Loader2, AlertCircle, X, Check, TrendingUp, Award, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GamTab = "badges" | "challenges" | "levels" | "xp-rules";

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: string;
  target: number;
}

const BADGE_ICONS = ["🏆", "⭐", "🔥", "💎", "🎯", "🚀", "👑", "🎖️", "🏅", "⚡", "🌟", "💪", "🎓", "🦁", "🐉"];
const XP_ACTIONS = [
  { action: "Complete Aptitude Question", default_xp: 10 },
  { action: "Solve Coding Problem", default_xp: 25 },
  { action: "Complete Interview Session", default_xp: 30 },
  { action: "Complete Mock Test", default_xp: 50 },
  { action: "Daily Login Streak", default_xp: 5 },
  { action: "Upload Resume", default_xp: 15 },
  { action: "Complete Company Roadmap Week", default_xp: 40 },
];

const LEVEL_THRESHOLDS = [
  { level: 1, name: "Beginner", min_xp: 0, max_xp: 100, perks: "Access to basic questions" },
  { level: 2, name: "Explorer", min_xp: 100, max_xp: 250, perks: "Unlock Medium difficulty" },
  { level: 3, name: "Practitioner", min_xp: 250, max_xp: 500, perks: "Unlock company-specific mocks" },
  { level: 4, name: "Advanced", min_xp: 500, max_xp: 1000, perks: "Unlock Hard difficulty + interview coach" },
  { level: 5, name: "Expert", min_xp: 1000, max_xp: 2000, perks: "Full leaderboard + premium roadmaps" },
  { level: 6, name: "Master", min_xp: 2000, max_xp: 5000, perks: "Mentor badge + special challenges" },
  { level: 7, name: "Legend", min_xp: 5000, max_xp: 999999, perks: "Hall of Fame + exclusive rewards" },
];

export default function GamificationView() {
  const [activeTab, setActiveTab] = useState<GamTab>("badges");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Badge modal state
  const [badgeModal, setBadgeModal] = useState<"add" | "edit" | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [badgeForm, setBadgeForm] = useState({ code: "", name: "", description: "", icon: "🏆", xp_required: 100 });
  const [isSaving, setIsSaving] = useState(false);

  // Challenge modal state
  const [challengeModal, setChallengeModal] = useState<"add" | "edit" | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeForm, setChallengeForm] = useState({ title: "", description: "", xp_reward: 50, type: "aptitude", target: 5 });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [{ data: b }, { data: c }] = await Promise.all([
        (supabase.from("badges") as any).select("*").order("xp_required"),
        (supabase.from("daily_challenges") as any).select("*").order("created_at", { ascending: false }).limit(30),
      ]);
      setBadges(b || []);
      setChallenges(c || []);
    } catch (err: any) {
      setError(err.message || "Failed to load gamification data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Badge CRUD
  const openAddBadge = () => {
    setBadgeForm({ code: "", name: "", description: "", icon: "🏆", xp_required: 100 });
    setBadgeModal("add");
  };
  const openEditBadge = (b: Badge) => {
    setSelectedBadge(b);
    setBadgeForm({ code: b.code, name: b.name, description: b.description, icon: b.icon, xp_required: b.xp_required });
    setBadgeModal("edit");
  };
  const saveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (badgeModal === "add") {
        await (supabase.from("badges") as any).insert(badgeForm);
      } else if (selectedBadge) {
        await (supabase.from("badges") as any).update(badgeForm).eq("id", selectedBadge.id);
      }
      setBadgeModal(null);
      await loadData();
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setIsSaving(false); }
  };
  const deleteBadge = async (id: string) => {
    if (!confirm("Delete this badge?")) return;
    await (supabase.from("badges") as any).delete().eq("id", id);
    await loadData();
  };

  // Challenge CRUD
  const openAddChallenge = () => {
    setChallengeForm({ title: "", description: "", xp_reward: 50, type: "aptitude", target: 5 });
    setChallengeModal("add");
  };
  const openEditChallenge = (c: Challenge) => {
    setSelectedChallenge(c);
    setChallengeForm({ title: c.title, description: c.description, xp_reward: c.xp_reward, type: c.type, target: c.target });
    setChallengeModal("edit");
  };
  const saveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (challengeModal === "add") {
        await (supabase.from("daily_challenges") as any).insert(challengeForm);
      } else if (selectedChallenge) {
        await (supabase.from("daily_challenges") as any).update(challengeForm).eq("id", selectedChallenge.id);
      }
      setChallengeModal(null);
      await loadData();
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setIsSaving(false); }
  };
  const deleteChallenge = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    await (supabase.from("daily_challenges") as any).delete().eq("id", id);
    await loadData();
  };

  const TABS: { id: GamTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: "badges", label: "Badges", icon: Award },
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "levels", label: "Level System", icon: TrendingUp },
    { id: "xp-rules", label: "XP Rules", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-100 dark:border-amber-900/30 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/20">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">Gamification Center</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage XP rules, levels, badges, and challenges that motivate students</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={loadData} className="ml-auto underline font-semibold">Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold whitespace-nowrap relative cursor-pointer transition-all ${isActive ? "text-amber-600 dark:text-amber-400" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}>
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && <motion.div layoutId="gam-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      )}

      {/* BADGES TAB */}
      {!isLoading && activeTab === "badges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{badges.length} badges configured</p>
            <Button onClick={openAddBadge} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ">
              <Plus className="h-4 w-4" /> Create Badge
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(badge => (
              <Card key={badge.id} className="p-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 hover:border-amber-200 dark:hover:border-amber-900/30 transition-all shadow-sm group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-2xl">
                      {badge.icon}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{badge.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{badge.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditBadge(badge)} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteBadge(badge.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{badge.description}</p>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star className="h-3.5 w-3.5" />
                  {badge.xp_required} XP Required
                </div>
              </Card>
            ))}
            {badges.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-400">No badges yet. Create your first badge!</div>
            )}
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {!isLoading && activeTab === "challenges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{challenges.length} challenge templates</p>
            <Button onClick={openAddChallenge} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ">
              <Plus className="h-4 w-4" /> New Challenge
            </Button>
          </div>
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Challenge</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">XP Reward</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {challenges.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{c.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{c.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 text-xs font-semibold capitalize rounded-full border bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">{c.target}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Zap className="h-3.5 w-3.5" />{c.xp_reward} XP
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditChallenge(c)} className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteChallenge(c.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {challenges.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-zinc-400">No challenges yet. Create daily challenges for students!</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* LEVELS TAB */}
      {!isLoading && activeTab === "levels" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0" />
            Level thresholds are computed dynamically from XP: <code className="font-mono ml-1">Level = floor(XP / 100) + 1</code>. The table below shows recommended level descriptions.
          </div>
          <div className="grid grid-cols-1 gap-3">
            {LEVEL_THRESHOLDS.map((lv, idx) => (
              <Card key={lv.level} className="p-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md
                    ${idx === 0 ? "bg-gradient-to-br from-zinc-400 to-zinc-600" :
                      idx === 1 ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                      idx === 2 ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                      idx === 3 ? "bg-gradient-to-br from-violet-500 to-purple-600" :
                      idx === 4 ? "bg-gradient-to-br from-amber-500 to-orange-600" :
                      idx === 5 ? "bg-gradient-to-br from-rose-500 to-red-600" :
                      "bg-gradient-to-br from-yellow-400 to-amber-500"
                    }`}>
                    {lv.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50">{lv.name}</h4>
                      <span className="text-xs font-mono text-zinc-500">{lv.min_xp} – {lv.max_xp === 999999 ? "∞" : lv.max_xp} XP</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{lv.perks}</p>
                  </div>
                  {lv.level === 7 && <Trophy className="h-6 w-6 text-amber-500 shrink-0" />}
                  {lv.level === 6 && <Flame className="h-6 w-6 text-rose-500 shrink-0" />}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* XP RULES TAB */}
      {!isLoading && activeTab === "xp-rules" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-700 dark:text-violet-400 flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0" />
            XP is awarded automatically when students complete actions. The values below are the defaults configured in the gamification engine.
          </div>
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">XP Awarded</th>
                  <th className="px-6 py-4">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {XP_ACTIONS.map((rule, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{rule.action}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 font-black text-amber-600 dark:text-amber-400 text-base">
                        <Zap className="h-4 w-4" />+{rule.default_xp}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">Per occurrence</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-xs text-zinc-400 text-center">XP rules are configured in <code className="font-mono">gamification.service.ts</code>. Contact the engineering team to modify base values.</p>
        </div>
      )}

      {/* Badge CRUD Modal */}
      <AnimatePresence>
        {badgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSaving && setBadgeModal(null)} className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  {badgeModal === "add" ? "Create Badge" : "Edit Badge"}
                </h3>
                <button onClick={() => !isSaving && setBadgeModal(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={saveBadge}>
                <div className="p-6 space-y-4">
                  {/* Icon selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Badge Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {BADGE_ICONS.map(icon => (
                        <button key={icon} type="button" onClick={() => setBadgeForm(f => ({ ...f, icon }))}
                          className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all cursor-pointer ${badgeForm.icon === icon ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 scale-110" : "border-zinc-200 dark:border-zinc-700 hover:border-amber-300"}`}>
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Code *</label>
                      <input required value={badgeForm.code} onChange={e => setBadgeForm(f => ({ ...f, code: e.target.value }))}
                        placeholder="first_login" className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Name *</label>
                      <input required value={badgeForm.name} onChange={e => setBadgeForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="First Login" className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                    <textarea value={badgeForm.description} onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))}
                      rows={2} placeholder="What does this badge mean?"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">XP Required</label>
                    <input type="number" min={0} value={badgeForm.xp_required} onChange={e => setBadgeForm(f => ({ ...f, xp_required: Number(e.target.value) }))}
                      className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                  <Button type="button" onClick={() => setBadgeModal(null)} variant="secondary" className="text-xs h-9 px-4" disabled={isSaving}>Cancel</Button>
                  <Button type="submit" variant="primary" className="text-xs h-9 px-4 gap-1.5 " disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Badge
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Challenge CRUD Modal */}
      <AnimatePresence>
        {challengeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSaving && setChallengeModal(null)} className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  {challengeModal === "add" ? "Create Challenge" : "Edit Challenge"}
                </h3>
                <button onClick={() => !isSaving && setChallengeModal(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={saveChallenge}>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title *</label>
                    <input required value={challengeForm.title} onChange={e => setChallengeForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Solve 5 Aptitude Questions" className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                    <textarea rows={2} value={challengeForm.description} onChange={e => setChallengeForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Practice quantitative and logical reasoning" className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500 resize-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</label>
                      <select value={challengeForm.type} onChange={e => setChallengeForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500">
                        <option value="aptitude">Aptitude</option><option value="coding">Coding</option>
                        <option value="interview">Interview</option><option value="login">Login</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target</label>
                      <input type="number" min={1} value={challengeForm.target} onChange={e => setChallengeForm(f => ({ ...f, target: Number(e.target.value) }))}
                        className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">XP Reward</label>
                      <input type="number" min={1} value={challengeForm.xp_reward} onChange={e => setChallengeForm(f => ({ ...f, xp_reward: Number(e.target.value) }))}
                        className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-amber-500" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                  <Button type="button" onClick={() => setChallengeModal(null)} variant="secondary" className="text-xs h-9 px-4" disabled={isSaving}>Cancel</Button>
                  <Button type="submit" variant="primary" className="text-xs h-9 px-4 gap-1.5 " disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Challenge
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
