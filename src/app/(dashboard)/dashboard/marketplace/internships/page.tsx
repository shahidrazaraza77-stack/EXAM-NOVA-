"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { matchCandidateWithListing } from "@/app/actions/marketplace";
import { Search, MapPin, Calendar, Star, DollarSign, Award, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function InternshipsMarketplace() {
  const { user } = useAuth();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [stipendFilter, setStipendFilter] = useState("all");
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Fetch internships
  useEffect(() => {
    async function loadInternships() {
      setLoading(true);
      const data = await marketplaceService.getInternshipListings({
        search: searchQuery,
        location: locationFilter,
        stipend: stipendFilter
      });
      setInternships(data);
      setLoading(false);

      if (user) {
        const saved = await marketplaceService.getUserSavedJobs(user.id);
        setSavedJobs(saved.map((s: any) => s.listing_id));
      }
    }
    loadInternships();
  }, [searchQuery, locationFilter, stipendFilter, user]);

  // Fetch match scores
  useEffect(() => {
    if (internships.length > 0 && user) {
      internships.forEach(async (intern) => {
        if (!matchScores[intern.id]) {
          const res = await matchCandidateWithListing(user.id, intern.id, "internship");
          setMatchScores(prev => ({
            ...prev,
            [intern.id]: res.matchScore
          }));
        }
      });
    }
  }, [internships, user]);

  const handleSaveToggle = async (internId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    if (savedJobs.includes(internId)) {
      const success = await marketplaceService.unsaveJob(user.id, internId);
      if (success) setSavedJobs(prev => prev.filter(id => id !== internId));
    } else {
      const success = await marketplaceService.saveJob(user.id, internId, "internship");
      if (success) setSavedJobs(prev => [...prev, internId]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-teal-600 text-emerald-100";
    if (score >= 70) return "from-indigo-500 to-violet-600 text-indigo-100";
    return "from-amber-500 to-orange-600 text-amber-100";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Placement Opportunities
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Discover internships curated for your college criteria and evaluated by AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketplace/applications"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors"
          >
            My Applications
          </Link>
          <Link
            href="/dashboard/marketplace/saved"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors"
          >
            Saved Jobs
          </Link>
          <Link
            href="/dashboard/marketplace/campus"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-all"
          >
            Campus Drives
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-250 dark:border-zinc-850">
        <Link
          href="/dashboard/marketplace/jobs"
          className="px-4 py-2.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 border-b-2 border-transparent hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          💼 Jobs Marketplace
        </Link>
        <Link
          href="/dashboard/marketplace/internships"
          className="px-4 py-2.5 text-sm font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
        >
          🎓 Internships Marketplace
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, role, company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
          />
        </div>

        {/* Location Filter */}
        <div className="relative md:col-span-3">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Location filter (e.g. Pune)..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
          />
        </div>

        {/* Stipend Filter */}
        <div className="md:col-span-3">
          <select
            value={stipendFilter}
            onChange={(e) => setStipendFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
          >
            <option value="all">All Stipends</option>
            <option value="paid">Paid Internships</option>
            <option value="high">High Stipend (&gt;15k/mo)</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading internships...</p>
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-900">
          <Calendar className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">No Internships Found</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-450 mt-1 max-w-md mx-auto">
            Try adjusting your search criteria. We'll update the portal as new recruiter listings are posted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map((intern) => {
            const hasScore = matchScores[intern.id] !== undefined;
            const score = matchScores[intern.id] || 0;
            const isSaved = savedJobs.includes(intern.id);

            return (
              <motion.div
                key={intern.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400">
                        Internship
                      </span>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {intern.title}
                      </h3>
                      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-455">
                        {intern.company_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleSaveToggle(intern.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isSaved
                            ? "bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/40"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-amber-500 dark:bg-zinc-900 dark:border-zinc-800"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      {hasScore && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r shadow-xs text-xs font-black ${getScoreColor(score)}`}>
                          <Award className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                          <span>{score}% Match</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500 dark:text-zinc-450 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{intern.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span>{intern.stipend}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                      <span>Duration: {intern.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                      <span>Apply before: {new Date(intern.application_deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Skills required */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Skills required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {intern.skills_required.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800/40"
                        >
                          {skill}
                        </span>
                      ))}
                      {intern.skills_required.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-50 dark:bg-zinc-900/60 text-zinc-400">
                          +{intern.skills_required.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-6">
                  <Link
                    href={`/dashboard/marketplace/listings/${intern.id}?type=internship`}
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
