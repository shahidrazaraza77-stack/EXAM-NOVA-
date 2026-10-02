"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Save, Plus, X, User, GraduationCap, Wrench, FolderKanban, Briefcase, ScrollText, Eye, Loader2, AlertCircle, FileText, CheckCircle2, Sparkles } from "lucide-react";
import ResumePreview from "./ResumePreview";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

interface FormData {
  personalInfo: { fullName: string; email: string; phone: string; linkedin: string; github: string; portfolio: string; location: string; summary: string };
  education: Array<{ degree: string; college: string; cgpa: string; year: string }>;
  skills: { technical: string[]; soft: string[]; tools: string[]; languages: string[] };
  projects: Array<{ title: string; description: string; techStack: string; githubLink: string; liveLink: string }>;
  experience: Array<{ type: string; company: string; role: string; duration: string; responsibilities: string }>;
  certifications: Array<{ name: string; issuer: string; date: string }>;
}

const defaultForm: FormData = {
  personalInfo: { fullName: "", email: "", phone: "", linkedin: "", github: "", portfolio: "", location: "", summary: "" },
  education: [{ degree: "", college: "", cgpa: "", year: "" }],
  skills: { technical: [], soft: [], tools: [], languages: [] },
  projects: [{ title: "", description: "", techStack: "", githubLink: "", liveLink: "" }],
  experience: [{ type: "internship", company: "", role: "", duration: "", responsibilities: "" }],
  certifications: [{ name: "", issuer: "", date: "" }],
};

const steps = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Education", icon: GraduationCap },
  { id: 3, label: "Skills", icon: Wrench },
  { id: 4, label: "Projects", icon: FolderKanban },
  { id: 5, label: "Experience", icon: Briefcase },
  { id: 6, label: "Certifications & Achievements", icon: ScrollText },
  { id: 7, label: "Review", icon: Eye },
];

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) { onChange([...tags, val]); setInput(""); }
  };
  return (
    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-h-[44px] flex flex-wrap gap-1.5 items-center">
      {tags.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          {t}
          <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors border-none bg-transparent p-0 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </span>
      ))}
      <input className="flex-grow min-w-[100px] text-sm outline-none border-none bg-transparent text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400" placeholder={placeholder || "Type and press Enter"} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
    </div>
  );
}

interface CreateResumeTabProps {
  onNavigate?: (tab: string) => void;
  setActiveResume?: (resume: any) => void;
  refreshResumes?: () => void;
}

