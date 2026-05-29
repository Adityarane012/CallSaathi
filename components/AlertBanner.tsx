"use client";

import { motion, AnimatePresence } from "framer-motion";

/* ── Types ──────────────────────────────────────────── */

interface AlertBannerProps {
  score: number;
  visible: boolean;
}

/* ── Component ──────────────────────────────────────── */

export default function AlertBanner({ score, visible }: AlertBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: -50, opacity: 0, x: "-50%" }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className="fixed top-20 left-1/2 z-50 w-[90%] max-w-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
        >
          {/* Glow backdrop */}
          <motion.div
            className="absolute inset-0"
            animate={{
              boxShadow: [
                "0 0 30px rgba(255, 34, 68, 0.4), inset 0 0 20px rgba(255, 34, 68, 0.2)",
                "0 0 50px rgba(255, 34, 68, 0.6), inset 0 0 30px rgba(255, 34, 68, 0.3)",
                "0 0 30px rgba(255, 34, 68, 0.4), inset 0 0 20px rgba(255, 34, 68, 0.2)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Banner content */}
          <div
            className="relative px-4 py-3 flex flex-col items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #ff2244 0%, #cc1133 100%)",
            }}
          >
            {/* Main alert line */}
            <div
              className="text-white text-sm font-bold tracking-wider text-center flex items-center gap-2"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            >
              <span className="animate-pulse">⚠</span> 
              AI-GENERATED VOICE DETECTED — {score}%
            </div>

            {/* Sub line */}
            <div
              className="text-white/80 text-xs text-center mt-1"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            >
              We recommend ending this call immediately.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
