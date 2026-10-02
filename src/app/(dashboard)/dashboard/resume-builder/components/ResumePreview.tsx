"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const templateStyles: Record<string, { headerClass: string; accentClass: string; sectionClass: string; nameClass: string; titleClass: string }> = {
  modern: { headerClass: "border-b-2 border-indigo-500 pb-6 mb-6", accentClass: "text-indigo-650", sectionClass: "text-sm font-extrabold uppercase tracking-wider text-indigo-750 border-b-2 border-indigo-200 pb-1 mb-3.5", nameClass: "text-3xl font-bold text-zinc-900 mb-1", titleClass: "text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4" },
  professional: { headerClass: "border-b-2 border-zinc-700 pb-6 mb-6", accentClass: "text-zinc-850", sectionClass: "text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-350 pb-1 mb-3.5", nameClass: "text-3xl font-bold text-zinc-900 mb-1", titleClass: "text-sm font-semibold text-zinc-750 uppercase tracking-wider mb-4" },
  minimal: { headerClass: "border-b border-zinc-300 pb-6 mb-6", accentClass: "text-zinc-750", sectionClass: "text-sm font-extrabold uppercase tracking-wider text-zinc-800 border-b-2 border-zinc-250 pb-1 mb-3.5", nameClass: "text-3xl font-light text-zinc-900 mb-1 tracking-wide", titleClass: "text-sm font-medium text-zinc-650 mb-4" },
  corporate: { headerClass: "border-b-2 border-blue-900 pb-6 mb-6", accentClass: "text-blue-950", sectionClass: "text-sm font-extrabold uppercase tracking-wider text-blue-900 border-b-2 border-blue-300 pb-1 mb-3.5", nameClass: "text-3xl font-serif font-bold text-zinc-900 mb-1", titleClass: "text-sm font-serif font-semibold text-blue-855 uppercase tracking-wider mb-4" },
  student: { headerClass: "border-b-2 border-teal-500 pb-6 mb-6", accentClass: "text-teal-700", sectionClass: "text-sm font-extrabold uppercase tracking-wider text-teal-850 border-b-2 border-teal-250 pb-1 mb-3.5", nameClass: "text-3xl font-bold text-zinc-900 mb-1", titleClass: "text-sm font-semibold text-teal-600 uppercase tracking-wider mb-4" },
};

interface ResumeData {
  header: { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string };
  summary?: string;
  education: Array<{ institution: string; degree: string; date: string; gpa: string; details?: string }>;
  skills: { languages: string[]; frontend?: string[]; backend?: string[]; tools: string[] };
  projects: Array<{ title: string; technologies: string[]; date: string; bullets: string[] }>;
  experience: Array<{ company: string; role: string; date: string; location: string; bullets: string[] }>;
  certifications?: Array<{ name: string; issuer: string; date: string }>;
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: string;
  zoom?: number;
  onZoomChange?: (z: number) => void;
}

