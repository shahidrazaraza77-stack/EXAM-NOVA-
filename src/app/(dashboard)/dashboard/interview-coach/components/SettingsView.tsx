"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Bell, Mic, Shield, Globe, Monitor,
  ChevronRight, Sparkles, Volume2, Video, Eye,
  MessageSquare, Clock, Zap, ToggleLeft, ToggleRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface SettingSelect {
  id: string;
  label: string;
  description: string;
  icon: any;
  value: string;
  options: string[];
}

export default function SettingsView() {
  const [toggles, setToggles] = useState<SettingToggle[]>([
    { id: "webcam", label: "Enable Webcam", description: "Use camera during interviews for visual feedback", icon: Video, enabled: true },
    { id: "mic", label: "Voice Input", description: "Allow microphone access for spoken answers", icon: Mic, enabled: false },
    { id: "feedback", label: "Instant Feedback", description: "Show AI feedback after each question", icon: Zap, enabled: true },
    { id: "timer", label: "Show Timer", description: "Display countdown timer during answers", icon: Clock, enabled: true },
    { id: "notifications", label: "Practice Reminders", description: "Get notified about practice sessions", icon: Bell, enabled: true },
    { id: "darkMode", label: "Dark Mode", description: "Use dark theme for the interview interface", icon: Monitor, enabled: true },
  ]);

  const [selects, setSelects] = useState<SettingSelect[]>([
    { id: "difficulty", label: "Default Difficulty", description: "Default difficulty for new interviews", icon: Shield, value: "Medium", options: ["Easy", "Medium", "Hard"] },
    { id: "language", label: "Interface Language", description: "Language for the interview coach UI", icon: Globe, value: "English", options: ["English", "Hindi", "Spanish"] },
    { id: "feedbackDepth", label: "Feedback Detail", description: "Level of detail in AI feedback", icon: MessageSquare, value: "Detailed", options: ["Brief", "Standard", "Detailed"] },
  ]);

  const toggleSetting = (id: string) => {
    setToggles(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const updateSelect = (id: string, value: string) => {
    setSelects(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 dark:from-violet-950/10 dark:to-indigo-950/10">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Interview Coach Settings</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Customize your interview practice experience. Changes are saved automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Preferences</h3>
        <div className="space-y-3">
          {toggles.map((setting, i) => {
            const Icon = setting.icon;
            return (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{setting.label}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-all border-none cursor-pointer shrink-0",
                        setting.enabled ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-800"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                        setting.enabled ? "left-[22px]" : "left-0.5"
                      )} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Defaults</h3>
        <div className="space-y-3">
          {selects.map((setting, i) => {
            const Icon = setting.icon;
            return (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{setting.label}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{setting.description}</p>
                      </div>
                    </div>
                    <select
                      value={setting.value}
                      onChange={(e) => updateSelect(setting.id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
                    >
                      {setting.options.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
