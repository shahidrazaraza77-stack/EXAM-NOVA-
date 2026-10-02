"use client";

import React, { useState, useEffect } from "react";
import { useNotifications, NotificationCategory } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Bell, Settings, Moon, Mail, ShieldAlert, Check, Eye, Trash2, Loader2, Sparkles, Clock, Smartphone
} from "lucide-react";
import Link from "next/link";

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings, updateSettings, toggleCategory } = useNotifications();
  const [saving, setSaving] = useState(false);

  // Local state copy for form inputs
  const [globalEnabled, setGlobalEnabled] = useState(settings.enabled);
  const [emailEnabled, setEmailEnabled] = useState(true); // default true, sync with DB
  const [pushEnabled, setPushEnabled] = useState(true);   // default true, sync with DB
  const [quietMode, setQuietMode] = useState(settings.quietMode);
  const [quietStart, setQuietStart] = useState(settings.quietModeStart);
  const [quietEnd, setQuietEnd] = useState(settings.quietModeEnd);

  // Synchronize with context settings on mount
  useEffect(() => {
    setGlobalEnabled(settings.enabled);
    setQuietMode(settings.quietMode);
    setQuietStart(settings.quietModeStart);
    setQuietEnd(settings.quietModeEnd);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        enabled: globalEnabled,
        quietMode: quietMode,
        quietModeStart: quietStart,
        quietModeEnd: quietEnd
      });
      toast.success("Preferences updated successfully in Supabase!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20 text-zinc-900 dark:text-zinc-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-zinc-500" />
            Notification Settings
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Configure quiet hours, toggle priority filters, and adjust platform email alerts.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <Link href="/dashboard/notifications" className="px-4 py-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
          Notification Center
        </Link>
        <Link href="/dashboard/notifications/recommendations" className="px-4 py-2 border-b-2 border-transparent text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
          AI Recommendations
        </Link>
        <Link href="/dashboard/notifications/settings" className="px-4 py-2 border-b-2 border-indigo-500 text-sm font-bold text-indigo-600 dark:text-indigo-400">
          Notification Settings
        </Link>
      </div>

      {/* Settings Panel */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Core Switches (Left Column 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Switches Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-900 pb-3">
              Delivery Channels
            </h3>
            
            {/* Global Switch */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Global Notifications</label>
                <p className="text-3xs text-zinc-400">Master switch to enable or disable all in-app, push, and email alerts.</p>
              </div>
              <input
                type="checkbox"
                checked={globalEnabled}
                onChange={(e) => setGlobalEnabled(e.target.checked)}
                className="w-9 h-5 rounded-full bg-zinc-200 checked:bg-indigo-500 dark:bg-zinc-800 cursor-pointer appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
              />
            </div>

            {/* Email Switch */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Email Notifications</label>
                </div>
                <p className="text-3xs text-zinc-400">Receive placement newsletters, test score analytics, and weekly roadmaps.</p>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                disabled={!globalEnabled}
                className="w-9 h-5 rounded-full bg-zinc-200 checked:bg-indigo-500 dark:bg-zinc-800 disabled:opacity-40 cursor-pointer appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
              />
            </div>

            {/* Push Switch */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Push Notifications</label>
                </div>
                <p className="text-3xs text-zinc-400">Receive real-time streak loss warnings, level unlocks, and coach suggestions.</p>
              </div>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                disabled={!globalEnabled}
                className="w-9 h-5 rounded-full bg-zinc-200 checked:bg-indigo-500 dark:bg-zinc-800 disabled:opacity-40 cursor-pointer appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
              />
            </div>
          </div>

          {/* Category Switches Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-900 pb-3">
                Category Preferences
              </h3>
              <p className="text-3xs text-zinc-400 mt-1">Select which notification categories you want to be alert of.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.categories).map(([cat, enabled]) => (
                <div
                  key={cat}
                  onClick={() => toggleCategory(cat as NotificationCategory)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    enabled
                      ? "bg-indigo-500/5 border-indigo-500/20 text-zinc-850 dark:text-zinc-200"
                      : "bg-zinc-50/50 hover:bg-zinc-150/40 border-zinc-150 dark:bg-zinc-900/10 dark:border-zinc-900 text-zinc-450 dark:text-zinc-550"
                  }`}
                >
                  <span className="text-xs font-bold capitalize">{cat.replace(/_/g, " ")}</span>
                  <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 ${
                    enabled ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  }`}>
                    {enabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quiet Hours & Save Actions (Right Column 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quiet Hours Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-xs space-y-5">
            <h3 className="text-sm font-bold border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-violet-500" />
              Quiet Hours
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Mute Notifications</label>
                <p className="text-3xs text-zinc-400">Do not send real-time sound/alerts during hours.</p>
              </div>
              <input
                type="checkbox"
                checked={quietMode}
                onChange={(e) => setQuietMode(e.target.checked)}
                className="w-9 h-5 rounded-full bg-zinc-200 checked:bg-indigo-500 dark:bg-zinc-800 cursor-pointer appearance-none relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
              />
            </div>

            {quietMode && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start Time</label>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">End Time</label>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    Notifications generated during quiet hours are saved to database but will not pop up as live toasts.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/15 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving preferences...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
