import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, History, CheckCircle2, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resumeService, validateResumeFile } from "@/services/resume";
import type { Database } from "@/types/supabase";

type ResumeRow = Database["public"]["Tables"]["resumes"]["Row"];

interface UploadStepProps {
  onNext: (resume: ResumeRow) => void;
}

export default function UploadStep({ onNext }: UploadStepProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeHistory, setResumeHistory] = useState<ResumeRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user?.id) {
      resumeService.getResumes(user.id)
        .then(setResumeHistory)
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [user?.id]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setUploadedFile(file);

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      setUploadedFile(null);
      return;
    }

    if (!user?.id) {
      setUploadError("You must be logged in to upload.");
      setUploadedFile(null);
      return;
    }

    setIsUploading(true);
    try {
      const resume = await resumeService.uploadResume(user.id, file);
      setIsUploading(false);
      onNext(resume);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Upload Area */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <CardContent className="p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                isDragging
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mx-auto border border-violet-100 dark:border-violet-900/60 mb-6">
                <Upload className={`w-8 h-8 ${isDragging ? "text-violet-600 animate-bounce" : "text-violet-600"}`} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Drag & drop your resume here
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                Supported formats: PDF, DOCX. Max file size: 5MB.
              </p>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="primary" className="relative pointer-events-none">
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {uploadError && (
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 animate-in fade-in slide-in-from-top-4">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
            </CardContent>
          </Card>
        )}

        {uploadedFile && (
          <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 animate-in fade-in slide-in-from-top-4">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{uploadedFile.name}</h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    {isUploading ? (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Uploaded Successfully
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* History Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <History className="w-4 h-4 text-violet-600" />
              Previous Analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            ) : resumeHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No previous analyses</p>
            ) : (
              resumeHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{item.file_name}</h5>
                      <span className="text-4xs text-zinc-400 block pt-0.5">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                  {item.score !== null && (
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                      item.score >= 80 
                        ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" 
                        : item.score >= 70
                        ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40"
                        : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
                    }`}>
                      {item.score}%
                    </span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
