
"use client";

import React from "react";
import { 
  ChevronLeft, 
  Play, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Info,
  ShieldAlert
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MockTest } from "../mockData";

interface TestInstructionsViewProps {
  test: MockTest;
  onStartTest: () => void;
  onCancel: () => void;
}

export default function TestInstructionsView({ test, onStartTest, onCancel }: TestInstructionsViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel} 
          className="p-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-500" />
        </Button>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">
            {test.title}
          </h1>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
            Exam Preparation & Guidelines
          </p>
        </div>
      </div>

      {/* TEST SPECIFICATIONS CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Duration</p>
            <h4 className="text-lg font-black text-zinc-800 dark:text-zinc-100">{test.durationMinutes} Minutes</h4>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Questions</p>
            <h4 className="text-lg font-black text-zinc-800 dark:text-zinc-100">{test.questionsCount} MCQs</h4>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Difficulty</p>
            <h4 className="text-lg font-black text-zinc-800 dark:text-zinc-100">{test.difficulty}</h4>
          </div>
        </Card>
      </div>

      {/* DETAILED GUIDELINES */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Instructions & Scoring Policy
        </h3>

        <div className="space-y-4 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-500/20 flex gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-400">Negative Marking Activated</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                Each correct response awards <span className="font-bold text-zinc-800 dark:text-white">+1.0 mark</span>. Incorrect answers will result in a penalty of <span className="font-bold text-zinc-800 dark:text-white">-0.25 marks</span>. Unanswered questions receive 0.0 marks.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200">General Exam Rules:</h4>
            <ul className="list-disc pl-5 space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                Once you click the <span className="font-bold">Start Test</span> button, the timer will begin ticking down immediately and cannot be paused.
              </li>
              <li>
                The test will take place in a fullscreen simulator view covering the navigation menus. This provides a focused exam environment.
              </li>
              <li>
                Use the <span className="font-bold">Question Palette</span> on the right to monitor which questions are Answered, Visited, or Marked for Review.
              </li>
              <li>
                You can change your responses at any point before clicking the final <span className="font-bold">Submit Test</span> button.
              </li>
              <li>
                If the timer reaches 0:00, your current progress will be automatically saved and submitted.
              </li>
            </ul>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="text-xs font-semibold cursor-pointer border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
          >
            Cancel & Go Back
          </Button>

          <Button 
            onClick={onStartTest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 cursor-pointer font-bold rounded-xl py-2 px-6 shadow-md shadow-indigo-500/10"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Test Now</span>
          </Button>
        </div>
      </Card>

    </div>
  );
}
