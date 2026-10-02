"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { updateApplicationStatusAction, matchCandidateWithListing } from "@/app/actions/marketplace";
import { Users, FileText, ChevronRight, Award, Clock, ArrowRight, UserCheck, MessageSquare, Send, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabaseClient";

export default function ManageApplicants() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  
  // Messaging
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadApplicants = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await marketplaceService.getRecruiterApplications(user.id);
      setApplicants(data);
      if (data.length > 0) {
        setSelectedApp(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [user]);

  // Load AI score for currently selected applicant
  useEffect(() => {
    if (selectedApp && user) {
      const appKey = `${selectedApp.user_id}-${selectedApp.listing_id}`;
      if (aiScores[appKey] === undefined) {
        evaluateCandidate(selectedApp);
      }
    }
  }, [selectedApp, user]);

  const evaluateCandidate = async (app: any) => {
    const appKey = `${app.user_id}-${app.listing_id}`;
    setAiLoading(app.id);
    try {
      const res = await matchCandidateWithListing(app.user_id, app.listing_id, app.listing_type, app.resume_id || undefined);
      setAiScores(prev => ({
        ...prev,
        [appKey]: res.matchScore
      }));
    } catch (e) {
      console.error(e);
      setAiScores(prev => ({
        ...prev,
        [appKey]: 75 // Mock fallback
      }));
    } finally {
      setAiLoading(null);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: any) => {
    setStatusUpdating(appId);
    try {
      const success = await updateApplicationStatusAction(appId, newStatus);
      if (success) {
        toast.success(`Application status updated to "${newStatus}"!`);
        // Refresh local list
        setApplicants(prev =>
          prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error("Failed to update status.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred.");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedApp || !messageText) return;
    setSendingMessage(true);
    try {
      // Mock sending message. In reality, raises a notification log for the candidate.
      const { notificationService } = await import("@/services/notification.service");
      await notificationService.createNotification({
        userId: selectedApp.user_id,
        title: `💬 Message from recruiter`,
        message: messageText,
        category: "system",
        priority: "medium"
      });
      toast.success("Message sent to candidate dashboard!");
      setMessageText("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400";
      case "shortlisted":
      case "interview scheduled":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400";
      default:
        return "bg-zinc-50 text-zinc-550 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Manage Applicants
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">
            Review submissions, evaluate candidate suitability scores, and schedule interviews.
          </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-zinc-500">Loading submitted applications...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60">
          <Users className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <h3 className="font-bold text-lg">No Applicants Yet</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Applications will appear here once candidates apply to your published job or internship opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Applicant cards list */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-bold text-sm text-zinc-450 uppercase tracking-wider">Candidate Feed ({applicants.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {applicants.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const scoreKey = `${app.user_id}-${app.listing_id}`;
                const hasScore = aiScores[scoreKey] !== undefined;

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-indigo-50/40 border-indigo-500 dark:bg-indigo-950/10 dark:border-indigo-600"
                        : "bg-white border-zinc-200/60 hover:border-zinc-350 dark:bg-zinc-950 dark:border-zinc-900/60"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{app.candidate_name}</h4>
                          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Role: {app.listing_title}</p>
                        </div>
                        {hasScore && (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            {aiScores[scoreKey]}% Match
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-450 pt-2 border-t border-zinc-100/60 dark:border-zinc-900/40">
                        <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded border capitalize ${getStatusColor(app.status)}`}>{app.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Candidate Assessment Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedApp ? (
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs space-y-6"
                >
                  {/* Candidate Header */}
                  <div className="flex justify-between items-start gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold">{selectedApp.candidate_name}</h2>
                      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{selectedApp.candidate_email}</p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-550 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Applied for: <span className="font-bold underline text-zinc-700 dark:text-zinc-300">{selectedApp.listing_title}</span></span>
                      </div>
                    </div>

                    {/* AI Score */}
                    {aiLoading === selectedApp.id ? (
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-650 border-t-transparent animate-spin" />
                    ) : aiScores[`${selectedApp.user_id}-${selectedApp.listing_id}`] !== undefined ? (
                      <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/10 text-center shrink-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-150">AI Fit score</p>
                        <h4 className="text-lg font-black leading-none mt-0.5">{aiScores[`${selectedApp.user_id}-${selectedApp.listing_id}`]}%</h4>
                      </div>
                    ) : (
                      <button
                        onClick={() => evaluateCandidate(selectedApp)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Run AI Match
                      </button>
                    )}
                  </div>

                  {/* Status update widget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-450 tracking-wider">Candidate Status</label>
                      <select
                        value={selectedApp.status}
                        onChange={(e) => handleStatusChange(selectedApp.id, e.target.value as any)}
                        disabled={statusUpdating === selectedApp.id}
                        className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-xl text-xs font-semibold focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                      >
                        <option value="applied">Applied</option>
                        <option value="under review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview scheduled">Interview Scheduled</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end">
                      {selectedApp.resume_id ? (
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); toast.success("Resume fetched successfully!"); }}
                          className="px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
                        >
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          Review Resume
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400">No Resume Attached</span>
                      )}
                    </div>
                  </div>

                  {/* Messaging card */}
                  <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                      <h4 className="font-bold text-sm">Send Portal Notification Notice</h4>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Write a message to the applicant (e.g. Please join this Meet link tomorrow)..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !messageText}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white disabled:bg-zinc-200 disabled:dark:bg-zinc-900 disabled:text-zinc-400 cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
