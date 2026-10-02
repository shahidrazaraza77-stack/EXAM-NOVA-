"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/context/NotificationContext";
import { Bell, Check, Trash2, X, Megaphone, Brain, AlertTriangle, Star, Target, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";

const categoryIcons: Record<string, React.ReactNode> = {
  system: <Megaphone className="h-3.5 w-3.5" />,
  learning: <Brain className="h-3.5 w-3.5" />,
  ai_alert: <Sparkles className="h-3.5 w-3.5" />,
  streak: <FlameIcon className="h-3.5 w-3.5" />,
  gamification: <Trophy className="h-3.5 w-3.5" />,
  mock_placement: <Target className="h-3.5 w-3.5" />,
  daily_plan: <Check className="h-3.5 w-3.5" />,
};

function FlameIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.866 0-7-3.134-7-7 0-3.866 3.5-8 7-12 3.5 4 7 8.134 7 12 0 3.866-3.134 7-7 7z"/></svg>; }

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, settings, updateSettings } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const recent = notifications.slice(0, 8);

  const priorityColors: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors">
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Notifications</span>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] px-2 py-1 rounded-lg bg-aurora-surface text-aurora-text-muted hover:text-aurora-text-secondary cursor-pointer transition-colors flex items-center gap-1">
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-500">No notifications yet</p>
                  <p className="text-xs text-zinc-400 mt-1">Complete activities to see updates here</p>
                </div>
              ) : (
                recent.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left p-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${!n.read ? "bg-violet-50/50 dark:bg-violet-950/10" : ""}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                        {categoryIcons[n.category] || <Bell className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${!n.read ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>{n.title}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityColors[n.priority]} shrink-0`} />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block p-3 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
