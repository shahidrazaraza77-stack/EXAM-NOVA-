"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { matchCandidateWithListing } from "@/app/actions/marketplace";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/context/ToastContext";
import {
  MapPin, Briefcase, Calendar, Star, DollarSign, Award, Clock, ArrowLeft, CheckCircle2,
  FileText, Check, AlertCircle, Sparkles, ChevronRight, UserCheck
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OpportunityDetails() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const listingType = (searchParams.get("type") || "job") as "job" | "internship";
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch listing data & resumes
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        let details = null;
        if (listingType === "job") {
          details = await marketplaceService.getJobListingById(id);
        } else {
          details = await marketplaceService.getInternshipListingById(id);
        }
        setListing(details);

        if (user) {
          // Fetch student resumes
          const { data: resList, error: resError } = await (supabase.from("resumes") as any)
            .select("id, file_name")
            .eq("user_id", user.id);
          
          if (!resError && resList) {
            setResumes(resList);
            if (resList.length > 0) {
              setSelectedResume(resList[0].id);
            }
          }

          // Check application status
          const app = await marketplaceService.getApplicationStatus(user.id, id);
          if (app) {
            setHasApplied(true);
            setApplicationStatus(app.status);
          }
        }
      } catch (err) {
        console.error("Failed to load listing info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, listingType, user]);

  // Compute AI Match Score
  const handleAIMatch = async () => {
    if (!user || !id) return;
    setMatchLoading(true);
    try {
      const res = await matchCandidateWithListing(user.id, id, listingType, selectedResume || undefined);
      setAiResult(res);
      toast.success("AI Mentor analysis completed!");
    } catch (e) {
      toast.error("AI Matching failed to generate. Using fallback analysis.");
    } finally {
      setMatchLoading(false);
    }
  };

  // Run AI Match on mount if listing is fetched
  useEffect(() => {
    if (listing && user && !aiResult) {
      handleAIMatch();
    }
  }, [listing, user]);

  // Handle application submission
  const handleApply = async () => {
    if (!user || !id) return;
    setSubmitting(true);
    try {
      const app = await marketplaceService.applyToListing({
        userId: user.id,
        listingId: id,
        listingType,
        resumeId: selectedResume || null
      });

      if (app) {
        setHasApplied(true);
        setApplicationStatus("applied");
        toast.success("Application submitted successfully!");
      } else {
        toast.error("Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-zinc-500">Retrieving opportunity parameters...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Opportunity Not Found</h2>
        <p className="text-zinc-500 text-sm">This listing may have expired or been removed by the recruiter.</p>
        <Link href="/dashboard/marketplace/jobs" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const score = aiResult?.matchScore || 0;
  const isHighMatch = score >= 80;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-zinc-900 dark:text-zinc-100">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={listingType === "job" ? "/dashboard/marketplace/jobs" : "/dashboard/marketplace/internships"}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Listing details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs space-y-6">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                {listingType === "job" ? "Job Listing" : "Internship Listing"}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight mt-2">{listing.title}</h1>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{listing.company_name}</p>
            </div>

            {/* Quick specifications */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold">{listingType === "job" ? listing.package_range : listing.stipend}</span>
              </div>
              {listingType === "internship" && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>{listing.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Deadline: {new Date(listing.application_deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-base border-b border-zinc-100 dark:border-zinc-900 pb-2">Description</h3>
              <p className="text-sm leading-relaxed text-zinc-650 dark:text-zinc-400 whitespace-pre-wrap">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Skills required */}
            <div className="space-y-2">
              <h3 className="font-bold text-base border-b border-zinc-100 dark:border-zinc-900 pb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {listing.skills_required.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-350 border border-zinc-200/45 dark:border-zinc-800/45"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Match & Application widget */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Match Scorecard */}
          <AnimatePresence mode="wait">
            {matchLoading ? (
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-md flex flex-col items-center justify-center py-12 space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs font-semibold text-zinc-500">AI Placement Mentor is analyzing your compatibility...</p>
              </div>
            ) : aiResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-md space-y-6 overflow-hidden relative"
              >
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-555/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-none">AI Mentor Scorecard</h3>
                    <p className="text-[10px] text-zinc-450 mt-1">Generated by Google Gemini Flash Analysis</p>
                  </div>
                </div>

                {/* Score circle */}
                <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-zinc-100 dark:stroke-zinc-850 fill-none" strokeWidth="6" />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="stroke-indigo-600 dark:stroke-indigo-500 fill-none transition-all duration-1000"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)}
                      />
                    </svg>
                    <span className="absolute text-lg font-black">{score}%</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {score >= 85 ? "Excellent Match!" : score >= 70 ? "Good Match" : "Fair Match"}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {score >= 85
                        ? "Your profile heavily satisfies this listing's criteria! Apply right away."
                        : "You have a solid alignment. Check the suggestions below to strengthen your application."}
                    </p>
                  </div>
                </div>

                {/* Strengths & Missing skills */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Top Match Strengths</p>
                    <ul className="space-y-1">
                      {aiResult.strengths?.map((str: string) => (
                        <li key={str} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-350">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {aiResult.missingSkills?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Missing Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.missingSkills.map((sk: string) => (
                          <span key={sk} className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200/40 dark:border-amber-900/40">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions & Advice */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Mentorship Feedback</p>
                    <p className="text-xs italic text-zinc-650 dark:text-zinc-400 leading-relaxed">
                      "{aiResult.careerAdvice}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Submission Card */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-md space-y-4">
            <h3 className="font-bold text-base">Application Gateway</h3>
            
            {hasApplied ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Already Applied</span>
                </div>
                <p className="text-xs leading-relaxed">
                  You submitted your application for this listing. Recruiter status is currently: 
                  <span className="font-bold uppercase ml-1 underline">{applicationStatus}</span>.
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/marketplace/applications"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-650 dark:text-emerald-400 hover:underline"
                  >
                    Track in Dashboard <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resume Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500">Select Resume</label>
                  {resumes.length === 0 ? (
                    <div className="p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs space-y-2 bg-zinc-50 dark:bg-zinc-900/20">
                      <FileText className="w-8 h-8 mx-auto text-zinc-400" />
                      <p className="text-zinc-500">No resumes generated yet.</p>
                      <Link
                        href="/dashboard/resume-builder"
                        className="inline-flex text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline"
                      >
                        Go to Resume Builder
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          📄 {r.file_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={handleApply}
                  disabled={submitting || resumes.length === 0}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 disabled:dark:bg-zinc-900 disabled:text-zinc-400 transition-all cursor-pointer shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 shrink-0" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
