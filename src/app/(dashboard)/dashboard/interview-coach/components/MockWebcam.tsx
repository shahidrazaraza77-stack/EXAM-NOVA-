"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Video, VideoOff, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface MockWebcamProps {
  /** Pass the mic MediaStream when listening so the audio analyser visualizes real levels */
  isRecording: boolean;
  micStream?: MediaStream | null;
}

export default function MockWebcam({ isRecording, micStream }: MockWebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"connecting" | "active" | "denied" | "unsupported">("connecting");

  // Audio analyser
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const [micLevels, setMicLevels] = useState<number[]>(Array(16).fill(0));

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("connecting");

    // Stop any existing stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, max: 60 },
        },
        audio: false, // mic is managed separately by LiveInterview
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure playback starts even after permission was already granted
        videoRef.current.play().catch(() => {});
      }
      setStatus("active");
    } catch (err: any) {
      console.warn("Webcam error:", err.name, err.message);
      if (err.name === "NotSupportedError" || err.name === "TypeError") {
        setStatus("unsupported");
      } else {
        setStatus("denied");
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [startCamera]);

  // Re-attach srcObject whenever the video element re-renders
  useEffect(() => {
    if (status === "active" && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [status]);

  // ── Mic level analyser ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRecording || !micStream) {
      cancelAnimationFrame(rafRef.current);
      setMicLevels(Array(16).fill(0));
      return;
    }

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // 32 frequency bins
    const source = ctx.createMediaStreamSource(micStream);
    source.connect(analyser);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      // Take first 16 bins (covers voice range ~0-3.4kHz at 44.1kHz sample rate)
      const bars = Array.from({ length: 16 }, (_, i) => {
        const val = dataArray[i] ?? 0;
        return Math.round((val / 255) * 100);
      });
      setMicLevels(bars);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      ctx.close().catch(() => {});
      setMicLevels(Array(16).fill(0));
    };
  }, [isRecording, micStream]);

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-2xl flex items-center justify-center">
      {/* Live video — always mounted, shown/hidden via opacity */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
          status === "active" ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
        }`}
      />

      {/* ── Fallback overlay ── */}
      {status !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 to-zinc-950 select-none">
          {/* Grid backdrop */}
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {status === "connecting" && (
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-300 animate-pulse">Connecting camera…</p>
            </div>
          )}

          {status === "denied" && (
            <div className="space-y-5 relative z-10 max-w-xs">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1 text-white">
                <h4 className="font-bold text-sm">Camera Permission Blocked</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Click the 🔒 lock in your address bar → set <strong>Camera</strong> to <strong>Allow</strong>, then click Retry.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3 h-3" /> Simulator Mode
              </div>
            </div>
          )}

          {status === "unsupported" && (
            <div className="space-y-4 relative z-10 text-center">
              <VideoOff className="w-10 h-10 text-red-500 mx-auto" />
              <div>
                <h4 className="font-bold text-white text-sm">Camera Not Available</h4>
                <p className="text-xs text-zinc-500 mt-1">Your browser or device doesn&apos;t support camera access.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Silhouette avatar in denied/sim mode */}
      {status === "denied" && (
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-violet-600/10 border-2 border-violet-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.2)] animate-pulse">
            <Video className="w-9 h-9 text-violet-400" />
          </div>
        </div>
      )}

      {/* ── Top HUD ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-400 animate-pulse" : "bg-violet-400"}`} />
          <span className="text-[10px] text-white/90 font-semibold tracking-wide">
            {status === "active" ? "60fps · Live" : "Simulator Mode"}
          </span>
        </div>

        {isRecording && (
          <div className="px-2.5 py-1 rounded-lg bg-red-600 border border-red-500/80 text-white flex items-center gap-1.5 shadow-lg shadow-red-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider">REC</span>
          </div>
        )}
      </div>

      {/* ── Mic Level Bar (real AudioContext analyser) ── */}
      {isRecording && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md z-20 pointer-events-none">
          <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider mr-1">MIC</span>
          <div className="flex gap-0.5 items-end h-4">
            {micLevels.map((level, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-sm transition-all duration-75 ${
                  level > 70 ? "bg-red-500" : level > 40 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ height: `${Math.max(3, level * 0.16 + 3)}px` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
