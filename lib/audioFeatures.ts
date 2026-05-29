import { AudioFeatures } from "@/types";

export const extractAudioFeatures = (analyser: AnalyserNode): AudioFeatures => {
  const sampleRate = analyser.context.sampleRate;
  
  // Get Time Domain Data (PCM)
  const timeData = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(timeData);
  
  // Get Frequency Data (FFT) - natively computed by browser
  const freqData = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatFrequencyData(freqData); // returns values in decibels (dB)
  
  // 1. RMS Energy
  let sumSquares = 0;
  for (let i = 0; i < timeData.length; i++) {
    sumSquares += timeData[i] * timeData[i];
  }
  const rms = Math.sqrt(sumSquares / timeData.length);
  
  // 2. Zero Crossing Rate
  let zeroCrossings = 0;
  for (let i = 1; i < timeData.length; i++) {
    if ((timeData[i] >= 0) !== (timeData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / timeData.length;
  
  // 3. Peak Amplitude
  const peak = Math.max(...Array.from(timeData).map(Math.abs));
  
  // 4. Silence Ratio
  const silenceThreshold = 0.01;
  let silentFrames = 0;
  for (let i = 0; i < timeData.length; i++) {
    if (Math.abs(timeData[i]) < silenceThreshold) {
      silentFrames++;
    }
  }
  const silenceRatio = silentFrames / timeData.length;
  
  // 5. Spectral Centroid
  let weightedSum = 0;
  let totalMagnitude = 0;
  
  for (let i = 0; i < freqData.length; i++) {
    // Convert dB back to linear magnitude
    // freqData[i] is usually between -100 and 0
    // To avoid NaN on -Infinity, max it with -100
    const db = Math.max(freqData[i], -100);
    const magnitude = Math.pow(10, db / 20);
    
    const frequency = (i / freqData.length) * (sampleRate / 2);
    weightedSum += frequency * magnitude;
    totalMagnitude += magnitude;
  }
  const spectralCentroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
  
  // 6. MFCC (simplified) — use average frequency band energy
  const mfccBands = 13;
  const mfccEnergy = new Array(mfccBands).fill(0);
  const bandWidth = freqData.length / mfccBands;
  
  for (let band = 0; band < mfccBands; band++) {
    const startIdx = Math.floor(band * bandWidth);
    const endIdx = Math.floor((band + 1) * bandWidth);
    for (let i = startIdx; i < endIdx; i++) {
      const db = Math.max(freqData[i], -100);
      mfccEnergy[band] += Math.pow(10, db / 20);
    }
  }
  
  // Calculate MFCC variance
  const mfccMean = mfccEnergy.reduce((a, b) => a + b, 0) / mfccBands;
  const mfccVariance = 
    mfccEnergy.reduce((sum, val) => sum + Math.pow(val - mfccMean, 2), 0) / mfccBands;
  
  return {
    rms: parseFloat(rms.toFixed(6)),
    zcr: parseFloat(zcr.toFixed(6)),
    peak: parseFloat(peak.toFixed(6)),
    silenceRatio: parseFloat(silenceRatio.toFixed(6)),
    spectralCentroid: parseFloat((spectralCentroid / sampleRate).toFixed(6)), // normalize 0-1
    mfccVariance: parseFloat(Math.sqrt(mfccVariance).toFixed(6)),
    sampleRate,
    timestamp: new Date().toISOString(),
  };
};