// A4 page dimensions in pixels at 96 DPI: 210mm x 297mm
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export default function ResumePreview({ data, template = "modern", zoom: externalZoom, onZoomChange }: ResumePreviewProps) {
  const [internalZoom, setInternalZoom] = useState(60);
  const zoom = externalZoom ?? internalZoom;
  const setZoom = onZoomChange ?? setInternalZoom;
  const style = templateStyles[template] || templateStyles.modern;

  // Calculate the scaled dimensions so the container matches the visual footprint
  const scaledWidth = Math.round(A4_WIDTH_PX * (zoom / 100));
  const scaledHeight = Math.round(A4_HEIGHT_PX * (zoom / 100));

  return (
    <div className="space-y-3">
      {/* Zoom controls toolbar */}
      <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold text-zinc-500">Live Preview</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(zoom - 10, 40))}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-500 border-none bg-transparent"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono w-9 text-center text-zinc-600 dark:text-zinc-400">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(zoom + 10, 160))}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-500 border-none bg-transparent"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(85)}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 border-none bg-transparent ml-1"
            title="Reset zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Scrollable preview container */}
      <div className="overflow-auto max-h-[680px] flex bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 scrollbar-thin">
        {/*
          The outer div has the SCALED visual width, preventing the parent from
          expanding to the full A4 width at 100% and causing layout overflow.
          transform-origin is top-center so it scales downward naturally.
        */}
        <div style={{ width: scaledWidth, height: scaledHeight, flexShrink: 0, overflow: "hidden", position: "relative" }} className="mx-auto">
          <div
            className="resume-print-target bg-white shadow-lg"
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              padding: "20mm 15mm",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <header className={style.headerClass}>
              <h1 className={style.nameClass}>{data.header.name}</h1>
              <h2 className={style.titleClass}>{data.header.title}</h2>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-750 font-sans font-medium">
                {data.header.email && <span>{data.header.email}</span>}
                {data.header.email && data.header.phone && <span className="text-zinc-300">|</span>}
                {data.header.phone && <span>{data.header.phone}</span>}
                {data.header.location && <><span className="text-zinc-300">|</span><span>{data.header.location}</span></>}
                {data.header.linkedin && <><span className="text-zinc-300">|</span><span>{data.header.linkedin}</span></>}
                {data.header.github && <><span className="text-zinc-300">|</span><span>{data.header.github}</span></>}
              </div>
            </header>

            {data.summary && (
              <section className="mb-5">
                <h3 className={style.sectionClass}>Professional Summary</h3>
                <p className="text-xs leading-relaxed text-zinc-800 font-medium">{data.summary}</p>
              </section>
            )}

            {data.experience.length > 0 && (
              <section className="mb-5">
                <h3 className={style.sectionClass}>Experience</h3>
                <div className="space-y-4">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-zinc-900">{exp.role}</h4>
                        <span className="text-xs font-semibold text-zinc-600">{exp.date}</span>
                      </div>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs italic text-zinc-700 font-semibold">{exp.company}</span>
                        <span className="text-xs text-zinc-550 font-medium">{exp.location}</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-zinc-800 space-y-0.5 pl-1 font-medium">
                        {exp.bullets.map((b, idx) => <li key={idx} className="leading-relaxed">{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.projects.length > 0 && (
              <section className="mb-5">
                <h3 className={style.sectionClass}>Projects</h3>
                <div className="space-y-4">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-zinc-900">{proj.title}</h4>
                        <span className="text-xs font-semibold text-zinc-600">{proj.date}</span>
                      </div>
                      {proj.technologies.length > 0 && (
                        <p className="text-[10px] text-zinc-550 mb-1 font-mono font-bold">[{proj.technologies.join(", ")}]</p>
                      )}
                      <ul className="list-disc list-inside text-xs text-zinc-800 space-y-0.5 pl-1 font-medium">
                        {proj.bullets.map((b, idx) => <li key={idx} className="leading-relaxed">{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.education.length > 0 && (
              <section className="mb-5">
                <h3 className={style.sectionClass}>Education</h3>
                <div className="space-y-3">
                  {data.education.map((edu, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-zinc-900">{edu.institution}</h4>
                        <span className="text-xs font-semibold text-zinc-600">{edu.date}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs italic text-zinc-700 font-semibold">{edu.degree}</span>
                        {edu.gpa && <span className="text-xs font-bold text-zinc-800">GPA: {edu.gpa}</span>}
                      </div>
                      {edu.details && <p className="text-xs text-zinc-700 mt-0.5 font-medium">{edu.details}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(data.skills.languages.length > 0 || (data.skills.tools && data.skills.tools.length > 0)) && (
              <section className="mb-5">
                <h3 className={style.sectionClass}>Skills</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-zinc-800 font-medium">
                  {data.skills.languages.length > 0 && (
                    <div><span className="font-bold text-zinc-900">Languages:</span> <span>{data.skills.languages.join(", ")}</span></div>
                  )}
                  {data.skills.frontend && data.skills.frontend.length > 0 && (
                    <div><span className="font-bold text-zinc-900">Frontend:</span> <span>{data.skills.frontend.join(", ")}</span></div>
                  )}
                  {data.skills.backend && data.skills.backend.length > 0 && (
                    <div><span className="font-bold text-zinc-900">Backend:</span> <span>{data.skills.backend.join(", ")}</span></div>
                  )}
                  {data.skills.tools && data.skills.tools.length > 0 && (
                    <div><span className="font-bold text-zinc-900">Tools:</span> <span>{data.skills.tools.join(", ")}</span></div>
                  )}
                </div>
              </section>
            )}

            {data.certifications && data.certifications.length > 0 && (
              <section className="mt-5">
                <h3 className={style.sectionClass}>Certifications</h3>
                <div className="space-y-2">
                  {data.certifications.map((cert, i) => (
                    <div key={i} className="flex justify-between text-xs text-zinc-800 font-medium">
                      <span className="font-bold text-zinc-900">{cert.name}</span>
                      <span className="text-zinc-755">{cert.issuer}{cert.date ? ` • ${cert.date}` : ""}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
