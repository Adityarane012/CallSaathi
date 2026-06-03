"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Dot,
} from "recharts";

/* ── Types ──────────────────────────────────────────── */

export interface ChartPoint {
  time: number;
  score: number;
}

interface TimelineGraphProps {
  data: ChartPoint[];
}

/* ── Custom active dot ──────────────────────────────── */

function ActiveDot(props: Record<string, unknown>) {
  const { cx, cy, value } = props as { cx: number; cy: number; value: number };
  if (cx == null || cy == null) return null;

  const color =
    (value as number) >= 70
      ? "#ff2244"
      : (value as number) >= 50
        ? "#ffaa00"
        : "#00ff88";

  return (
    <g>
      {/* Outer glow ring */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.3}
      >
        <animate
          attributeName="r"
          from="6"
          to="12"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.4"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={4} fill={color} stroke="#0a0a0f" strokeWidth={2} />
    </g>
  );
}

/* ── Custom line dot ────────────────────────────────── */

function LineDot(props: Record<string, unknown>) {
  const { cx, cy, index, payload } = props as {
    cx: number;
    cy: number;
    index: number;
    payload: ChartPoint;
  };
  if (cx == null || cy == null) return null;

  const color =
    payload.score >= 70
      ? "#ff2244"
      : payload.score >= 50
        ? "#ffaa00"
        : "#00ff88";

  return (
    <Dot
      key={index}
      cx={cx}
      cy={cy}
      r={2.5}
      fill={color}
      stroke="none"
    />
  );
}

/* ── Gradient ID ────────────────────────────────────── */

const GRADIENT_ID = "scoreGradient";
const AREA_GRADIENT_ID = "areaGradient";

/* ── Component ──────────────────────────────────────── */

export default function TimelineGraph({ data }: TimelineGraphProps) {
  if (data.length === 0) {
    return (
      <div
        className="w-full rounded-xl flex items-center justify-center"
        style={{
          height: 200,
          background: "rgba(10, 10, 15, 0.6)",
          border: "1px solid var(--border)",
        }}
      >
        <span
          className="text-sm"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            color: "var(--text-secondary)",
          }}
        >
          Waiting for data...
        </span>
      </div>
    );
  }

  // Determine current line color from latest point
  const latestScore = data[data.length - 1]?.score ?? 0;
  const lineColor =
    latestScore >= 70 ? "#ff2244" : latestScore >= 50 ? "#ffaa00" : "#00ff88";

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        height: 200,
        background: "rgba(10, 10, 15, 0.6)",
        border: "1px solid var(--border)",
        padding: "12px 8px 4px 0",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <defs>
            {/* Line gradient */}
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2244" />
              <stop offset="30%" stopColor="#ffaa00" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
            {/* Area fill */}
            <linearGradient id={AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#2a2a3e"
            strokeDasharray="3 6"
            horizontal={true}
            vertical={false}
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#8888aa",
              fontSize: 10,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
            tickFormatter={(v: number) => `${v}s`}
          />

          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#8888aa",
              fontSize: 10,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
            tickFormatter={(v: number) => `${v}%`}
            width={38}
          />

          {/* Threshold reference lines */}
          <ReferenceLine
            y={50}
            stroke="#ffaa00"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: "Suspicious",
              position: "right",
              fill: "#ffaa0080",
              fontSize: 9,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          />
          <ReferenceLine
            y={70}
            stroke="#ff2244"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: "Danger",
              position: "right",
              fill: "#ff224480",
              fontSize: 9,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          />

          {/* Area fill under the line */}
          <Area
            type="monotone"
            dataKey="score"
            fill={`url(#${AREA_GRADIENT_ID})`}
            stroke="none"
            isAnimationActive={false}
          />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="score"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={<LineDot />}
            activeDot={<ActiveDot />}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
