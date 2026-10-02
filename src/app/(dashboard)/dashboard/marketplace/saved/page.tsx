"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { Search, MapPin, Calendar, Star, DollarSign, ChevronRight, Clock, Trash2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function SavedJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved jobs
  const loadSavedJobs = async () => {
    if (!user) return;
    setLoading(true);
    const data = await marketplaceService.getUserSavedJobs(user.id);
    setSavedJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSavedJobs();
  }, [user]);

  const handleRemove = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    const success = await marketplaceService.unsaveJob(user.id, listingId);
    if (success) {
      setSavedJobs(prev => prev.filter(s => s.listing_id !== listingId));
      toast.success("Bookmark removed.");
    } else {
      toast.error("Failed to remove bookmark.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Saved Opportunities
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Review your bookmarked jobs and internships and apply when ready.
          </p>
        </div>
        <Link
          href="/dashboard/marketplace/jobs"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors"
        >
          Back to Marketplace
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-zinc-500">Loading saved listings...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60">
          <Star className="w-12 h-12 mx-auto text-zinc-400 mb-3 fill-none" />
          <h3 className="font-bold text-lg">No Bookmarks Saved</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Bookmark opportunities by tapping the star indicator while exploring the marketplace catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((item) => {
            const job = item.details || {};

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                        {item.listing_type === "job" ? "Job" : "Internship"}
                      </span>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-455">
                        {job.company_name}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleRemove(item.listing_id, e)}
                      className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-500 dark:bg-zinc-900 dark:border-zinc-800 transition-colors cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500 dark:text-zinc-455 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span>{item.listing_type === "job" ? job.package_range : job.stipend}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-6">
                  <Link
                    href={`/dashboard/marketplace/listings/${job.id}?type=${item.listing_type}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-white hover:bg-zinc-800 hover:shadow-md transition-all group-hover:bg-indigo-650 dark:group-hover:bg-indigo-600"
                  >
                    View Details & Apply
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
