"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { Calendar, Plus, Building2, Users, FileText, CheckCircle2, ChevronRight, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function ManageDrives() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [collegeName, setCollegeName] = useState("");
  const [driveDate, setDriveDate] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [roles, setRoles] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Registrations selection
  const [selectedDrive, setSelectedDrive] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const loadDrives = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await marketplaceService.getRecruiterCampusDrives(user.id);
      setDrives(list);
      if (list.length > 0) {
        setSelectedDrive(list[0]);
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

  // Load drive registrations when drive is selected
  useEffect(() => {
    async function loadRegistrations() {
      if (!selectedDrive) return;
      setRegsLoading(true);
      try {
        const list = await marketplaceService.getRecruiterDriveRegistrations(selectedDrive.id);
        setRegistrations(list);
      } catch (e) {
        console.error(e);
      } finally {
        setRegsLoading(false);
      }
    }
    loadRegistrations();
  }, [selectedDrive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!collegeName || !driveDate || !eligibility || !roles) {
      toast.error("Please fill in all drive fields.");
      return;
    }

    setSubmitting(true);
    try {
      const drive = await marketplaceService.createCampusDrive(user.id, {
        college_name: collegeName,
        drive_date: driveDate,
        eligibility,
        roles,
        company_name: "" // set inside service
      });

      if (drive) {
        toast.success("Campus hiring drive posted successfully!");
        setShowForm(false);
        setCollegeName("");
        setDriveDate("");
        setEligibility("");
        setRoles("");
        loadDrives();
      } else {
        toast.error("Failed to create drive.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-900/60 pb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Campus Hiring Drives
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">
            Organize recruitment cycles and download student registrations for drives.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          {showForm ? "Cancel Drive" : "Launch Drive Campaign"}
          {!showForm && <Plus className="w-4 h-4 shrink-0" />}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Drive Post Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-12 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-md space-y-4"
            >
              <h3 className="font-extrabold text-lg">Launch Drive Campaign</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Target College / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Indian Institute of Technology, Madras"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Drive Date</label>
                  <input
                    type="date"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-350"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Eligibility Criteria</label>
                  <input
                    type="text"
                    placeholder="e.g. CGPA >= 7.5, B.Tech/M.Tech CS/EE only"
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Roles Offered</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer, QA Engineer"
                    value={roles}
                    onChange={(e) => setRoles(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    required
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10 disabled:bg-zinc-200 dark:disabled:bg-zinc-900 disabled:text-zinc-400"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    Post Drive Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* drives list & drive registration overview */}
        {loading ? (
          <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-zinc-500">Loading drive campaigns...</p>
          </div>
        ) : drives.length === 0 ? (
          <div className="lg:col-span-12 text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60">
            <Calendar className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
            <h3 className="font-bold text-lg">No Active Drives</h3>
            <p className="text-sm text-zinc-550 mt-1 max-w-sm mx-auto">
              You haven't launched any campus drives yet. Click the "Launch Drive Campaign" button to coordinate your first campus drive.
            </p>
          </div>
        ) : (
          <>
            {/* Left drives List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-sm text-zinc-450 uppercase tracking-wider">Drive Campaigns ({drives.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {drives.map((drive) => {
                  const isSelected = selectedDrive?.id === drive.id;

                  return (
                    <div
                      key={drive.id}
                      onClick={() => setSelectedDrive(drive)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-50/40 border-indigo-500 dark:bg-indigo-950/10 dark:border-indigo-600"
                          : "bg-white border-zinc-200/60 hover:border-zinc-350 dark:bg-zinc-950 dark:border-zinc-900/60"
                      }`}
                    >
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{drive.college_name}</h4>
                          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Roles: {drive.roles}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-zinc-450 pt-2 border-t border-zinc-100/60 dark:border-zinc-900/40">
                          <span>Drive Date: {new Date(drive.drive_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right registrations List */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {selectedDrive ? (
                  <motion.div
                    key={selectedDrive.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs space-y-6"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold">{selectedDrive.college_name}</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-0.5">Date: {new Date(selectedDrive.drive_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Eligibility details */}
                    <div className="flex items-start gap-2.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40 text-xs">
                      <Award className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-650 dark:text-zinc-350">Eligibility criteria requirements:</p>
                        <p className="text-zinc-500 mt-0.5">{selectedDrive.eligibility}</p>
                      </div>
                    </div>

                    {/* Registrants */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                        <Users className="w-4.5 h-4.5 text-indigo-500" />
                        <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Registered Students ({registrations.length})</h3>
                      </div>

                      {regsLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="w-6 h-6 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : registrations.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic py-4">No student registrations recorded for this drive campaign yet.</p>
                      ) : (
                        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                          {registrations.map((reg) => (
                            <div
                              key={reg.id}
                              className="p-3 rounded-xl border border-zinc-150 bg-zinc-50/20 dark:border-zinc-900 dark:bg-zinc-950 flex items-center justify-between gap-4 text-xs"
                            >
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-white">{reg.student_name}</h4>
                                <p className="text-[10px] text-zinc-450 mt-0.5">{reg.student_email}</p>
                              </div>
                              <span className="text-[10px] text-zinc-400">Registered on {new Date(reg.created_at || "").toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
