"use client";

import { useRef, useEffect, useCallback } from "react";

/* ── Types ──────────────────────────────────────────── */

export type RiskLevel = "safe" | "suspicious" | "danger";

interface WaveformProps {
  /** The AnalyserNode from useAudioCapture — null when mic is off */
  analyserNode: AnalyserNode | null;
  /** Current risk level — drives the bar color */
  riskLevel: RiskLevel;
  /** Optional CSS class on the outer wrapper */
  className?: string;
}

/* ── Color map ──────────────────────────────────────── */

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "#00ff88",
  suspicious: "#ffaa00",
  danger: "#ff2244",
};

const RISK_GLOW: Record<RiskLevel, string> = {
  safe: "rgba(0, 255, 136, 0.35)",
  suspicious: "rgba(255, 170, 0, 0.35)",
  danger: "rgba(255, 34, 68, 0.35)",
};

/* ── Constants ──────────────────────────────────────── */

const BAR_COUNT = 64;
const BAR_GAP = 2;
const CANVAS_HEIGHT = 120;
const IDLE_WAVE_SPEED = 0.02;
const IDLE_AMPLITUDE = 6;
const COLOR_LERP_SPEED = 0.06;

/* ── Helpers ────────────────────────────────────────── */

/** Parse hex (#rrggbb) to [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Lerp between two RGB colors */
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function rgbToString(c: [number, number, number], alpha = 1): string {
  return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`;
}

/* ── Component ──────────────────────────────────────── */

export default function Waveform({
  analyserNode,
  riskLevel,
  className = "",
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const currentColorRef = useRef<[number, number, number]>(
    hexToRgb(RISK_COLORS.safe)
  );

  /* ── Draw loop ────────────────────────────────────── */

  useEffect(() => {
    let animationId: number;
    
    const renderFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Resize canvas to match display size (retina aware)
      if (
        canvas.width !== rect.width * dpr ||
        canvas.height !== rect.height * dpr
      ) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const W = rect.width;
      const H = rect.height;

      // Lerp color toward target
      const targetColor = hexToRgb(RISK_COLORS[riskLevel]);
      currentColorRef.current = lerpColor(
        currentColorRef.current,
        targetColor,
        COLOR_LERP_SPEED
      );
      const color = currentColorRef.current;

      // Clear
      ctx.clearRect(0, 0, W, H);

      const barWidth = (W - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT;

      if (analyserNode) {
        /* ── Live mode: real frequency data ─────────── */
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        // Map frequency bins to our bar count
        const step = Math.floor(bufferLength / BAR_COUNT);

        for (let i = 0; i < BAR_COUNT; i++) {
          // Average a few bins for each bar
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j] || 0;
          }
          const avg = sum / step;
          const normalised = avg / 255;

          // Bar height: min 2px, max 90% of canvas
          const barH = Math.max(2, normalised * H * 0.9);
          const x = i * (barWidth + BAR_GAP);
          const y = (H - barH) / 2;

          // Gradient per bar
          const grad = ctx.createLinearGradient(x, y, x, y + barH);
          grad.addColorStop(0, rgbToString(color, 0.9));
          grad.addColorStop(0.5, rgbToString(color, 1));
          grad.addColorStop(1, rgbToString(color, 0.9));

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 1.5);
          ctx.fill();
        }

        // Subtle glow reflection at center line
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = rgbToString(color);
        ctx.fillRect(0, H / 2 - 0.5, W, 1);
        ctx.restore();
      } else {
        /* ── Idle mode: gentle sine wave ────────────── */
        timeRef.current += IDLE_WAVE_SPEED;

        for (let i = 0; i < BAR_COUNT; i++) {
          const phase = (i / BAR_COUNT) * Math.PI * 4 + timeRef.current;
          const sine = Math.sin(phase);
          const barH = Math.max(2, Math.abs(sine) * IDLE_AMPLITUDE + 2);
          const x = i * (barWidth + BAR_GAP);
          const y = (H - barH) / 2;

          ctx.fillStyle = rgbToString(color, 0.25 + Math.abs(sine) * 0.35);
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 1);
          ctx.fill();
        }

        // Faint center line
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = rgbToString(color);
        ctx.fillRect(0, H / 2 - 0.5, W, 1);
        ctx.restore();
      }

      animationId = requestAnimationFrame(renderFrame);
    };

    animationId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationId);
  }, [analyserNode, riskLevel]);

  /* ── Render ───────────────────────────────────────── */

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      style={{
        height: CANVAS_HEIGHT,
        background: "rgba(10, 10, 15, 0.6)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Glow overlay at the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${rgbToString(
            hexToRgb(RISK_COLORS[riskLevel]),
            0.06
          )}, transparent)`,
        }}
      />

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
