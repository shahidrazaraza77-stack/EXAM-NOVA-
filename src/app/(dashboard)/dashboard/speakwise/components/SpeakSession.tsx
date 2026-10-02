"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Play, Square, ArrowLeft, Video, Mic, Volume2, 
  Activity, CheckCircle2, RefreshCw, BarChart2, ShieldAlert
} from "lucide-react";
import { SpeechTopic } from "./mockData";
import MockWebcam from "../../interview-coach/components/MockWebcam";
import { motion } from "framer-motion";

interface SpeakSessionProps {
  modeTitle: string;
  topic: SpeechTopic;
  onComplete: (reportData: {
    overallScore: number;
    breakdown: {
      confidence: number;
      eyeContact: number;
      fluency: number;
      speed: number;
      fillerWords: number;
    };
    fillerWordsBreakdown: {
      um: number;
      uh: number;
      like: number;
      basically: number;
      actually: number;
    };
    eyeContactMetrics: {
      eyeContactPct: number;
      lookingAwayPct: number;
      attentionTrend: number[];
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  }) => void;
  onCancel: () => void;
}

export default function SpeakSession({
  modeTitle,
  topic,
  onComplete,
  onCancel
}: SpeakSessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcriptText, setTranscriptText] = useState("");
  
  // Real-time fluctuating metrics
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveConfidence, setLiveConfidence] = useState(85);
  const [liveEyeContact, setLiveEyeContact] = useState(88);
  const [liveFluency, setLiveFluency] = useState(80);
  
  const [fillerCounts, setFillerCounts] = useState({
    um: 0,
    uh: 0,
    like: 0,
    basically: 0,
    actually: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptText]);

  useEffect(() => {
    return () => {
      stopSessionTimers();
    };
  }, []);

  const stopSessionTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (transcriptionRef.current) clearInterval(transcriptionRef.current);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimerSeconds(0);
    setTranscriptText("");
    setLiveWpm(110);
    setLiveConfidence(85);
    setLiveEyeContact(88);
    setLiveFluency(80);
    setFillerCounts({ um: 0, uh: 0, like: 0, basically: 0, actually: 0 });

    // Ticker timer
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    // Speed-to-text typing simulation
    const words = topic.mockTranscript.split(" ");
    let wordIndex = 0;

    transcriptionRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        const nextWord = words[wordIndex];
        setTranscriptText((prev) => (prev ? `${prev} ${nextWord}` : nextWord));

        // Evaluate filler tokens (lower case and clean punctuations)
        const cleanWord = nextWord.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        
        if (cleanWord === "um") {
          setFillerCounts((prev) => ({ ...prev, um: prev.um + 1 }));
        } else if (cleanWord === "uh") {
          setFillerCounts((prev) => ({ ...prev, uh: prev.uh + 1 }));
        } else if (cleanWord === "like") {
          setFillerCounts((prev) => ({ ...prev, like: prev.like + 1 }));
        } else if (cleanWord === "basically") {
          setFillerCounts((prev) => ({ ...prev, basically: prev.basically + 1 }));
        } else if (cleanWord === "actually") {
          setFillerCounts((prev) => ({ ...prev, actually: prev.actually + 1 }));
        }

        // Fluctuate speaking speed, confidence, eye contact, fluency
        setLiveWpm((prev) => {
          const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5 WPM change
          return Math.max(120, Math.min(155, prev + delta));
        });
        setLiveConfidence((prev) => {
          const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
          return Math.max(75, Math.min(95, prev + delta));
        });
        setLiveEyeContact((prev) => {
          const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
          return Math.max(78, Math.min(96, prev + delta));
        });
        setLiveFluency((prev) => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return Math.max(75, Math.min(94, prev + delta));
        });

        wordIndex++;
      } else {
        handleStopRecording();
      }
    }, 390); // Conversational WPM mapping delay
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopSessionTimers();

    // Fallback transcript checks
    let finalFiller = fillerCounts;
    if (!transcriptText) {
      setTranscriptText(topic.mockTranscript);
      finalFiller = topic.analysis.fillerWordsBreakdown;
      setFillerCounts(finalFiller);
    }

    // Compile final analysis report
    const tAnalysis = topic.analysis;
    const totalFillerCount = Object.values(finalFiller).reduce((a, b) => a + b, 0);

    // Complete session after a tiny visual delay
    setTimeout(() => {
      onComplete({
        overallScore: tAnalysis.overallScore,
        breakdown: {
          confidence: liveConfidence,
          eyeContact: liveEyeContact,
          fluency: liveFluency,
          speed: liveWpm,
          fillerWords: totalFillerCount
        },
        fillerWordsBreakdown: finalFiller,
        eyeContactMetrics: tAnalysis.eyeContactMetrics,
        feedback: tAnalysis.feedback
      });
    }, 600);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 pb-20">
      {/* Header back link */}
      <div className="-mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel} 
          className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 gap-1.5 cursor-pointer -ml-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit to Coach Home
        </Button>
      </div>

      {/* Session Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-600 dark:bg-pink-500 animate-pulse" />
            <h1 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              SpeakWise Session View
            </h1>
          </div>
          <p className="text-2xs text-zinc-500 dark:text-zinc-400">
            Practice mode: {modeTitle}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-2xs font-extrabold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            Target: {topic.title}
          </span>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Topic & Guidance Instructions (3/12) */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm min-h-[350px]">
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
              <span className="text-[9px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider block mb-1">PROMPT TOPIC</span>
              <h4 className="text-sm font-bold text-zinc-905 dark:text-white leading-relaxed">
                {topic.title}
              </h4>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">GUIDANCE CHECKLIST:</span>
              <ul className="space-y-2.5 text-3xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {topic.instructions.map((inst, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 text-[10px] text-zinc-400 leading-relaxed mt-6">
            <span className="font-bold text-zinc-650 dark:text-zinc-350 block mb-1">💡 Coach Tip</span>
            Try to speak with structured breaks. Take short pauses to eliminate filler dependencies.
          </div>
        </Card>

        {/* Center Panel: Webcam preview & timers (5/12) */}
        <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm">
          {/* Webcam Box */}
          <MockWebcam isRecording={isRecording} />

          {/* Indicators and timers */}
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Mic className={`w-4 h-4 ${isRecording ? "text-pink-500 animate-pulse" : ""}`} />
              <span className="text-xs font-bold tracking-tight text-zinc-600 dark:text-zinc-300">
                {isRecording ? "Audio Capture Active" : "Mic Idle"}
              </span>
            </div>
            
            {/* Ticker timer */}
            <div className="text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-850">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span>TIMER: {formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Record buttons */}
          <div className="flex items-center gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6 justify-center">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white font-bold text-xs py-3 px-5 rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-pink-500/10 flex-1 sm:flex-initial"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 px-5 rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-500/15 flex-1 sm:flex-initial"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop Recording
              </Button>
            )}
          </div>
        </Card>

        {/* Right Side: Live transcript & metrics (4/12) */}
        <Card className="lg:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm min-h-[350px]">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden h-[230px]">
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">REALTIME SPEECH FEED</span>
            
            {/* Live Typing speech box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-850 rounded-xl p-4 flex-1 overflow-y-auto text-2xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-mono relative">
              {transcriptText ? (
                <div>
                  {transcriptText}
                  {isRecording && <span className="inline-block w-1.5 h-3 bg-pink-500 ml-1 animate-pulse" />}
                </div>
              ) : (
                <div className="text-zinc-400 italic flex flex-col items-center justify-center h-full text-center space-y-2 select-none">
                  <Activity className="w-5 h-5 text-zinc-300 animate-pulse" />
                  <p>Click "Start Recording" and respond out loud. Live speech-to-text transcript compiles here.</p>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Live speaking telemetry panel */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 space-y-3 shrink-0">
            {/* Speed & Eye Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-450 dark:text-zinc-555">
                  <span>SPEAKING SPEED</span>
                  <span className="text-zinc-750 dark:text-zinc-200 font-extrabold">{isRecording ? `${liveWpm} WPM` : "--"}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: isRecording ? `${Math.min(100, (liveWpm / 180) * 100)}%` : "0%" }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-450 dark:text-zinc-555">
                  <span>EYE CONTACT</span>
                  <span className="text-zinc-750 dark:text-zinc-200 font-extrabold">{isRecording ? `${liveEyeContact}%` : "--"}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-300"
                    style={{ width: isRecording ? `${liveEyeContact}%` : "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* Confidence & Fluency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-450 dark:text-zinc-555">
                  <span>CONFIDENCE</span>
                  <span className="text-zinc-750 dark:text-zinc-200 font-extrabold">{isRecording ? `${liveConfidence}%` : "--"}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: isRecording ? `${liveConfidence}%` : "0%" }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-450 dark:text-zinc-555">
                  <span>FLUENCY</span>
                  <span className="text-zinc-750 dark:text-zinc-200 font-extrabold">{isRecording ? `${liveFluency}%` : "--"}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: isRecording ? `${liveFluency}%` : "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* Filler count summary */}
            <div className="p-2 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg text-center flex items-center justify-between px-3">
              <span className="text-[9px] text-zinc-400 font-semibold uppercase">Filler Word Frequency</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                Object.values(fillerCounts).reduce((a,b)=>a+b,0) > 4 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"
              }`}>
                {Object.values(fillerCounts).reduce((a,b)=>a+b,0)} counts
              </span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
