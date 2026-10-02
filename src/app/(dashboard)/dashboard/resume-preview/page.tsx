"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import {
  ZoomIn, ZoomOut, Printer, Download, FileText,
  Target, Building2, FileSignature,
  GripVertical, Edit3, CheckCircle2,
  Plus, Trash2,
  Eye, RefreshCw, Palette,
  Save, Undo2, Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type SectionType = "summary" | "experience" | "education" | "skills" | "projects" | "certifications";

const sectionLabels: Record<SectionType, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
};

interface ResumeHeader {
  name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string;
}
interface Education { institution: string; degree: string; date: string; gpa: string; details: string; }
interface Project { title: string; technologies: string[]; date: string; bullets: string[]; }
interface Experience { company: string; role: string; date: string; location: string; bullets: string[]; }
interface Certification { name: string; issuer: string; date: string; }

interface ResumeData {
  header: ResumeHeader;
  summary: string;
  education: Education[];
  skills: string[][];
  skillLabels: string[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
}

interface TemplateStyle {
  id: string; name: string; description: string;
  nameClass: string; titleClass: string; headerClass: string;
  contactClass: string; sectionClass: string; bodyClass: string;
  accentColor: string; bgClass: string; previewColor: string;
}

const templates: TemplateStyle[] = [
  { id: "modern", name: "Modern", description: "Clean lines with vibrant indigo accents", previewColor: "#6366f1",
    nameClass: "text-3xl font-bold text-zinc-900 mb-1", titleClass: "text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4",
    headerClass: "border-b-2 border-indigo-500 pb-6 mb-6", contactClass: "text-[10px] text-zinc-500",
    sectionClass: "text-xs font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-200 pb-1 mb-3",
    bodyClass: "text-[11px] text-zinc-700", accentColor: "#6366f1", bgClass: "bg-white" },
  { id: "professional", name: "Professional", description: "Bold header block with dark formal tones", previewColor: "#1e293b",
    nameClass: "text-3xl font-bold text-white mb-1", titleClass: "text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2",
    headerClass: "bg-zinc-800 -mx-[15mm] -mt-[15mm] px-[15mm] pt-[18mm] pb-6 mb-6", contactClass: "text-[10px] text-zinc-400",
    sectionClass: "text-xs font-bold uppercase tracking-wider text-zinc-800 border-b-2 border-zinc-400 pb-1 mb-3",
    bodyClass: "text-[11px] text-zinc-700", accentColor: "#1e293b", bgClass: "bg-white" },
  { id: "minimal", name: "Minimal", description: "Focus on typography and whitespace", previewColor: "#18181b",
    nameClass: "text-3xl font-light text-zinc-900 mb-1 tracking-wide", titleClass: "text-sm font-light text-zinc-500 mb-4",
    headerClass: "border-b border-zinc-200 pb-6 mb-6", contactClass: "text-[10px] text-zinc-400",
    sectionClass: "text-xs font-light uppercase tracking-widest text-zinc-500 border-b border-zinc-100 pb-1 mb-3",
    bodyClass: "text-[11px] text-zinc-600 font-light leading-relaxed", accentColor: "#18181b", bgClass: "bg-white" },
  { id: "corporate", name: "Corporate", description: "Traditional serif layout for formal roles", previewColor: "#1e3a5f",
    nameClass: "text-3xl font-serif font-bold text-zinc-900 mb-1", titleClass: "text-sm font-serif font-semibold text-blue-900 uppercase tracking-wider mb-4",
    headerClass: "border-b-2 border-blue-900 pb-6 mb-6", contactClass: "text-[10px] text-blue-800/70",
    sectionClass: "text-xs font-serif font-bold uppercase tracking-wider text-blue-900 border-b border-blue-300 pb-1 mb-3",
    bodyClass: "text-[11px] text-zinc-700 font-serif", accentColor: "#1e3a5f", bgClass: "bg-white" },
  { id: "student", name: "Student", description: "Highlight education and projects for entry-level", previewColor: "#0d9488",
    nameClass: "text-3xl font-bold text-zinc-900 mb-1", titleClass: "text-sm font-semibold text-teal-600 uppercase tracking-wider mb-4",
    headerClass: "border-b-2 border-teal-500 pb-6 mb-6", contactClass: "text-[10px] text-teal-700/70",
    sectionClass: "text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-200 pb-1 mb-3",
    bodyClass: "text-[11px] text-zinc-700", accentColor: "#0d9488", bgClass: "bg-white" },
  { id: "elegant", name: "Elegant", description: "Gold accents with sophisticated serif style", previewColor: "#b45309",
    nameClass: "text-3xl font-serif font-bold text-zinc-900 mb-1", titleClass: "text-sm font-serif italic text-amber-700 mb-4",
    headerClass: "border-b border-amber-300 pb-6 mb-6", contactClass: "text-[10px] text-amber-800/60",
    sectionClass: "text-xs font-serif font-bold uppercase tracking-wider text-amber-800 border-b border-amber-200 pb-1 mb-3",
    bodyClass: "text-[11px] text-zinc-700 font-serif", accentColor: "#b45309", bgClass: "bg-white" },
];

const defaultResumeData: ResumeData = {
  header: { name: "John Doe", title: "Full Stack Software Engineer", email: "john.doe@example.com", phone: "+1 (555) 123-4567", location: "San Francisco, CA", linkedin: "linkedin.com/in/johndoe", github: "github.com/johndoe" },
  summary: "Results-driven Software Engineer with 3+ years of experience in building scalable web applications. Proficient in React, Node.js, and Java. Passionate about writing clean, maintainable code and solving complex technical challenges.",
  education: [{ institution: "University of Technology", degree: "B.Sc. in Computer Science", date: "2018 - 2022", gpa: "3.8/4.0", details: "Relevant Coursework: Data Structures, Algorithms, Database Management, Web Development." }],
  skills: [["JavaScript", "TypeScript", "Java", "Python", "SQL"], ["React", "Next.js", "Tailwind CSS", "Redux", "HTML/CSS"], ["Node.js", "Express", "Spring Boot", "REST APIs"], ["Git", "PostgreSQL", "MongoDB", "Figma"]],
  skillLabels: ["Languages", "Frontend", "Backend", "Tools"],
  projects: [
    { title: "E-Commerce Platform", technologies: ["React", "Node.js", "MongoDB", "Stripe"], date: "Jan 2023 - Present", bullets: ["Developed a full-stack e-commerce application supporting 10,000+ products.", "Implemented secure payment processing using Stripe API.", "Optimized database queries, reducing load times by 30%."] },
    { title: "Real-time Chat Application", technologies: ["React", "Socket.io", "Express"], date: "Aug 2022 - Dec 2022", bullets: ["Built a real-time messaging app with WebSockets.", "Designed responsive UI components using Tailwind CSS.", "Handled concurrent connections effectively without latency."] },
  ],
  experience: [{ company: "Tech Solutions Inc.", role: "Frontend Developer Intern", date: "May 2021 - Aug 2021", location: "Remote", bullets: ["Collaborated with a team of 5 to develop internal dashboard tools.", "Refactored legacy code to React functional components, improving render performance.", "Participated in daily stand-ups and agile development cycles."] }],
  certifications: [],
};

const STORAGE_RESUME = "rp_resume_data";
const STORAGE_TEMPLATE = "rp_template_id";
const STORAGE_ORDER = "rp_section_order";
const STORAGE_ZOOM = "rp_zoom";

const defaultOrder: SectionType[] = ["summary", "experience", "education", "skills", "projects", "certifications"];

function cls(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key: string, value: any) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  const add = () => onChange([...bullets, ""]);
  const remove = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));
  const update = (i: number, v: string) => onChange(bullets.map((b, idx) => idx === i ? v : b));

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="text-zinc-400 mt-1 text-[10px]">•</span>
          <input value={b} onChange={e => update(i, e.target.value)} className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 px-1 py-0.5 text-[11px] outline-none focus:border-indigo-400" placeholder="Add a bullet point..." />
          <button onClick={() => remove(i)} className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-[10px] text-aurora-primary hover:text-aurora-primary-hover font-medium bg-transparent border-none cursor-pointer"><Plus className="w-3 h-3" /> Add bullet</button>
    </div>
  );
}

