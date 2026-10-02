"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useGamification } from "./GamificationContext";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { supabase } from "@/lib/supabaseClient";

// ─── Types ───────────────────────────────────────────────────────────

export type NotificationCategory = "system" | "learning" | "ai_alert" | "streak" | "gamification" | "mock_placement" | "daily_plan";
export type NotificationPriority = "high" | "medium" | "low";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  dismissible: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  quietMode: boolean;
  quietModeStart: string; // "22:00"
  quietModeEnd: string;   // "07:00"
  categories: Record<NotificationCategory, boolean>;
  frequency: "realtime" | "hourly" | "daily" | "weekly";
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  quietMode: false,
  quietModeStart: "22:00",
  quietModeEnd: "07:00",
  categories: {
    system: true,
    learning: true,
    ai_alert: true,
    streak: true,
    gamification: true,
    mock_placement: true,
    daily_plan: true,
  },
  frequency: "realtime",
};

// ─── Bidirectional Mappings ─────────────────────────────────────────

const contextToDbCategory = (cat: NotificationCategory): "system" | "ai" | "gamification" | "study" => {
  switch (cat) {
    case "system":
      return "system";
    case "ai_alert":
      return "ai";
    case "streak":
    case "gamification":
    case "mock_placement":
      return "gamification";
    case "learning":
    case "daily_plan":
    default:
      return "study";
  }
};

const dbToContextCategory = (dbCat: string): NotificationCategory => {
  switch (dbCat) {
    case "system": return "system";
    case "ai": return "ai_alert";
    case "gamification": return "gamification";
    case "study": return "learning";
    default: return "system";
  }
};

// ─── Context ─────────────────────────────────────────────────────────

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearCategory: (category: NotificationCategory) => void;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  toggleCategory: (category: NotificationCategory) => void;
  filteredNotifications: (category?: NotificationCategory | "all", priority?: NotificationPriority | "all") => AppNotification[];
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { state: gState, newBadgeAlerts, clearBadgeAlerts } = useGamification();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [seenBadgeIds, setSeenBadgeIds] = useState<Set<string>>(new Set());
  const prevStreakRef = useRef(gState.practiceStreak);
  const prevLoginRef = useRef(gState.loginStreak);

  // ─── Database Synchronization ──────────────────────────────────────

  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await (supabase.from("notifications") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: AppNotification[] = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          category: dbToContextCategory(n.category),
          priority: n.priority as NotificationPriority,
          read: n.is_read,
          createdAt: n.created_at,
          dismissible: true
        }));
        setNotifications(mapped);
      }
    } catch (e) {
      console.error("Failed to load DB notifications:", e);
    }
  }, [user?.id]);

  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await (supabase.from("user_preferences") as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setSettings({
          enabled: data.notifications_enabled,
          quietMode: !!(data.quiet_hours_start || data.quiet_hours_end),
          quietModeStart: data.quiet_hours_start ? data.quiet_hours_start.substring(0, 5) : "22:00",
          quietModeEnd: data.quiet_hours_end ? data.quiet_hours_end.substring(0, 5) : "08:00",
          categories: {
            system: data.notifications_enabled,
            learning: data.notifications_enabled,
            ai_alert: data.notifications_enabled,
            streak: data.notifications_enabled,
            gamification: data.notifications_enabled,
            mock_placement: data.notifications_enabled,
            daily_plan: data.notifications_enabled,
          },
          frequency: "realtime"
        });
      }
    } catch (e) {
      console.error("Failed to load user preferences:", e);
    }
  }, [user?.id]);

  // Load initially when user is present
  useEffect(() => {
    if (user?.id) {
      refreshNotifications();
      loadPreferences();
    } else {
      setNotifications([]);
    }
  }, [user?.id, refreshNotifications, loadPreferences]);

  // Realtime Postgres subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`db_notifications_sync_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const raw = payload.new as any;
          const mapped: AppNotification = {
            id: raw.id,
            title: raw.title,
            message: raw.message,
            category: dbToContextCategory(raw.category),
            priority: raw.priority as NotificationPriority,
            read: raw.is_read,
            createdAt: raw.created_at,
            dismissible: true
          };

          setNotifications((prev) => {
            if (prev.some((p) => p.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });

          // Trigger active toast alert
          if (settings.enabled) {
            if (mapped.priority === "high") {
              toast.error(`${mapped.title}: ${mapped.message}`);
            } else if (mapped.priority === "medium") {
              toast.warning(`${mapped.title}: ${mapped.message}`);
            } else {
              toast.success(`${mapped.title}: ${mapped.message}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, settings.enabled, toast]);

  // ─── Actions ────────────────────────────────────────────────────────

  const addNotification = useCallback(async (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    if (!user?.id) return;
    try {
      const dbCat = contextToDbCategory(n.category);
      await (supabase.from("notifications") as any)
        .insert({
          user_id: user.id,
          title: n.title,
          message: n.message,
          category: dbCat,
          priority: n.priority,
          is_read: false
        });
    } catch (e) {
      console.error("Failed to insert notification:", e);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try {
      await (supabase.from("notifications") as any)
        .update({ is_read: true })
        .eq("id", id);
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!user?.id) return;
    try {
      await (supabase.from("notifications") as any)
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  }, [user?.id]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    if (!user?.id) return;
    try {
      await (supabase.from("notifications") as any)
        .delete()
        .eq("user_id", user.id);
    } catch (e) {
      console.error("Failed to delete notifications:", e);
    }
    clearBadgeAlerts();
  }, [user?.id, clearBadgeAlerts]);

  const clearCategory = useCallback(async (category: NotificationCategory) => {
    setNotifications((prev) => prev.filter((n) => n.category !== category));
    if (!user?.id) return;
    try {
      const dbCat = contextToDbCategory(category);
      await (supabase.from("notifications") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("category", dbCat);
    } catch (e) {
      console.error("Failed to clear category:", e);
    }
  }, [user?.id]);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (user?.id) {
        (supabase.from("user_preferences") as any)
          .upsert({
            user_id: user.id,
            notifications_enabled: next.enabled,
            email_notifications: next.enabled,
            push_notifications: next.enabled,
            quiet_hours_start: next.quietMode ? `${next.quietModeStart}:00` : null,
            quiet_hours_end: next.quietMode ? `${next.quietModeEnd}:00` : null,
          }, { onConflict: "user_id" })
          .then(({ error }: any) => {
            if (error) console.error("Failed to save remote preferences:", error);
          });
      }
      return next;
    });
  }, [user?.id]);

  const toggleCategory = useCallback((category: NotificationCategory) => {
    setSettings((prev) => ({
      ...prev,
      categories: { ...prev.categories, [category]: !prev.categories[category] }
    }));
  }, []);

  const filteredNotifications = useCallback((category?: NotificationCategory | "all", priority?: NotificationPriority | "all") => {
    return notifications.filter((n) => {
      if (category && category !== "all" && n.category !== category) return false;
      if (priority && priority !== "all" && n.priority !== priority) return false;
      return true;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearCategory,
    updateSettings,
    toggleCategory,
    filteredNotifications,
    refreshNotifications
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
