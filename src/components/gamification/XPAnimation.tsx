"use client";

import { motion, AnimatePresence } from "framer-motion";

export function XPAnimation({ amount, x, y, show }: { amount: number; x: number; y: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
          animate={{ opacity: 0, y: -80, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fixed pointer-events-none z-[90] text-lg font-extrabold text-violet-500 drop-shadow-lg"
          style={{ left: x, top: y }}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
