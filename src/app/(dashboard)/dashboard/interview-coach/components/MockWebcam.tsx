"use client";

import React, { useEffect, useRef, useState } from "react";
import { Video, VideoOff, ShieldAlert, Sparkles } from "lucide-react";

interface MockWebcamProps {
  isRecording: boolean;
}

export default function MockWebcam({ isRecording }: MockWebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<"connecting" | "active" | "denied" | "unsupported">("connecting");

  useEffect(() => {
    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      try {
        setStatus("connecting");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false // Only request video for UI display to avoid mic feedback
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStatus("active");
      } catch (err) {
        console.warn("Webcam access denied or unavailable: ", err);
        setStatus("denied");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col items-center justify-center group">
      {/* Active Webcam Feed */}
      {status === "active" && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      )}

      {/* Fallback Screen - Access Denied/Connecting */}
      {status !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-400 select-none overflow-hidden">
          {/* Animated wireframe grid backdrop */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {status === "connecting" && (
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto" />
              <p className="text-sm font-medium animate-pulse text-zinc-300">Requesting Camera Permissions...</p>
            </div>
          )}

          {status === "denied" && (
            <div className="space-y-4 relative z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 mx-auto shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Camera Permission Blocked</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Webcam access was denied. Continuing in **Simulator Mode** with a mock avatar overlay.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3 h-3" /> Simulation Active
              </div>
            </div>
          )}

          {status === "unsupported" && (
            <div className="space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 mx-auto">
                <VideoOff className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Webcam Unsupported</h4>
                <p className="text-xs text-zinc-500">Your browser does not support media recording APIs.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulated User Portrait Silhouette when camera is blocked/denied */}
      {status === "denied" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-violet-600/10 border-2 border-violet-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Video className="w-10 h-10 text-violet-400" />
          </div>
          {/* Animated audio waves */}
          {isRecording && (
            <div className="absolute bottom-16 flex items-center gap-1.5 h-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-violet-500"
                  style={{
                    height: `${20 + Math.sin(i + Date.now() / 100) * 15}px`,
                    animation: `pulse 1.2s infinite ease-in-out`,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay controls HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Connection status/Quality indicator */}
        <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-500 animate-pulse" : "bg-violet-400"}`} />
          <span className="text-[10px] text-white/95 font-medium tracking-wide">
            {status === "active" ? "1080p WebRTC Session" : "Virtual Camera Core"}
          </span>
        </div>

        {/* Live Recording HUD */}
        {isRecording && (
          <div className="px-2.5 py-1 rounded-lg bg-red-600 border border-red-500 text-white flex items-center gap-1.5 shadow-lg shadow-red-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-wider">REC</span>
          </div>
        )}
      </div>

      {/* Sound Meter overlay in bottom left corner */}
      {isRecording && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md pointer-events-none z-20 w-fit">
          <div className="text-[9px] text-white/70 font-semibold uppercase tracking-wider">MIC LEVEL</div>
          <div className="flex gap-0.5 items-end h-2 w-16">
            {[...Array(10)].map((_, idx) => (
              <div
                key={idx}
                className={`w-1 rounded-sm transition-all duration-75 ${
                  idx < 4 ? "bg-emerald-500" : idx < 7 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{
                  height: `${20 + (isRecording ? Math.random() * 80 : 0)}%`,
                  opacity: isRecording ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
