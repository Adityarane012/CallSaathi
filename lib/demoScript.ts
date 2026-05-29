import { AudioFeatures } from "@/types";

export type RiskLevel = "safe" | "suspicious" | "danger";

export interface DemoStep {
  time: number;
  score: number;
  risk: RiskLevel;
  artifacts: string[];
  features: AudioFeatures;
}

const createDemoFeature = (
  rms: number,
  zcr: number,
  peak: number,
  silenceRatio: number,
  spectralCentroid: number,
  mfccVariance: number
): AudioFeatures => ({
  rms,
  zcr,
  peak,
  silenceRatio,
  spectralCentroid,
  mfccVariance,
  sampleRate: 16000,
  timestamp: new Date().toISOString(),
});

export const demoScript: DemoStep[] = [
  { 
    time: 0,  
    score: 12, 
    risk: "safe",       
    artifacts: [],
    features: createDemoFeature(0.042, 0.085, 0.156, 0.18, 0.45, 1.8)
  },
  { 
    time: 3,  
    score: 18, 
    risk: "safe",       
    artifacts: ["Analyzing audio stream..."],
    features: createDemoFeature(0.045, 0.082, 0.160, 0.17, 0.46, 1.7)
  },
  { 
    time: 6,  
    score: 27, 
    risk: "safe",       
    artifacts: ["Pitch variance nominal"],
    features: createDemoFeature(0.048, 0.080, 0.165, 0.15, 0.44, 1.75)
  },
  { 
    time: 9,  
    score: 35, 
    risk: "safe",       
    artifacts: ["Breath pattern detected"],
    features: createDemoFeature(0.052, 0.078, 0.170, 0.14, 0.43, 1.6)
  },
  { 
    time: 12, 
    score: 48, 
    risk: "suspicious", 
    artifacts: ["Unnatural prosody detected"],
    features: createDemoFeature(0.060, 0.045, 0.180, 0.08, 0.38, 1.2)
  },
  { 
    time: 15, 
    score: 59, 
    risk: "suspicious", 
    artifacts: ["Micro-pause absence", "Spectral flattening"],
    features: createDemoFeature(0.065, 0.038, 0.185, 0.05, 0.36, 1.0)
  },
  { 
    time: 18, 
    score: 67, 
    risk: "suspicious", 
    artifacts: ["Missing breath patterns"],
    features: createDemoFeature(0.072, 0.030, 0.190, 0.03, 0.34, 0.85)
  },
  { 
    time: 21, 
    score: 76, 
    risk: "danger",     
    artifacts: ["Neural vocoder signature identified"],
    features: createDemoFeature(0.089, 0.019, 0.201, 0.02, 0.32, 0.6)
  },
  { 
    time: 24, 
    score: 82, 
    risk: "danger",     
    artifacts: ["Formant irregularity", "Temporal inconsistency"],
    features: createDemoFeature(0.092, 0.018, 0.210, 0.01, 0.31, 0.55)
  },
  { 
    time: 27, 
    score: 86, 
    risk: "danger",     
    artifacts: ["Pitch variance anomaly", "Harmonic distortion pattern"],
    features: createDemoFeature(0.095, 0.017, 0.215, 0.01, 0.30, 0.52)
  },
  { 
    time: 30, 
    score: 84, 
    risk: "danger",     
    artifacts: ["Neural vocoder signature — HIGH CONFIDENCE"],
    features: createDemoFeature(0.098, 0.016, 0.220, 0.00, 0.29, 0.50)
  },
];