function ResumeA4Preview({ data, template, sectionOrder }: { data: ResumeData; template: TemplateStyle; sectionOrder: SectionType[] }) {
  const s = template;
  const renderSection = (type: SectionType) => {
    switch (type) {
      case "summary":
        return data.summary ? (
          <section key="summary" className="mb-5">
            <h3 className={s.sectionClass}>Professional Summary</h3>
            <p className={cls(s.bodyClass, "leading-relaxed")}>{data.summary}</p>
          </section>
        ) : null;

      case "experience":
        return data.experience.length > 0 ? (
          <section key="experience" className="mb-5">
            <h3 className={s.sectionClass}>Experience</h3>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-[11px] font-bold text-zinc-800">{exp.role}</h4>
                    <span className="text-[9px] text-zinc-500">{exp.date}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[10px] italic text-zinc-600">{exp.company}</span>
                    <span className="text-[9px] text-zinc-400">{exp.location}</span>
                  </div>
                  <ul className="list-disc list-inside text-[10px] text-zinc-700 space-y-0.5 pl-1">
                    {exp.bullets.map((b, idx) => <li key={idx} className="leading-relaxed">{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case "education":
        return data.education.length > 0 ? (
          <section key="education" className="mb-5">
            <h3 className={s.sectionClass}>Education</h3>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-[11px] font-bold text-zinc-800">{edu.institution}</h4>
                    <span className="text-[9px] text-zinc-500">{edu.date}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] italic text-zinc-700">{edu.degree}</span>
                    <span className="text-[9px] font-bold text-zinc-600">GPA: {edu.gpa}</span>
                  </div>
                  {edu.details && <p className="text-[9px] text-zinc-500 mt-0.5">{edu.details}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case "skills":
        return (
          <section key="skills" className="mb-5">
            <h3 className={s.sectionClass}>Skills</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px]">
              {data.skillLabels.map((label, i) => (
                data.skills[i] && data.skills[i].length > 0 ? (
                  <div key={i}><span className="font-bold text-zinc-700">{label}:</span> <span className="text-zinc-600">{data.skills[i].join(", ")}</span></div>
                ) : null
              ))}
            </div>
          </section>
        );

      case "projects":
        return data.projects.length > 0 ? (
          <section key="projects" className="mb-5">
            <h3 className={s.sectionClass}>Projects</h3>
            <div className="space-y-4">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-[11px] font-bold text-zinc-800">{proj.title}</h4>
                    <span className="text-[9px] text-zinc-500">{proj.date}</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 mb-1 font-mono">[{proj.technologies.join(", ")}]</p>
                  <ul className="list-disc list-inside text-[10px] text-zinc-700 space-y-0.5 pl-1">
                    {proj.bullets.map((b, idx) => <li key={idx} className="leading-relaxed">{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case "certifications":
        return data.certifications.length > 0 ? (
          <section key="certifications" className="mb-5">
            <h3 className={s.sectionClass}>Certifications</h3>
            <div className="space-y-2">
              {data.certifications.map((cert, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="font-semibold text-zinc-700">{cert.name}</span>
                  <span className="text-zinc-500">{cert.issuer} &bull; {cert.date}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null;
    }
  };

  return (
    <div className={cls(s.bgClass, "shadow-xl transition-shadow mx-auto will-change-transform")} style={{ width: "210mm", minHeight: "297mm", padding: "15mm", transform: "translateZ(0)" }}>
      <header className={s.headerClass}>
        <h1 className={s.nameClass}>{data.header.name}</h1>
        <h2 className={s.titleClass}>{data.header.title}</h2>
        <div className={cls("flex flex-wrap items-center justify-center gap-x-4 gap-y-1", s.contactClass)}>
          <span>{data.header.email}</span><span className="text-zinc-300">|</span>
          <span>{data.header.phone}</span><span className="text-zinc-300">|</span>
          <span>{data.header.location}</span>
          {data.header.linkedin && <><span className="text-zinc-300">|</span><span>{data.header.linkedin}</span></>}
          {data.header.github && <><span className="text-zinc-300">|</span><span>{data.header.github}</span></>}
        </div>
      </header>
      {sectionOrder.map(s => renderSection(s))}
    </div>
  );
}

function TemplateThumbnail({ template }: { template: TemplateStyle }) {
  return (
    <div className="h-14 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-2 flex flex-col gap-1 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: template.previewColor }} />
        <div className="h-1.5 w-4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="space-y-0.5 mt-0.5">
        <div className="h-1 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-1 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="flex gap-1.5 mt-0.5">
        <div className="flex-1 space-y-0.5">
          <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-1 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="w-5 space-y-0.5">
          <div className="h-1 w-full rounded-full opacity-40" style={{ backgroundColor: template.previewColor }} />
          <div className="h-1 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, data, onChange }: { section: SectionType; data: ResumeData; onChange: (d: ResumeData) => void }) {
  const set = useCallback(<K extends keyof ResumeData>(key: K, val: ResumeData[K]) => onChange({ ...data, [key]: val }), [data, onChange]);

  const updateSkill = (groupIdx: number, items: string[]) => {
    const newSkills = [...data.skills];
    newSkills[groupIdx] = items;
    set("skills", newSkills);
  };

  const updateSkillLabel = (groupIdx: number, label: string) => {
    const newLabels = [...data.skillLabels];
    newLabels[groupIdx] = label;
    set("skillLabels", newLabels);
  };

  const addSkillGroup = () => {
    set("skills", [...data.skills, []]);
    set("skillLabels", [...data.skillLabels, "New"]);
  };

  const removeSkillGroup = (idx: number) => {
    set("skills", data.skills.filter((_, i) => i !== idx));
    set("skillLabels", data.skillLabels.filter((_, i) => i !== idx));
  };

  const addToList = <T,>(key: "education" | "projects" | "experience" | "certifications", empty: T) => {
    set(key, [...(data[key] as any), empty] as any);
  };

  const removeFromList = <T,>(key: "education" | "projects" | "experience" | "certifications", idx: number) => {
    set(key, (data[key] as any).filter((_: T, i: number) => i !== idx) as any);
  };

  const updateInList = <T,>(key: "education" | "projects" | "experience" | "certifications", idx: number, field: string, value: any) => {
    const list = [...(data[key] as any)];
    list[idx] = { ...list[idx], [field]: value };
    set(key, list as any);
  };

  const updateBullets = (key: "projects" | "experience", idx: number, bullets: string[]) => {
    const list = [...(data[key] as any)];
    list[idx] = { ...list[idx], bullets };
    set(key, list as any);
  };

  switch (section) {
    case "summary":
      return (
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-500 leading-relaxed">Your professional summary is the first thing recruiters read. Keep it concise and impactful.</p>
          <textarea value={data.summary} onChange={e => set("summary", e.target.value)}
            className="w-full min-h-[140px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
            placeholder="Write a compelling professional summary..." />
        </div>
      );

    case "experience":
      return (
        <div className="space-y-4">
          {data.experience.map((exp, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Position {i + 1}</span>
                <button onClick={() => removeFromList("experience", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Company</label><input value={exp.company} onChange={e => updateInList("experience", i, "company", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Company name" /></div>
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Role</label><input value={exp.role} onChange={e => updateInList("experience", i, "role", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Job title" /></div>
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Date</label><input value={exp.date} onChange={e => updateInList("experience", i, "date", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="May 2021 - Aug 2021" /></div>
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Location</label><input value={exp.location} onChange={e => updateInList("experience", i, "location", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Remote / City" /></div>
              </div>
              <div><label className="text-[9px] font-medium text-zinc-500 block mb-1">Bullet Points</label><BulletEditor bullets={exp.bullets} onChange={b => updateBullets("experience", i, b)} /></div>
            </div>
          ))}
          <button onClick={() => addToList("experience", { company: "", role: "", date: "", location: "", bullets: [""] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Experience</button>
        </div>
      );

    case "education":
      return (
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Education {i + 1}</span>
                <button onClick={() => removeFromList("education", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Institution</label><input value={edu.institution} onChange={e => updateInList("education", i, "institution", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="University name" /></div>
                <div className="col-span-2"><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Degree</label><input value={edu.degree} onChange={e => updateInList("education", i, "degree", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="B.Sc. in Computer Science" /></div>
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Date</label><input value={edu.date} onChange={e => updateInList("education", i, "date", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="2018 - 2022" /></div>
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">GPA</label><input value={edu.gpa} onChange={e => updateInList("education", i, "gpa", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="3.8/4.0" /></div>
                <div className="col-span-2"><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Details (optional)</label><input value={edu.details} onChange={e => updateInList("education", i, "details", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Relevant coursework, honors, etc." /></div>
              </div>
            </div>
          ))}
          <button onClick={() => addToList("education", { institution: "", degree: "", date: "", gpa: "", details: "" })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Education</button>
        </div>
      );

    case "skills":
      return (
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-500">Group your skills by category (e.g. Languages, Frontend, Backend, Tools).</p>
          {data.skillLabels.map((label, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <input value={label} onChange={e => updateSkillLabel(i, e.target.value)} className="font-bold text-xs bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-400 outline-none px-1 py-0.5 w-28" placeholder="Category name" />
                <button onClick={() => removeSkillGroup(i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="w-3 h-3" /></button>
              </div>
              <input value={data.skills[i]?.join(", ") || ""} onChange={e => updateSkill(i, e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Skill1, Skill2, Skill3" />
            </div>
          ))}
          <button onClick={addSkillGroup} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-aurora-border text-xs font-medium text-aurora-text-muted hover:text-aurora-primary hover:border-aurora-primary transition-colors bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Skill Group</button>
        </div>
      );

    case "projects":
      return (
        <div className="space-y-4">
          {data.projects.map((proj, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Project {i + 1}</span>
                <button onClick={() => removeFromList("projects", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Title</label><input value={proj.title} onChange={e => updateInList("projects", i, "title", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Project title" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Technologies (comma separated)</label><input value={proj.technologies.join(", ")} onChange={e => updateInList("projects", i, "technologies", e.target.value.split(",").map(s => s.trim()))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="React, Node.js, MongoDB" /></div>
                <div className="col-span-2"><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Date</label><input value={proj.date} onChange={e => updateInList("projects", i, "date", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Jan 2023 - Present" /></div>
              </div>
              <div><label className="text-[9px] font-medium text-zinc-500 block mb-1">Bullet Points</label><BulletEditor bullets={proj.bullets} onChange={b => updateBullets("projects", i, b)} /></div>
            </div>
          ))}
          <button onClick={() => addToList("projects", { title: "", technologies: [], date: "", bullets: [""] })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Project</button>
        </div>
      );

    case "certifications":
      return (
        <div className="space-y-4">
          {data.certifications.length === 0 && (
            <p className="text-[11px] text-zinc-400 italic text-center py-4">No certifications added yet.</p>
          )}
          {data.certifications.map((cert, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Certification {i + 1}</span>
                <button onClick={() => removeFromList("certifications", i)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Name</label><input value={cert.name} onChange={e => updateInList("certifications", i, "name", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="AWS Certified Developer" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Issuer</label><input value={cert.issuer} onChange={e => updateInList("certifications", i, "issuer", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Amazon" /></div>
                <div><label className="text-[9px] font-medium text-zinc-500 block mb-0.5">Date</label><input value={cert.date} onChange={e => updateInList("certifications", i, "date", e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" placeholder="2024" /></div>
              </div>
            </div>
          ))}
          <button onClick={() => addToList("certifications", { name: "", issuer: "", date: "" })} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors bg-transparent cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Certification</button>
        </div>
      );
  }
}

export default function ResumePreviewPage() {
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [templateId, setTemplateId] = useState("modern");
  const [sectionOrder, setSectionOrder] = useState<SectionType[]>([...defaultOrder]);
  const [zoom, setZoom] = useState(80);
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const template = templates.find(t => t.id === templateId) || templates[0];

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = loadFromStorage<ResumeData | null>(STORAGE_RESUME, null);
    if (savedData) setData(savedData);
    const savedTemplate = loadFromStorage<string>(STORAGE_TEMPLATE, "modern");
    if (templates.some(t => t.id === savedTemplate)) setTemplateId(savedTemplate);
    const savedOrder = loadFromStorage<SectionType[]>(STORAGE_ORDER, defaultOrder);
    setSectionOrder(savedOrder);
    const savedZoom = loadFromStorage<number>(STORAGE_ZOOM, 80);
    setZoom(Math.min(Math.max(savedZoom, 40), 160));
  }, []);

  // Auto-save with debounce
  const save = useMemo(() => debounce((d: ResumeData, tid: string, order: SectionType[], z: number) => {
    saveToStorage(STORAGE_RESUME, d);
    saveToStorage(STORAGE_TEMPLATE, tid);
    saveToStorage(STORAGE_ORDER, order);
    saveToStorage(STORAGE_ZOOM, z);
    setLastSaved(new Date());
    setSaving(false);
  }, 800), []);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSaving(true);
    save(data, templateId, sectionOrder, zoom);
  }, [data, templateId, sectionOrder, zoom, save]);

  const updateData = useCallback((d: ResumeData) => setData(d), []);
  const updateHeader = useCallback(<K extends keyof ResumeHeader>(key: K, val: ResumeHeader[K]) => {
    setData(prev => ({ ...prev, header: { ...prev.header, [key]: val } }));
  }, []);

  const resetData = () => {
    setData(defaultResumeData);
    setTemplateId("modern");
    setSectionOrder([...defaultOrder]);
    setZoom(80);
    setActiveSection(null);
    setEditMode(false);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const styleEl = Array.from(document.querySelectorAll("style, link[rel=stylesheet]")).map(el => el.outerHTML).join("\n");
    const previewEl = document.getElementById("resume-a4-preview");
    if (!previewEl) return;
    const content = previewEl.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Resume - ${data.header.name}</title>${styleEl}
      <style>@page { margin: 0; } body { margin: 15mm; } .no-print { display: none !important; }</style>
      </head><body>${content}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const visibleSections = sectionOrder.filter(s => {
    switch (s) {
      case "summary": return !!data.summary;
      case "experience": return data.experience.length > 0;
      case "education": return data.education.length > 0;
      case "skills": return data.skills.some(g => g.length > 0);
      case "projects": return data.projects.length > 0;
      case "certifications": return data.certifications.length > 0;
    }
  });

  const lastSavedStr = lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ===== TOP HEADER ===== */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">Resume Preview</h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Live preview &bull; Real-time editing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 rounded-lg px-2.5 py-1.5">
              {saving ? (
                <><RefreshCw className="w-3 h-3 animate-spin text-indigo-500" /> Saving...</>
              ) : lastSaved ? (
                <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {lastSavedStr}</>
              ) : (
                <><Save className="w-3 h-3 text-zinc-400" /> Auto-save ready</>
              )}
            </div>
            <button onClick={resetData} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent border border-zinc-200 dark:border-zinc-800 text-[10px] font-medium text-aurora-text-muted hover:text-aurora-danger hover:border-aurora-danger transition-colors cursor-pointer"><Undo2 className="w-3 h-3" /> Reset</button>
          </div>
        </div>
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={editMode ? "primary" : "outline"} size="sm" onClick={() => setEditMode(!editMode)} className="gap-1.5">
            <Edit3 className="w-3.5 h-3.5" /> {editMode ? "Done Editing" : "Edit Resume"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Target className="w-3.5 h-3.5" /> Analyze ATS
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Optimize for Company
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSignature className="w-3.5 h-3.5" /> Generate Cover Letter
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== LEFT SIDEBAR ===== */}
          <div className={cls("w-full lg:w-80 shrink-0 space-y-4", !editMode && "lg:w-64")}>
            {/* Template Selector */}
            <Card>
              <CardHeader className="p-3.5 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" /> Template
                </CardTitle>
                <button onClick={() => setShowTemplatePicker(!showTemplatePicker)} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium bg-transparent border-none cursor-pointer">
                  {showTemplatePicker ? "Collapse" : "Change"}
                </button>
              </CardHeader>
              {showTemplatePicker && (
                <CardContent className="p-3.5 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => { setTemplateId(t.id); setShowTemplatePicker(false); }}
                        className={cls("p-2 rounded-xl border-2 transition-all text-left bg-transparent cursor-pointer",
                          templateId === t.id ? "border-indigo-500 ring-1 ring-indigo-400" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}>
                        <TemplateThumbnail template={t} />
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.previewColor }} />
                          <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">{t.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              )}
              {!showTemplatePicker && (
                <CardContent className="p-3.5 pt-2">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: template.previewColor }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{template.name}</p>
                      <p className="text-[9px] text-zinc-500">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Section Order (drag & drop) */}
            {editMode && (
              <Card>
                <CardHeader className="p-3.5 pb-0 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Section Order
                  </CardTitle>
                  <span className="text-[9px] text-zinc-400">Drag to reorder</span>
                </CardHeader>
                <CardContent className="p-3.5 pt-2">
                  <Reorder.Group axis="y" values={sectionOrder} onReorder={setSectionOrder} className="space-y-1">
                    {sectionOrder.map(s => (
                      <Reorder.Item key={s} value={s} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing select-none">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex-1">{sectionLabels[s]}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setActiveSection(activeSection === s ? null : s)}
                            className={cls("p-1 rounded-md transition-colors bg-transparent border-none cursor-pointer",
                              activeSection === s ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" : "text-zinc-400 hover:text-zinc-600"
                            )}>
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </CardContent>
              </Card>
            )}

            {/* Section Editor */}
            {editMode && activeSection && (
              <Card>
                <CardHeader className="p-3.5 pb-0 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {sectionLabels[activeSection]}
                  </CardTitle>
                  <button onClick={() => setActiveSection(null)} className="text-[9px] text-zinc-400 hover:text-zinc-600 bg-transparent border-none cursor-pointer">Close</button>
                </CardHeader>
                <CardContent className="p-3.5 pt-2 max-h-[500px] overflow-y-auto">
                  <SectionEditor section={activeSection} data={data} onChange={updateData} />
                </CardContent>
              </Card>
            )}

            {/* Header quick editor (always visible in edit mode) */}
            {editMode && (
              <Card>
                <CardHeader className="p-3.5 pb-0">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-500" /> Header Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3.5 pt-2 space-y-2">
                  {(["name", "title", "email", "phone", "location", "linkedin", "github"] as (keyof ResumeHeader)[]).map(field => (
                    <div key={field}>
                      <label className="text-[9px] font-medium text-zinc-500 block mb-0.5 capitalize">{field}</label>
                      <input value={data.header[field]} onChange={e => updateHeader(field, e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ===== RIGHT: PREVIEW ===== */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3 sticky top-28">
              {/* Zoom + Print Controls */}
              <div className="flex items-center justify-between bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Live Preview</span>
                  <span className="text-[9px] text-zinc-400 hidden sm:inline">A4 &bull; {template.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setZoom(Math.max(zoom - 10, 40))} className="p-1.5 rounded-lg hover:bg-aurora-card-hover transition-colors cursor-pointer text-aurora-text-muted border-none bg-transparent" title="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="text-[10px] font-mono w-8 text-center text-zinc-500">{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(zoom + 10, 160))} className="p-1.5 rounded-lg hover:bg-aurora-card-hover transition-colors cursor-pointer text-aurora-text-muted border-none bg-transparent" title="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                  <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-aurora-card-hover transition-colors cursor-pointer text-aurora-text-muted border-none bg-transparent" title="Print Preview"><Printer className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* A4 Preview */}
              <div className="overflow-auto max-h-[800px] flex justify-center bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <div className="transition-transform origin-top will-change-transform" style={{ transform: `scale(${zoom / 100}) translateZ(0)` }}>
                  <div id="resume-a4-preview">
                    <ResumeA4Preview data={data} template={template} sectionOrder={sectionOrder} />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {visibleSections.length} sections</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {template.name} template</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
