"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  X,
  Check,
  Building2,
  ListPlus,
  MinusCircle,
  PlusCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { companyService, type FrontendCompany } from "@/services/company.service";

export default function CompaniesView() {
  const [companies, setCompanies] = useState<FrontendCompany[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCompanies() {
    try {
      setLoading(true);
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Modal states
  const [modalType, setModalType] = useState<"preview" | "edit" | "add" | null>(null);
  const [selectedC, setSelectedC] = useState<FrontendCompany | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<string>("Medium");
  const [formLogoColor, setFormLogoColor] = useState("from-blue-600 to-blue-800");
  const [formLogoBg, setFormLogoBg] = useState("bg-blue-100 dark:bg-blue-950");
  const [formDescription, setFormDescription] = useState("");
  const [formHiringProcess, setFormHiringProcess] = useState<string[]>([""]);
  const [formPrepTips, setFormPrepTips] = useState<string[]>([""]);
  const [formEligibility, setFormEligibility] = useState("");
  const [formRequiredSkills, setFormRequiredSkills] = useState<string[]>([""]);
  const [formRecommendations, setFormRecommendations] = useState<Array<{ title: string; description: string; priority: "High" | "Medium" | "Low" }>>([
    { title: "", description: "", priority: "Medium" }
  ]);
  const [formStatus, setFormStatus] = useState<"Active" | "Draft">("Active");

  // Filter list
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = difficultyFilter === "All" || c.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const openAddModal = () => {
    setFormName("");
    setFormType("Technology");
    setFormDifficulty("Medium");
    setFormLogoColor("from-violet-600 to-indigo-600");
    setFormLogoBg("bg-violet-100 dark:bg-violet-950/40");
    setFormDescription("");
    setFormHiringProcess(["Online Aptitude & Coding Test", "Technical Interview Round", "HR Fitment Round"]);
    setFormPrepTips(["Practice quantitative and logical aptitude tests", "Revise Core CS fundamentals: DBMS, OS, Network", "Structure project explanations using STAR method"]);
    setFormEligibility("CGPA > 6.0, no active backlogs. B.Tech/M.Tech/MCA/M.Sc streams preferred.");
    setFormRequiredSkills(["Java/Python", "Data Structures", "SQL & Databases", "Communication Skills"]);
    setFormRecommendations([
      { title: "Master Core DSA", description: "Practice Arrays, Strings, and Trees on the Coding platform.", priority: "High" },
      { title: "STAR Method Behavioral Stories", description: "Review common HR questions and structure explanations using STAR.", priority: "Medium" }
    ]);
    setFormStatus("Active");
    setModalType("add");
  };

  const openEditModal = (c: FrontendCompany) => {
    setSelectedC(c);
    setFormName(c.name);
    setFormDifficulty(c.difficulty || "Medium");
    setFormLogoColor("from-violet-600 to-indigo-600");
    setFormLogoBg("bg-violet-100 dark:bg-violet-950/40");
    setFormDescription(c.description || "");
    setFormHiringProcess(
      c.hiring_process && c.hiring_process.length > 0
        ? c.hiring_process.map(h => `${h.round}. ${h.title} - ${h.description}`)
        : ["Online assessment (Aptitude & Coding)", "Technical interview loop", "HR & Managerial round"]
    );
    setFormPrepTips(c.preparation_tips && c.preparation_tips.length > 0 ? c.preparation_tips : [""]);
    setFormEligibility(c.eligibility || "");
    setFormRequiredSkills(c.required_skills && c.required_skills.length > 0 ? c.required_skills : [""]);
    setFormRecommendations(
      c.recommendations && c.recommendations.length > 0
        ? c.recommendations
        : [{ title: "", description: "", priority: "Medium" }]
    );
    setFormStatus("Active");
    setModalType("edit");
  };

  const openPreviewModal = (c: FrontendCompany) => {
    setSelectedC(c);
    // Sync up lists for preview
    setFormHiringProcess(
      c.hiring_process && c.hiring_process.length > 0
        ? c.hiring_process.map(h => `${h.round}. ${h.title} - ${h.description}`)
        : ["Online assessment (Aptitude & Coding)", "Technical interview loop", "HR & Managerial round"]
    );
    setFormPrepTips(c.preparation_tips && c.preparation_tips.length > 0 ? c.preparation_tips : [""]);
    setFormEligibility(c.eligibility || "");
    setFormRequiredSkills(c.required_skills && c.required_skills.length > 0 ? c.required_skills : [""]);
    setFormRecommendations(c.recommendations || []);
    setModalType("preview");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    try {
      await companyService.adminAddCompany({
        name: formName,
        slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formDescription,
        difficulty: formDifficulty,
        package_range: "",
        hiring_process: formHiringProcess.filter(Boolean).map((step, i) => {
          const actual = step.includes(".") ? step.split(".").slice(1).join(".").trim() : step.trim();
          const parts = actual.split("-");
          return {
            round: i + 1,
            title: parts[0]?.trim() || actual,
            description: parts.slice(1).join("-")?.trim() || "",
          };
        }),
        logo_url: null,
        prep_materials: {
          eligibility: formEligibility,
          required_skills: formRequiredSkills.filter(Boolean),
          preparation_tips: formPrepTips.filter(Boolean),
          recommendations: formRecommendations.filter(r => r.title.trim() !== ""),
        } as any,
      });
      await loadCompanies();
      setModalType(null);
    } catch (err) {
      console.error("Failed to add company:", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedC || !formName) return;

    try {
      await companyService.adminEditCompany(selectedC.id, {
        name: formName,
        description: formDescription,
        difficulty: formDifficulty,
        hiring_process: formHiringProcess.filter(Boolean).map((step, i) => {
          const actual = step.includes(".") ? step.split(".").slice(1).join(".").trim() : step.trim();
          const parts = actual.split("-");
          return {
            round: i + 1,
            title: parts[0]?.trim() || actual,
            description: parts.slice(1).join("-")?.trim() || "",
          };
        }),
        prep_materials: {
          eligibility: formEligibility,
          required_skills: formRequiredSkills.filter(Boolean),
          preparation_tips: formPrepTips.filter(Boolean),
          recommendations: formRecommendations.filter(r => r.title.trim() !== ""),
        } as any,
      });
      await loadCompanies();
      setModalType(null);
    } catch (err) {
      console.error("Failed to update company:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this company profile?")) {
      try {
        await companyService.adminDeleteCompany(id);
        await loadCompanies();
      } catch (err) {
        console.error("Failed to delete company:", err);
      }
    }
  };

  // Helper arrays for logo color picker
  const PRESET_GRADIENTS = [
    { label: "Violet/Indigo", color: "from-violet-600 to-indigo-600", bg: "bg-violet-100 dark:bg-violet-950/40" },
    { label: "Blue", color: "from-blue-600 to-blue-800", bg: "bg-blue-100 dark:bg-blue-950" },
    { label: "Orange", color: "from-orange-500 to-orange-700", bg: "bg-orange-100 dark:bg-orange-950" },
    { label: "Red", color: "from-red-500 to-red-700", bg: "bg-red-100 dark:bg-red-950" },
    { label: "Purple", color: "from-purple-500 to-purple-700", bg: "bg-purple-100 dark:bg-purple-950" },
    { label: "Teal", color: "from-teal-500 to-teal-700", bg: "bg-teal-100 dark:bg-teal-950" },
    { label: "Green", color: "from-green-500 to-emerald-700", bg: "bg-green-100 dark:bg-green-950" }
  ];

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200/50 dark:border-green-900/30",
    Medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30",
    Hard: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/30",
    Expert: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30",
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center relative w-full md:w-80">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search company or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:border-violet-500 transition-all shadow-sm"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <Button onClick={openAddModal} variant="primary" size="sm" className="h-10 px-4 gap-1.5 ml-auto md:ml-0">
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Business Sector</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 text-sm">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm uppercase shrink-0">
                          {c.name.slice(0, 2)}
                        </div>
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-150">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-705 dark:text-zinc-350">
                      {c.difficulty || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${difficultyColors[c.difficulty || "Medium"]}`}>
                        {c.difficulty || "Medium"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openPreviewModal(c)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-650 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Preview Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-650 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-505">
                    No companies listed matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CRUD MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-violet-500" />
                  {modalType === "add" && "Add New Company Profile"}
                  {modalType === "edit" && "Edit Company Profile"}
                  {modalType === "preview" && "Company Placement Details"}
                </h3>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-550 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview Content */}
              {modalType === "preview" && selectedC && (
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md uppercase">
                      {selectedC.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-xl leading-tight">{selectedC.name}</h4>
                      <p className="text-sm text-zinc-500 font-semibold mt-0.5">{selectedC.difficulty || "N/A"}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ml-auto ${difficultyColors[selectedC.difficulty || "Medium"]}`}>
                      {selectedC.difficulty || "Medium"}
                    </span>
                  </div>

                  {/* Profile Description */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">About the Company</h5>
                    <p className="text-sm text-zinc-700 dark:text-zinc-350 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-905/30 p-4 border border-zinc-150 dark:border-zinc-850/60 rounded-xl">
                      {selectedC.description || `${selectedC.name} is a renowned global organization.`}
                    </p>
                  </div>

                  {/* Eligibility & Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Eligibility Criteria</h5>
                      <div className="text-sm text-zinc-700 dark:text-zinc-350 font-medium bg-zinc-50 dark:bg-zinc-905/30 p-3.5 border border-zinc-150 dark:border-zinc-850/60 rounded-xl min-h-[70px]">
                        {formEligibility || "No specific eligibility criteria defined."}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Required Skills</h5>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-905/30 border border-zinc-150 dark:border-zinc-850/60 rounded-xl min-h-[70px] content-start">
                        {formRequiredSkills.filter(Boolean).length > 0 ? (
                          formRequiredSkills.filter(Boolean).map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs font-bold bg-violet-50 dark:bg-violet-955/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 rounded-lg animate-fade-in">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-550 italic">No skills specified.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hiring Process Rounds */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Selection / Hiring Process</h5>
                    <div className="space-y-2.5">
                      {formHiringProcess.map((round, idx) => (
                        <div key={idx} className="flex gap-3 text-sm items-start">
                          <span className="h-5.5 w-5.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-850 text-violet-700 dark:text-violet-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-zinc-800 dark:text-zinc-300 font-semibold">{round}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preparation Tips */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-amber-500" /> Placement Prep Tips
                    </h5>
                    <ul className="space-y-2">
                      {formPrepTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-350 font-medium">
                          <span className="text-amber-500 shrink-0 font-black">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Recommendations */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-violet-500" /> AI Recommendations
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formRecommendations.filter(r => r.title.trim() !== "").length > 0 ? (
                        formRecommendations.filter(r => r.title.trim() !== "").map((rec, idx) => {
                          const priorityColors = {
                            High: "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400",
                            Medium: "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400",
                            Low: "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400",
                          };
                          return (
                            <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <h6 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{rec.title}</h6>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${priorityColors[rec.priority]}`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-605 dark:text-zinc-405 font-medium leading-relaxed">{rec.description}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-xs text-zinc-500 italic p-3.5 bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                          No recommendations defined.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button onClick={() => setModalType(null)} variant="secondary" className="text-xs h-9 px-4">
                      Close Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}>
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-550 uppercase tracking-wider">Company Name</label>
                        <input 
                          type="text" 
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Amazon, Tech Mahindra"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>

                      {/* Type Sector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-550 uppercase tracking-wider">Business Sector</label>
                        <input 
                          type="text" 
                          required
                          value={formType}
                          onChange={(e) => setFormType(e.target.value)}
                          placeholder="e.g. IT Services, Consulting, Technology"
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Difficulty */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty Level</label>
                        <select
                          value={formDifficulty}
                          onChange={(e) => setFormDifficulty(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Listing Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full px-3 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                        >
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Logo Colors Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Branding Gradient Color</label>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_GRADIENTS.map((p) => {
                          const isSelected = formLogoColor === p.color;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                setFormLogoColor(p.color);
                                setFormLogoBg(p.bg);
                              }}
                              className={`h-9 px-3 rounded-lg text-xs font-bold bg-gradient-to-tr ${p.color} text-white transition-all cursor-pointer ${
                                isSelected ? "ring-2 ring-violet-500 ring-offset-2 scale-[1.03] shadow-md" : "opacity-75 hover:opacity-100"
                              }`}
                            >
                              {p.label.split(" ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company Description</label>
                      <textarea
                        required
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Provide details about the company's background and size..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 text-zinc-900 dark:text-zinc-150 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
                      />
                    </div>

                    {/* Hiring Process Rounds Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hiring Process Steps</label>
                        <button 
                          type="button" 
                          onClick={() => setFormHiringProcess([...formHiringProcess, ""])}
                          className="text-xs font-bold text-violet-650 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Step
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formHiringProcess.map((round, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-zinc-400 w-6">R{idx + 1}</span>
                            <input 
                              type="text" 
                              required
                              value={round}
                              onChange={(e) => {
                                const updated = [...formHiringProcess];
                                updated[idx] = e.target.value;
                                setFormHiringProcess(updated);
                              }}
                              placeholder={`Step ${idx + 1} details (e.g. Technical Coding Round)`}
                              className="flex-1 px-3.5 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                            />
                            {formHiringProcess.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setFormHiringProcess(formHiringProcess.filter((_, i) => i !== idx))}
                                className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preparation Tips Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Placement Prep Tips</label>
                        <button 
                          type="button" 
                          onClick={() => setFormPrepTips([...formPrepTips, ""])}
                          className="text-xs font-bold text-violet-655 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Tip
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formPrepTips.map((tip, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              required
                              value={tip}
                              onChange={(e) => {
                                const updated = [...formPrepTips];
                                updated[idx] = e.target.value;
                                setFormPrepTips(updated);
                              }}
                              placeholder={`Tip ${idx + 1} (e.g. Master dynamic programming questions)`}
                              className="flex-1 px-3.5 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                            />
                            {formPrepTips.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setFormPrepTips(formPrepTips.filter((_, i) => i !== idx))}
                                className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eligibility Criteria Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Eligibility Criteria</label>
                      <textarea
                        required
                        rows={2}
                        value={formEligibility}
                        onChange={(e) => setFormEligibility(e.target.value)}
                        placeholder="e.g. CGPA > 6.0, B.Tech/MCA/MCA, no active backlogs."
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 text-zinc-900 dark:text-zinc-150 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner resize-none"
                      />
                    </div>

                    {/* Required Skills Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Required Skills</label>
                        <button 
                          type="button" 
                          onClick={() => setFormRequiredSkills([...formRequiredSkills, ""])}
                          className="text-xs font-bold text-violet-655 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Skill
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {formRequiredSkills.map((skill, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              required
                              value={skill}
                              onChange={(e) => {
                                const updated = [...formRequiredSkills];
                                updated[idx] = e.target.value;
                                setFormRequiredSkills(updated);
                              }}
                              placeholder={`Skill ${idx + 1} (e.g. Java)`}
                              className="flex-1 px-3.5 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-855 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                            />
                            {formRequiredSkills.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setFormRequiredSkills(formRequiredSkills.filter((_, i) => i !== idx))}
                                className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations Input */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Recommendations</label>
                        <button 
                          type="button" 
                          onClick={() => setFormRecommendations([...formRecommendations, { title: "", description: "", priority: "Medium" }])}
                          className="text-xs font-bold text-violet-655 hover:text-violet-500 flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Add Recommendation
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formRecommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-2 relative bg-zinc-50/50 dark:bg-zinc-900/40">
                            {formRecommendations.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setFormRecommendations(formRecommendations.filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 cursor-pointer"
                              >
                                <MinusCircle className="h-4.5 w-4.5" />
                              </button>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <input 
                                  type="text" 
                                  required
                                  value={rec.title}
                                  onChange={(e) => {
                                    const updated = [...formRecommendations];
                                    updated[idx] = { ...updated[idx], title: e.target.value };
                                    setFormRecommendations(updated);
                                  }}
                                  placeholder="Recommendation Title"
                                  className="w-full px-3 h-8 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                                />
                              </div>
                              <div>
                                <select
                                  value={rec.priority}
                                  onChange={(e) => {
                                    const updated = [...formRecommendations];
                                    updated[idx] = { ...updated[idx], priority: e.target.value as any };
                                    setFormRecommendations(updated);
                                  }}
                                  className="w-full px-2 h-8 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 outline-none focus:border-violet-500 transition-all font-semibold"
                                >
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                              </div>
                            </div>
                            <input 
                              type="text" 
                              required
                              value={rec.description}
                              onChange={(e) => {
                                const updated = [...formRecommendations];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                setFormRecommendations(updated);
                              }}
                              placeholder="Description details..."
                              className="w-full px-3 h-8 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-all shadow-inner"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setModalType(null)} 
                      variant="secondary" 
                      className="text-xs h-9 px-4"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="text-xs h-9 px-4 gap-1"
                    >
                      <Check className="h-4 w-4" /> Save Profile
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
