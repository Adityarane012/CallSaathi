"use client";

import { useCallback, useRef, useState } from "react";
import { extractAudioFeatures } from "@/lib/audioFeatures";
import type { AudioFeatures } from "@/types";

export type { AudioFeatures };

/* ── Types ──────────────────────────────────────────── */

export interface UseAudioCaptureOptions {
  /** Interval between chunks in ms (default 2500) */
  chunkInterval?: number;
  /** Called with each audio chunk blob */
  onChunk?: (blob: Blob, features: AudioFeatures) => void;
}

export interface UseAudioCaptureReturn {
  /** Whether the mic is actively listening */
  isListening: boolean;
  /** Any error (e.g. permission denied) */
  error: string | null;
  /** The Web Audio API AnalyserNode — feed this to the Waveform component */
  analyserNode: AnalyserNode | null;
  /** Start capturing mic audio */
  startListening: () => Promise<void>;
  /** Stop capturing mic audio */
  stopListening: () => void;
}

/* ── Hook ───────────────────────────────────────────── */

export function useAudioCapture(
  options: UseAudioCaptureOptions = {}
): UseAudioCaptureReturn {
  const { chunkInterval = 2500, onChunk } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Refs to hold mutable instances across renders
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;

  /* ── Start ────────────────────────────────────────── */

  const startListening = useCallback(async () => {
    // Already running — bail
    if (streamRef.current) return;

    setError(null);

    try {
      // 1. Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 2. Set up Web Audio API for AnalyserNode
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      // Don't connect analyser to destination — we don't want to hear ourselves
      setAnalyserNode(analyser);

      // 3. Set up MediaRecorder for chunked capture
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data.size > 0 && onChunkRef.current) {
          try {
            const features = extractAudioFeatures(analyser);
            onChunkRef.current(event.data, features);
          } catch (e) {
            console.error("Failed to extract audio features:", e);
          }
        }
      };

      recorder.onerror = () => {
        setError("MediaRecorder error occurred.");
      };

      // Start recording, fire ondataavailable every chunkInterval ms
      recorder.start(chunkInterval);
      setIsListening(true);
    } catch (err) {
      // Handle specific permission errors
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            setError(
              "Microphone permission denied. Please allow mic access and try again."
            );
            break;
          case "NotFoundError":
            setError(
              "No microphone found. Please connect a microphone and try again."
            );
            break;
          case "NotReadableError":
            setError(
              "Microphone is in use by another application. Please close it and try again."
            );
            break;
          default:
            setError(`Microphone error: ${err.message}`);
        }
      } else {
        setError("Failed to access microphone.");
      }

      // Clean up partial state
      streamRef.current = null;
      setIsListening(false);
    }
  }, [chunkInterval]);

  /* ── Stop ─────────────────────────────────────────── */

  const stopListening = useCallback(() => {
    // Stop MediaRecorder
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    // Stop all mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close AudioContext
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {
        /* swallow — context may already be closed */
      });
      audioCtxRef.current = null;
    }

    setAnalyserNode(null);
    setIsListening(false);
  }, []);

  return {
    isListening,
    error,
    analyserNode,
    startListening,
    stopListening,
  };
}
