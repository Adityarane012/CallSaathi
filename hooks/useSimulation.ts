"use client";

import { useState, useCallback, useRef } from "react";
import { demoScript, type RiskLevel } from "@/lib/demoScript";

/* ── Types ──────────────────────────────────────────── */

import { AudioFeatures } from "@/types";

export interface ChartPoint {
  time: number;
  score: number;
}

export interface ArtifactEntry {
  text: string;
  time: number;
  riskLevel: RiskLevel;
}

export interface ChunkRecord {
  chunkNumber: number;
  score: number;
  artifacts: string[];
  features?: AudioFeatures;
}

export interface UseSimulationReturn {
  currentScore: number;
  currentRisk: RiskLevel;
  currentArtifacts: ArtifactEntry[];
  allArtifacts: string[];
  chartData: ChartPoint[];
  chunks: ChunkRecord[];
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/* ── Hook ───────────────────────────────────────────── */

export function useSimulation(): UseSimulationReturn {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>("safe");
  const [currentArtifacts, setCurrentArtifacts] = useState<ArtifactEntry[]>([]);
  const [allArtifacts, setAllArtifacts] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chunks, setChunks] = useState<ChunkRecord[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Fire one step ────────────────────────────────── */

  const fireStep = useCallback(() => {
    const idx = indexRef.current;

    if (idx >= demoScript.length) {
      // Script finished — keep running timer but don't advance
      setElapsed((prev) => prev + 3);
      return;
    }

    const step = demoScript[idx];

    setCurrentScore(step.score);
    setCurrentRisk(step.risk);
    setElapsed(step.time);

    // Accumulate chart data
    setChartData((prev) => [...prev, { time: step.time, score: step.score }]);

    // Accumulate chunk records
    setChunks((prev) => [
      ...prev,
      {
        chunkNumber: idx + 1,
        score: step.score,
        artifacts: step.artifacts,
        features: step.features,
      },
    ]);

    // Add new artifacts
    if (step.artifacts.length > 0) {
      const newEntries: ArtifactEntry[] = step.artifacts.map((text) => ({
        text,
        time: step.time,
        riskLevel: step.risk,
      }));
      setCurrentArtifacts((prev) => [...prev, ...newEntries]);
      setAllArtifacts((prev) => {
        const set = new Set([...prev, ...step.artifacts]);
        return Array.from(set);
      });
    }

    indexRef.current = idx + 1;
  }, []);

  /* ── Start ────────────────────────────────────────── */

  const start = useCallback(() => {
    if (intervalRef.current) return; // Already running

    setIsRunning(true);

    // Fire first step immediately
    fireStep();

    // Then fire every 3 seconds
    intervalRef.current = setInterval(fireStep, 3000);
  }, [fireStep]);

  /* ── Stop ─────────────────────────────────────────── */

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /* ── Reset ────────────────────────────────────────── */

  const reset = useCallback(() => {
    stop();
    indexRef.current = 0;
    setCurrentScore(0);
    setCurrentRisk("safe");
    setCurrentArtifacts([]);
    setAllArtifacts([]);
    setChartData([]);
    setChunks([]);
    setElapsed(0);
  }, [stop]);

  return {
    currentScore,
    currentRisk,
    currentArtifacts,
    allArtifacts,
    chartData,
    chunks,
    elapsed,
    isRunning,
    start,
    stop,
    reset,
  };
}
