"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useCountUp(end: number, duration = 2000, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const timeout = setTimeout(() => {
      function animate(ts: number) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setValue(Math.round(e * end));
        if (p < 1) frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); if (frame) cancelAnimationFrame(frame); };
  }, [end, duration, delay]);
  return value;
}

export default function ATSScoreRing({ score, size = 160, strokeWidth = 12, label = "ATS Score" }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(score, 2000);
  const id = React.useId();
  const textColor = score >= 80 ? "text-emerald-500" : score >= 65 ? "text-amber-500" : "text-red-500";
  const stop1 = score >= 80 ? "#34d399" : score >= 65 ? "#f59e0b" : "#f87171";
  const stop2 = score >= 80 ? "#059669" : score >= 65 ? "#ea580c" : "#dc2626";

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ats-ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stop1} /><stop offset="100%" stopColor={stop2} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#ats-ring-${id})`}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black tracking-tight tabular-nums ${textColor}`}>{animated}</span>
        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-0.5">{label}</span>
      </div>
    </div>
  );
}
