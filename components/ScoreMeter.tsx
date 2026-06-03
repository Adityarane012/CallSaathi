"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

/* ── Types ──────────────────────────────────────────── */

export type RiskLevel = "safe" | "suspicious" | "danger";

interface ScoreMeterProps {
  score: number;
  riskLevel: RiskLevel;
}

/* ── Color map ──────────────────────────────────────── */

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "#00ff88",
  suspicious: "#ffaa00",
  danger: "#ff2244",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  safe: "SAFE",
  suspicious: "SUSPICIOUS",
  danger: "DANGER",
};



/* ── Arc geometry ───────────────────────────────────── */

const SIZE = 200;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2 - 8;
const CENTER = SIZE / 2;

// Arc from 135° to 405° (270° sweep)
const START_ANGLE = 135;
const END_ANGLE = 405;
const SWEEP = END_ANGLE - START_ANGLE; // 270°

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/* ── Component ──────────────────────────────────────── */

export default function ScoreMeter({ score, riskLevel }: ScoreMeterProps) {
  const color = RISK_COLORS[riskLevel];
  const label = RISK_LABELS[riskLevel];

  // Spring-animated score value
  const springValue = useSpring(0, {
    stiffness: 80,
    damping: 20,
    mass: 1,
  });

  // Update spring target when score changes
  useEffect(() => {
    springValue.set(score);
  }, [score, springValue]);

  // Transform spring value to arc end angle
  const arcEnd = useTransform(springValue, [0, 100], [START_ANGLE, END_ANGLE]);

  // Transform spring value to display number
  const displayScore = useTransform(springValue, (v) => Math.round(v));

  // Background arc (full track)
  const bgArcPath = describeArc(CENTER, CENTER, RADIUS, START_ANGLE, END_ANGLE);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* Background track */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />

        {/* Animated fill arc */}
        <motion.path
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          d={useTransform(arcEnd, (end) => {
            const clampedEnd = Math.max(end, START_ANGLE + 0.5);
            return describeArc(CENTER, CENTER, RADIUS, START_ANGLE, clampedEnd);
          })}
          style={{
            transition: "stroke 0.6s ease",
          }}
        />

        {/* Center score text */}
        <motion.text
          x={CENTER}
          y={CENTER - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary)"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "42px",
            fontWeight: 700,
          }}
        >
          {useTransform(displayScore, (v) => `${v}`)}
        </motion.text>

        {/* Percent symbol */}
        <text
          x={CENTER + 36}
          y={CENTER - 16}
          textAnchor="middle"
          fill="var(--text-secondary)"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          %
        </text>

        {/* Tick marks at 0%, 50%, 100% */}
        {[0, 50, 100].map((pct) => {
          const angle = START_ANGLE + (pct / 100) * SWEEP;
          const inner = polarToCartesian(CENTER, CENTER, RADIUS - STROKE_WIDTH / 2 - 4, angle);
          const outer = polarToCartesian(CENTER, CENTER, RADIUS - STROKE_WIDTH / 2 - 10, angle);
          return (
            <line
              key={pct}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              opacity={0.4}
            />
          );
        })}
      </svg>

      {/* Risk badge */}
      <motion.div
        className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          background: `${color}15`,
          border: `1px solid ${color}40`,
          color: color,
        }}
        animate={{
          borderColor: `${color}60`,
        }}
        transition={{ duration: 0.6 }}
      >
        {label}
      </motion.div>
    </div>
  );
}
