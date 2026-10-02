"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  shape: "circle" | "square";
}

const COLORS = ["#8b5cf6", "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

export function Confetti({ active = false, duration = 3000 }: { active: boolean; duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    const p: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? "circle" : "square",
    }));
    setParticles(p);
    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: p.rotation, opacity: 1, scale: 0 }}
              animate={{ y: "110vh", rotate: p.rotation + 360, opacity: [1, 1, 0], scale: [0, 1.2, 1, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 + Math.random() * 1.5, ease: "easeIn", delay: Math.random() * 0.3 }}
              className="absolute"
              style={{ width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.shape === "circle" ? "50%" : "2px" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
