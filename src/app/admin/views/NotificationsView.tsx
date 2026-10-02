"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  Bell, Plus, Edit3, Trash2, Loader2, AlertCircle, X, Check,
  Sparkles, Send, Clock, CheckCircle2, Users, Megaphone,
  BookOpen, Trophy, Wrench, RefreshCw, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NotifType = "platform" | "maintenance" | "study_reminder" | "achievement" | "system";
type NotifTab = "create" | "all" | "ai";

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority?: string;
  is_read?: boolean;
  created_at: string;
  user_id?: string;
}

const NOTIF_TYPES: { id: NotifType; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { id: "platform", label: "Platform Announcement", icon: Megaphone, color: "text-violet-500" },
  { id: "maintenance", label: "Maintenance Notice", icon: Wrench, color: "text-amber-500" },
  { id: "study_reminder", label: "Study Reminder", icon: BookOpen, color: "text-blue-500" },
  { id: "achievement", label: "Achievement Alert", icon: Trophy, color: "text-green-500" },
  { id: "system", label: "System Message", icon: Bell, color: "text-zinc-500" },
];

const AI_TRIGGERS = [
  { value: "achievement", label: "User Achievement" },
  { value: "reminder", label: "Study Reminder" },
  { value: "motivation", label: "Motivation Boost" },
  { value: "system", label: "System Update" },
];

