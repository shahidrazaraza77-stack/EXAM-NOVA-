"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import { Plus, Briefcase, MapPin, DollarSign, Calendar, Clock, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function ManageListings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"job" | "internship">("job");
  const [employmentType, setEmploymentType] = useState<"full-time" | "part-time" | "contract" | "remote">("full-time");
  const [packageRange, setPackageRange] = useState("");
  const [stipend, setStipend] = useState("");
  const [duration, setDuration] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const stats = await marketplaceService.getRecruiterStats(user.id);
      setListings(stats.listings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title || !description || !location || !deadline) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const skillsRequired = skillsStr
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let success = null;

      if (type === "job") {
        success = await marketplaceService.createJobListing(user.id, {
          title,
          description,
          location,
          employment_type: employmentType,
          package_range: packageRange || "unspecified",
          skills_required: skillsRequired,
          application_deadline: deadline,
          company_name: "" // Set automatically in service
        });
      } else {
        success = await marketplaceService.createInternshipListing(user.id, {
          title,
          description,
          location,
          stipend: stipend || "Unpaid",
          duration: duration || "3 months",
          skills_required: skillsRequired,
          application_deadline: deadline,
          company_name: "" // Set automatically in service
        });
      }

      if (success) {
        toast.success(`${type === "job" ? "Job" : "Internship"} opportunity posted successfully!`);
        setShowForm(false);
        // Clear fields
        setTitle("");
        setDescription("");
        setLocation("");
        setPackageRange("");
        setStipend("");
        setDuration("");
        setSkillsStr("");
        setDeadline("");
        loadListings();
      } else {
        toast.error("Failed to post opportunity. Verify that you have updated your Recruiter Profile config first.");
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
            Manage Listings
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">
            Publish and archive placement job postings and internships.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          {showForm ? "Cancel Posting" : "Publish Opportunity"}
          {!showForm && <Plus className="w-4 h-4 shrink-0" />}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Modal/Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-12 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-md space-y-6"
            >
              <h3 className="font-extrabold text-lg">Post New Opportunity</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Listing Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
                  >
                    <option value="job">💼 Full-time Job Opportunity</option>
                    <option value="internship">🎓 Internship Opportunity</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Opportunity Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Development Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500">Description & Requirements</label>
                  <textarea
                    rows={4}
                    placeholder="Enter role responsibilities, eligibility criteria, and details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Karnataka (or Remote)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                    required
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
                    required
                  />
                </div>

                {/* Job Specific fields */}
                {type === "job" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Employment Type</label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="remote">Remote Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Salary Package Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 12 - 15 LPA"
                        value={packageRange}
                        onChange={(e) => setPackageRange(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                      />
                    </div>
                  </>
                )}

                {/* Internship Specific fields */}
                {type === "internship" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Stipend Amount</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹25,000 / month (or Unpaid)"
                        value={stipend}
                        onChange={(e) => setStipend(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 6 Months"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                      />
                    </div>
                  </>
                )}

                {/* Skills String */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500">Skills Required (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, SQL, TypeScript"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50/50 rounded-xl text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50"
                  />
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10 disabled:bg-zinc-200 dark:disabled:bg-zinc-900 disabled:text-zinc-455"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    Publish Opportunity
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listings display */}
        <div className="lg:col-span-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-zinc-500">Loading active opportunities...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60">
              <Briefcase className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
              <h3 className="font-bold text-lg">No Active Postings</h3>
              <p className="text-sm text-zinc-550 mt-1 max-w-sm mx-auto">
                You haven't posted any jobs or internships yet. Click the "Publish Opportunity" button to post your first listing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-900/60 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                        {job.type === "job" ? job.employment_type : "Internship"}
                      </span>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white mt-2">
                        {job.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">{job.company_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-450 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{job.type === "job" ? job.package_range : job.stipend}</span>
                      </div>
                      {job.type === "internship" && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{job.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
