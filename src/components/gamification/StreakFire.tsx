"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function StreakFire({ streak, size = "md" }: { streak: number; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: { icon: 14, text: "text-xs" }, md: { icon: 18, text: "text-sm" }, lg: { icon: 24, text: "text-lg" } };
  const s = sizeMap[size];
  const level = streak >= 30 ? "text-orange-500" : streak >= 15 ? "text-amber-500" : streak >= 7 ? "text-yellow-500" : "text-zinc-400";

  return (
    <div className="flex items-center gap-1.5">
      <div className={streak > 0 ? "animate-pulse" : ""}>
        <Flame className={`${s.icon} ${level} ${streak > 0 ? "drop-shadow-lg" : ""}`} style={{ filter: streak > 0 ? "drop-shadow(0 0 6px rgba(249,115,22,0.5))" : "none" }} />
      </div>
      {streak > 0 && (
        <motion.span
          key={streak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${s.text} font-extrabold ${level}`}
        >
          {streak}
        </motion.span>
      )}
      <span className={`${s.text} font-medium text-zinc-500`}>day streak</span>
    </div>
  );
}
