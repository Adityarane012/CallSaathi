"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";

/* ── Types ──────────────────────────────────────────── */

export type RiskLevel = "safe" | "suspicious" | "danger";

export interface ArtifactEntry {
  text: string;
  time: number; // seconds elapsed
  riskLevel: RiskLevel;
}

interface ArtifactFeedProps {
  artifacts: ArtifactEntry[];
  riskLevel: RiskLevel;
}

/* ── Color map ──────────────────────────────────────── */

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "#00ff88",
  suspicious: "#ffaa00",
  danger: "#ff2244",
};

/* ── Helper: format time ────────────────────────────── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Component ──────────────────────────────────────── */

export default function ArtifactFeed({
  artifacts,
  riskLevel,
}: ArtifactFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new artifacts arrive (most recent first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [artifacts.length]);

  const isEmpty = artifacts.length === 0;

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        background: "rgba(10, 10, 15, 0.6)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: "var(--text-secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: RISK_COLORS[riskLevel],
            boxShadow: `0 0 6px ${RISK_COLORS[riskLevel]}80`,
            animation: "glowPulse 2s ease-in-out infinite",
          }}
        />
        Detected Artifacts
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: 260, minHeight: 120 }}
      >
        {isEmpty ? (
          /* ── Empty state ────────────────────────── */
          <div className="flex items-center justify-center gap-3 py-10 px-4">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--state-safe)",
                animation: "glowPulse 1.5s ease-in-out infinite",
              }}
            />
            <span
              className="text-sm"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: "var(--text-secondary)",
              }}
            >
              Monitoring audio stream...
            </span>
          </div>
        ) : (
          /* ── Artifact list (most recent first) ── */
          <div className="flex flex-col gap-0.5 p-2">
            <AnimatePresence initial={false}>
              {[...artifacts].reverse().map((artifact, i) => {
                const color = RISK_COLORS[artifact.riskLevel];
                return (
                  <motion.div
                    key={`${artifact.time}-${artifact.text}-${i}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{
                      background: `${color}08`,
                    }}
                  >
                    {/* Timestamp */}
                    <span
                      className="text-xs shrink-0 w-10 text-right"
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        color: "var(--text-secondary)",
                        opacity: 0.7,
                      }}
                    >
                      {formatTime(artifact.time)}
                    </span>

                    {/* Pill badge */}
                    <span
                      className="text-xs px-2.5 py-1 rounded-full truncate"
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        color: color,
                        border: `1px solid ${color}35`,
                        background: `${color}10`,
                        maxWidth: 220,
                      }}
                    >
                      {artifact.text}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
