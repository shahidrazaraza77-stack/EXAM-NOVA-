import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ZoomIn, ZoomOut, ArrowRight } from "lucide-react";
import { mockResumeData } from "../mockData";

interface PreviewStepProps {
  onNext: () => void;
}

export default function PreviewStep({ onNext }: PreviewStepProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const A4_WIDTH_PX = 794; // 210mm
  const A4_HEIGHT_PX = 1123; // 297mm
  const scaledWidth = Math.round(A4_WIDTH_PX * (zoom / 100));
  const scaledHeight = Math.round(A4_HEIGHT_PX * (zoom / 100));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Zoom Controls */}
      <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Preview Mode</span>
        <div className="flex items-center gap-3">
          <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-aurora-card-hover transition-colors cursor-pointer text-aurora-text-muted">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-10 text-center text-zinc-600 dark:text-zinc-400">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-1.5 rounded-md hover:bg-aurora-card-hover transition-colors cursor-pointer text-aurora-text-muted">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resume Document Wrapper */}
      <div className="overflow-auto max-h-[800px] flex bg-zinc-50 dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 scrollbar-thin">
        
        {/* Scaled Bounding Box */}
        <div style={{ width: scaledWidth, height: scaledHeight, flexShrink: 0, overflow: "hidden", position: "relative" }} className="mx-auto">
          {/* Actual Resume Paper Element */}
          <div 
            className="bg-white shadow-2xl"
            style={{ 
              width: `${A4_WIDTH_PX}px`, 
              height: `${A4_HEIGHT_PX}px`, 
              padding: "20mm 15mm",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
              color: "#1f2937" // Forcing dark text since it's a printed document representation
            }}
          >
          {/* Header */}
          <header className="text-center border-b-2 border-zinc-300 pb-6 mb-6">
            <h1 className="text-4xl font-serif text-zinc-900 uppercase tracking-widest mb-2">
              {mockResumeData.header.name}
            </h1>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">
              {mockResumeData.header.title}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-700 font-sans font-medium">
              <span>{mockResumeData.header.email}</span>
              <span>•</span>
              <span>{mockResumeData.header.phone}</span>
              <span>•</span>
              <span>{mockResumeData.header.location}</span>
              <span>•</span>
              <span>{mockResumeData.header.linkedin}</span>
              <span>•</span>
              <span>{mockResumeData.header.github}</span>
            </div>
          </header>

          {/* Summary */}
          <section className="mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-300 pb-1 mb-3.5">Professional Summary</h3>
            <p className="text-xs leading-relaxed text-zinc-800 font-medium">
              {mockResumeData.summary}
            </p>
          </section>

          {/* Experience */}
          <section className="mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-300 pb-1 mb-3.5">Experience</h3>
            <div className="space-y-5">
              {mockResumeData.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-xs font-bold text-zinc-900">{exp.role}</h4>
                    <span className="text-xs font-semibold text-zinc-600">{exp.date}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs italic text-zinc-700 font-semibold">{exp.company}</span>
                    <span className="text-xs text-zinc-550 font-medium">{exp.location}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-zinc-800 space-y-1 pl-1 font-medium">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-300 pb-1 mb-3.5">Projects</h3>
            <div className="space-y-5">
              {mockResumeData.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-xs font-bold text-zinc-900">{proj.title}</h4>
                    <span className="text-xs font-semibold text-zinc-600">{proj.date}</span>
                  </div>
                  <p className="text-[10px] text-zinc-550 mb-2 font-mono font-bold">
                    [{proj.technologies.join(", ")}]
                  </p>
                  <ul className="list-disc list-inside text-xs text-zinc-800 space-y-1 pl-1 font-medium">
                    {proj.bullets.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-300 pb-1 mb-3.5">Education</h3>
            {mockResumeData.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-xs font-bold text-zinc-900">{edu.institution}</h4>
                  <span className="text-xs font-semibold text-zinc-600">{edu.date}</span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs italic text-zinc-700 font-semibold">{edu.degree}</span>
                  <span className="text-xs font-bold text-zinc-800">GPA: {edu.gpa}</span>
                </div>
                <p className="text-xs text-zinc-700 mt-1 font-medium">{edu.details}</p>
              </div>
            ))}
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-300 pb-1 mb-3.5">Skills</h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-800 font-medium">
              <div>
                <span className="font-bold text-zinc-900">Languages:</span> <span>{mockResumeData.skills.languages.join(", ")}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-900">Frontend:</span> <span>{mockResumeData.skills.frontend.join(", ")}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-900">Backend:</span> <span>{mockResumeData.skills.backend.join(", ")}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-900">Tools:</span> <span>{mockResumeData.skills.tools.join(", ")}</span>
              </div>
            </div>
          </section>

          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button variant="primary" onClick={onNext} className="gap-2">
          Continue to Download <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
