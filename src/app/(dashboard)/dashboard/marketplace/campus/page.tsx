"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { Search, Calendar, Award, Building2, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function CampusHiring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drives, setDrives] = useState<any[]>([]);
  const [registeredDriveIds, setRegisteredDriveIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load drives
  const loadDrives = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getCampusDrives();
      setDrives(data);

      if (user) {
        const regs = await marketplaceService.getUserCampusDrives(user.id);
        setRegisteredDriveIds(regs.map((d: any) => d.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrives();
  }, [user]);

  const handleRegister = async (driveId: string) => {
    if (!user) return;
    try {
      const success = await marketplaceService.registerForCampusDrive(user.id, driveId);
      if (success) {
        setRegisteredDriveIds(prev => [...prev, driveId]);
        toast.success("Successfully registered for campus drive!");
      } else {
        toast.error("Registration failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during registration.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Campus Hiring Drives
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">
            Register directly for upcoming placement events organized on campus.
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
          <p className="text-sm font-semibold text-zinc-500">Loading campus drives...</p>
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60">
          <Building2 className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <h3 className="font-bold text-lg">No Active Campus Drives</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Recruiters have not listed any campus recruitment campaigns yet. Updates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((drive) => {
            const isRegistered = registeredDriveIds.includes(drive.id);

            return (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400">
                      🏢 Campus Drive
                    </span>
                    <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white mt-2">
                      {drive.company_name}
                    </h3>
                    <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-450 mt-0.5">
                      Roles: {drive.roles}
                    </p>
                  </div>

                  {/* Drive Info */}
                  <div className="grid grid-cols-1 gap-2.5 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="font-semibold">{drive.college_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>Drive Date: {new Date(drive.drive_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>Eligibility: {drive.eligibility}</span>
                    </div>
                  </div>
                </div>

                {/* Registration button */}
                <div className="pt-6">
                  {isRegistered ? (
                    <div className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/40">
                      <CheckCircle2 className="w-4 h-4" />
                      Registered
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(drive.id)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      Register Now
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
