export interface AudioFeatures {
  rms: number;
  zcr: number;
  peak: number;
  silenceRatio: number;
  spectralCentroid: number;
  mfccVariance: number;
  sampleRate: number;
  timestamp: string;
}
