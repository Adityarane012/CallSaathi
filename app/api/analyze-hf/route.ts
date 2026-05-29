import { NextRequest, NextResponse } from 'next/server'
import {
  detectWithHuggingFace,
  convertHFScoreToDeepfakeScore,
} from '@/lib/deepfakeDetection'

export async function POST(request: NextRequest) {
  try {
    // Receive audio blob
    const formData = await request.formData()
    const audioBlob = formData.get('audio') as Blob

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio blob provided' },
        { status: 400 }
      )
    }

    // Try HF first
    const hfResult = await detectWithHuggingFace(audioBlob)

    if (hfResult) {
      // HF worked! Use real detection
      const { score, confidence } = convertHFScoreToDeepfakeScore(hfResult)
      const riskLevel =
        score > 70 ? 'danger' : score > 50 ? 'suspicious' : 'safe'

      // Map HF result to our artifact format
      const artifacts: string[] = []
      if (hfResult.label === 'fake') {
        artifacts.push('Real deepfake model flagged this as synthetic')
        if (score > 80) {
          artifacts.push('High confidence AI-generated speech detected')
        }
      }

      return NextResponse.json({
        score,
        confidence,
        artifacts,
        riskLevel,
        detectionMethod: 'huggingface', // For transparency
      })
    } else {
      // HF failed, return message that you're falling back to Groq
      return NextResponse.json({
        score: null,
        error: 'HF unavailable, use Groq endpoint',
        fallbackToGroq: true,
      })
    }
  } catch (error) {
    console.error('HF analysis error:', error)
    return NextResponse.json(
      { error: 'Detection failed', fallbackToGroq: true },
      { status: 500 }
    )
  }
}
