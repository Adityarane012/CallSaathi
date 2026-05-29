"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion } from "framer-motion";

import Waveform from "@/components/Waveform";
import ScoreMeter from "@/components/ScoreMeter";
import ArtifactFeed from "@/components/ArtifactFeed";
import TimelineGraph from "@/components/TimelineGraph";
import AlertBanner from "@/components/AlertBanner";
import { useSimulation } from "@/hooks/useSimulation";
import { useAudioCapture } from "@/hooks/useAudioCapture";

import type { ArtifactEntry } from "@/components/ArtifactFeed";
import type { ChartPoint } from "@/components/TimelineGraph";
import type { AudioFeatures } from "@/types";

/* ── Types ──────────────────────────────────────────── */

type RiskLevel = "safe" | "suspicious" | "danger";

interface ChunkRecord {
  chunkNumber: number;
  score: number;
  artifacts: string[];
  features?: AudioFeatures;
  detectionMethod?: string;
}

/* ── Helper: format MM:SS ───────────────────────────── */

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* ── Monitor content (uses useSearchParams) ─────────── */

function MonitorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") === "demo" ? "demo" : "live";

  /* ── Demo mode state ────────────────────────────── */
  const sim = useSimulation();

  /* ── Live mode state ────────────────────────────── */
  const [liveScore, setLiveScore] = useState(0);
  const [liveRisk, setLiveRisk] = useState<RiskLevel>("safe");
  const [liveArtifacts, setLiveArtifacts] = useState<ArtifactEntry[]>([]);
  const [liveAllArtifacts, setLiveAllArtifacts] = useState<string[]>([]);
  const [liveChartData, setLiveChartData] = useState<ChartPoint[]>([]);
  const [liveChunks, setLiveChunks] = useState<ChunkRecord[]>([]);
  const [liveElapsed, setLiveElapsed] = useState(0);

  const chunkCountRef = useRef(0);
  const callIdRef = useRef(`CS-${Date.now()}`);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Live mode: handle audio chunks ───────────────── */

  const timeRef = useRef(0);

  const handleChunk = useCallback(async (blob: Blob, features: AudioFeatures) => {
    if (mode === "demo") return; // Demo handles its own timing

    timeRef.current += 3;
    const currentTime = timeRef.current;

    // Use extracted RMS to detect silence
    const isSilent = features.rms < 0.015;

    if (isSilent) {
      // User is silent: decay score slightly, don't advance the fake detection arc
      setLiveScore((prevScore) => {
        const newScore = Math.max(prevScore - 2, 0);
        if (newScore < 50) setLiveRisk("safe");
        else if (newScore < 70) setLiveRisk("suspicious");
        
        setLiveChartData((chart) => [...chart, { time: currentTime, score: newScore }]);
        return newScore;
      });
      return;
    }

    chunkCountRef.current += 1;
    const chunkNum = chunkCountRef.current;

    try {
      let analysisResult;

      // TRY 1: Hugging Face (real detection)
      const formData = new FormData();
      formData.append('audio', blob);

      const hfResponse = await fetch('/api/analyze-hf', {
        method: 'POST',
        body: formData,
      });

      const hfData = await hfResponse.json();

      if (hfData.detectionMethod === 'huggingface' && hfData.score !== null) {
        // HF worked, use real result
        analysisResult = hfData;
        console.log('Using Hugging Face detection');
      } else {
        // FALL BACK: Use Groq with features
        const groqResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: callIdRef.current,
            chunkNumber: chunkNum,
            duration: currentTime,
            features,
          }),
        });

        analysisResult = await groqResponse.json();
        console.log('Using Groq detection (HF unavailable)');
      }

      const { score: s, riskLevel: r, artifacts: a } = analysisResult as {
        score: number;
        riskLevel: RiskLevel;
        artifacts: string[];
      };

      setLiveScore(s);
      setLiveRisk(r);

      setLiveChartData((prev) => [...prev, { time: currentTime, score: s }]);
      setLiveChunks((prev) => [
        ...prev,
        { 
          chunkNumber: chunkNum, 
          score: s, 
          artifacts: a, 
          features, 
          detectionMethod: (analysisResult as any).detectionMethod || "groq" 
        },
      ]);

      if (a && a.length > 0) {
        const newEntries: ArtifactEntry[] = a.map((text: string) => ({
          text,
          time: currentTime,
          riskLevel: r,
        }));
        setLiveArtifacts((prev) => [...prev, ...newEntries]);
        setLiveAllArtifacts((prev) => {
          const set = new Set([...prev, ...a]);
          return Array.from(set);
        });
      }
    } catch (err) {
      console.error("Analyze error:", err);
    }
  }, [mode]);

  const audioCapture = useAudioCapture({
    chunkInterval: 3000,
    onChunk: handleChunk,
  });

  /* ── Derived values based on mode ───────────────── */
  const score = mode === "demo" ? sim.currentScore : liveScore;
  const riskLevel = mode === "demo" ? sim.currentRisk : liveRisk;
  const artifacts = mode === "demo" ? sim.currentArtifacts : liveArtifacts;
  const chartData = mode === "demo" ? sim.chartData : liveChartData;
  const elapsed = mode === "demo" ? sim.elapsed : liveElapsed;
  const chunks = mode === "demo" ? sim.chunks : liveChunks;
  const allArtifacts = mode === "demo" ? sim.allArtifacts : liveAllArtifacts;

  const isDanger = riskLevel === "danger" && score > 70;

  /* ── Start monitoring on mount ──────────────────── */

  useEffect(() => {
    if (mode === "demo") {
      audioCapture.startListening();
      sim.start();
    } else {
      // Live mode
      audioCapture.startListening();

      // Start elapsed timer (counts every second)
      timerIntervalRef.current = setInterval(() => {
        setLiveElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (mode === "demo") {
        sim.stop();
      } else {
        audioCapture.stopListening();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* ── End Call handler ───────────────────────────── */

  const handleEndCall = useCallback(() => {
    // Stop everything
    if (mode === "demo") {
      sim.stop();
    } else {
      audioCapture.stopListening();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    // Calculate peak score
    const peakScore = Math.max(...chunks.map((c) => c.score), 0);

    // Save to localStorage
    const callData = {
      callId: callIdRef.current,
      chunks: chunks.map((c) => ({
        chunkNumber: c.chunkNumber,
        score: c.score,
        artifacts: c.artifacts,
        riskLevel: c.score > 70 ? "danger" : c.score > 35 ? "suspicious" : "safe",
        features: c.features,
      })),
      peakScore,
      totalDuration: elapsed,
      allArtifacts: [...new Set(allArtifacts)],
      detectionMethods: [...new Set(chunks.map((c) => c.detectionMethod || (mode === "demo" ? "demo" : "groq")))],
    };

    localStorage.setItem("callsaathi_call_data", JSON.stringify(callData));

    // Navigate to report
    router.push("/report");
  }, [mode, sim, audioCapture, chunks, elapsed, allArtifacts, router]);

  /* ── Render ─────────────────────────────────────── */

  return (
    <main
      className="relative min-h-screen flex flex-col"
      style={{
        background: "var(--bg-primary)",
        transition: "box-shadow 0.6s ease",
        boxShadow: isDanger
          ? "inset 0 0 80px rgba(255, 34, 68, 0.15)"
          : "none",
      }}
    >
      {/* Animated grid bg */}
      <div className="animated-grid-bg" />

      {/* Alert Banner */}
      <AlertBanner score={score} visible={isDanger} />

      {/* ── Top Bar ────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full px-4 md:px-8 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: "rgba(0, 255, 136, 0.1)",
              border: "1px solid rgba(0, 255, 136, 0.25)",
            }}
          >
            <svg
              width="16"
              height="16"
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
          </div>
          <span
            className="text-sm font-bold tracking-wide"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              color: "var(--text-primary)",
            }}
          >
            Call<span style={{ color: "var(--state-safe)" }}>Saathi</span>
          </span>

          {/* Demo badge */}
          {mode === "demo" && (
            <span
              className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                background: "rgba(255, 170, 0, 0.12)",
                border: "1px solid rgba(255, 170, 0, 0.3)",
                color: "var(--state-warn)",
              }}
            >
              Demo Mode
            </span>
          )}
        </div>

        {/* Center: Timer */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-lg font-bold"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            color: "var(--text-primary)",
          }}
        >
          {formatDuration(elapsed)}
        </div>

        {/* Right: End Call */}
        <button
          id="btn-end-call"
          onClick={handleEndCall}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            background: "rgba(255, 34, 68, 0.1)",
            border: "1px solid rgba(255, 34, 68, 0.35)",
            color: "var(--state-danger)",
          }}
        >
          ■ End Call
        </button>
      </motion.header>

      {/* ── Main Content ───────────────────────────── */}
      <div className="relative z-10 flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full">
          {/* Left Column (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4 w-full md:w-[60%]"
          >
            {/* Waveform */}
            <div>
              <div
                className="text-[10px] uppercase tracking-widest mb-2 px-1"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  color: "var(--text-secondary)",
                }}
              >
                ● Audio Waveform
              </div>
              <Waveform
                analyserNode={audioCapture.analyserNode}
                riskLevel={riskLevel}
              />
            </div>

            {/* Timeline */}
            <div>
              <div
                className="text-[10px] uppercase tracking-widest mb-2 px-1"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  color: "var(--text-secondary)",
                }}
              >
                ● Detection Timeline
              </div>
              <TimelineGraph data={chartData} />
            </div>

            {/* Mic error message */}
            {audioCapture.error && (
              <div
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(255, 34, 68, 0.08)",
                  border: "1px solid rgba(255, 34, 68, 0.2)",
                  color: "var(--state-danger)",
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                {audioCapture.error}
              </div>
            )}
          </motion.div>

          {/* Right Column (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col gap-4 w-full md:w-[40%]"
          >
            {/* Score Meter */}
            <div
              className="rounded-xl p-6 flex justify-center"
              style={{
                background: "rgba(10, 10, 15, 0.6)",
                border: "1px solid var(--border)",
              }}
            >
              <ScoreMeter score={score} riskLevel={riskLevel} />
            </div>

            {/* Artifact Feed */}
            <div>
              <div
                className="text-[10px] uppercase tracking-widest mb-2 px-1"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  color: "var(--text-secondary)",
                }}
              >
                ● Live Analysis
              </div>
              <ArtifactFeed
                artifacts={artifacts as ArtifactEntry[]}
                riskLevel={riskLevel}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

/* ── Page (Suspense boundary for useSearchParams) ──── */

export default function MonitorPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--bg-primary)" }}
        >
          <div
            className="text-sm animate-pulse"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              color: "var(--text-secondary)",
            }}
          >
            Initializing monitor...
          </div>
        </div>
      }
    >
      <MonitorContent />
    </Suspense>
  );
}
