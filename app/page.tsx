"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ── Animation variants ─────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 1.2 + i * 0.15, ease: "easeOut" },
  }),
};

/* ── Stats data ─────────────────────────────────────── */

const stats = [
  {
    value: "1 in 4",
    label: "scam calls now uses AI voice cloning technology",
  },
  {
    value: "₹1,750 Cr",
    label: "lost to voice scams in India (2024)",
  },
  {
    value: "0",
    label: "consumer tools exist to detect it in real time",
  },
];

/* ── Page Component ─────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Animated background layers */}
      <div className="animated-grid-bg" />
      <div className="scan-line" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Nav Bar ──────────────────────────────── */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full px-6 py-5 md:px-10"
        >
          <div className="flex items-center gap-3">
            {/* Mic icon */}
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: "rgba(0, 255, 136, 0.1)",
                border: "1px solid rgba(0, 255, 136, 0.25)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--state-safe)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              {/* Pulsing dot */}
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{
                  background: "var(--state-safe)",
                  animation: "glowPulse 2s ease-in-out infinite",
                  boxShadow: "0 0 8px rgba(0,255,136,0.6)",
                }}
              />
            </div>

            {/* Logo text */}
            <span
              className="text-lg font-bold tracking-wide"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: "var(--text-primary)",
              }}
            >
              Call
              <span style={{ color: "var(--state-safe)" }}>Saathi</span>
            </span>
          </div>
        </motion.nav>

        {/* ── Hero Section ─────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col items-center justify-center px-6 pb-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                background: "rgba(255, 34, 68, 0.08)",
                border: "1px solid rgba(255, 34, 68, 0.25)",
                color: "var(--state-danger)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "var(--state-danger)",
                  animation: "glowPulse 1.5s ease-in-out infinite",
                }}
              />
              Cybersecurity Tool
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Is that voice{" "}
            <span
              className="relative inline-block"
              style={{ color: "var(--state-safe)" }}
            >
              real
              <span
                className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--state-safe), transparent)",
                }}
              />
            </span>
            ?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-center text-base sm:text-lg md:text-xl max-w-xl mb-12"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            Real-time deepfake voice detection.
            <br />
            Know before it&apos;s too late.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/monitor?mode=live">
              <button id="btn-start-monitoring" className="btn-primary">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                Start Monitoring
              </button>
            </Link>

            <Link href="/monitor?mode=demo">
              <button id="btn-run-demo" className="btn-secondary">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                Run Demo
              </button>
            </Link>
          </motion.div>

          {/* Decorative element — glowing orb */}
          <motion.div
            variants={itemVariants}
            className="relative mt-16 mb-4 flex items-center justify-center"
          >
            <div
              className="w-24 h-24 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)",
                animation: "glowPulse 3s ease-in-out infinite",
              }}
            />
            <div
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: "var(--state-safe)",
                boxShadow: "0 0 20px rgba(0,255,136,0.5), 0 0 60px rgba(0,255,136,0.2)",
              }}
            />
          </motion.div>
        </motion.section>

        {/* ── Divider ──────────────────────────────── */}
        <div className="divider-glow" />

        {/* ── Stats Bar ────────────────────────────── */}
        <section className="w-full px-6 py-10 md:px-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                custom={i}
                variants={statVariants}
                initial="hidden"
                animate="visible"
                className="stat-card"
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Footer ───────────────────────────────── */}
        <footer className="w-full px-6 py-6 md:px-10">
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                opacity: 0.5,
              }}
            >
              ◆
            </span>
            <span>Built for Unison Tech Club BUILD-A-THON 2026</span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                opacity: 0.5,
              }}
            >
              ◆
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
