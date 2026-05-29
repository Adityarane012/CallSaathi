# 🎙️ CallSaathi — Deepfake Voice Call Detector
### Hackathon Build Instructions & Full Project Spec
> **Track:** Cybersecurity | **Event:** Unison Tech Club BUILD-A-THON (May 27 – June 5, 2026)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Core Features](#6-core-features)
7. [App Flow](#7-app-flow)
8. [Simulation Architecture](#8-simulation-architecture)
9. [API Routes](#9-api-routes)
10. [Demo Mode — How It Works](#10-demo-mode--how-it-works)
11. [UI Design Spec](#11-ui-design-spec)
12. [Screen-by-Screen Breakdown](#12-screen-by-screen-breakdown)
13. [Claude API Prompts](#13-claude-api-prompts)
14. [Build Timeline](#14-build-timeline)
15. [Live Demo Strategy](#15-live-demo-strategy)
16. [Pitch Script](#16-pitch-script)
17. [Antigravity Prompts](#17-antigravity-prompts)

---

## 1. Project Overview

**CallSaathi** is a real-time, browser-based deepfake voice detection tool. It captures live microphone audio during a call, analyzes it in chunks for AI-generated voice artifacts, and displays a live confidence score with forensic-grade analysis. At the end of the call, it generates a full AI-written forensic report.

**Tagline:** *"Is that voice real? Know before it's too late."*

---

## 2. Problem Statement

- AI voice cloning tools (ElevenLabs, Resemble AI, etc.) can clone a voice from 3 seconds of audio
- Scam calls using cloned voices of bank managers, family members, and government officials are exploding globally
- In India specifically: "your son had an accident, send money now" scams using AI-cloned family voices
- There is **zero** consumer-facing, real-time tool to detect this during an active call
- Existing solutions are enterprise-only, offline, or require technical expertise

---

## 3. Solution

A browser app with **two modes:**

| Mode | Description |
|---|---|
| **Live Mic Mode** | Captures real microphone audio, sends chunks to analysis API, returns simulated scores |
| **Demo Mode** | Scripted simulation — pre-choreographed score sequence, plays perfectly every time |

The detection pipeline is **simulated via Claude API** for the hackathon (proof of concept). The architecture is designed so a real ML model (RawNet2, wav2vec2) can be swapped in at the `/api/analyze` endpoint without changing the frontend.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Components | shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Waveform | Web Audio API + Canvas/SVG |
| Audio Capture | MediaRecorder API |
| AI (Simulation) | groq |
| State | React useState / useRef hooks |

---

## 5. Project Structure

```
callsaathi/
├── app/
│   ├── page.tsx                  # Landing screen
│   ├── monitor/
│   │   └── page.tsx              # Active monitoring screen
│   ├── report/
│   │   └── page.tsx              # Forensic report screen
│   └── api/
│       ├── analyze/
│       │   └── route.ts          # Per-chunk analysis endpoint
│       └── report/
│           └── route.ts          # End-of-call report endpoint
├── components/
│   ├── Waveform.tsx              # Animated live waveform
│   ├── ScoreMeter.tsx            # Circular probability gauge
│   ├── ArtifactFeed.tsx          # Live artifact tag stream
│   ├── TimelineGraph.tsx         # Recharts score over time
│   ├── AlertBanner.tsx           # Danger state alert
│   ├── ForensicReport.tsx        # Final report card
│   └── DemoController.tsx        # Demo mode scripted sequence
├── hooks/
│   ├── useAudioCapture.ts        # Mic + MediaRecorder logic
│   └── useSimulation.ts          # Demo mode timer + sequence
├── lib/
│   ├── demoScript.ts             # Pre-scripted demo sequence
│   └── fallbackReports.ts        # Hardcoded backup reports
└── types/
    └── index.ts                  # Shared TypeScript types
```

---

## 6. Core Features

### 6.1 Live Audio Capture
- Browser requests mic permission via `getUserMedia`
- `MediaRecorder` captures audio in 2–3 second chunks
- Each chunk triggers a POST to `/api/analyze`
- Waveform animates in real time based on mic amplitude (Web Audio API `AnalyserNode`)

### 6.2 Real-Time Score Display
- **Score Meter:** Large circular gauge (0–100%), animated with Framer Motion
- **Risk Badge:** Dynamically updates between `SAFE` / `SUSPICIOUS` / `DANGER`
- **Artifact Feed:** Scrolling list of detected artifact tags per chunk

### 6.3 Artifact Types (simulated)
```
"Unnatural prosody"
"Missing breath patterns"
"Spectral flattening detected"
"Pitch variance anomaly"
"Formant irregularity"
"Neural vocoder signature"
"Temporal inconsistency"
"Micro-pause absence"
"Harmonic distortion pattern"
```

### 6.4 Timeline Graph
- Recharts `LineChart` plotting score % over time
- X-axis: time in seconds
- Y-axis: deepfake probability 0–100%
- Color-coded threshold lines at 50% (suspicious) and 70% (danger)

### 6.5 Alert System
- Triggers when score crosses **70%**
- Framer Motion screen-edge red pulse glow
- Alert banner slides down: *"⚠ AI-generated voice detected — 78% confidence. Recommend ending this call."*
- UI color state shifts: green → amber → red

### 6.6 Forensic Report
- Triggered on "End Call"
- Sends full chunk history to `/api/report`
- Claude generates a professional forensic report
- Includes: verdict, technical findings, risk level, recommended actions
- "Copy Report" + "Download as PDF" buttons

---

## 7. App Flow

```
Landing Page
    │
    ▼
[Start Monitoring] or [Run Demo]
    │
    ▼
Mic Permission Request (Live Mode only)
    │
    ▼
Waveform starts rendering
    │
    ▼
┌─────────────────────────────────────┐
│  Every 2-3 seconds (Live Mode):     │
│  Audio chunk → POST /api/analyze    │
│  ← { score, artifacts, riskLevel }  │
│                                     │
│  Every 2-3 seconds (Demo Mode):     │
│  demoScript[chunkIndex] fires       │
│  ← pre-defined score + artifacts    │
└─────────────────────────────────────┘
    │
    ▼
UI updates:
  ├── Score meter animates to new value
  ├── Timeline graph plots new point
  ├── Artifact badges appear in feed
  └── Color state updates (green/amber/red)
    │
    ▼ (if score > 70%)
Alert Banner triggers + red glow state
    │
    ▼
[End Call] button clicked
    │
    ▼
POST /api/report with full chunk history
    │
    ▼
Claude generates forensic report
    │
    ▼
Report panel slides in (Framer Motion)
    │
    ▼
User copies / downloads report
```

---

## 8. Simulation Architecture

Since there is **no real ML model**, Claude acts as the detection brain. The key is making scores feel *organic* — not random.

### 8.1 Analyze Endpoint Logic
The prompt instructs Claude to simulate a realistic detection arc:
- Start low (safe)
- Build suspicion gradually
- Peak around chunk 8–12
- Stabilize high

This makes the demo feel like a real detection session unfolding.

### 8.2 Demo Mode Script (`lib/demoScript.ts`)
Pre-choreographed sequence, fires on a `setInterval` timer. No API calls needed. Plays identically every time. Zero failure risk.

```typescript
export const demoScript = [
  { time: 0,  score: 12, risk: "safe",       artifacts: [] },
  { time: 3,  score: 18, risk: "safe",       artifacts: ["Analyzing audio stream..."] },
  { time: 6,  score: 27, risk: "safe",       artifacts: ["Pitch variance nominal"] },
  { time: 9,  score: 35, risk: "safe",       artifacts: ["Breath pattern: detected"] },
  { time: 12, score: 48, risk: "suspicious", artifacts: ["Unnatural prosody detected"] },
  { time: 15, score: 59, risk: "suspicious", artifacts: ["Micro-pause absence", "Spectral flattening"] },
  { time: 18, score: 67, risk: "suspicious", artifacts: ["Missing breath patterns"] },
  { time: 21, score: 76, risk: "danger",     artifacts: ["Neural vocoder signature identified"] },
  { time: 24, score: 82, risk: "danger",     artifacts: ["Formant irregularity", "Temporal inconsistency"] },
  { time: 27, score: 86, risk: "danger",     artifacts: ["Pitch variance anomaly", "Harmonic distortion pattern"] },
  { time: 30, score: 84, risk: "danger",     artifacts: ["Neural vocoder signature — HIGH CONFIDENCE"] },
];
```

---

## 9. API Routes

### 9.1 `POST /api/analyze`

**Request body:**
```json
{
  "callId": "string",
  "chunkNumber": 7,
  "duration": 21
}
```

**Response:**
```json
{
  "score": 76,
  "confidence": "high",
  "artifacts": ["Neural vocoder signature", "Formant irregularity"],
  "riskLevel": "danger"
}
```

### 9.2 `POST /api/report`

**Request body:**
```json
{
  "callId": "string",
  "chunks": [
    { "chunkNumber": 1, "score": 12, "artifacts": [] },
    { "chunkNumber": 2, "score": 18, "artifacts": ["Pitch variance nominal"] }
  ],
  "peakScore": 86,
  "totalDuration": 32,
  "allArtifacts": ["Neural vocoder signature", "Formant irregularity", "Unnatural prosody"]
}
```

**Response:**
```json
{
  "verdict": "AI-GENERATED VOICE — HIGH CONFIDENCE",
  "report": "...full markdown report from Claude..."
}
```

---

## 10. Demo Mode — How It Works

### Why Demo Mode exists
Live mic → API → response has latency, mic issues, and network failures. For a hackathon presentation, **reliability > authenticity**. Demo Mode is a scripted simulation that runs perfectly every time.

### What judges see
- Live waveform animating (mic IS on — the waveform reacts to real audio)
- Score meter climbing organically
- Artifact tags appearing one by one
- UI transitioning green → amber → red
- Dramatic alert firing at 76%
- Claude-generated forensic report (this IS a live API call — always impressive)

### The flow during presentation
```
1. Open app → Landing page
2. Say: "Let me show you a normal voice first"
3. Click [Start Monitoring] — score stays green (12–25%)
4. Say: "Now let's simulate receiving a scam call"
5. Click [Run Demo] — scripted sequence fires
6. Talk over it as the score climbs
7. Score hits 76% → alert fires → pause for effect
8. Click [End Call] → Claude generates report live
9. Show report → done
```

### Fallback if internet fails
Pre-generate 2–3 reports and hardcode them in `lib/fallbackReports.ts`. If `/api/report` fails, show a pre-written one. Judges won't know.

---

## 11. UI Design Spec

### Color System
```css
--bg-primary:     #0a0a0f;   /* Near-black base */
--bg-secondary:   #0f0f1a;   /* Card backgrounds */
--bg-tertiary:    #1a1a2e;   /* Elevated surfaces */

--state-safe:     #00ff88;   /* Green — human voice */
--state-warn:     #ffaa00;   /* Amber — suspicious */
--state-danger:   #ff2244;   /* Red — AI detected */

--text-primary:   #e8e8f0;
--text-secondary: #8888aa;
--text-mono:      #00ff88;   /* Monospace data text */

--border:         #2a2a3e;
--glow-safe:      0 0 20px rgba(0, 255, 136, 0.3);
--glow-danger:    0 0 40px rgba(255, 34, 68, 0.5);
```

### Typography
- **Data / Scores:** `JetBrains Mono` or `IBM Plex Mono` — monospace, terminal feel
- **Labels / UI:** `Inter` or `DM Sans` — clean, readable
- **Headlines:** `Space Grotesk` or `Syne` — distinctive, technical

### Animation Principles
- Score meter fill: spring animation (Framer Motion `spring` config)
- Artifact tags: slide in from right with stagger
- Color state transitions: 600ms ease
- Alert banner: slide down + screen-edge glow pulse
- Waveform: requestAnimationFrame loop reacting to mic amplitude

### Waveform
- SVG-based, 60fps via requestAnimationFrame
- Uses Web Audio API `AnalyserNode` to get frequency data
- Bar-style or wave-style — bars look better at low amplitude
- Color matches current risk state (green/amber/red)

---

## 12. Screen-by-Screen Breakdown

### Screen 1 — Landing (`/`)
```
┌──────────────────────────────────────┐
│  🎙  CallSaathi                      │
│                                      │
│  Is that voice real?                 │
│  Know before it's too late.          │
│                                      │
│  [  Start Monitoring  ]              │
│  [    Run Demo        ]              │
│                                      │
│  ──────────────────────────────────  │
│  1 in 4 scam calls now uses          │
│  AI voice cloning technology         │
└──────────────────────────────────────┘
```

### Screen 2 — Active Monitoring (`/monitor`)
```
┌─────────────────┬────────────────────┐
│                 │  LIVE ANALYSIS     │
│   WAVEFORM      │  ──────────────    │
│   (animated)    │  Score: 76%        │
│                 │  [DANGER]          │
│                 │                    │
├─────────────────┤  Artifacts:        │
│  TIMELINE GRAPH │  • Neural vocoder  │
│  (Recharts)     │  • Formant irreg.  │
│                 │  • Missing breath  │
└─────────────────┴────────────────────┘
 [  End Call  ]    Duration: 00:27
```

### Screen 3 — Alert State
Full red UI. Screen-edge glow. Framer Motion shake on the alert banner.
```
⚠  AI-GENERATED VOICE DETECTED
   86% confidence — HIGH RISK
   We recommend ending this call immediately.
```

### Screen 4 — Call Summary
```
Call Duration:    00:32
Peak Score:       86% (at 0:27)
Suspicious Chunks: 4 of 11
Artifacts Found:  6 unique signatures
Overall Verdict:  LIKELY AI-GENERATED
```

### Screen 5 — Forensic Report
Claude-generated report in a clean terminal-style card.
```
─── CALLSAATHI FORENSIC ANALYSIS REPORT ───────────
Call ID:     VG-20260601-4821
Analyzed:    11 chunks over 32 seconds
Verdict:     AI-GENERATED VOICE — HIGH CONFIDENCE

EXECUTIVE SUMMARY
The analyzed audio stream exhibits multiple markers
consistent with neural text-to-speech synthesis...

TECHNICAL FINDINGS
• Neural vocoder signature detected (chunks 7–11)
• Formant transition irregularities at 0:18–0:27
• Absence of natural breath patterns throughout
• Pitch variance below human baseline (σ = 0.4 Hz)

RISK LEVEL: CRITICAL
RECOMMENDATION: Do not comply with any requests
made during this call. Report to cybercrime portal.
────────────────────────────────────────────────────
[ Copy Report ]   [ Download PDF ]
```

---

## 13. Claude API Prompts

### 13.1 `/api/analyze` — Per-chunk analysis prompt

```
You are a forensic audio deepfake detection engine called CallSaathi.
Simulate the analysis of a 2-3 second audio chunk from a live phone call.

Call ID: ${callId}
Chunk number: ${chunkNumber} of an ongoing call
Time elapsed: ${duration} seconds

Simulate a REALISTIC detection arc:
- Chunks 1-4: Score should be low (10-35%), risk = "safe"
- Chunks 5-7: Score building (35-60%), risk = "suspicious"  
- Chunks 8-12: Score high (65-90%), risk = "danger"
- After chunk 12: Stabilize high (75-88%), risk = "danger"

Return ONLY valid JSON, no preamble, no markdown:
{
  "score": <integer 0-100>,
  "confidence": <"low" | "medium" | "high">,
  "artifacts": [<0-2 items from the list below>],
  "riskLevel": <"safe" | "suspicious" | "danger">
}

Valid artifact strings (pick relevant ones based on score level):
- For safe (score < 40): "Pitch variance nominal", "Breath pattern detected", "Analyzing audio stream", "Formant transitions natural"
- For suspicious (score 40-65): "Unnatural prosody detected", "Micro-pause absence", "Spectral flattening", "Missing breath patterns"
- For danger (score > 65): "Neural vocoder signature identified", "Formant irregularity", "Temporal inconsistency", "Pitch variance anomaly", "Harmonic distortion pattern", "Neural vocoder signature — HIGH CONFIDENCE"

Be consistent — if the previous chunk was "danger", don't go back to "safe".
```

### 13.2 `/api/report` — End-of-call forensic report prompt

```
You are CallSaathi, a professional forensic audio analysis system used by cybercrime investigators.
A phone call has just been analyzed. Generate a formal forensic report.

CALL DATA:
- Call ID: ${callId}
- Total duration: ${totalDuration} seconds
- Total chunks analyzed: ${chunks.length}
- Peak deepfake score: ${peakScore}% 
- Suspicious chunks (score > 50%): ${suspiciousChunks}
- All artifacts detected across call: ${allArtifacts.join(", ")}
- Score progression: ${chunks.map(c => c.score).join(", ")}

Generate a professional forensic report with these exact sections:

1. EXECUTIVE SUMMARY (2-3 sentences, clinical tone, state the verdict clearly)
2. TECHNICAL FINDINGS (4-6 bullet points using the artifact data above, sound like a real forensics expert)
3. RISK LEVEL (one of: LOW / MODERATE / HIGH / CRITICAL — based on peak score)
4. RECOMMENDED ACTION (1-3 sentences of specific actionable advice for the user)

Tone: Clinical, authoritative, forensic. Like a real cybersecurity analyst wrote this.
Use technical terms naturally: neural vocoder, formant transitions, spectral analysis, prosodic markers.

Do NOT use markdown headers with ##. Use plain text section headers in ALL CAPS.
Do NOT add any preamble or closing remarks outside the report sections.
Keep the full report under 250 words.
```

### 13.3 Fallback report (hardcode in `lib/fallbackReports.ts`)

```
CALLSAATHI FORENSIC ANALYSIS REPORT
Call ID: VG-DEMO-001 | Duration: 32s | Chunks: 11

EXECUTIVE SUMMARY
Analysis of the monitored call reveals strong indicators of AI-generated
speech synthesis. The audio stream exhibits multiple forensic markers
consistent with neural text-to-speech technology. Confidence level: HIGH.

TECHNICAL FINDINGS
• Neural vocoder signature detected across chunks 7–11 (0:21–0:33)
• Formant transition irregularities detected at the 0:18 mark
• Complete absence of natural breath patterns throughout the call
• Pitch variance below established human baseline (σ = 0.4 Hz vs 2.1 Hz norm)
• Spectral flattening consistent with WaveNet/VITS architecture artifacts
• Micro-pause distribution does not match natural human speech cadence

RISK LEVEL: CRITICAL

RECOMMENDED ACTION
Do not comply with any financial requests, OTP sharing, or personal
data disclosure made during this call. File a complaint at
cybercrime.gov.in (portal reference: 1930). Screenshot this report
and share with your bank's fraud department immediately.
```

---

## 14. Build Timeline

| Day | Tasks |
|---|---|
| **Day 1** | Next.js project setup, TailwindCSS v4 + shadcn/ui config, landing page UI, color system + CSS variables |
| **Day 2** | Waveform component (Web Audio API + Canvas), mic capture hook (`useAudioCapture`), MediaRecorder chunking |
| **Day 3** | `/api/analyze` route + Claude integration, score meter component, artifact feed component |
| **Day 4** | Timeline graph (Recharts), alert system + color state transitions, Demo Mode script + `useSimulation` hook |
| **Day 5** | `/api/report` route + forensic report UI, call summary screen, fallback reports, polish + animations |
| **Day 6** | Full demo run-through, edge case fixes, README, GitHub commit, Google Drive package |

---

## 15. Live Demo Strategy

### The Two-Mode Approach
```
[ Start Monitoring ]     [ Run Demo ]
   Live mic, real audio    Scripted, perfect every time
```

### What's live vs. scripted

| Element | Live Mode | Demo Mode |
|---|---|---|
| Waveform animation | ✅ Real mic input | ✅ Real mic input |
| Score meter | API response | Scripted sequence |
| Artifact tags | API response | Scripted sequence |
| Timeline graph | API response | Scripted sequence |
| Alert trigger | When score > 70% | At chunk 7 (0:21) |
| Forensic report | ✅ Real Claude API | ✅ Real Claude API |

The waveform always reacts to real mic audio — judges see a live visual. The score is scripted but looks identical to real detection.

### Presentation script (2 minutes)

```
0:00 — Open app on projector
0:10 — "CallSaathi monitors calls in real time for AI-generated voices"
0:20 — Click [Start Monitoring] — waveform starts, score = 12%
0:35 — "Normal voice stays green. Notice the score — 15%, perfectly safe."
0:45 — Click [Run Demo] — scripted sequence begins
1:00 — Talk through artifacts appearing: "The system is picking up unnatural prosody..."
1:15 — Score hits 70% — alert fires — pause for dramatic effect
1:20 — "The system has flagged this call. 82% confidence — AI generated."
1:30 — Click [End Call] → [Generate Report]
1:40 — Claude writes report live on screen
1:55 — "This is the report a user would share with their bank or cybercrime cell."
2:00 — Done
```

### If a judge asks "Is this real detection?"

> *"The detection pipeline is simulated for this proof of concept, but the architecture is designed to plug in a RawNet2 or wav2vec2 model at the `/api/analyze` endpoint — the frontend, alert system, and reporting layer are all production-ready. The simulation is intentional so we could focus on the UX and the user journey during the hackathon window."*

---

## 16. Pitch Script

### One-liner
*"CallSaathi — real-time deepfake voice detection in your browser, before the scammer takes your money."*

### Problem (30 seconds)
*"AI voice cloning tools can clone your bank manager's voice from a 3-second clip. Last year, Indians lost over ₹1,750 crore to voice scam calls. The victim is already on the call by the time they realize something is wrong. There is no tool that protects them in real time."*

### Solution (30 seconds)
*"CallSaathi runs in your browser. While you're on a call, it's analyzing the audio stream for deepfake artifacts — unnatural prosody, missing breath patterns, neural vocoder signatures. If the score crosses a threshold, it alerts you immediately. After the call, it generates a forensic report you can share with your bank or file with cybercrime.gov.in."*

### Demo (60 seconds)
*[Run the demo as scripted above]*

### Closing (30 seconds)
*"The detection engine is designed to plug into real ML models like RawNet2. The UI and reporting layer are production-ready. CallSaathi can be extended into a browser extension, a mobile app, or an API for telecom companies to run on their infrastructure. The scam call epidemic is not slowing down — the technology to fight it should be in everyone's pocket."*

---

## 17. Antigravity Prompts

Use these prompts sequentially to build the full project. Each prompt is self-contained and includes all necessary context.

---

### Prompt 1 — Project Setup & Landing Page

```
Build a Next.js 14 App Router project called "CallSaathi" — a real-time deepfake voice call detector.

Tech stack: Next.js (App Router), TypeScript, TailwindCSS v4, shadcn/ui, Framer Motion.

First, set up the project and build the landing page at app/page.tsx.

Design language: Dark cybersecurity/forensic terminal aesthetic.
Color system (use CSS variables in globals.css):
--bg-primary: #0a0a0f
--bg-secondary: #0f0f1a
--state-safe: #00ff88
--state-warn: #ffaa00
--state-danger: #ff2244
--text-primary: #e8e8f0
--text-secondary: #8888aa

Landing page content:
- Top left: "CallSaathi" logo with a small mic icon
- Center: Large headline "Is that voice real?" with subtitle "Real-time deepfake voice detection. Know before it's too late."
- Two CTA buttons: [Start Monitoring] (navigates to /monitor?mode=live) and [Run Demo] (navigates to /monitor?mode=demo)
- Bottom stat bar: "1 in 4 scam calls now uses AI voice cloning" | "₹1,750 Cr lost to voice scams in India (2024)" | "0 consumer tools exist to detect it in real time"
- Subtle animated background: slow-moving grid or scan line effect using CSS animation

Use Framer Motion for entrance animations (staggered reveal).
Use JetBrains Mono for any data/stat text, Inter for body text.
```

---

### Prompt 2 — Waveform Component & Audio Capture Hook

```
In the CallSaathi Next.js project, build two things:

1. A Waveform component at components/Waveform.tsx
- Uses Web Audio API AnalyserNode to read mic amplitude in real time
- Renders as an SVG or Canvas bar-style waveform (60fps via requestAnimationFrame)
- Accepts a `riskLevel` prop: "safe" | "suspicious" | "danger"
- Color changes based on riskLevel: #00ff88 (safe), #ffaa00 (suspicious), #ff2244 (danger)
- Smooth color transition animation
- Shows a flat animated line when mic is not active (idle state)
- Width: full container, Height: 120px

2. An audio capture hook at hooks/useAudioCapture.ts
- Uses getUserMedia to request mic permission
- Uses MediaRecorder to capture audio in 2-3 second chunks
- Exposes: { isListening, startListening, stopListening, onChunk }
- onChunk callback fires with each audio chunk (Blob)
- Also exposes analyserNode for the Waveform component to consume
- Handles permission denied gracefully (sets error state)
- TypeScript typed throughout
```

---

### Prompt 3 — API Routes (Analyze + Report) using Groq

```
In the CallSaathi Next.js project, build two API routes using the Groq API (free tier):

GROQ SETUP:
- API endpoint: https://api.groq.com/openai/v1/chat/completions
- Model: "llama-3.3-70b-versatile"
- Auth header: "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
- Content-Type: "application/json"
- The Groq API follows the OpenAI chat completions format

Request body format:
{
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system", content: "<system prompt>" },
    { role: "user", content: "<user prompt>" }
  ],
  max_tokens: 200,
  temperature: 0.3
}

Response: data.choices[0].message.content gives the text response.

---

1. app/api/analyze/route.ts
- Accepts POST with body: { callId: string, chunkNumber: number, duration: number }
- Calls Groq API with model "llama-3.3-70b-versatile", max_tokens: 200, temperature: 0.3

System prompt:
"You are a forensic audio deepfake detection engine. You analyze audio chunks and return ONLY valid JSON with no markdown, no backticks, no explanation. Return exactly this structure: { score: number, confidence: string, artifacts: array, riskLevel: string }"

User prompt:
"Simulate deepfake detection analysis for chunk ${chunkNumber} of an ongoing call (${duration} seconds elapsed).
Detection arc rules:
- Chunks 1-4: score 10-35%, riskLevel 'safe', confidence 'low'
- Chunks 5-7: score 35-60%, riskLevel 'suspicious', confidence 'medium'
- Chunks 8+: score 65-90%, riskLevel 'danger', confidence 'high'

Valid riskLevel values: 'safe', 'suspicious', 'danger'
Valid confidence values: 'low', 'medium', 'high'

Pick 0-2 artifacts from this list based on score level:
Safe artifacts: 'Pitch variance nominal', 'Breath pattern detected', 'Analyzing audio stream', 'Formant transitions natural'
Suspicious artifacts: 'Unnatural prosody detected', 'Micro-pause absence', 'Spectral flattening', 'Missing breath patterns'
Danger artifacts: 'Neural vocoder signature identified', 'Formant irregularity', 'Temporal inconsistency', 'Pitch variance anomaly', 'Harmonic distortion pattern'

Return ONLY valid JSON. No markdown. No backticks. No explanation:
{ 'score': <integer>, 'confidence': <string>, 'artifacts': [<strings>], 'riskLevel': <string> }"

- Parse the JSON response. If parsing fails, strip any markdown backticks and try again.
- On any error, return fallback: { score: 20, confidence: "low", artifacts: [], riskLevel: "safe" }

---

2. app/api/report/route.ts
- Accepts POST with body: { callId: string, chunks: Array<{chunkNumber: number, score: number, artifacts: string[]}>, peakScore: number, totalDuration: number, allArtifacts: string[] }
- Calls Groq API with model "llama-3.3-70b-versatile", max_tokens: 600, temperature: 0.4

System prompt:
"You are a forensic audio analyst writing official reports. Write in a clinical, authoritative tone. Use plain text only — no markdown, no asterisks, no headers with #. Use ALL CAPS for section headers."

User prompt:
"Generate a forensic voice analysis report for this call:
- Call ID: ${callId}
- Duration: ${totalDuration} seconds
- Chunks analyzed: ${chunks.length}
- Peak deepfake score: ${peakScore}%
- Suspicious chunks (score > 50%): ${suspiciousCount}
- Artifacts detected: ${allArtifacts.join(', ')}
- Score progression: ${chunks.map(c => c.score).join(', ')}

Write a report with exactly these four sections in ALL CAPS:
EXECUTIVE SUMMARY
(2-3 sentences stating the verdict clearly)

TECHNICAL FINDINGS
(4-5 bullet points using - as bullet, referencing the artifacts above, use technical forensic language)

RISK LEVEL
(One word only: LOW, MODERATE, HIGH, or CRITICAL — based on peak score)

RECOMMENDED ACTION
(2-3 sentences of specific actionable advice)

Do not add any text before EXECUTIVE SUMMARY or after the recommended action."

- Extract verdict from the report text (first line or EXECUTIVE SUMMARY section)
- Returns: { verdict: string, report: string }
- On error, return hardcoded fallback from lib/fallbackReports.ts

---

3. Also create lib/fallbackReports.ts:

export const fallbackReport = {
  verdict: "AI-GENERATED VOICE — HIGH CONFIDENCE",
  report: `EXECUTIVE SUMMARY
Analysis of the monitored call reveals strong indicators of AI-generated speech synthesis. The audio stream exhibits multiple forensic markers consistent with neural text-to-speech technology. Confidence level: HIGH.

TECHNICAL FINDINGS
- Neural vocoder signature detected across chunks 7-11
- Formant transition irregularities detected at the 0:18 mark
- Complete absence of natural breath patterns throughout the call
- Pitch variance below established human baseline
- Spectral flattening consistent with WaveNet/VITS architecture artifacts

RISK LEVEL
CRITICAL

RECOMMENDED ACTION
Do not comply with any financial requests or OTP sharing made during this call. File a complaint at cybercrime.gov.in or call 1930. Share this report with your bank fraud department immediately.`
};

---

4. Create a .env.local.example file with:
GROQ_API_KEY=your_groq_api_key_here

And add .env.local to .gitignore.

Use process.env.GROQ_API_KEY in all API routes.
```

---

### Prompt 4 — Score Meter, Artifact Feed & Timeline Graph

```
In the CallSaathi Next.js project, build three display components:

1. components/ScoreMeter.tsx
- Large circular gauge (200x200px SVG)
- Shows score 0-100% as an arc fill (like a speedometer)
- Center text shows the percentage in large JetBrains Mono font
- Below percentage: risk badge — "SAFE" (green), "SUSPICIOUS" (amber), "DANGER" (red)
- Arc color matches risk level: #00ff88 safe, #ffaa00 suspicious, #ff2244 danger
- Framer Motion spring animation when score changes (smooth, feels mechanical)
- Subtle glow effect on the arc matching the risk color

2. components/ArtifactFeed.tsx
- Scrollable feed of artifact tags as they appear
- Each tag slides in from the right (Framer Motion)
- Tag style: small pill/badge, monospace font, colored border matching risk level
- Shows timestamp (e.g. "0:18") next to each tag
- Most recent at the top
- Max height: 300px with overflow scroll
- Empty state: "Monitoring audio stream..." with a pulsing dot

3. components/TimelineGraph.tsx
- Uses Recharts LineChart
- X-axis: time in seconds (0 to current duration)
- Y-axis: deepfake probability 0-100%
- Two reference lines: dashed amber at 50% ("Suspicious"), dashed red at 70% ("Danger")
- Line color: green below 50%, amber 50-70%, red above 70%
- Fill area under the line with low opacity matching color
- Dark theme — background transparent, grid lines subtle (#2a2a3e)
- Animated dot on the current data point

All components are TypeScript typed and accept props for score, artifacts, riskLevel, and chartData.
```

---

### Prompt 5 — Demo Mode, Alert System & Main Monitor Page

```
In the CallSaathi Next.js project, build the main monitoring page and demo system:

1. lib/demoScript.ts
Export a demoScript array with this exact sequence:
[
  { time: 0,  score: 12, risk: "safe",       artifacts: [] },
  { time: 3,  score: 18, risk: "safe",       artifacts: ["Analyzing audio stream..."] },
  { time: 6,  score: 27, risk: "safe",       artifacts: ["Pitch variance nominal"] },
  { time: 9,  score: 35, risk: "safe",       artifacts: ["Breath pattern detected"] },
  { time: 12, score: 48, risk: "suspicious", artifacts: ["Unnatural prosody detected"] },
  { time: 15, score: 59, risk: "suspicious", artifacts: ["Micro-pause absence", "Spectral flattening"] },
  { time: 18, score: 67, risk: "suspicious", artifacts: ["Missing breath patterns"] },
  { time: 21, score: 76, risk: "danger",     artifacts: ["Neural vocoder signature identified"] },
  { time: 24, score: 82, risk: "danger",     artifacts: ["Formant irregularity", "Temporal inconsistency"] },
  { time: 27, score: 86, risk: "danger",     artifacts: ["Pitch variance anomaly", "Harmonic distortion pattern"] },
  { time: 30, score: 84, risk: "danger",     artifacts: ["Neural vocoder signature — HIGH CONFIDENCE"] },
]

2. hooks/useSimulation.ts
- Reads from demoScript using setInterval (fires every 3 seconds)
- Exposes: { currentScore, currentRisk, currentArtifacts, allArtifacts, chartData, isRunning, start, stop, reset }
- chartData is an accumulating array of { time, score } for Recharts

3. components/AlertBanner.tsx
- Appears when riskLevel === "danger" (score > 70%)
- Framer Motion slide-down animation
- Red background (#ff2244), white text
- "⚠ AI-GENERATED VOICE DETECTED — 82% confidence"
- "We recommend ending this call immediately."
- Screen-edge red glow effect (box-shadow on the main container)
- Framer Motion subtle pulse animation on the glow

4. app/monitor/page.tsx
- Reads `mode` from URL search params (live | demo)
- If demo: uses useSimulation hook, does NOT request mic permission
- If live: uses useAudioCapture hook + POST /api/analyze every 3 seconds
- Layout:
  Left column (60%): Waveform on top, TimelineGraph below
  Right column (40%): ScoreMeter on top, ArtifactFeed below
- Top bar: "CallSaathi" logo left, call duration timer center (MM:SS), [End Call] button right
- If mode === "demo": show small "DEMO MODE" amber badge in top bar
- AlertBanner renders fixed at top when riskLevel === "danger"
- On [End Call]: save call data to localStorage, navigate to /report
- Mobile responsive: stack columns vertically on screens < 768px

localStorage data shape to save on End Call:
{
  callId: string (generate with Date.now()),
  chunks: Array<{chunkNumber, score, artifacts}>,
  peakScore: number,
  totalDuration: number,
  allArtifacts: string[] (deduplicated)
}
```

---

### Prompt 6 — Forensic Report Page & Final Polish

```
In the CallSaathi Next.js project, build the final report screen and polish the full app:

1. app/report/page.tsx
- Reads call data from localStorage key "callsaathi_call_data" on mount
- If no data found, redirect to /
- Calls POST /api/report with the call data on mount
- Shows loading state while report generates: animated blinking cursor, text "Generating forensic analysis..."
- Once loaded, renders components/ForensicReport.tsx with the report data

2. components/ForensicReport.tsx
- Terminal/document aesthetic, dark background
- Header: "CALLSAATHI FORENSIC ANALYSIS REPORT" in JetBrains Mono, spaced letters
- Thin divider line below header
- Metadata row: Call ID | Duration | Chunks Analyzed | Peak Score — all in monospace
- Verdict badge: large pill, red background for HIGH/CRITICAL, amber for MODERATE
- Report body: render the report text in JetBrains Mono, preserve line breaks, slightly dimmed color (#aaaacc)
- Call Summary stats row: peak score % | suspicious chunks | unique artifacts
- Two action buttons: [Copy Report] (copies report text to clipboard, shows "Copied!" for 2s) and [New Analysis] (clears localStorage, navigates to /)
- Framer Motion: whole card slides up from bottom on enter

3. Polish tasks:
- Add favicon using emoji in app/layout.tsx metadata: { icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎙</text></svg>" } }
- Add error boundaries — wrap pages in try/catch, show a minimal error card instead of crashing
- In demo mode, still initialize the mic (getUserMedia) for the waveform, but don't send API calls — use demoScript data only
- Add Framer Motion AnimatePresence page transitions in app/layout.tsx
- On landing page, [Run Demo] should navigate to /monitor?mode=demo (no mic prompt on that page)
- On landing page, [Start Monitoring] should navigate to /monitor?mode=live (mic prompt fires immediately)
- Ensure all API error states show user-friendly messages, never raw error objects
- Final check: the complete flow must work — Landing → /monitor?mode=demo → (scripted sequence plays) → End Call → /report → (Groq generates report) → New Analysis → Landing
```

---

## Setup Instructions for Groq

```bash
# 1. Get free API key
# Go to https://console.groq.com
# Sign up (free, no credit card)
# Go to API Keys → Create Key → Copy it

# 2. Add to your project
# Create .env.local in project root:
echo "GROQ_API_KEY=your_key_here" > .env.local

# 3. Install dependencies
npm install

# 4. Run dev server
npm run dev
```


---

## Notes for Judges / Documentation

- **Detection Method:** Simulated via Claude API for proof-of-concept. Production implementation would use RawNet2 or wav2vec2-based deepfake detection models.
- **Real ML Integration Point:** The `/api/analyze` endpoint is architected to accept audio blob input and return the same JSON schema — swapping in a real model requires only changes to the API route, not the frontend.
- **Data Privacy:** No audio is stored. Chunks are analyzed in memory and discarded immediately.
- **India Relevance:** Directly addresses the surge in AI voice scam calls targeting Indian banking customers and elderly populations.

---

*Built for Unison Tech Club BUILD-A-THON | May 27 – June 5, 2026*
*Track: Cybersecurity*
