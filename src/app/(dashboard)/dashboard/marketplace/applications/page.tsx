"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import {
  Briefcase, CheckCircle2, Circle, AlertCircle, XCircle, Search, Calendar,
  Clock, MapPin, DollarSign, ChevronRight, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ApplicationsTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    async function loadApps() {
      if (!user) return;
      setLoading(true);
      const data = await marketplaceService.getUserApplications(user.id);
      setApplications(data);
      if (data.length > 0) {
        setSelectedApp(data[0]);
      }
      setLoading(false);
    }
    loadApps();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900";
      case "rejected":
        return "bg-red-50 text-red-750 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900";
      case "shortlisted":
      case "interview scheduled":
        return "bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900";
      case "under review":
        return "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900";
      default:
        return "bg-zinc-50 text-zinc-650 border-zinc-250 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800";
    }
  };

  // Status flow stages mapping
  const stages = [
    { key: "applied", label: "Applied", description: "Your profile has been received by the hiring manager." },
    { key: "under review", label: "Under Review", description: "Recruiters are actively screening your credentials." },
    { key: "shortlisted", label: "Shortlisted", description: "Congratulations! You advanced to the screening list." },
    { key: "interview scheduled", label: "Interview Scheduled", description: "An interview slot has been allocated for you." },
    { key: "selected", label: "Selected", description: "Congratulations! You have received a selection offer." }
  ];

  const getStageIndex = (status: string) => {
    if (status === "rejected") return -1;
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Track your application lifecycle and interview schedules in real time.
          </p>
        </div>
        <Link
          href="/dashboard/marketplace/jobs"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors"
        >
          Discover Jobs
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-zinc-500">Retrieving submitted applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60">
          <UserCheck className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <h3 className="font-bold text-lg">No Applications Found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            You haven't submitted any applications yet. Visit the Jobs or Internships tabs to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Applications List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-bold text-sm text-zinc-450 uppercase tracking-wider">Submissions ({applications.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {applications.map((app) => {
                const details = app.details || {};
                const isSelected = selectedApp?.id === app.id;

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
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{details.title || "Unknown Role"}</h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">{details.company_name || "Company"}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-zinc-450 pt-2 border-t border-zinc-100/60 dark:border-zinc-900/40">
                        <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                        <span className="capitalize">{app.listing_type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Application Tracker Timeline */}
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
                  {/* Title Header */}
                  <div className="flex justify-between items-start gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold">{selectedApp.details?.title}</h2>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{selectedApp.details?.company_name}</p>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-450 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{selectedApp.details?.location}</span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/marketplace/listings/${selectedApp.listing_id}?type=${selectedApp.listing_type}`}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1"
                    >
                      View Job <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Rejected Alert Box */}
                  {selectedApp.status === "rejected" && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                      <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Application Update</h4>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          We regret to inform you that the recruiters have decided not to move forward with your application for this opportunity. Keep practicing and applying!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Selected Alert Box */}
                  {selectedApp.status === "selected" && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Offer Received!</h4>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          Congratulations! You have successfully cleared all assessment parameters and received a placement offer. Recruiters will email onboarding instructions to you shortly.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-zinc-450 uppercase tracking-wider">Application Timeline</h3>
                    <div className="relative pl-6 space-y-6 border-l-2 border-zinc-100 dark:border-zinc-850 ml-3">
                      {stages.map((stage, index) => {
                        const currentActiveIndex = getStageIndex(selectedApp.status);
                        const isCompleted = currentActiveIndex >= index;
                        const isCurrent = currentActiveIndex === index;

                        return (
                          <div key={stage.key} className="relative group">
                            {/* Bullet indicator */}
                            <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-white dark:bg-zinc-950 border-2 transition-all flex items-center justify-center z-10">
                              {isCompleted ? (
                                <CheckCircle2 className={`w-full h-full fill-white dark:fill-zinc-950 ${isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-500"}`} />
                              ) : (
                                <Circle className="w-2.5 h-2.5 text-zinc-300 dark:text-zinc-800" />
                              )}
                            </span>

                            {/* Text Description */}
                            <div className="space-y-1">
                              <h4 className={`text-sm font-bold transition-colors ${isCompleted ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600"}`}>
                                {stage.label}
                              </h4>
                              <p className={`text-xs transition-colors ${isCompleted ? "text-zinc-550 dark:text-zinc-400" : "text-zinc-350 dark:text-zinc-700"}`}>
                                {stage.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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
