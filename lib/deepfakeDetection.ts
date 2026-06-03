export interface HFDetectionResult {
  label: string // "fake" or "real"
  score: number // 0-1 confidence
}

export const detectWithHuggingFace = async (
  audioBlob: Blob
): Promise<HFDetectionResult | null> => {
  try {
    const formData = new FormData()
    formData.append('data', audioBlob)

    const response = await fetch(
      'https://api-inference.huggingface.co/models/garystafford/wav2vec2-deepfake-voice-detector',
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
        method: 'POST',
        body: audioBlob,
        signal: AbortSignal.timeout(8000), // 8 second timeout
      }
    )

    if (!response.ok) {
      console.warn(`HF API error: ${response.status}`)
      return null // Fall back to Groq
    }

    const result = await response.json()

    // HF returns array of { label, score }
    // We want the confidence for "fake" label
    const fakeResult = result.find((r: any) => r.label === 'fake') || result[0]

    return {
      label: fakeResult.label,
      score: fakeResult.score,
    }
  } catch (error) {
    console.warn('HF detection failed, falling back to Groq:', error)
    return null // Fall back to Groq
  }
}

export const convertHFScoreToDeepfakeScore = (
  hfResult: HFDetectionResult
): { score: number; confidence: 'low' | 'medium' | 'high' } => {
  if (hfResult.label === 'fake') {
    // HF's confidence that it's fake
    const score = Math.round(hfResult.score * 100)
    const confidence =
      score > 80 ? 'high' : score > 50 ? 'medium' : 'low'
    return { score, confidence }
  } else {
    // It thinks it's real
    const score = Math.round((1 - hfResult.score) * 100)
    const confidence =
      score < 20 ? 'high' : score < 50 ? 'medium' : 'low'
    return { score, confidence }
  }
}
