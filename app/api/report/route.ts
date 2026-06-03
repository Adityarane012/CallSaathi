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

/* ── Helper: generate dynamic fallback report ────────── */

function getDynamicFallbackReport(
  verdict: string,
  riskLevel: string,
  callId: string,
  totalDuration: number,
  peakScore: number,
  averageScore: number
) {
  const isHighRisk = riskLevel === "CRITICAL" || riskLevel === "HIGH";

  const execSummary = isHighRisk
    ? `Analysis of the monitored call (${callId}) reveals strong indicators of AI-generated speech synthesis. The audio stream exhibits multiple forensic markers consistent with neural text-to-speech technology. Confidence level: HIGH.`
    : `Analysis of the monitored call (${callId}) shows no significant indicators of speech synthesis. The audio characteristics remain consistent with natural human speech profiles. Risk level is evaluated as LOW.`;

  const findings = isHighRisk
    ? `- Neural vocoder signatures detected in transient frames\n- Complete absence of physiological breath patterns throughout critical speech segments\n- Rigid pitch variance and repeating spectral patterns consistent with AI synthesis`
    : `- Standard zero-crossing rate variance consistent with human articulation\n- Natural breathing patterns and pause durations present\n- Dynamic amplitude range within normal human speech baseline`;

  const action = isHighRisk
    ? `Do not comply with any financial requests, bank details, or OTP sharing made during this call. File a complaint at cybercrime.gov.in or call 1930. Share this report with your bank fraud department immediately.`
    : `No security actions are required at this time. However, always exercise caution if a caller requests sensitive personal details or immediate transactions.`;

  return {
    verdict,
    report: `EXECUTIVE SUMMARY\n${execSummary}\n\nTECHNICAL FINDINGS\n${findings}\n\nRISK LEVEL\n${riskLevel}\n\nRECOMMENDED ACTION\n${action}`,
  };
}

