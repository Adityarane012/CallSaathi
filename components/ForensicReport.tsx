"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

/* ── Types ──────────────────────────────────────────── */

interface ForensicReportProps {
  reportData: {
    callId: string;
    totalDuration: number;
    chunksAnalyzed: number;
    peakScore: number;
    suspiciousChunks: number;
    uniqueArtifacts: number;
    verdict: string;
    reportBody: string;
    detectionMethods?: string[];
  };
}

/* ── Component ──────────────────────────────────────── */

export default function ForensicReport({ reportData }: ForensicReportProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const isHighRisk = reportData.verdict.includes("HIGH") || reportData.verdict.includes("CRITICAL");
  const badgeColor = isHighRisk ? "#ff2244" : "#ffaa00";

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `CALLSAATHI FORENSIC ANALYSIS REPORT\n` +
      `Call ID: ${reportData.callId} | Duration: ${reportData.totalDuration}s\n` +
      `Verdict: ${reportData.verdict}\n\n` +
      `${reportData.reportBody}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewAnalysis = () => {
    localStorage.removeItem("callsaathi_call_data");
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* ── Header ───────────────────────────────────── */}
      <div
        className="px-6 py-5 text-center tracking-[0.2em] font-bold"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: "var(--text-primary)",
          borderBottom: "1px solid var(--border)",
          background: "rgba(10, 10, 15, 0.4)",
        }}
      >
        CALLSAATHI FORENSIC ANALYSIS REPORT
      </div>

      <div className="p-6 md:p-8">
        {/* ── Metadata Row ───────────────────────────── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-xs md:text-sm"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            color: "var(--text-secondary)",
          }}
        >
          <div>
            <div className="opacity-60 mb-1">CALL ID</div>
            <div style={{ color: "var(--text-primary)" }}>{reportData.callId}</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">DURATION</div>
            <div style={{ color: "var(--text-primary)" }}>{reportData.totalDuration}s</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">CHUNKS ANALYZED</div>
            <div style={{ color: "var(--text-primary)" }}>{reportData.chunksAnalyzed}</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">PEAK SCORE</div>
            <div style={{ color: "var(--state-danger)" }}>{reportData.peakScore}%</div>
          </div>
        </div>

        {/* ── Verdict Badge ──────────────────────────── */}
        <div className="flex justify-center mb-10">
          <div
            className="px-6 py-2 rounded-full font-bold tracking-widest text-center"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              background: `${badgeColor}20`,
              border: `1px solid ${badgeColor}50`,
              color: badgeColor,
              boxShadow: `0 0 20px ${badgeColor}20`,
            }}
          >
            VERDICT: {reportData.verdict}
          </div>
        </div>

        {/* ── Report Body ────────────────────────────── */}
        <div
          className="mb-10 text-sm md:text-base leading-relaxed whitespace-pre-wrap"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            color: "#aaaacc",
          }}
        >
          {reportData.reportBody}
        </div>

        {/* ── Summary Stats ──────────────────────────── */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-lg mb-8"
          style={{
            background: "rgba(10, 10, 15, 0.5)",
            border: "1px dashed var(--border)",
            fontFamily: "var(--font-jetbrains), monospace",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="opacity-60">Peak Risk:</span>
            <span style={{ color: "var(--state-danger)" }}>{reportData.peakScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-60">Suspicious Chunks:</span>
            <span style={{ color: "var(--state-warn)" }}>{reportData.suspiciousChunks}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-60">Unique Artifacts:</span>
            <span style={{ color: "var(--state-safe)" }}>{reportData.uniqueArtifacts}</span>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCopy}
            className="btn-secondary min-w-[200px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {copied ? (
                <>
                  <polyline points="20 6 9 17 4 12" />
                </>
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </svg>
            {copied ? "Copied!" : "Copy Report"}
          </button>
          
          <button
            onClick={handleNewAnalysis}
            className="btn-primary min-w-[200px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            New Analysis
          </button>
        </div>

        {/* ── Detection Method Indicator ──────────────── */}
        {(reportData.detectionMethods || []).length > 0 && (
          <div 
            className="text-center text-xs opacity-40 mt-8" 
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            {reportData.detectionMethods?.includes('huggingface') && <div>Detection: Real ML model (HuggingFace mo-tts/audio-deepfake-detection)</div>}
            {reportData.detectionMethods?.includes('groq') && <div>Detection: Feature-based analysis (Groq LLM)</div>}
            {reportData.detectionMethods?.includes('demo') && <div>Detection: Demo mode (simulated)</div>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
