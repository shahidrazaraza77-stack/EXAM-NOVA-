"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, File, Share2, Link as LinkIcon, CheckCircle2, Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import ResumePreview from "./ResumePreview";
import { mockTemplates, mockResumeData } from "../mockData";
import { supabase } from "@/lib/supabase";

const itemVariants = { 
  hidden: { opacity: 0, y: 15 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } 
};

interface TemplatesTabProps {
  activeResume: any | null;
  setActiveResume?: (resume: any) => void;
  refreshResumes?: () => void;
  onNavigate?: (tab: string) => void;
}

export default function TemplatesTab({ 
  activeResume, 
  setActiveResume, 
  refreshResumes, 
  onNavigate 
}: TemplatesTabProps) {
  const [selected, setSelected] = useState("modern");
  const [zoom, setZoom] = useState(85);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Auto-parsing logic for unstructured uploaded resumes
  useEffect(() => {
    const autoParseUnstructured = async () => {
      if (activeResume && !activeResume.content) {
        const textToParse = activeResume.improved_content || activeResume.parsed_content;
        if (textToParse && textToParse.trim()) {
          setIsParsing(true);
          try {
            const res = await fetch("/api/resume/parse-markdown", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ markdownText: textToParse })
            });
            const data = await res.json();
            if (res.ok && data.structuredData) {
              const { data: updatedResume, error } = await supabase
                .from("resumes")
                .update({ 
                  content: data.structuredData, 
                  updated_at: new Date().toISOString() 
                })
                .eq("id", activeResume.id)
                .select()
                .single();

              if (!error && updatedResume) {
                if (setActiveResume) setActiveResume(updatedResume);
                if (refreshResumes) refreshResumes();
              }
            }
          } catch (err) {
            console.error("Auto-parse uploaded resume error:", err);
          } finally {
            setIsParsing(false);
          }
        }
      }
    };

    autoParseUnstructured();
  }, [activeResume?.id]);

  // Map activeResume structured content to previewData
  let previewData = mockResumeData;

  if (activeResume && activeResume.content) {
    const form = activeResume.content;
    previewData = {
      header: {
        name: form.personalInfo?.fullName || "Your Name",
        title: form.personalInfo?.title || (activeResume?.target_company ? `${activeResume.target_company} Candidate` : "Software Developer"),
        email: form.personalInfo?.email || "email@example.com",
        phone: form.personalInfo?.phone || "+1 234 567 890",
        location: form.personalInfo?.location || "City, State",
        linkedin: form.personalInfo?.linkedin || "linkedin.com/in/you",
        github: form.personalInfo?.github || "github.com/you"
      },
      summary: form.personalInfo?.summary || "Results-driven Software Developer with expertise in building scalable applications and resolving technical challenges.",
      education: (form.education || []).map((e: any) => ({
        institution: e.college || "University",
        degree: e.degree || "Degree",
        date: e.year || "2024",
        gpa: e.cgpa || "3.5/4.0",
        details: e.details || ""
      })),
      skills: {
        languages: form.skills?.languages?.length ? form.skills.languages : ["JavaScript", "TypeScript"],
        frontend: form.skills?.technical?.slice(0, 4) || ["React"],
        backend: form.skills?.tools?.slice(0, 4) || ["Node.js"],
        tools: form.skills?.tools || ["Git"]
      },
      projects: (form.projects || []).filter((p: any) => p.title).map((p: any) => ({
        title: p.title,
        technologies: (p.techStack || "").split(",").map((s: string) => s.trim()),
        date: "2024",
        bullets: [p.description]
      })),
      experience: (form.experience || []).filter((e: any) => e.company).map((e: any) => ({
        company: e.company,
        role: e.role,
        date: e.duration,
        location: "Remote",
        bullets: [e.responsibilities]
      })),
      certifications: (form.certifications || []).filter((c: any) => c.name).map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        date: c.date
      }))
    };
  }

  // Client-side DOCX exporter function
  const exportToDoc = (data: any) => {
    const header = data.header || {};
    const summary = data.summary || "";
    const education = data.education || [];
    const skills = data.skills || { languages: [], frontend: [], backend: [], tools: [] };
    const projects = data.projects || [];
    const experience = data.experience || [];
    const certifications = data.certifications || [];

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${header.name} - Resume</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Arial', sans-serif;
            color: #333333;
            line-height: 1.4;
            font-size: 11pt;
          }
          h1 {
            font-size: 24pt;
            margin-bottom: 2pt;
            color: #111111;
            font-weight: bold;
          }
          h2 {
            font-size: 12pt;
            color: #4f46e5;
            text-transform: uppercase;
            margin-top: 15pt;
            margin-bottom: 5pt;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2pt;
            font-weight: bold;
          }
          .subtitle {
            font-size: 12pt;
            color: #4f46e5;
            margin-bottom: 10pt;
          }
          .contact-info {
            font-size: 9pt;
            color: #6b7280;
            margin-bottom: 15pt;
          }
          .section-item {
            margin-bottom: 10pt;
          }
          ul {
            margin: 2pt 0 5pt 15pt;
            padding: 0;
          }
          li {
            margin-bottom: 2pt;
          }
          .skills-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5pt;
          }
          .skills-table td {
            padding: 3pt 0;
            vertical-align: top;
          }
          .skills-label {
            font-weight: bold;
            width: 100px;
          }
        </style>
      </head>
      <body>
        <div style="text-align: center;">
          <h1>${header.name}</h1>
          <div class="subtitle">${header.title}</div>
          <div class="contact-info">
            ${header.email} | ${header.phone} | ${header.location}<br>
            ${header.linkedin ? `LinkedIn: ${header.linkedin}` : ""} ${header.github ? `| GitHub: ${header.github}` : ""}
          </div>
        </div>

        ${summary ? `
          <h2>Professional Summary</h2>
          <p>${summary}</p>
        ` : ""}

        ${experience.length > 0 ? `
          <h2>Experience</h2>
          ${experience.map((exp: any) => `
            <div class="section-item">
              <table style="width:100%">
                <tr>
                  <td style="font-weight:bold">${exp.role}</td>
                  <td style="text-align:right; font-size:9pt; color:#6b7280">${exp.date}</td>
                </tr>
                <tr>
                  <td style="font-style:italic; font-size:10pt; color:#4b5563">${exp.company} - ${exp.location || "Remote"}</td>
                  <td></td>
                </tr>
              </table>
              <ul>
                ${(exp.bullets || []).map((bullet: string) => `<li>${bullet}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        ` : ""}

        ${projects.length > 0 ? `
          <h2>Projects</h2>
          ${projects.map((proj: any) => `
            <div class="section-item">
              <table style="width:100%">
                <tr>
                  <td style="font-weight:bold">${proj.title}</td>
                  <td style="text-align:right; font-size:9pt; color:#6b7280">${proj.date}</td>
                </tr>
              </table>
              ${proj.technologies && proj.technologies.length > 0 ? `<div style="font-size:9pt; color:#6b7280; font-family:Consolas, monospace; margin-bottom:2pt">Technologies: ${proj.technologies.join(", ")}</div>` : ""}
              <ul>
                ${(proj.bullets || []).map((bullet: string) => `<li>${bullet}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        ` : ""}

        ${education.length > 0 ? `
          <h2>Education</h2>
          ${education.map((edu: any) => `
            <div class="section-item">
              <table style="width:100%">
                <tr>
                  <td style="font-weight:bold">${edu.institution}</td>
                  <td style="text-align:right; font-size:9pt; color:#6b7280">${edu.date}</td>
                </tr>
                <tr>
                  <td style="font-style:italic; font-size:10pt; color:#4b5563">${edu.degree}</td>
                  <td style="text-align:right; font-size:9pt; font-weight:bold; color:#4b5563">${edu.gpa ? `GPA: ${edu.gpa}` : ""}</td>
                </tr>
              </table>
              ${edu.details ? `<p style="font-size:9pt; margin-top:2pt">${edu.details}</p>` : ""}
            </div>
          `).join("")}
        ` : ""}

        <h2>Skills</h2>
        <table class="skills-table">
          ${skills.languages && skills.languages.length > 0 ? `
            <tr>
              <td class="skills-label">Languages:</td>
              <td>${skills.languages.join(", ")}</td>
            </tr>
          ` : ""}
          ${skills.frontend && skills.frontend.length > 0 ? `
            <tr>
              <td class="skills-label">Frontend:</td>
              <td>${skills.frontend.join(", ")}</td>
            </tr>
          ` : ""}
          ${skills.backend && skills.backend.length > 0 ? `
            <tr>
              <td class="skills-label">Backend:</td>
              <td>${skills.backend.join(", ")}</td>
            </tr>
          ` : ""}
          ${skills.tools && skills.tools.length > 0 ? `
            <tr>
              <td class="skills-label">Tools:</td>
              <td>${skills.tools.join(", ")}</td>
            </tr>
          ` : ""}
        </table>

        ${certifications.length > 0 ? `
          <h2>Certifications</h2>
          <table style="width:100%; font-size:10pt">
            ${certifications.map((cert: any) => `
              <tr>
                <td style="font-weight:bold">${cert.name}</td>
                <td style="text-align:right; color:#6b7280">${cert.issuer} ${cert.date ? `• ${cert.date}` : ""}</td>
              </tr>
            `).join("")}
          </table>
        ` : ""}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "application/msword"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${header.name.replace(/\s+/g, "_")}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (type: "pdf" | "docx") => {
    setDownloading(type);
    if (type === "pdf") {
      setTimeout(() => {
        setDownloading(null);
        window.print();
      }, 1000);
    } else {
      setTimeout(() => {
        setDownloading(null);
        exportToDoc(previewData);
      }, 1000);
    }
  };

  if (isParsing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-650 animate-spin" />
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Converting resume text into interactive templates...</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8 print:p-0 print:m-0" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="visible">
      <motion.div className="space-y-1 print:hidden" variants={itemVariants}>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Resume Templates</h2>
        <p className="text-sm text-zinc-500">Choose a professional template and preview your resume in real-time.</p>
      </motion.div>

      {/* Template Selection Grid */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 print:hidden" variants={itemVariants}>
        {mockTemplates.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button key={t.id} onClick={() => setSelected(t.id)} className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 bg-white dark:bg-zinc-950 border-none cursor-pointer group ${isSelected ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10" : "hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700"}`}>
              <div className="h-28 rounded-xl bg-zinc-50 dark:bg-zinc-900 p-3 flex flex-col gap-1.5 mb-3 border border-zinc-100 dark:border-zinc-800 overflow-hidden relative">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                  <div className="h-1.5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="space-y-1 mt-1">
                  <div className="h-1 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-1 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 space-y-1">
                    <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-1 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                  <div className="w-8 space-y-1">
                    <div className="h-1 w-full rounded-full" style={{ backgroundColor: t.primaryColor, opacity: 0.4 }} />
                    <div className="h-1 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.name}</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{t.description}</p>
            </button>
          );
        })}
      </motion.div>

      {/* Preview Section */}
      <motion.div variants={itemVariants} className="print:block">
        <ResumePreview data={previewData} template={selected} zoom={zoom} onZoomChange={setZoom} />
      </motion.div>

      {/* Download Box */}
      <motion.div variants={itemVariants} className="print:hidden">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-500" /> Download & Share Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => handleDownload("pdf")} disabled={downloading !== null} className="flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 transition-all bg-white dark:bg-zinc-950 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <File className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Download PDF</p>
                <p className="text-[10px] text-zinc-500">Save formatted resume for printing</p>
              </div>
              {downloading === "pdf" ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Download className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />}
            </button>
            <button onClick={() => handleDownload("docx")} disabled={downloading !== null} className="flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-zinc-950 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <File className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Download DOCX</p>
                <p className="text-[10px] text-zinc-500">Editable Microsoft Word document</p>
              </div>
              {downloading === "docx" ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Download className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />}
            </button>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">Share your resume via a secure link</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:w-48 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 font-mono truncate">
                examnova.com/r/{activeResume?.id ? activeResume.id.slice(0, 8) : "default"}
              </div>
              <button onClick={() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all border-none cursor-pointer">
                {copiedLink ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><LinkIcon className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Navigation Footer */}
      {onNavigate && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-8 print:hidden">
          <button
            onClick={() => onNavigate("match")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-transparent transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back: Job Match
          </button>
          <button
            onClick={() => onNavigate("history")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/10 transition-all border-none cursor-pointer"
          >
            Next: Version History <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
