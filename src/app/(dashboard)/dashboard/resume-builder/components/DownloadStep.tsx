import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Share2, File, CheckCircle2, Loader2, Link as LinkIcon } from "lucide-react";

export default function DownloadStep() {
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = (type: "pdf" | "docx") => {
    setDownloading(type);
    setTimeout(() => {
      setDownloading(null);
    }, 1500);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto text-center">
      
      <div className="flex flex-col items-center justify-center space-y-4 pt-8 pb-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Your Resume is Ready!</h2>
        <p className="text-zinc-500 max-w-md mx-auto">
          Your optimized resume has been generated. Download it below or share it via a secure link.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-2 border-zinc-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 transition-colors cursor-pointer group" onClick={() => handleDownload("pdf")}>
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Download PDF</h3>
              <p className="text-xs text-zinc-500">Best for applications and printing</p>
            </div>
            <Button variant="primary" className="w-full mt-2 pointer-events-none" disabled={downloading !== null}>
              {downloading === "pdf" ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer group" onClick={() => handleDownload("docx")}>
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <File className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Download DOCX</h3>
              <p className="text-xs text-zinc-500">Editable format for Microsoft Word</p>
            </div>
            <Button variant="outline" className="w-full mt-2 pointer-events-none" disabled={downloading !== null}>
              {downloading === "docx" ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download DOCX</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <Share2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Share Online Link</h4>
              <p className="text-xs text-zinc-500">Send a view-only link to recruiters</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 font-mono truncate max-w-[200px] flex-1">
              examnova.com/r/johndoe85
            </div>
            <Button variant={copiedLink ? "primary" : "outline"} onClick={handleCopyLink} className="shrink-0">
              {copiedLink ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
              {copiedLink ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="pt-8">
        <Button variant="outline" className="text-aurora-text-muted" onClick={() => window.location.reload()}>
          Start New Resume
        </Button>
      </div>
    </div>
  );
}
