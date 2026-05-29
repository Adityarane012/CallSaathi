import { NextRequest, NextResponse } from "next/server";
import { fallbackReport } from "@/lib/fallbackReports";

/* ── Types ──────────────────────────────────────────── */

interface ChunkData {
  chunkNumber: number;
  score: number;
  artifacts: string[];
}

interface ReportRequest {
  callId: string;
  chunks: ChunkData[];
  peakScore: number;
  totalDuration: number;
  allArtifacts: string[];
}

interface ReportResponse {
  verdict: string;
  report: string;
}

/* ── Groq config ────────────────────────────────────── */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

/* ── Helper: extract verdict ────────────────────────── */

function extractVerdict(report: string, peakScore: number): string {
  // Try to extract from EXECUTIVE SUMMARY section
  const summaryMatch = report.match(
    /EXECUTIVE SUMMARY\s*\n([\s\S]*?)(?:\n\s*\n|\nTECHNICAL)/i
  );
  if (summaryMatch) {
    const firstSentence = summaryMatch[1].trim().split(".")[0];
    if (firstSentence.length > 10) {
      return firstSentence.includes("AI-generated") || firstSentence.includes("deepfake")
        ? "AI-GENERATED VOICE — HIGH CONFIDENCE"
        : firstSentence;
    }
  }

  // Fallback based on peak score
  if (peakScore >= 70) return "AI-GENERATED VOICE — HIGH CONFIDENCE";
  if (peakScore >= 50) return "SUSPICIOUS AUDIO — MODERATE CONFIDENCE";
  return "LIKELY HUMAN VOICE — LOW RISK";
}

/* ── Route handler ──────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json();
    const { callId, chunks, peakScore, totalDuration, allArtifacts } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set");
      return NextResponse.json(fallbackReport);
    }

    const suspiciousCount = chunks.filter((c) => c.score > 50).length;

    const systemPrompt =
      "You are a forensic audio analyst writing official reports. Write in a clinical, authoritative tone. Use plain text only — no markdown, no asterisks, no headers with #. Use ALL CAPS for section headers.";

    const userPrompt = `Generate a forensic voice analysis report for this call:
- Call ID: ${callId}
- Duration: ${totalDuration} seconds
- Chunks analyzed: ${chunks.length}
- Peak deepfake score: ${peakScore}%
- Suspicious chunks (score > 50%): ${suspiciousCount}
- Artifacts detected: ${allArtifacts.join(", ")}
- Score progression: ${chunks.map((c) => c.score).join(", ")}

Write a report with exactly these four sections in ALL CAPS:
EXECUTIVE SUMMARY
(2-3 sentences stating the verdict clearly)

TECHNICAL FINDINGS
(4-5 bullet points using - as bullet, referencing the artifacts above, use technical forensic language)

RISK LEVEL
(One word only: LOW, MODERATE, HIGH, or CRITICAL — based on peak score)

RECOMMENDED ACTION
(2-3 sentences of specific actionable advice)

Do not add any text before EXECUTIVE SUMMARY or after the recommended action.`;

    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.4,
      }),
    });

    if (!groqResponse.ok) {
      console.error("Groq API error:", groqResponse.status, await groqResponse.text());
      return NextResponse.json(fallbackReport);
    }

    const data = await groqResponse.json();
    const reportText: string = data.choices?.[0]?.message?.content ?? "";

    if (!reportText || reportText.length < 50) {
      console.error("Groq returned empty or too-short report");
      return NextResponse.json(fallbackReport);
    }

    const verdict = extractVerdict(reportText, peakScore);

    const result: ReportResponse = {
      verdict,
      report: reportText.trim(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Report route error:", error);
    return NextResponse.json(fallbackReport);
  }
}
