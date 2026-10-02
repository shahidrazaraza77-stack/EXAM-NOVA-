"use client";

import React, { useState } from "react";
import { useNotifications, NotificationCategory, NotificationPriority } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Check, Trash2, Megaphone, Brain, Trophy, Target, Sparkles, Filter, Inbox, Search, Clock, ArrowRight
} from "lucide-react";
import Link from "next/link";

const categoryIcons: Record<string, React.ReactNode> = {
  system: <Megaphone className="h-4 w-4" />,
  learning: <Brain className="h-4 w-4" />,
  ai_alert: <Sparkles className="h-4 w-4" />,
  streak: <span className="text-orange-500 font-bold">🔥</span>,
  gamification: <Trophy className="h-4 w-4 text-amber-500" />,
  mock_placement: <Target className="h-4 w-4 text-rose-500" />,
  daily_plan: <Check className="h-4 w-4 text-emerald-500" />,
};

const priorityConfig: Record<NotificationPriority, { label: string; text: string; bg: string; dot: string }> = {
  high: { label: "High", text: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40", dot: "bg-red-500" },
  medium: { label: "Medium", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40", dot: "bg-amber-500" },
  low: { label: "Low", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40", dot: "bg-blue-500" },
};

export default function NotificationCenterPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, refreshNotifications } = useNotifications();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = async () => {
    await refreshNotifications();
  };

  const filtered = notifications.filter((n) => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) {
        return false;
      }
    }
    // 2. Category
    if (filterCategory !== "all") {
      // Map database/context category queries
      if (filterCategory === "system" && n.category !== "system") return false;
      if (filterCategory === "ai" && n.category !== "ai_alert") return false;
      if (filterCategory === "gamification" && !["gamification", "streak"].includes(n.category)) return false;
      if (filterCategory === "study" && !["learning", "daily_plan", "mock_placement"].includes(n.category)) return false;
    }
    // 3. Priority
    if (filterPriority !== "all" && n.priority !== filterPriority) return false;
    // 4. Read Status
    if (filterRead === "unread" && n.read) return false;
    if (filterRead === "read" && !n.read) return false;

    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20 text-zinc-900 dark:text-zinc-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Placement Command Notifications</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage system events, streak warnings, and AI recommendations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Sync Database
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-500/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Internal View Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <Link href="/dashboard/notifications" className="px-4 py-2 border-b-2 border-indigo-500 text-sm font-bold text-indigo-600 dark:text-indigo-400">
          Notification Center
        </Link>
        <Link href="/dashboard/notifications/recommendations" className="px-4 py-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
          AI Recommendations
        </Link>
        <Link href="/dashboard/notifications/settings" className="px-4 py-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
          Notification Settings
        </Link>
      </div>

      {/* Filters & Search Board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <option value="all">All Categories</option>
            <option value="system">System Alerts</option>
            <option value="ai">AI Mentor Advice</option>
            <option value="gamification">Streaks & Badges</option>
            <option value="study">Study Plan & Tests</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="md:col-span-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🔵 Low Priority</option>
          </select>
        </div>

        {/* Read Status Switch */}
        <div className="md:col-span-3 flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50/50 dark:bg-zinc-900/50">
          {(["all", "unread", "read"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterRead(mode)}
              className={`flex-1 py-1 text-[10px] font-bold capitalize rounded-lg transition-all cursor-pointer ${
                filterRead === mode
                  ? "bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Board */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-12 text-center"
            >
              <Inbox className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">All caught up!</h3>
              <p className="text-3xs text-zinc-400 mt-0.5">No notifications match your current filter settings.</p>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((n) => {
                const priority = priorityConfig[n.priority];
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className={`group relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl p-4 transition-all duration-300 ${
                      !n.read ? "shadow-sm border-indigo-500/20 dark:border-indigo-500/20" : ""
                    }`}
                  >
                    {/* Left unread marker line */}
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        !n.read
                          ? "bg-violet-50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30 text-violet-650 dark:text-violet-400"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
                      }`}>
                        {categoryIcons[n.category] || <Bell className="h-4.5 w-4.5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-xs font-bold ${!n.read ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-650 dark:text-zinc-400"}`}>
                            {n.title}
                          </h4>
                          
                          {/* Priority Badge */}
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border flex items-center gap-1 ${priority.bg} ${priority.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                            {priority.label}
                          </span>

                          {/* Category Tag */}
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-150/50 dark:border-zinc-800">
                            {n.category.replace(/_/g, " ")}
                          </span>
                        </div>
                        
                        <p className={`text-xs leading-relaxed ${!n.read ? "text-zinc-650 dark:text-zinc-300 font-medium" : "text-zinc-500 dark:text-zinc-400"}`}>
                          {n.message}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                          {n.actionUrl && (
                            <Link href={n.actionUrl} className="flex items-center gap-0.5 text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
                              Action Required
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Mark Read Action Button */}
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-500 hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer border border-zinc-200/50 dark:border-zinc-800 transition-all shadow-2xs group-hover:scale-105"
                          title="Mark as read"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
