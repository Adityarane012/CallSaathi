import { NextRequest, NextResponse } from 'next/server'

interface AudioFeatures {
  rms: number
  zcr: number
  peak: number
  silenceRatio: number
  spectralCentroid: number
  mfccVariance: number
  sampleRate: number
  timestamp: string
}

interface AnalyzeRequest {
  callId: string
  chunkNumber: number
  duration: number
  features: AudioFeatures
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { callId, chunkNumber, duration, features } = body

    // Build the prompt that includes REAL audio feature analysis
    const systemPrompt = `You are a forensic audio deepfake detection engine. You analyze real audio signal features and return ONLY valid JSON with no markdown, no backticks. Return exactly this structure: { "score": number (0-100), "confidence": string, "artifacts": array of strings, "riskLevel": string }`

    const analysisContext = `
REAL AUDIO FEATURES EXTRACTED FROM THIS CHUNK:
- RMS Energy: ${features.rms.toFixed(4)} (typical human speech: 0.01-0.1)
- Zero Crossing Rate: ${features.zcr.toFixed(4)} (typical human: 0.04-0.12, AI often: 0.01-0.03)
- Peak Amplitude: ${features.peak.toFixed(4)} (dynamic range indicator)
- Silence Ratio: ${features.silenceRatio.toFixed(4)} (natural speech has 0.1-0.3, AI: 0.0-0.1)
- Spectral Centroid: ${features.spectralCentroid.toFixed(4)} (frequency brightness, 0-1)
- MFCC Variance: ${features.mfccVariance.toFixed(4)} (AI voices show < 0.8, humans > 1.2)
- Sample Rate: ${features.sampleRate}Hz
- Chunk: ${chunkNumber} of ongoing call (${duration}s elapsed)

DEEPFAKE INDICATORS TO LOOK FOR:
1. Unusually low Zero Crossing Rate (< 0.03) + high MFCC variance uniformity = synthetic speech
2. Zero silence ratio across multiple chunks = missing natural breath/pause patterns
3. Very consistent RMS energy across chunks = AI-generated smoothness
4. Spectral centroid in narrow range (0.2-0.4) = vocoder-like artifacts
5. Perfect silence (RMS < 0.001) in middle of speech = splicing/concatenation
6. Highly repeating MFCC patterns = WaveNet/Tacotron fingerprints

Based on these REAL features from the audio, estimate the deepfake probability score.
Do NOT fall back to chunk-number-based scoring. Analyze the features.

Valid riskLevel values: "safe", "suspicious", "danger"
Valid confidence values: "low", "medium", "high"

Valid artifact strings (pick relevant ones based on features):
Safe artifacts: "Natural ZCR detected", "Breathing patterns present", "Dynamic variance typical", "Human-like spectral profile"
Suspicious artifacts: "Unusually flat ZCR", "Minimal breath patterns", "Spectral narrowing", "MFCC uniformity detected"
Danger artifacts: "Neural vocoder signature (low ZCR + flat MFCC)", "Synthetic breath absence", "Spectral flattening signature", "WaveNet-like pitch consistency", "Perfect silence gaps", "Vocoder artifacts detected"

Return ONLY valid JSON. No markdown. No backticks. No explanation.`

    const userPrompt = analysisContext + `\n\nAnalyze these features and return the deepfake probability score and risk level.`

    // Call Groq API
    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      }
    )

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.statusText}`)
    }

    const groqData = await groqResponse.json()
    let responseText = groqData.choices[0].message.content.trim()

    // Strip markdown backticks if present
    responseText = responseText
      .replace(/^```json\n?/g, '')
      .replace(/\n?```$/g, '')
      .trim()

    // Parse JSON
    const analysis = JSON.parse(responseText)

    // Validate response structure
    if (
      typeof analysis.score !== 'number' ||
      !analysis.confidence ||
      !Array.isArray(analysis.artifacts) ||
      !analysis.riskLevel
    ) {
      throw new Error('Invalid response structure from Groq')
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)

    // Fallback response
    return NextResponse.json({
      score: 20,
      confidence: 'low',
      artifacts: [],
      riskLevel: 'safe',
    })
  }
}