export default function NotificationsView() {
  const [activeTab, setActiveTab] = useState<NotifTab>("create");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<NotifType>("platform");
  const [formTargetUser, setFormTargetUser] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // AI Generator
  const [aiTrigger, setAiTrigger] = useState("achievement");
  const [aiDetails, setAiDetails] = useState("");
  const [aiUserId, setAiUserId] = useState("all");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Preview modal
  const [previewNotif, setPreviewNotif] = useState<Notification | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await (supabase.from("notifications") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (dbErr) throw dbErr;
      setNotifications(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (activeTab === "all") loadNotifications(); }, [activeTab]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formMessage) return;
    setIsSending(true);
    setSendSuccess(null);
    setError(null);
    try {
      const payload = {
        title: formTitle,
        message: formMessage,
        category: formType,
        priority: "normal",
        user_id: formTargetUser || null,
        is_read: false,
      };
      const { error: dbErr } = await (supabase.from("notifications") as any).insert(payload);
      if (dbErr) throw dbErr;

      // Log admin action
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch("/api/admin/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: `Sent notification: ${formTitle}`, entity_type: "notification", metadata: { type: formType, target: formTargetUser || "all" } })
        });
      }

      setSendSuccess(`✅ Notification "${formTitle}" sent successfully!`);
      setFormTitle(""); setFormMessage(""); setFormTargetUser("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    await (supabase.from("notifications") as any).delete().eq("id", id);
    await loadNotifications();
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDetails) return;
    setIsAIGenerating(true);
    setAiResult(null);
    setAiError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ module: "notification", userId: aiUserId, triggerType: aiTrigger, details: aiDetails })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "AI generation failed");
      setAiResult(result.data);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleApproveAI = async () => {
    if (!aiResult) return;
    setIsSending(true);
    try {
      await (supabase.from("notifications") as any).insert({
        title: aiResult.title || "AI Notification",
        message: aiResult.message || aiResult.body || JSON.stringify(aiResult),
        category: "system",
        priority: aiResult.priority || "normal",
        user_id: aiUserId !== "all" ? aiUserId : null,
        is_read: false,
      });
      setSendSuccess("✅ AI-generated notification sent!");
      setAiResult(null);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const typeColor: Record<string, string> = {
    platform: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200/50",
    maintenance: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50",
    study_reminder: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50",
    achievement: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50",
    gamification: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50",
    system: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">Notification Center</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Create, manage, and AI-generate platform notifications for users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        {[
          { id: "create", label: "Create Notification" },
          { id: "all", label: "All Notifications" },
          { id: "ai", label: "AI Generate" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-bold tracking-tight transition-all relative cursor-pointer ${activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}>
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
        ))}
      </div>

      {/* Success / Error banners */}
      <AnimatePresence>
        {sendSuccess && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />{sendSuccess}
            <button onClick={() => setSendSuccess(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Type Selector */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Notification Type</p>
            {NOTIF_TYPES.map(nt => {
              const Icon = nt.icon;
              const isSelected = formType === nt.id;
              return (
                <button key={nt.id} onClick={() => setFormType(nt.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? "border-blue-400 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"}`}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                    <Icon className={`h-4.5 w-4.5 ${isSelected ? "text-white" : nt.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}>{nt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Compose Notification</h3>
              </div>
              <form onSubmit={handleSendNotification}>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title *</label>
                    <input required value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Notification title..."
                      className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message *</label>
                    <textarea required rows={4} value={formMessage} onChange={e => setFormMessage(e.target.value)}
                      placeholder="Write the notification message here..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 transition-all resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Target User ID
                    </label>
                    <input value={formTargetUser} onChange={e => setFormTargetUser(e.target.value)}
                      placeholder="Leave empty to broadcast to all users"
                      className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-mono text-xs" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
                  <Button type="submit" variant="primary" className="w-full h-11 gap-2 text-sm font-bold" disabled={isSending}>
                    {isSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send Notification</>}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* ALL NOTIFICATIONS TAB */}
      {activeTab === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{notifications.length} notifications found</p>
            <Button onClick={loadNotifications} variant="secondary" size="sm" className="h-9 gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
            </div>
          )}

          {!isLoading && (
            <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Notification</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Sent</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                    {notifications.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-zinc-400">No notifications yet.</td></tr>
                    ) : notifications.map(notif => (
                      <tr key={notif.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4 max-w-sm">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{notif.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{notif.message}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${typeColor[notif.category] || typeColor.system}`}>
                            {notif.category?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                          {notif.user_id ? notif.user_id.slice(0, 12) + "..." : <span className="font-sans font-semibold text-zinc-400">All users</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500">
                          {new Date(notif.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setPreviewNotif(notif)} className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(notif.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI GENERATE TAB */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">AI Notification Generator</h3>
              </div>
              <form onSubmit={handleAIGenerate}>
                <div className="p-6 space-y-4">
                  <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-700 dark:text-violet-400">
                    Gemini will draft a personalized notification based on the trigger and context you provide. Review before sending.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Trigger Type *</label>
                    <select value={aiTrigger} onChange={e => setAiTrigger(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-semibold">
                      {AI_TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Context / Details *</label>
                    <textarea required rows={3} value={aiDetails} onChange={e => setAiDetails(e.target.value)}
                      placeholder="e.g. Student solved 100 coding problems, reached Level 5, completed Amazon mock test with 92%..."
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">User ID (or 'all')</label>
                    <input value={aiUserId} onChange={e => setAiUserId(e.target.value)} placeholder="all"
                      className="w-full h-10 px-3.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:border-violet-500 font-mono text-xs" />
                  </div>
                  {aiError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />{aiError}
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
                  <Button type="submit" variant="primary" className="w-full h-11 gap-2 " disabled={isAIGenerating}>
                    {isAIGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate with Gemini</>}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* AI Result Preview */}
          <div>
            {aiResult ? (
              <Card className="border border-emerald-200 dark:border-emerald-900/30 bg-white dark:bg-zinc-900/30 shadow-sm overflow-hidden h-full">
                <div className="px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/50 dark:bg-emerald-950/10 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">AI Generated Draft</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Title</p>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{aiResult.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Message</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{aiResult.message || aiResult.body || JSON.stringify(aiResult)}</p>
                  </div>
                  {aiResult.priority && (
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Priority</p>
                      <span className="px-2.5 py-0.5 text-xs font-bold capitalize rounded-full border bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50">
                        {aiResult.priority}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button onClick={handleApproveAI} variant="primary" className="flex-1 h-10 gap-1.5 text-xs " disabled={isSending}>
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Approve & Send
                    </Button>
                    <Button onClick={() => setAiResult(null)} variant="secondary" className="h-10 px-4 text-xs">Discard</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Sparkles className="h-12 w-12 text-violet-300 dark:text-violet-700 mb-4" />
                <p className="font-semibold text-sm">AI-generated notification will appear here</p>
                <p className="text-xs mt-1">Review and approve before sending to users</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewNotif(null)} className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" /> Notification Preview
                </h3>
                <button onClick={() => setPreviewNotif(null)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${typeColor[previewNotif.category] || typeColor.system}`}>
                  {previewNotif.category?.replace("_", " ")}
                </span>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{previewNotif.title}</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{previewNotif.message}</p>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(previewNotif.created_at).toLocaleString("en-IN")}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setPreviewNotif(null)} variant="secondary" className="text-xs h-9 px-4">Close</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
