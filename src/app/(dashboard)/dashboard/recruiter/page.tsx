"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { Users, FileText, CheckCircle2, Award, Building2, Save, BadgeCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function RecruiterOverview() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState<{
    totalApplicants: number;
    shortlisted: number;
    selected: number;
    conversionRate: number;
    listings: any[];
  }>({
    totalApplicants: 0,
    shortlisted: 0,
    selected: 0,
    conversionRate: 0,
    listings: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRecruiterData() {
      if (!user) return;
      setLoading(true);
      try {
        const recruiter = await marketplaceService.getRecruiterByUserId(user.id);
        if (recruiter) {
          setCompanyName(recruiter.company_name);
          setDesignation(recruiter.designation);
          setIsVerified(recruiter.verified);
        }

        const metrics = await marketplaceService.getRecruiterStats(user.id);
        setStats(metrics);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRecruiterData();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!companyName || !designation) {
      toast.error("Please fill in all profile fields.");
      return;
    }

    setSaving(true);
    try {
      const data = await marketplaceService.updateRecruiter(user.id, companyName, designation);
      if (data) {
        toast.success("Recruiter profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-zinc-500">Retrieving recruiter profiles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Recruiter Command Center
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">
            Welcome back, {user?.name || "Recruiter"}. Manage job applications and track conversion metrics here.
          </p>
        </div>
        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            Verified Employer
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Verification Pending
          </span>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applicants */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Applicants</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.totalApplicants}</h3>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Shortlisted</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.shortlisted}</h3>
          </div>
        </div>

        {/* Selected */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Hires Selected</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.selected}</h3>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Hire Conversion</p>
            <h3 className="text-2xl font-black mt-0.5">{stats.conversionRate}%</h3>
          </div>
        </div>
      </div>

      {/* Profile Update Form */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-lg">Company Profile</h3>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Google India"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500">Designation / Role Title</label>
            <input
              type="text"
              placeholder="e.g. Lead Talent Acquisition"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10 disabled:bg-zinc-200 dark:disabled:bg-zinc-900 disabled:text-zinc-400"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 shrink-0" />
            )}
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
}
