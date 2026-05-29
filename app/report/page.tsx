"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ForensicReport from "@/components/ForensicReport";

/* ── Types ──────────────────────────────────────────── */

interface CallData {
  callId: string;
  chunks: { chunkNumber: number; score: number; artifacts: string[] }[];
  peakScore: number;
  totalDuration: number;
  allArtifacts: string[];
  detectionMethods?: string[];
}

interface ReportResponse {
  verdict: string;
  report: string;
}

/* ── Component ──────────────────────────────────────── */

export default function ReportPage() {
  const router = useRouter();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [reportResult, setReportResult] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. On mount, load data from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("callsaathi_call_data");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setCallData(parsed);
    } catch (e) {
      console.error("Failed to parse call data", e);
      router.replace("/");
    }
  }, [router]);

  // 2. Once data is loaded, call the API to generate the report
  useEffect(() => {
    if (!callData) return;

    let isSubscribed = true;

    async function generateReport() {
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(callData),
        });

        if (!res.ok) {
          throw new Error("Failed to generate report from API");
        }

        const data = await res.json();
        
        if (isSubscribed) {
          setReportResult(data);
        }
      } catch (err: any) {
        console.error("Report generation error:", err);
        if (isSubscribed) {
          setError("Failed to generate the forensic report. Please try again.");
        }
      }
    }

    generateReport();

    return () => {
      isSubscribed = false;
    };
  }, [callData]);

  // 3. Render loading state if generating
  if (!reportResult && !error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md w-full">
          <div className="relative">
             <div className="w-16 h-16 rounded-full border-2 border-[var(--text-secondary)] border-t-[var(--state-safe)] animate-spin opacity-80" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-2 bg-[var(--state-safe)] rounded-full animate-pulse" />
             </div>
          </div>
          <div 
            className="text-[var(--text-primary)] font-bold tracking-widest uppercase animate-pulse"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Generating forensic analysis
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            >
              _
            </motion.span>
          </div>
          <div 
             className="text-xs text-[var(--text-secondary)]"
             style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
             Compiling technical findings and calculating risk vectors...
          </div>
        </div>
      </main>
    );
  }

  // 4. Render error state
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
        <div className="p-6 rounded-lg bg-[rgba(255,34,68,0.1)] border border-[rgba(255,34,68,0.3)] max-w-md text-center">
           <div className="text-[var(--state-danger)] text-xl mb-4 font-bold">Analysis Failed</div>
           <p className="text-[var(--text-secondary)] mb-6 text-sm">{error}</p>
           <button 
             onClick={() => router.push("/")}
             className="btn-secondary w-full"
           >
             Return Home
           </button>
        </div>
      </main>
    );
  }

  // 5. Render final report
  if (callData && reportResult) {
    const suspiciousChunksCount = callData.chunks.filter(c => c.score > 50).length;
    
    return (
      <main className="min-h-screen p-4 md:p-8 bg-[var(--bg-primary)]">
        {/* Animated grid bg */}
        <div className="animated-grid-bg" />
        
        <div className="relative z-10 w-full h-full pt-4 md:pt-10 pb-20">
          <AnimatePresence>
            <ForensicReport 
              reportData={{
                callId: callData.callId,
                totalDuration: callData.totalDuration,
                chunksAnalyzed: callData.chunks.length,
                peakScore: callData.peakScore,
                suspiciousChunks: suspiciousChunksCount,
                uniqueArtifacts: callData.allArtifacts.length,
                verdict: reportResult.verdict,
                reportBody: reportResult.report,
                detectionMethods: callData.detectionMethods || []
              }} 
            />
          </AnimatePresence>
        </div>
      </main>
    );
  }

  return null;
}
