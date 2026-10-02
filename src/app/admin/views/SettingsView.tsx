"use client";

import React, { useState } from "react";
import { useAdmin, PlatformSettings } from "@/context/AdminContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Settings, 
  Palette, 
  Bell, 
  ShieldAlert, 
  Check, 
  Globe,
  Sliders,
  Sparkles,
  Lock,
  Moon,
  Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsView() {
  const { settings, updateSettings } = useAdmin();

  // Internal tab state
  const [activeTab, setActiveTab] = useState<"platform" | "branding" | "notifications" | "security">("platform");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states initialized from settings context
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [allowRegistrations, setAllowRegistrations] = useState(settings.allowRegistrations);

  // Branding states
  const [primaryColor, setPrimaryColor] = useState(settings.branding.primaryColor);
  const [logoText, setLogoText] = useState(settings.branding.logoText);
  const [darkThemeByDefault, setDarkThemeByDefault] = useState(settings.branding.darkThemeByDefault);

  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(settings.notifications.emailAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(settings.notifications.weeklyDigest);
  const [slackIntegration, setSlackIntegration] = useState(settings.notifications.slackIntegration);

  // Security states
  const [twoFactorAuth, setTwoFactorAuth] = useState(settings.security.twoFactorAuth);
  const [sessionTimeout, setSessionTimeout] = useState(settings.security.sessionTimeout);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(settings.security.passwordExpiryDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSettings({
      siteName,
      tagline,
      maintenanceMode,
      allowRegistrations,
      branding: {
        primaryColor,
        logoText,
        darkThemeByDefault
      },
      notifications: {
        emailAlerts,
        weeklyDigest,
        slackIntegration
      },
      security: {
        twoFactorAuth,
        sessionTimeout,
        passwordExpiryDays
      }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const colorThemes = [
    { name: "violet", class: "bg-violet-600 border-violet-700" },
    { name: "blue", class: "bg-blue-600 border-blue-700" },
    { name: "emerald", class: "bg-emerald-600 border-emerald-700" },
    { name: "amber", class: "bg-amber-500 border-amber-600" },
    { name: "rose", class: "bg-rose-600 border-rose-700" }
  ];

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs font-bold text-emerald-700 dark:text-emerald-450 flex items-center gap-2 shadow-sm"
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>Platform configurations saved successfully! Site settings synchronized.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Left sub-sidebar */}
        <aside className="w-full lg:w-60 flex flex-row lg:flex-col gap-1 p-1 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 h-fit overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("platform")}
            className={`w-full flex items-center justify-center lg:justify-start px-4 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "platform"
                ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
            }`}
          >
            <Globe className="h-4 w-4 mr-2" />
            Platform Settings
          </button>
          <button
            onClick={() => setActiveTab("branding")}
            className={`w-full flex items-center justify-center lg:justify-start px-4 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "branding"
                ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
            }`}
          >
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center justify-center lg:justify-start px-4 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "notifications"
                ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
            }`}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center justify-center lg:justify-start px-4 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "bg-white dark:bg-zinc-950 text-violet-650 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350"
            }`}
          >
            <ShieldAlert className="h-4 w-4 mr-2" />
            Security & Access
          </button>
        </aside>

        {/* Configuration Pane */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 sm:p-8 shadow-sm">
              {activeTab === "platform" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="h-5 w-5 text-violet-500" /> Platform Configurations
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Configure global configurations for the ExamNova site dashboard.</p>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-850 pt-5">
                    {/* Site name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Site Brand Name</label>
                      <input 
                        type="text" 
                        required
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full sm:w-96 px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                    </div>

                    {/* Site Tagline */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Site Tagline</label>
                      <input 
                        type="text" 
                        required
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full sm:w-96 px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                    </div>

                    {/* Toggle Settings */}
                    <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                      {/* Maintenance Mode */}
                      <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Maintenance Mode</span>
                          <p className="text-xs text-zinc-500">Temporarily restrict public access to the platform.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                          className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                        />
                      </label>

                      {/* Allow registrations */}
                      <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">New User Registrations</span>
                          <p className="text-xs text-zinc-500">Allow students to sign up via public login portals.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={allowRegistrations}
                          onChange={(e) => setAllowRegistrations(e.target.checked)}
                          className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "branding" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="h-5 w-5 text-violet-500" /> Branding Configurations
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Customize typography colors and styles of the client UI.</p>
                  </div>

                  <div className="space-y-6 border-t border-zinc-100 dark:border-zinc-850 pt-5">
                    {/* Primary Color selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Primary Brand Color</label>
                      <div className="flex gap-2">
                        {colorThemes.map((c) => {
                          const isSelected = primaryColor === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setPrimaryColor(c.name)}
                              className={`h-8 w-8 rounded-full border-2 ${c.class} transition-all cursor-pointer ${
                                isSelected ? "ring-2 ring-violet-500 ring-offset-2 scale-110 shadow-sm" : "opacity-80 hover:opacity-100"
                              }`}
                              title={c.name}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Logo Brand Text */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Logo Header Text</label>
                      <input 
                        type="text" 
                        required
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        className="w-full sm:w-96 px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                    </div>

                    {/* Default theme checkbox */}
                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Force Dark Mode</span>
                        <p className="text-xs text-zinc-500">Enable premium dark layouts by default for new accounts.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={darkThemeByDefault}
                        onChange={(e) => setDarkThemeByDefault(e.target.checked)}
                        className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Bell className="h-5 w-5 text-violet-500" /> Notifications Settings
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Determine how emails and messaging hooks are triggered.</p>
                  </div>

                  <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-850 pt-5">
                    {/* Email Alerts */}
                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">System Email Alerts</span>
                        <p className="text-xs text-zinc-500">Send administrators warning alerts about system activity.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                      />
                    </label>

                    {/* Weekly digest */}
                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Weekly Performance Bulletins</span>
                        <p className="text-xs text-zinc-500">Auto-email weekly reports to students on preparation readiness scores.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={weeklyDigest}
                        onChange={(e) => setWeeklyDigest(e.target.checked)}
                        className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                      />
                    </label>

                    {/* Slack Webhook integration mock */}
                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Slack Webhook Alerts</span>
                        <p className="text-xs text-zinc-500">Integrate real-time placement tracker logs to team channels.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={slackIntegration}
                        onChange={(e) => setSlackIntegration(e.target.checked)}
                        className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="h-5 w-5 text-violet-500" /> Security & Session Rules
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Configure authentication settings and session access lifetimes.</p>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-850 pt-5">
                    {/* 2FA */}
                    <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-850/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Enforce Multi-Factor (MFA)</span>
                        <p className="text-xs text-zinc-500">Require 2FA authentication code prompts for all admin roles.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                        className="h-5 w-5 accent-violet-650 rounded cursor-pointer"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Session timeout */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Session Timeout (Minutes)</label>
                        <input 
                          type="number" 
                          required
                          min={5}
                          max={240}
                          value={sessionTimeout}
                          onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>

                      {/* Password expiry */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password Expiry Policy (Days)</label>
                        <input 
                          type="number" 
                          required
                          min={15}
                          max={365}
                          value={passwordExpiryDays}
                          onChange={(e) => setPasswordExpiryDays(parseInt(e.target.value))}
                          className="w-full px-3.5 h-10 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-850/60 flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="gap-1.5 h-10 px-6 font-bold"
                >
                  <Check className="h-4.5 w-4.5" /> Save Changes
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