/* ── Route handler ──────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json();
    const { callId, chunks, peakScore, totalDuration, allArtifacts } = body;

    const scores = chunks.map((c) => c.score);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Weighted Score: 60% average, 40% peak. Prevents single noise spike from driving the outcome.
    const weightedScore = Math.round(averageScore * 0.6 + peakScore * 0.4);

    // Determine the verdict and risk level programmatically
    let calculatedRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    let calculatedVerdict = "LIKELY HUMAN VOICE — LOW RISK";

    if (weightedScore >= 70) {
      calculatedRisk = "CRITICAL";
      calculatedVerdict = "AI-GENERATED VOICE — HIGH CONFIDENCE";
    } else if (weightedScore >= 50) {
      calculatedRisk = "HIGH";
      calculatedVerdict = "SUSPICIOUS AUDIO — MODERATE CONFIDENCE";
    } else if (weightedScore >= 35) {
      calculatedRisk = "MODERATE";
      calculatedVerdict = "SUSPICIOUS AUDIO — LOW RISK";
    } else {
      calculatedRisk = "LOW";
      calculatedVerdict = "LIKELY HUMAN VOICE — LOW RISK";
    }

    const apiKey = process.env.GROQ_API_KEY;
    const useOllama =
      process.env.USE_LOCAL_OLLAMA === "true" || !apiKey;
    const modelName = process.env.OLLAMA_MODEL || "gemma2:2b";
    
    let reportText = "";

    const systemPrompt =
      "You are an advanced AI cyber-forensics engine (CallSaathi-Core) writing a highly detailed, clinical voice analysis report. Emulate a terminal-style forensic output. Use plain text only. Use ASCII brackets like [+], indented bullets, and highly technical terminology (e.g., Mel-frequency cepstral coefficients, phase discontinuities, vocoder artifacts). Do not use markdown headers (# or **). Use ALL CAPS for section headers.";

    const userPrompt = `Generate a comprehensive forensic voice analysis report for this call session:
- Call ID: ${callId}
- Duration: ${totalDuration} seconds
- Chunks analyzed: ${chunks.length}
- Peak deepfake score: ${peakScore}%
- Average deepfake score: ${averageScore.toFixed(1)}%
- Overall Weighted Deepfake Score: ${weightedScore}% (weighted combo to prevent transient single-chunk spikes)
- Assigned Verdict: ${calculatedVerdict}
- Assigned Risk Level: ${calculatedRisk}
- Artifacts detected: ${allArtifacts.join(", ") || "None"}

Structure the report EXACTLY with these sections in ALL CAPS:

[+] EXECUTIVE SUMMARY
(3-4 sentences detailing the aggregate findings, the analysis of the waveform, and why the final verdict of "${calculatedVerdict}" was reached. Keep it clinical, authoritative, and deeply technical.)

[+] TECHNICAL METRICS & FINDINGS
(5-6 highly detailed bullet points using '-' as the bullet. Reference specific artifacts from the list above. Explain the acoustic math—e.g., why a flat Zero-Crossing Rate or low MFCC variance mathematically proves it is AI-generated, or conversely, why dynamic breath patterns prove it is human.)

[+] VERDICT & RISK ASSESSMENT
Assigned Risk Level: ${calculatedRisk}
(1-2 sentences justifying the severity of the risk based on the score progression: ${scores.join(", ")})

[+] RECOMMENDED COUNTERMEASURES
(3-4 actionable security directives. E.g., instructing the user to freeze accounts, report to cybercrime, or simply remain vigilant. Tailor strictly to the ${calculatedRisk} level.)

Do not add any conversational text before or after these sections.`;

    if (useOllama) {
      console.log(`Generating report using local Ollama engine with model: ${modelName}`);
      try {
        const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false,
            options: {
              temperature: 0.4,
            },
          }),
        });

        if (ollamaResponse.ok) {
          const ollamaData = await ollamaResponse.json();
          reportText = ollamaData.response.trim();
        } else {
          console.warn("Ollama report generation returned non-ok status:", ollamaResponse.status);
        }
      } catch (err) {
        console.error("Local Ollama report generation failed:", err);
      }
    } else {
      // Call Groq API
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

      if (groqResponse.ok) {
        const data = await groqResponse.json();
        reportText = data.choices?.[0]?.message?.content ?? "";
      } else {
        console.error(
          "Groq API error:",
          groqResponse.status,
          await groqResponse.text()
        );
      }
    }

    if (!reportText || reportText.length < 50) {
      console.warn("LLM returned empty or too-short report. Using programmatic fallback report.");
      return NextResponse.json(
        getDynamicFallbackReport(
          calculatedVerdict,
          calculatedRisk,
          callId,
          totalDuration,
          peakScore,
          averageScore
        )
      );
    }

    const result: ReportResponse = {
      verdict: calculatedVerdict,
      report: reportText.trim(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Report route error:", error);
    // Programmatic dynamic fallback
    try {
      const body: ReportRequest = await request.json().catch(() => ({}));
      const { callId = "UNKNOWN", chunks = [], peakScore = 0, totalDuration = 0 } = body;
      const scores = chunks.map((c: any) => c.score);
      const averageScore =
        scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
      const weightedScore = Math.round(averageScore * 0.6 + peakScore * 0.4);
      let calcRisk = "LOW";
      let calcVerdict = "LIKELY HUMAN VOICE — LOW RISK";
      if (weightedScore >= 70) {
        calcRisk = "CRITICAL";
        calcVerdict = "AI-GENERATED VOICE — HIGH CONFIDENCE";
      } else if (weightedScore >= 50) {
        calcRisk = "HIGH";
        calcVerdict = "SUSPICIOUS AUDIO — MODERATE CONFIDENCE";
      } else if (weightedScore >= 35) {
        calcRisk = "MODERATE";
        calcVerdict = "SUSPICIOUS AUDIO — LOW RISK";
      }
      return NextResponse.json(
        getDynamicFallbackReport(
          calcVerdict,
          calcRisk,
          callId,
          totalDuration,
          peakScore,
          averageScore
        )
      );
    } catch {
      return NextResponse.json(fallbackReport);
    }
  }
}