export default function CreateResumeTab({ onNavigate, setActiveResume, refreshResumes }: CreateResumeTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Wizard States
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Save & Load Draft States
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<any | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "idle">("idle");
  const [isFinishing, setIsFinishing] = useState(false);

  // Gemini Comparison States
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiComparisonMode, setAiComparisonMode] = useState(false);
  const [enhancedForm, setEnhancedForm] = useState<FormData | null>(null);

  const isSavingRef = useRef(false);

  // 1. Calculate Completion Progress Percentage
  const calculateProgress = (data: FormData): number => {
    let score = 0;
    
    // Step 1: Personal Info (max 25)
    if (data.personalInfo.fullName.trim()) score += 10;
    if (data.personalInfo.email.trim()) score += 5;
    if (data.personalInfo.phone.trim()) score += 5;
    if (data.personalInfo.location.trim()) score += 3;
    if (data.personalInfo.summary.trim()) score += 2;
    
    // Step 2: Education (max 15)
    const hasEdu = data.education.some(edu => edu.degree.trim() && edu.college.trim());
    if (hasEdu) score += 15;
    
    // Step 3: Skills (max 15)
    if (data.skills.technical.length > 0) score += 10;
    if (data.skills.tools.length > 0 || data.skills.soft.length > 0) score += 5;
    
    // Step 4: Projects (max 15)
    const hasProj = data.projects.some(proj => proj.title.trim() && proj.description.trim());
    if (hasProj) score += 15;
    
    // Step 5: Experience (max 15)
    const hasExp = data.experience.some(exp => exp.company.trim() && exp.role.trim());
    if (hasExp) score += 15;
    
    // Step 6: Certifications (max 15)
    const hasCert = data.certifications.some(cert => cert.name.trim() && cert.issuer.trim());
    if (hasCert) score += 15;
    
    return Math.min(100, score);
  };

  const progressPercentage = calculateProgress(form);

  // 2. Validate current step inputs
  const validateStep = (currentStep: number, data: FormData) => {
    const stepErrors: { [key: string]: string } = {};
    
    if (currentStep === 1) {
      if (!data.personalInfo.fullName.trim()) stepErrors.fullName = "Full Name is required";
      if (!data.personalInfo.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(data.personalInfo.email)) {
        stepErrors.email = "Invalid email format";
      }
      if (!data.personalInfo.phone.trim()) stepErrors.phone = "Phone number is required";
    } else if (currentStep === 2) {
      if (data.education.length === 0) {
        stepErrors.education = "At least one education entry is required";
      } else {
        data.education.forEach((edu, idx) => {
          if (!edu.degree.trim()) stepErrors[`education_${idx}_degree`] = "Degree is required";
          if (!edu.college.trim()) stepErrors[`education_${idx}_college`] = "College/University is required";
          if (!edu.year.trim()) stepErrors[`education_${idx}_year`] = "Year is required";
        });
      }
    } else if (currentStep === 3) {
      if (data.skills.technical.length === 0) {
        stepErrors.skills = "At least one technical skill is required";
      }
    } else if (currentStep === 4) {
      if (data.projects.length === 0) {
        stepErrors.projects = "At least one project is required";
      } else {
        data.projects.forEach((proj, idx) => {
          if (!proj.title.trim()) stepErrors[`projects_${idx}_title`] = "Project title is required";
          if (!proj.description.trim()) stepErrors[`projects_${idx}_description`] = "Project description is required";
        });
      }
    } else if (currentStep === 5) {
      if (data.experience.length === 0) {
        stepErrors.experience = "At least one experience entry is required";
      } else {
        data.experience.forEach((exp, idx) => {
          if (!exp.company.trim()) stepErrors[`experience_${idx}_company`] = "Company is required";
          if (!exp.role.trim()) stepErrors[`experience_${idx}_role`] = "Role is required";
          if (!exp.duration.trim()) stepErrors[`experience_${idx}_duration`] = "Duration is required";
        });
      }
    } else if (currentStep === 6) {
      data.certifications.forEach((cert, idx) => {
        const hasAnyField = cert.name.trim() || cert.issuer.trim() || cert.date.trim();
        if (hasAnyField) {
          if (!cert.name.trim()) stepErrors[`certifications_${idx}_name`] = "Certification name is required";
          if (!cert.issuer.trim()) stepErrors[`certifications_${idx}_issuer`] = "Issuer is required";
        }
      });
    }

    return {
      valid: Object.keys(stepErrors).length === 0,
      errors: stepErrors
    };
  };

  // 3. Supabase Saving logic
  const saveDraftToSupabase = async (overrideForm?: FormData, overrideStep?: number) => {
    if (!user || isSavingRef.current) return;
    
    isSavingRef.current = true;
    setSaveStatus("saving");
    
    const activeForm = overrideForm || form;
    const activeStep = overrideStep !== undefined ? overrideStep : step;
    const progress = calculateProgress(activeForm);
    
    const payload = {
      ...activeForm,
      isDraft: true,
      currentStep: activeStep,
      progressPercentage: progress
    };

    try {
      if (currentDraftId) {
        const { error } = await (supabase.from("resumes") as any)
          .update({
            content: payload as any,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentDraftId);
          
        if (error) throw error;
      } else {
        const { data, error } = await (supabase.from("resumes") as any)
          .insert({
            user_id: user.id,
            file_name: activeForm.personalInfo.fullName 
              ? `Draft - ${activeForm.personalInfo.fullName}` 
              : "Draft Resume",
            content: payload as any,
            score: null
          })
          .select()
          .single();
          
        if (error) throw error;
        if (data) {
          setCurrentDraftId(data.id);
        }
      }
      setSaveStatus("saved");
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  };

  // Debounced autosave triggers 1.5s after editing form fields
  useEffect(() => {
    if (!user || loadingDraft || pendingDraft) return;

    // Skip saving blank default forms unless editing a draft
    const isFormDefault = JSON.stringify(form) === JSON.stringify(defaultForm);
    if (isFormDefault && !currentDraftId) return;

    const timeout = setTimeout(() => {
      saveDraftToSupabase();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [form]);

  // 4. Check for existing drafts on mount
  useEffect(() => {
    const checkDrafts = async () => {
      if (!user) {
        setLoadingDraft(false);
        return;
      }
      try {
        setLoadingDraft(true);
        const { data, error } = await (supabase.from("resumes") as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("content->>isDraft", "true")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setPendingDraft(data[0]);
        }
      } catch (err) {
        console.error("Error checking draft:", err);
      } finally {
        setLoadingDraft(false);
      }
    };
    
    checkDrafts();
  }, [user]);

  // Load selected draft
  const handleLoadDraft = () => {
    if (pendingDraft) {
      const draftContent = pendingDraft.content;
      setForm(draftContent);
      setStep(draftContent.currentStep || 1);
      setCurrentDraftId(pendingDraft.id);
    }
    setPendingDraft(null);
  };

  // Decline draft and start fresh
  const handleDiscardDraft = () => {
    setPendingDraft(null);
    setCurrentDraftId(null);
  };

  // Form value updates
  const updatePI = (k: keyof FormData["personalInfo"], v: string) => setForm(f => ({ ...f, personalInfo: { ...f.personalInfo, [k]: v } }));
  const updateEdu = (i: number, k: string, v: string) => setForm(f => ({ ...f, education: f.education.map((e, j) => j === i ? { ...e, [k]: v } : e) }));
  const addEdu = () => setForm(f => ({ ...f, education: [...f.education, { degree: "", college: "", cgpa: "", year: "" }] }));
  const remEdu = (i: number) => setForm(f => ({ ...f, education: f.education.filter((_, j) => j !== i) }));
  const updateSkills = (k: keyof FormData["skills"], v: string[]) => setForm(f => ({ ...f, skills: { ...f.skills, [k]: v } }));
  const updateProj = (i: number, k: string, v: string) => setForm(f => ({ ...f, projects: f.projects.map((p, j) => j === i ? { ...p, [k]: v } : p) }));
  const addProj = () => setForm(f => ({ ...f, projects: [...f.projects, { title: "", description: "", techStack: "", githubLink: "", liveLink: "" }] }));
  const remProj = (i: number) => setForm(f => ({ ...f, projects: f.projects.filter((_, j) => j !== i) }));
  const updateExp = (i: number, k: string, v: string) => setForm(f => ({ ...f, experience: f.experience.map((e, j) => j === i ? { ...e, [k]: v } : e) }));
  const addExp = () => setForm(f => ({ ...f, experience: [...f.experience, { type: "internship", company: "", role: "", duration: "", responsibilities: "" }] }));
  const remExp = (i: number) => setForm(f => ({ ...f, experience: f.experience.filter((_, j) => j !== i) }));
  const updateCert = (i: number, k: string, v: string) => setForm(f => ({ ...f, certifications: f.certifications.map((c, j) => j === i ? { ...c, [k]: v } : c) }));
  const addCert = () => setForm(f => ({ ...f, certifications: [...f.certifications, { name: "", issuer: "", date: "" }] }));
  const remCert = (i: number) => setForm(f => ({ ...f, certifications: f.certifications.filter((_, j) => j !== i) }));

  // AI-Improved Form Updates
  const updateEnhancedPI = (k: keyof FormData["personalInfo"], v: string) => setEnhancedForm(f => f ? ({ ...f, personalInfo: { ...f.personalInfo, [k]: v } }) : null);
  const updateEnhancedSkills = (k: keyof FormData["skills"], v: string[]) => setEnhancedForm(f => f ? ({ ...f, skills: { ...f.skills, [k]: v } }) : null);
  const updateEnhancedProj = (i: number, k: string, v: string) => setEnhancedForm(f => f ? ({ ...f, projects: f.projects.map((p, j) => j === i ? { ...p, [k]: v } : p) }) : null);
  const updateEnhancedExp = (i: number, k: string, v: string) => setEnhancedForm(f => f ? ({ ...f, experience: f.experience.map((e, j) => j === i ? { ...e, [k]: v } : e) }) : null);

  // Trigger Gemini Enhancement
  const handleEnhanceWithAI = async () => {
    // Validate current step first
    const validation = validateStep(step, form);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.warning("Please correct validation errors on the current step first.");
      return;
    }
    setErrors({});
    setIsEnhancing(true);

    try {
      const res = await fetch("/api/resume/enhance-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData: form })
      });
      const data = await res.json();
      if (res.ok && data.enhancedData) {
        setEnhancedForm(data.enhancedData);
        setAiComparisonMode(true);
      } else {
        toast.error("Enhancement failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error calling AI Enhancement: " + err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Save AI Accepted suggestions as a NEW resume row (Never overwrite original)
  const handleAcceptAIChanges = async () => {
    if (!user || !enhancedForm) return;

    setIsFinishing(true);
    try {
      // Find latest version count from Supabase to increment it
      const { data: maxVerData, error: maxVerErr } = await (supabase.from("resumes") as any)
        .select("version")
        .eq("user_id", user.id)
        .order("version", { ascending: false })
        .limit(1);

      const latestVerNum = (!maxVerErr && maxVerData && maxVerData.length > 0)
        ? (maxVerData[0].version || 1)
        : 1;

      const newVersion = latestVerNum + 1;

      const finalFileName = enhancedForm.personalInfo.fullName
        ? `Resume - ${enhancedForm.personalInfo.fullName}`
        : "AI Resume Profile";

      const finalPayload = {
        ...enhancedForm,
        isDraft: false,
        progressPercentage: 100
      };

      const { data: savedData, error: saveError } = await (supabase.from("resumes") as any)
        .insert({
          user_id: user.id,
          file_name: finalFileName,
          content: finalPayload as any,
          score: null,
          version: newVersion
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast.success(`AI Suggestions Accepted! Created new Version ${newVersion}.0.`);
      if (refreshResumes) refreshResumes();
      if (setActiveResume && savedData) setActiveResume(savedData);
      if (onNavigate) onNavigate("ats");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save AI suggestions: " + err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  // Step transition navigation
  const handleNext = async () => {
    const validation = validateStep(step, form);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.warning(`Please fill in all required fields on Step ${step} before proceeding.`);
      return;
    }
    setErrors({});
    const nextStep = step + 1;
    await saveDraftToSupabase(form, nextStep);
    setStep(nextStep);
  };

  const handlePrev = async () => {
    setErrors({});
    const prevStep = step - 1;
    await saveDraftToSupabase(form, prevStep);
    setStep(prevStep);
  };

  // Final structured publish (saves current non-AI details as general)
  const handlePublish = async () => {
    // Validate all steps 1 to 6
    let allValid = true;
    for (let s = 1; s <= 6; s++) {
      const v = validateStep(s, form);
      if (!v.valid) {
        allValid = false;
        setStep(s);
        setErrors(v.errors);
        toast.warning(`Validation failed on Step ${s}. Please fix required fields.`);
        break;
      }
    }

    if (!allValid || !user) return;

    setIsFinishing(true);
    try {
      const finalPayload = {
        ...form,
        isDraft: false,
        progressPercentage: 100
      };

      const finalFileName = form.personalInfo.fullName 
        ? `Resume - ${form.personalInfo.fullName}` 
        : "AI Resume Profile";

      let savedData: any = null;
      if (currentDraftId) {
        const { data, error } = await (supabase.from("resumes") as any)
          .update({
            file_name: finalFileName,
            content: finalPayload as any,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentDraftId)
          .select()
          .single();
          
        if (error) throw error;
        savedData = data;
      } else {
        const { data, error } = await (supabase.from("resumes") as any)
          .insert({
            user_id: user.id,
            file_name: finalFileName,
            content: finalPayload as any,
            score: null
          })
          .select()
          .single();
          
        if (error) throw error;
        savedData = data;
      }

      toast.success("Resume saved successfully!");
      if (refreshResumes) refreshResumes();
      if (setActiveResume && savedData) setActiveResume(savedData);
      if (onNavigate) onNavigate("ats");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to finalize resume: " + err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  // Resume details parsed for live rendering
  const previewData = {
    header: { name: form.personalInfo.fullName || "Your Name", title: "Full Stack Developer", email: form.personalInfo.email || "email@example.com", phone: form.personalInfo.phone || "+1 234 567 890", location: form.personalInfo.location || "City, State", linkedin: form.personalInfo.linkedin || "linkedin.com/in/you", github: form.personalInfo.github || "github.com/you" },
    summary: form.personalInfo.summary || "Add a career objective to see it here.",
    education: form.education.map(e => ({ institution: e.college || "University", degree: e.degree || "Degree", date: e.year || "2024", gpa: e.cgpa || "3.5/4.0" })),
    skills: { languages: form.skills.technical.length ? form.skills.technical : ["JavaScript", "Python"], frontend: ["React"], backend: ["Node.js"], tools: form.skills.tools.length ? form.skills.tools : ["Git"] },
    projects: form.projects.filter(p => p.title).map(p => ({ title: p.title, technologies: p.techStack.split(",").map(s => s.trim()), date: "2024", bullets: [p.description] })),
    experience: form.experience.filter(e => e.company).map(e => ({ company: e.company, role: e.role, date: e.duration, location: "Remote", bullets: [e.responsibilities] })),
    certifications: form.certifications.filter(c => c.name).map(c => ({ name: c.name, issuer: c.issuer, date: c.date })),
  };

  // Styled classes
  const inputClass = (field: string) => `w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 ${
    errors[field] 
      ? "border-red-500 focus:border-red-500 dark:border-red-800" 
      : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500"
  }`;
  const labelClass = "text-xs font-semibold text-zinc-650 dark:text-zinc-400 mb-1.5 block";

  // AI comparison mode
  if (aiComparisonMode && enhancedForm) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Resume Enhancement Comparison
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Review and manually tweak Gemini's suggestions on the right. Saving will create a new resume version, preserving your original.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setAiComparisonMode(false); setEnhancedForm(null); }}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 bg-transparent cursor-pointer transition-colors"
            >
              Reject Suggestions
            </button>
            <Button 
              onClick={handleAcceptAIChanges} 
              isLoading={isFinishing}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Accept & Save Version
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Panel: Original (Read-only) */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-805 bg-zinc-50/30 dark:bg-zinc-950/20 space-y-6 overflow-y-auto max-h-[650px] scrollbar-thin">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-extrabold text-sm text-zinc-550 dark:text-zinc-400">Original Resume details</h3>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Original Draft</span>
            </div>

            {/* Career Objective */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Career Objective</h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-450 leading-relaxed font-medium bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-850 shadow-3xs">{form.personalInfo.summary || "No career objective entered."}</p>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350">Technical Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {form.skills.technical.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-600 dark:text-zinc-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350">Projects</h4>
              {form.projects.map((proj, i) => (
                <div key={i} className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-1 shadow-3xs">
                  <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200">{proj.title}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-405 leading-relaxed">{proj.description}</p>
                  {proj.techStack && <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold">Stack: {proj.techStack}</p>}
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350">Experience</h4>
              {form.experience.map((exp, i) => (
                <div key={i} className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-1 shadow-3xs">
                  <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200">{exp.role} at {exp.company}</p>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-405 leading-relaxed">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: AI-Enhanced (Editable) */}
          <div className="p-6 rounded-2xl border border-violet-150 dark:border-violet-950 bg-white dark:bg-zinc-950 space-y-6 overflow-y-auto max-h-[650px] scrollbar-thin shadow-xl shadow-violet-500/5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-850">
              <h3 className="font-extrabold text-sm text-violet-650 dark:text-violet-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI-Improved (Editable)
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-450 border border-violet-200 dark:border-violet-900/50">Gemini Optimization</span>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className={labelClass}>Career Objective</label>
              <textarea 
                className={`${inputClass("enhancedSummary")} resize-none h-28 font-medium`} 
                value={enhancedForm.personalInfo.summary} 
                onChange={e => updateEnhancedPI("summary", e.target.value)} 
              />
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Technical Skills (AI Enhanced)</label>
                <TagInput 
                  tags={enhancedForm.skills.technical} 
                  onChange={tags => updateEnhancedSkills("technical", tags)} 
                />
              </div>
              <div>
                <label className={labelClass}>Tools & Platforms (AI Enhanced)</label>
                <TagInput 
                  tags={enhancedForm.skills.tools} 
                  onChange={tags => updateEnhancedSkills("tools", tags)} 
                />
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Projects</h4>
              {enhancedForm.projects.map((proj, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div className="font-bold text-[10px] text-zinc-400 uppercase">Project {i + 1}</div>
                  <div>
                    <label className={labelClass}>Project Title</label>
                    <input 
                      className={inputClass(`enhancedProjects_${i}_title`)} 
                      value={proj.title} 
                      onChange={e => updateEnhancedProj(i, "title", e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea 
                      className={`${inputClass(`enhancedProjects_${i}_description`)} resize-none h-24`} 
                      value={proj.description} 
                      onChange={e => updateEnhancedProj(i, "description", e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Experience</h4>
              {enhancedForm.experience.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div className="font-bold text-[10px] text-zinc-400 uppercase">Experience {i + 1}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Role</label>
                      <input 
                        className={inputClass(`enhancedExperience_${i}_role`)} 
                        value={exp.role} 
                        onChange={e => updateEnhancedExp(i, "role", e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Company</label>
                      <input 
                        className={inputClass(`enhancedExperience_${i}_company`)} 
                        value={exp.company} 
                        onChange={e => updateEnhancedExp(i, "company", e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Responsibilities</label>
                    <textarea 
                      className={`${inputClass(`enhancedExperience_${i}_responsibilities`)} resize-none h-24`} 
                      value={exp.responsibilities} 
                      onChange={e => updateEnhancedExp(i, "responsibilities", e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen while resolving drafts
  if (loadingDraft) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Checking for resume drafts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Draft Recovery Prompt Card */}
      {pendingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Unfinished Draft Found</h3>
                <p className="text-[10px] text-zinc-500">Last updated: {new Date(pendingDraft.updated_at || pendingDraft.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-455 leading-relaxed">
              We found a saved draft matching <strong>{pendingDraft.content?.personalInfo?.fullName || "Unlabeled Resume"}</strong>. Would you like to resume editing this draft or start a new resume?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={handleDiscardDraft}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-pointer bg-transparent transition-colors"
              >
                Start Fresh
              </button>
              <button 
                onClick={handleLoadDraft}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer border-none shadow-md shadow-indigo-500/10 transition-colors"
              >
                Resume Draft
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            Create Resume
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">Step {step} of 7</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Fill in details step-by-step to build a structured profile.</p>
        </div>

        {/* Draft Saving Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <AnimatePresence mode="wait">
            {saveStatus === "saving" && (
              <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-bold"><Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Saving Draft...</motion.span>
            )}
            {saveStatus === "saved" && (
              <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Draft Saved</motion.span>
            )}
            {saveStatus === "error" && (
              <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 flex items-center gap-1.5 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Save Failed</motion.span>
            )}
          </AnimatePresence>

          <button 
            onClick={() => saveDraftToSupabase()}
            className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-transparent transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
        </div>
      </div>

      {/* Progress & Completion Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-zinc-500">Wizard Progress</span>
          <span className="text-indigo-650 dark:text-indigo-400">{progressPercentage}% Complete</span>
        </div>
        <div className="relative py-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-full" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full" 
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative flex items-center justify-between">
            {steps.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="relative flex flex-col items-center">
                  <button
                    onClick={async () => {
                      if (s.id < step) {
                        setStep(s.id);
                      } else if (s.id > step) {
                        let firstInvalidStep = -1;
                        let aggregatedErrors = {};
                        for (let checkStep = 1; checkStep < s.id; checkStep++) {
                          const validation = validateStep(checkStep, form);
                          if (!validation.valid) {
                            firstInvalidStep = checkStep;
                            aggregatedErrors = validation.errors;
                            break;
                          }
                        }

                        if (firstInvalidStep === -1) {
                          setStep(s.id);
                        } else {
                          setStep(firstInvalidStep);
                          setErrors(aggregatedErrors);
                          toast.warning(`Please fill in required fields on Step ${firstInvalidStep} before navigating forward.`);
                        }
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 cursor-pointer ${
                      isCompleted ? "bg-indigo-600 border-indigo-600 text-white" :
                      isActive ? "bg-indigo-600 border-indigo-100 dark:border-indigo-900/50 text-white ring-4 ring-indigo-50 dark:ring-indigo-950" :
                      "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4.5 h-4.5" /> : <Icon className="w-4 h-4" />}
                  </button>
                  <span className={`absolute top-10 left-1/2 -translate-x-1/2 text-[9px] font-extrabold whitespace-nowrap transition-colors hidden sm:block ${isActive ? "text-indigo-600 dark:text-indigo-400" : isCompleted ? "text-zinc-900 dark:text-zinc-350" : "text-zinc-400"}`}>
                    {s.id === 6 ? "Certifications" : s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Steps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: Step Input Fields */}
        <div className={step === 7 ? "lg:col-span-12" : "lg:col-span-7"}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }} className="h-full flex flex-col justify-between">
              
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                      <input className={inputClass("fullName")} placeholder="John Doe" value={form.personalInfo.fullName} onChange={e => updatePI("fullName", e.target.value)} />
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                      <input className={inputClass("email")} placeholder="john@example.com" type="email" value={form.personalInfo.email} onChange={e => updatePI("email", e.target.value)} />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                      <input className={inputClass("phone")} placeholder="+1 555-123-4567" value={form.personalInfo.phone} onChange={e => updatePI("phone", e.target.value)} />
                      {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input className={inputClass("location")} placeholder="San Francisco, CA" value={form.personalInfo.location} onChange={e => updatePI("location", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>LinkedIn URL</label>
                      <input className={inputClass("linkedin")} placeholder="linkedin.com/in/johndoe" value={form.personalInfo.linkedin} onChange={e => updatePI("linkedin", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>GitHub URL</label>
                      <input className={inputClass("github")} placeholder="github.com/johndoe" value={form.personalInfo.github} onChange={e => updatePI("github", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Portfolio Website</label>
                    <input className={inputClass("portfolio")} placeholder="johndoe.dev" value={form.personalInfo.portfolio} onChange={e => updatePI("portfolio", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Professional Summary / Career Objective</label>
                    <textarea className={`${inputClass("summary")} resize-none h-24 font-medium`} placeholder="A brief summary of your skills, targets, and expertise..." value={form.personalInfo.summary} onChange={e => updatePI("summary", e.target.value)} />
                  </div>
                </div>
              )}

              {/* STEP 2: Education */}
              {step === 2 && (
                <div className="space-y-4">
                  {errors.education && (
                    <div className="flex items-center gap-1.5 text-red-650 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-950 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errors.education}
                    </div>
                  )}
                  {form.education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Education Entry {i + 1}</span>
                        {form.education.length > 1 && (
                          <button onClick={() => remEdu(i)} className="text-red-500 hover:text-red-650 text-xs font-bold border-none bg-transparent cursor-pointer">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Degree <span className="text-red-500">*</span></label>
                          <input className={inputClass(`education_${i}_degree`)} placeholder="B.Sc. Computer Science" value={edu.degree} onChange={e => updateEdu(i, "degree", e.target.value)} />
                          {errors[`education_${i}_degree`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`education_${i}_degree`]}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>College / University <span className="text-red-500">*</span></label>
                          <input className={inputClass(`education_${i}_college`)} placeholder="University of Technology" value={edu.college} onChange={e => updateEdu(i, "college", e.target.value)} />
                          {errors[`education_${i}_college`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`education_${i}_college`]}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>CGPA / Marks</label>
                          <input className={inputClass(`education_${i}_cgpa`)} placeholder="3.8/4.0" value={edu.cgpa} onChange={e => updateEdu(i, "cgpa", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Graduation Year <span className="text-red-500">*</span></label>
                          <input className={inputClass(`education_${i}_year`)} placeholder="2024" value={edu.year} onChange={e => updateEdu(i, "year", e.target.value)} />
                          {errors[`education_${i}_year`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`education_${i}_year`]}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addEdu} className="flex items-center gap-2 text-xs font-bold text-aurora-primary hover:text-aurora-primary-hover border-none bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Education</button>
                </div>
              )}

              {/* STEP 3: Skills */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Technical Skills <span className="text-red-500">*</span></label>
                    <TagInput tags={form.skills.technical} onChange={v => updateSkills("technical", v)} placeholder="e.g. React, Node.js, Python (Press Enter to add)" />
                    {errors.skills && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.skills}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Soft Skills</label>
                    <TagInput tags={form.skills.soft} onChange={v => updateSkills("soft", v)} placeholder="e.g. Leadership, Communication" />
                  </div>
                  <div>
                    <label className={labelClass}>Tools & Platforms</label>
                    <TagInput tags={form.skills.tools} onChange={v => updateSkills("tools", v)} placeholder="e.g. Git, Docker, VS Code" />
                  </div>
                  <div>
                    <label className={labelClass}>Languages</label>
                    <TagInput tags={form.skills.languages} onChange={v => updateSkills("languages", v)} placeholder="e.g. English, Hindi" />
                  </div>
                </div>
              )}

              {/* STEP 4: Projects */}
              {step === 4 && (
                <div className="space-y-4">
                  {errors.projects && (
                    <div className="flex items-center gap-1.5 text-red-650 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-950 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errors.projects}
                    </div>
                  )}
                  {form.projects.map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Project Entry {i + 1}</span>
                        {form.projects.length > 1 && (
                          <button onClick={() => remProj(i)} className="text-red-500 hover:text-red-655 text-xs font-bold border-none bg-transparent cursor-pointer">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Project Title <span className="text-red-500">*</span></label>
                          <input className={inputClass(`projects_${i}_title`)} placeholder="E-Commerce Platform" value={proj.title} onChange={e => updateProj(i, "title", e.target.value)} />
                          {errors[`projects_${i}_title`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`projects_${i}_title`]}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Description <span className="text-red-500">*</span></label>
                          <textarea className={`${inputClass(`projects_${i}_description`)} resize-none h-20`} placeholder="Describe the project, your role, and impact..." value={proj.description} onChange={e => updateProj(i, "description", e.target.value)} />
                          {errors[`projects_${i}_description`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`projects_${i}_description`]}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Tech Stack</label>
                          <input className={inputClass(`projects_${i}_techStack`)} placeholder="React, Node.js, MongoDB" value={proj.techStack} onChange={e => updateProj(i, "techStack", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>GitHub Link</label>
                          <input className={inputClass(`projects_${i}_github`)} placeholder="github.com/..." value={proj.githubLink} onChange={e => updateProj(i, "githubLink", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelClass}>Live Link</label>
                          <input className={inputClass(`projects_${i}_live`)} placeholder="https://..." value={proj.liveLink} onChange={e => updateProj(i, "liveLink", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addProj} className="flex items-center gap-2 text-xs font-bold text-aurora-primary hover:text-aurora-primary-hover border-none bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Project</button>
                </div>
              )}

              {/* STEP 5: Experience */}
              {step === 5 && (
                <div className="space-y-4">
                  {errors.experience && (
                    <div className="flex items-center gap-1.5 text-red-650 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-950 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errors.experience}
                    </div>
                  )}
                  {form.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Experience Entry {i + 1}</span>
                        {form.experience.length > 1 && (
                          <button onClick={() => remExp(i)} className="text-red-500 hover:text-red-655 text-xs font-bold border-none bg-transparent cursor-pointer">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Experience Type</label>
                          <select className={inputClass(`experience_${i}_type`)} value={exp.type} onChange={e => updateExp(i, "type", e.target.value)}>
                            <option value="internship">Internship</option>
                            <option value="work">Work Experience</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Company <span className="text-red-500">*</span></label>
                          <input className={inputClass(`experience_${i}_company`)} placeholder="Company Name" value={exp.company} onChange={e => updateExp(i, "company", e.target.value)} />
                          {errors[`experience_${i}_company`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`experience_${i}_company`]}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Role / Designation <span className="text-red-500">*</span></label>
                          <input className={inputClass(`experience_${i}_role`)} placeholder="Software Engineer" value={exp.role} onChange={e => updateExp(i, "role", e.target.value)} />
                          {errors[`experience_${i}_role`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`experience_${i}_role`]}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Duration <span className="text-red-500">*</span></label>
                          <input className={inputClass(`experience_${i}_duration`)} placeholder="May 2021 - Aug 2021" value={exp.duration} onChange={e => updateExp(i, "duration", e.target.value)} />
                          {errors[`experience_${i}_duration`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`experience_${i}_duration`]}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Responsibilities</label>
                          <textarea className={`${inputClass(`experience_${i}_responsibilities`)} resize-none h-20`} placeholder="Describe your key responsibilities and achievements..." value={exp.responsibilities} onChange={e => updateExp(i, "responsibilities", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addExp} className="flex items-center gap-2 text-xs font-bold text-aurora-primary hover:text-aurora-primary-hover border-none bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Experience</button>
                </div>
              )}

              {/* STEP 6: Certifications & Achievements */}
              {step === 6 && (
                <div className="space-y-4">
                  {form.certifications.map((cert, i) => (
                    <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Certification Entry {i + 1}</span>
                        {form.certifications.length > 1 && (
                          <button onClick={() => remCert(i)} className="text-red-500 hover:text-red-655 text-xs font-bold border-none bg-transparent cursor-pointer">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Certification / Award Name</label>
                          <input className={inputClass(`certifications_${i}_name`)} placeholder="AWS Certified Developer" value={cert.name} onChange={e => updateCert(i, "name", e.target.value)} />
                          {errors[`certifications_${i}_name`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`certifications_${i}_name`]}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Issuer / Organization</label>
                          <input className={inputClass(`certifications_${i}_issuer`)} placeholder="Amazon Web Services" value={cert.issuer} onChange={e => updateCert(i, "issuer", e.target.value)} />
                          {errors[`certifications_${i}_issuer`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`certifications_${i}_issuer`]}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Date Issued</label>
                          <input className={inputClass(`certifications_${i}_date`)} placeholder="2024" value={cert.date} onChange={e => updateCert(i, "date", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addCert} className="flex items-center gap-2 text-xs font-bold text-aurora-primary hover:text-aurora-primary-hover border-none bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Certification</button>
                </div>
              )}

              {/* STEP 7: Review */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Review Structured Details
                    </h3>
                    <p className="text-xs text-zinc-500">Double check your structured information before publishing. You can click any step to go back and correct it.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Column 1 */}
                    <div className="space-y-4">
                      {/* Personal Info */}
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350 flex items-center gap-1.5"><User className="w-4 h-4 text-violet-500" /> Personal Details</h4>
                        <div className="text-xs space-y-1 text-zinc-650 dark:text-zinc-400 font-medium">
                          <p><span className="font-bold text-zinc-500">Name:</span> {form.personalInfo.fullName || "-"}</p>
                          <p><span className="font-bold text-zinc-500">Email:</span> {form.personalInfo.email || "-"}</p>
                          <p><span className="font-bold text-zinc-500">Phone:</span> {form.personalInfo.phone || "-"}</p>
                          <p><span className="font-bold text-zinc-500">Location:</span> {form.personalInfo.location || "-"}</p>
                          <p className="leading-relaxed"><span className="font-bold text-zinc-500">Summary:</span> {form.personalInfo.summary || "-"}</p>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350 flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-emerald-500" /> Education</h4>
                        <div className="space-y-2 text-xs">
                          {form.education.map((edu, idx) => (
                            <div key={idx} className="pb-2 last:pb-0 border-b border-zinc-100 dark:border-zinc-900 last:border-none">
                              <p className="font-bold text-zinc-800 dark:text-zinc-300">{edu.degree || "-"}</p>
                              <p className="text-zinc-550 dark:text-zinc-455">{edu.college || "-"} ({edu.year || "-"})</p>
                              {edu.cgpa && <p className="text-[10px] text-zinc-400">CGPA/Marks: {edu.cgpa}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350 flex items-center gap-1.5"><Wrench className="w-4 h-4 text-indigo-500" /> Core Skills</h4>
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Technical Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {form.skills.technical.map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900 font-semibold">{tag}</span>
                              ))}
                            </div>
                          </div>
                          {form.skills.soft.length > 0 && (
                            <div>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Soft Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {form.skills.soft.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 font-semibold">{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                      {/* Projects */}
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350 flex items-center gap-1.5"><FolderKanban className="w-4 h-4 text-amber-500" /> Projects</h4>
                        <div className="space-y-2 text-xs">
                          {form.projects.map((proj, idx) => (
                            <div key={idx} className="pb-2 last:pb-0 border-b border-zinc-100 dark:border-zinc-900 last:border-none">
                              <p className="font-bold text-zinc-800 dark:text-zinc-300">{proj.title || "-"}</p>
                              <p className="text-zinc-500 dark:text-zinc-450 line-clamp-2 leading-relaxed">{proj.description || "-"}</p>
                              {proj.techStack && <p className="text-[10px] text-zinc-400 mt-0.5">Stack: {proj.techStack}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2.5">
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-blue-500" /> Experience</h4>
                        <div className="space-y-2 text-xs">
                          {form.experience.map((exp, idx) => (
                            <div key={idx} className="pb-2 last:pb-0 border-b border-zinc-100 dark:border-zinc-900 last:border-none">
                              <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-300">
                                <span>{exp.role || "-"}</span>
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{exp.type}</span>
                              </div>
                              <p className="text-zinc-550 dark:text-zinc-450">{exp.company || "-"} ({exp.duration || "-"})</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      {form.certifications.length > 0 && form.certifications.some(c => c.name) && (
                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2.5">
                          <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-350 flex items-center gap-1.5"><ScrollText className="w-4 h-4 text-pink-500" /> Certifications</h4>
                          <div className="space-y-2 text-xs">
                            {form.certifications.filter(c => c.name).map((cert, idx) => (
                              <div key={idx}>
                                <p className="font-bold text-zinc-800 dark:text-zinc-300">{cert.name}</p>
                                <p className="text-zinc-500 dark:text-zinc-450">{cert.issuer} {cert.date ? `(${cert.date})` : ""}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button 
                  onClick={step === 1 ? () => onNavigate?.("overview") : handlePrev} 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-transparent transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> {step === 1 ? "Back: Overview" : "Previous"}
                </button>
                <div className="flex items-center gap-3">
                  {step < 7 ? (
                    <button 
                      onClick={handleNext} 
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/10 transition-all border-none cursor-pointer"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleEnhanceWithAI} 
                        disabled={isEnhancing}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-md shadow-violet-500/10 transition-all border-none cursor-pointer"
                      >
                        {isEnhancing ? (
                          <><Loader2 className="w-4 h-4 animate-spin text-white" /> Enhancing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4 text-white" /> Enhance with AI</>
                        )}
                      </button>
                      <Button 
                        onClick={handlePublish} 
                        isLoading={isFinishing} 
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-605 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition-all border-none cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Finish & Save Resume
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right column: Live Render Preview (Hidden on Review Step for wide reading) */}
        {step < 7 && (
          <div className="lg:col-span-5 h-full">
            <div className="sticky top-4">
              <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 text-center">Live Preview</div>
              <ResumePreview data={previewData} template="modern" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
