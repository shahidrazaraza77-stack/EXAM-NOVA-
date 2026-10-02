"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResumeHistoryRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paramsStr = searchParams.toString();
    const targetUrl = `/dashboard/resume-builder?tab=history${paramsStr ? `&${paramsStr}` : ""}`;
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-650 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-zinc-550">Redirecting to consolidated Resume History...</p>
      </div>
    </div>
  );
}
