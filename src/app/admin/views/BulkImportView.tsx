"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  FileText,
  Check,
  X,
  AlertCircle,
  Database,
  Loader2,
} from "lucide-react";

type ImportType = "aptitude" | "coding" | "technical" | "hr" | "users";

interface ImportOption {
  id: ImportType;
  label: string;
  icon: React.ReactNode;
  description: string;
  template: string;
}

const importOptions: ImportOption[] = [
  { id: "aptitude", label: "Aptitude Questions", icon: <FileSpreadsheet className="h-5 w-5" />, description: "CSV with columns: question, options (A-D), answer, topic, difficulty", template: "question,optionA,optionB,optionC,optionD,answer,topic,difficulty" },
  { id: "coding", label: "Coding Problems", icon: <FileText className="h-5 w-5" />, description: "JSON array with: title, description, difficulty, topics, examples", template: '[{"title":"Two Sum","description":"...","difficulty":"Easy","topics":["Array"],"examples":[]}]' },
  { id: "technical", label: "Technical Questions", icon: <FileJson className="h-5 w-5" />, description: "CSV with columns: question, answer, topic, difficulty, company", template: "question,answer,topic,difficulty,company" },
  { id: "hr", label: "HR Questions", icon: <FileText className="h-5 w-5" />, description: "CSV with columns: question, category, tips, keywords", template: "question,category,tips,keywords" },
  { id: "users", label: "Users", icon: <Database className="h-5 w-5" />, description: "CSV with columns: name, email, role (Admin/Content Manager/Student)", template: "name,email,role" },
];

export default function BulkImportView() {
  const { addActivityLog } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const simulateImport = async () => {
    if (!file || !selectedType) return;
    setImporting(true);
    setResult(null);
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1500));
    const count = Math.floor(Math.random() * 15) + 5;
    setResult({ success: count, errors: Math.random() > 0.7 ? [`Row ${count + 1}: Invalid format in column "answer"`] : [] });
    addActivityLog({ action: "Bulk Import", description: `${count} ${selectedType} questions imported via ${file.name}`, user: "Admin", category: "import" });
    setImporting(false);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
          <Upload className="h-6 w-6 text-violet-500" />
          Bulk Import
        </h2>
        <p className="text-sm text-zinc-500 mt-1">Import questions and users in bulk from CSV, JSON, or Excel files</p>
      </div>

      {!result ? (
        <>
          {/* Step 1: Select Type */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">1. Select data type to import</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {importOptions.map((opt) => (
                <button key={opt.id} onClick={() => { setSelectedType(opt.id); setFile(null); setResult(null); }}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedType === opt.id ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-500/10" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200 dark:hover:border-violet-900/50 hover:shadow-sm"}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${selectedType === opt.id ? "bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{opt.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{opt.description}</p>
                  </div>
                  {selectedType === opt.id && <Check className="h-5 w-5 text-violet-600 shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload File */}
          {selectedType && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">2. Upload file</h3>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20" : file ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-zinc-900"}`}>
                <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-600" />
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Drop file here or click to browse</p>
                    <p className="text-xs text-zinc-400">Supports CSV, JSON, XLSX</p>
                  </div>
                )}
              </div>

              {/* Template preview */}
              <div className="mt-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Template format
                  </span>
                  <span className="text-[10px] text-zinc-400">Use as reference</span>
                </div>
                <code className="text-[11px] text-zinc-600 dark:text-zinc-400 break-all">
                  {importOptions.find((o) => o.id === selectedType)?.template}
                </code>
              </div>
            </motion.div>
          )}

          {/* Step 3: Import */}
          {selectedType && file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button onClick={simulateImport} disabled={importing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importing ? "Importing..." : "Start Import"}
              </button>
            </motion.div>
          )}
        </>
      ) : (
        /* Result */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Import Complete</h3>
          <p className="text-sm text-zinc-500 mt-1">Successfully imported {result.success} records</p>
          {result.errors.length > 0 && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-3 text-left">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5" /> {result.errors.length} error(s)
              </p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-[11px] text-red-500 mt-1">{err}</p>
              ))}
            </div>
          )}
          <button onClick={() => { setResult(null); setFile(null); setSelectedType(null); }}
            className="mt-6 px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer">
            Import Another File
          </button>
        </motion.div>
      )}
    </div>
  );
}
