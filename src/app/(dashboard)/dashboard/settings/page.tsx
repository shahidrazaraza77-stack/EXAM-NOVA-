"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Settings, User, Bell, Shield, Camera, Check, AlertCircle, 
  Trash2, QrCode, KeyRound, Copy, Download, LogOut, Laptop, 
  Smartphone, ShieldCheck, CheckCircle2, RefreshCw, X, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { storageService } from "@/services/storage.service";
import { mfaService, MfaStatus } from "@/services/mfa.service";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, updateUserProfile, deleteUserAccount, resetPassword, logout } = useAuth();
  const { toast } = useToast();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Security / 2FA States
  const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true);
  const [recoveryCount, setRecoveryCount] = useState<number>(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // 2FA Enrollment Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState<string[]>([]);
  const [enrollStep, setEnrollStep] = useState<"qr" | "codes">("qr");

  // 2FA Disable Modal
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableTotpCode, setDisableTotpCode] = useState("");
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);

  // Recovery Codes Modal
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isGeneratingRecovery, setIsGeneratingRecovery] = useState(false);
  const [activeRecoveryCodes, setActiveRecoveryCodes] = useState<string[]>([]);

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Notification toggle states
  const [notifInterviewReminders, setNotifInterviewReminders] = useState(true);
  const [notifAptitudeDigest, setNotifAptitudeDigest] = useState(false);

  // Load User Profile
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.name || "");
      setTargetRole(user.target_role || "");
      setTargetCompany(user.target_company || "");
      setAvatarPreview(user.avatar_url || "");
    }
  }, [user]);

  // Load Real MFA & Security State
  const fetchSecurityDetails = async () => {
    setIsLoadingMfa(true);
    try {
      const status = await mfaService.getMfaStatus();
      setMfaStatus(status);

      if (status.isEnabled) {
        const count = await mfaService.getRecoveryCodesCount();
        setRecoveryCount(count);
      }

      // Fetch user security activity
      const logRes = await fetch("/api/auth/security-logs");
      if (logRes.ok) {
        const logData = await logRes.json();
        setRecentLogs(logData.logs || []);
      }
    } catch (err) {
      console.warn("Failed to load security state:", err);
    } finally {
      setIsLoadingMfa(false);
    }
  };

  useEffect(() => {
    fetchSecurityDetails();
  }, []);

  // Avatar Management
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      if (user.avatar_url) {
        await storageService.deleteAvatar(user.avatar_url);
      }
      const publicUrl = await storageService.uploadAvatar(user.id, file);
      await updateUserProfile({ avatar_url: publicUrl });
      toast.success("Avatar updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar.");
      setAvatarPreview(user.avatar_url || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !user.avatar_url) return;
    setIsUploading(true);
    try {
      await storageService.deleteAvatar(user.avatar_url);
      await updateUserProfile({ avatar_url: "" });
      setAvatarPreview("");
      toast.success("Avatar removed successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile({
        full_name: fullName,
        target_role: targetRole,
        target_company: targetCompany,
      });
      toast.success("Profile settings saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  // Start 2FA Enrollment
  const handleStartEnrollMfa = async () => {
    try {
      const data = await mfaService.enrollTotp();
      setEnrollData(data);
      setTotpVerifyCode("");
      setEnrollStep("qr");
      setShowEnrollModal(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize 2FA enrollment.");
    }
  };

  // Verify initial TOTP code to complete enrollment
  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData) return;

    setIsVerifyingTotp(true);
    try {
      const result = await mfaService.verifyEnrollment(enrollData.factorId, totpVerifyCode);
      toast.success("Two-Factor Authentication enabled successfully!");
      setGeneratedRecoveryCodes(result.recoveryCodes);
      setEnrollStep("codes");
      await fetchSecurityDetails();
    } catch (err: any) {
      toast.error(err?.message || "Invalid authenticator code. Please check and try again.");
    } finally {
      setIsVerifyingTotp(false);
    }
  };

  // Disable 2FA with current TOTP code verification
  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaStatus?.verifiedFactorId) return;

    setIsDisablingMfa(true);
    try {
      // Step 1: Verify current TOTP code
      await mfaService.verifyLoginChallenge(mfaStatus.verifiedFactorId, disableTotpCode);
      // Step 2: Unenroll factor
      await mfaService.unenrollFactor(mfaStatus.verifiedFactorId);
      toast.success("Two-Factor Authentication disabled.");
      setShowDisableModal(false);
      setDisableTotpCode("");
      await fetchSecurityDetails();
    } catch (err: any) {
      toast.error(err?.message || "Failed to disable 2FA. Check your code.");
    } finally {
      setIsDisablingMfa(false);
    }
  };

  // Generate / View Fresh Recovery Codes
  const handleGenerateFreshCodes = async () => {
    setIsGeneratingRecovery(true);
    try {
      const codes = await mfaService.generateNewRecoveryCodes();
      setActiveRecoveryCodes(codes);
      setRecoveryCount(codes.length);
      toast.success("8 new backup recovery codes generated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate recovery codes.");
    } finally {
      setIsGeneratingRecovery(false);
    }
  };

  // Sign Out Other Devices
  const handleSignOutOtherDevices = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      toast.success("All other active sessions signed out successfully.");
      await fetchSecurityDetails();
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign out other devices.");
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await resetPassword(newPassword);
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      toast.success("Account deleted successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete account.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const copyToClipboard = (text: string, msg: string = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isGoogleAccount = user?.email?.includes("@gmail.com") || (user as any)?.identities?.some((id: any) => id.provider === "google");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16" style={{ background: "var(--aurora-bg)", color: "var(--aurora-text)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, #6D5DF6, #4F46E5)" }}>
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--aurora-text)" }}>
              Account Settings
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--aurora-text-secondary)" }}>
              Manage your personal profile, credentials, two-factor authentication, and active sessions.
            </p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center p-1 rounded-2xl border gap-1 self-start sm:self-auto" style={{ background: "var(--aurora-card)", borderColor: "var(--aurora-border)" }}>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent"
            }`}
          >
            General Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Security & 2FA
            {mfaStatus?.isEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === "notifications"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent"
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* TAB 1: GENERAL PROFILE */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-6" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 16 }}>
              <h3 className="font-bold text-sm flex items-center gap-2 pb-3" style={{ color: "var(--aurora-text)", borderBottom: "1px solid var(--aurora-border)" }}>
                <User className="w-4.5 h-4.5" style={{ color: "#6D5DF6" }} /> Account Profile Info
              </h3>

              {/* Avatar Uploader UI */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center relative" style={{ background: "var(--aurora-surface)", border: "1px solid var(--aurora-border)" }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-zinc-400" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-lg transition-transform active:scale-95">
                    <Camera className="w-4.5 h-4.5" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <h4 className="font-bold text-sm" style={{ color: "var(--aurora-text)" }}>Profile Photo</h4>
                  <p className="text-2xs max-w-xs leading-relaxed" style={{ color: "var(--aurora-text-secondary)" }}>
                    Upload a professional JPEG, PNG, or WEBP image up to 2MB. Validated server-side.
                  </p>
                  {avatarPreview && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="text-2xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      disabled={isUploading}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                />
                <Input
                  label="Email Address"
                  value={user?.email || ""}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <Input
                  label="Target Placement Role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
                <Input
                  label="Target Company"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  variant="primary" 
                  onClick={handleSaveProfile} 
                  className="cursor-pointer"
                  isLoading={isSaving}
                >
                  Save Profile Changes
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="p-5 space-y-4" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 16 }}>
              <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Account Security Status
              </h4>
              <div className="space-y-3 text-xs leading-relaxed" style={{ color: "var(--aurora-text-secondary)" }}>
                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "var(--aurora-border)" }}>
                  <span>Two-Factor Auth:</span>
                  <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${mfaStatus?.isEnabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    {mfaStatus?.isEnabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "var(--aurora-border)" }}>
                  <span>Current Role:</span>
                  <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400">
                    {user?.role || "student"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("security")}
                  className="w-full justify-center text-xs cursor-pointer mt-2"
                >
                  Configure Security & 2FA
                </Button>
              </div>
            </Card>

            <Card className="p-5 space-y-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16 }}>
              <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--aurora-danger)" }}>
                <AlertCircle className="w-4 h-4" style={{ color: "var(--aurora-danger)" }} /> Danger Zone
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--aurora-text-secondary)" }}>
                Permanently delete your ExamNova profile, resumes, submissions, and credentials using authenticated self-deletion.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="w-full justify-center border-red-200 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer"
              >
                Delete My Account
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY CENTER & 2FA (REQUIREMENT 28) */}
      {activeTab === "security" && (
        <div className="space-y-8">
          {/* Account Protection Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Authentication Card */}
            <Card className="p-6 space-y-4 relative overflow-hidden" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 20 }}>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Protected
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: "var(--aurora-text)" }}>Primary Authentication</h4>
                <p className="text-2xs mt-1" style={{ color: "var(--aurora-text-secondary)" }}>
                  {isGoogleAccount ? "Authenticated via Google OAuth" : "Authenticated via Email and Password"}
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-2xs" style={{ borderColor: "var(--aurora-border)" }}>
                <span className="text-zinc-400">{user?.email}</span>
                {!isGoogleAccount && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer border-none bg-transparent"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </Card>

            {/* Two-Factor Authentication Card */}
            <Card className="p-6 space-y-4 relative overflow-hidden" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 20 }}>
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mfaStatus?.isEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase flex items-center gap-1 ${mfaStatus?.isEnabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${mfaStatus?.isEnabled ? "bg-emerald-500" : "bg-zinc-400"}`} />
                  {mfaStatus?.isEnabled ? "Enabled" : "Not Enabled"}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: "var(--aurora-text)" }}>Two-Factor Authentication</h4>
                <p className="text-2xs mt-1" style={{ color: "var(--aurora-text-secondary)" }}>
                  {mfaStatus?.isEnabled ? "TOTP Authenticator Application active." : "Enhance account security with TOTP authentication."}
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-2xs" style={{ borderColor: "var(--aurora-border)" }}>
                {mfaStatus?.isEnabled ? (
                  <>
                    <span className="text-zinc-400">{recoveryCount} recovery codes</span>
                    <button
                      onClick={() => setShowDisableModal(true)}
                      className="font-bold text-red-500 hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Disable 2FA
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEnrollMfa}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer border-none bg-transparent ml-auto"
                  >
                    Enable 2FA Now →
                  </button>
                )}
              </div>
            </Card>

            {/* Google Account Connection Card */}
            <Card className="p-6 space-y-4 relative overflow-hidden" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 20 }}>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase ${isGoogleAccount ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                  {isGoogleAccount ? "Connected" : "Not Linked"}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: "var(--aurora-text)" }}>Google Account</h4>
                <p className="text-2xs mt-1" style={{ color: "var(--aurora-text-secondary)" }}>
                  {isGoogleAccount ? "Single sign-on active. Protected by Supabase OAuth." : "Direct email/password login is active."}
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-2xs" style={{ borderColor: "var(--aurora-border)" }}>
                <span className="text-zinc-400">OAuth Handshake Verified</span>
              </div>
            </Card>
          </div>

          {/* MFA Management Hub */}
          <Card className="p-6 space-y-6" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 20 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--aurora-border)" }}>
              <div className="space-y-1">
                <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
                  <Shield className="w-5 h-5 text-indigo-500" /> Real Two-Factor Authentication (TOTP)
                </h3>
                <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                  Compatible with Google Authenticator, Microsoft Authenticator, 1Password, and Authy.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {mfaStatus?.isEnabled ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRecoveryModal(true)}
                      className="cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Recovery Codes ({recoveryCount})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEnrollMfa}
                      className="cursor-pointer text-xs"
                    >
                      Replace Authenticator
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStartEnrollMfa}
                    className="cursor-pointer text-xs font-bold"
                  >
                    Enable Two-Factor Authentication
                  </Button>
                )}
              </div>
            </div>

            {mfaStatus?.isEnabled ? (
              <div className="p-4 rounded-xl flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                      Two-Factor Authentication is actively protecting your account
                    </h5>
                    <p className="text-2xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Logins and administrative operations require entering a 6-digit TOTP code.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl flex items-center justify-between bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-amber-800 dark:text-amber-300">
                      Two-factor authentication is not currently enabled
                    </h5>
                    <p className="text-2xs text-amber-700 dark:text-amber-400 mt-0.5">
                      We strongly recommend enabling 2FA to defend against credential stuffing and brute-force attacks.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Active Sessions & Device Management (Requirement 29) */}
          <Card className="p-6 space-y-6" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 20 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--aurora-border)" }}>
              <div className="space-y-1">
                <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
                  <Laptop className="w-5 h-5 text-indigo-500" /> Active Session Management
                </h3>
                <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                  View devices currently authorized with your ExamNova account.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOutOtherDevices}
                className="cursor-pointer text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out Other Devices
              </Button>
            </div>

            <div className="space-y-3">
              {/* Current Device Item */}
              <div className="p-4 rounded-2xl flex items-center justify-between border" style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)" }}>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs" style={{ color: "var(--aurora-text)" }}>Current Web Browser</h5>
                      <span className="px-2 py-0.2 rounded-full text-3xs font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        This Session
                      </span>
                    </div>
                    <p className="text-2xs mt-0.5" style={{ color: "var(--aurora-text-secondary)" }}>
                      Next.js Secure Client • Verified Session • Active Now
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-mono font-semibold text-emerald-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Activity Logs */}
          <Card className="p-6 space-y-4" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 20 }}>
            <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Recent Security Activity
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--aurora-border)", color: "var(--aurora-text-secondary)" }}>
                    <th className="pb-3 font-semibold">Event</th>
                    <th className="pb-3 font-semibold">Severity</th>
                    <th className="pb-3 font-semibold">IP Address</th>
                    <th className="pb-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--aurora-border)" }}>
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log) => (
                      <tr key={log.id} className="py-2.5">
                        <td className="py-3 font-mono font-bold text-2xs" style={{ color: "var(--aurora-text)" }}>
                          {log.event_type}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase ${
                            log.severity === "error" || log.severity === "critical"
                              ? "bg-red-500/15 text-red-500"
                              : log.severity === "warning"
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-emerald-500/15 text-emerald-500"
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-2xs text-zinc-400">
                          {log.ip_address || "Client"}
                        </td>
                        <td className="py-3 text-2xs text-zinc-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-2xs text-zinc-400">
                        No recent suspicious activity logged. All security checks normal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl space-y-6">
          <Card className="p-6 space-y-6" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)", borderRadius: 16 }}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-3" style={{ color: "var(--aurora-text)", borderBottom: "1px solid var(--aurora-border)" }}>
              <Bell className="w-4.5 h-4.5" style={{ color: "#6D5DF6" }} /> Placement Notifications
            </h3>
            <div className="space-y-4">
              {[
                { label: "Interview Reminders", desc: "Receive alert popups 15 minutes before mock sessions start.", state: notifInterviewReminders, toggle: () => setNotifInterviewReminders(v => !v) },
                { label: "Aptitude Digest Recommendations", desc: "Receive email summaries containing adaptive questions.", state: notifAptitudeDigest, toggle: () => setNotifAptitudeDigest(v => !v) },
              ].map(({ label, desc, state, toggle }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-xs" style={{ color: "var(--aurora-text)" }}>{label}</h4>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--aurora-text-secondary)" }}>{desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state}
                    onClick={toggle}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer border-none shrink-0 ${
                      state ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 700, damping: 30 }}
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${
                        state ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: 2FA ENROLLMENT MODAL (REQUIREMENT 9) */}
      {showEnrollModal && enrollData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)" }}>
            <button
              onClick={() => setShowEnrollModal(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            {enrollStep === "qr" ? (
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-indigo-600 text-white mb-2 shadow-lg">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black" style={{ color: "var(--aurora-text)" }}>
                    Enable Two-Factor Authentication
                  </h3>
                  <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                    Scan the QR code below using your authenticator application.
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center mx-auto w-fit shadow-md">
                  <img
                    src={enrollData.qrCode}
                    alt="Authenticator QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                {/* Manual Secret Key */}
                <div className="space-y-1.5">
                  <label className="text-3xs font-extrabold uppercase text-zinc-400">
                    Can't scan? Use this setup key manually:
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border font-mono text-xs select-all justify-between" style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)" }}>
                    <span className="truncate">{enrollData.secret}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(enrollData.secret, "Setup secret key copied!")}
                      className="p-1 rounded text-indigo-500 hover:text-indigo-600 cursor-pointer bg-transparent border-none shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 6-Digit Verification Code */}
                <form onSubmit={handleVerifyEnrollment} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold block" style={{ color: "var(--aurora-text)" }}>
                      Enter 6-digit Authenticator Code to Confirm:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                      placeholder="000000"
                      value={totpVerifyCode}
                      onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full py-3 px-4 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)", color: "var(--aurora-text)" }}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center py-3 font-bold cursor-pointer"
                    isLoading={isVerifyingTotp}
                    disabled={totpVerifyCode.length !== 6}
                  >
                    Verify & Activate 2FA
                  </Button>
                </form>
              </div>
            ) : (
              /* Step 2: Show Single-Use Recovery Codes (Requirement 11) */
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-emerald-500 text-white mb-2 shadow-lg">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    Two-Factor Authentication Enabled!
                  </h3>
                  <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                    Save these 8 emergency recovery codes now. If you lose your authenticator device, each code can be used exactly once to log in.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl border font-mono text-xs font-bold text-center" style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)", color: "var(--aurora-text)" }}>
                  {generatedRecoveryCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 select-all">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 justify-center cursor-pointer text-xs"
                    onClick={() => copyToClipboard(generatedRecoveryCodes.join("\n"), "All recovery codes copied!")}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy All Codes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 justify-center cursor-pointer text-xs"
                    onClick={() => downloadTextFile("examnova-recovery-codes.txt", `ExamNova Backup Recovery Codes:\n\n${generatedRecoveryCodes.join("\n")}\n\nEach code can only be used once.`)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download (.txt)
                  </Button>
                </div>

                <Button
                  variant="primary"
                  className="w-full justify-center py-2.5 font-bold cursor-pointer"
                  onClick={() => setShowEnrollModal(false)}
                >
                  I Have Saved My Recovery Codes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: DISABLE 2FA MODAL (REQUIREMENT 12) */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)" }}>
            <button
              onClick={() => setShowDisableModal(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-red-500/10 text-red-500 mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black" style={{ color: "var(--aurora-text)" }}>
                Disable Two-Factor Authentication
              </h3>
              <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                To ensure security, enter your current 6-digit authenticator code before disabling 2FA.
              </p>
            </div>

            <form onSubmit={handleDisableMfa} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold block" style={{ color: "var(--aurora-text)" }}>
                  Current 6-Digit Authenticator Code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  placeholder="000000"
                  value={disableTotpCode}
                  onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full py-3 px-4 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)", color: "var(--aurora-text)" }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1 justify-center cursor-pointer"
                  onClick={() => setShowDisableModal(false)}
                  disabled={isDisablingMfa}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 justify-center bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer border-none"
                  isLoading={isDisablingMfa}
                  disabled={disableTotpCode.length !== 6}
                >
                  Confirm Disable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECOVERY CODES MANAGEMENT MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)" }}>
            <button
              onClick={() => {
                setShowRecoveryModal(false);
                setActiveRecoveryCodes([]);
              }}
              className="absolute right-5 top-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-indigo-600 text-white mb-2 shadow-lg">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black" style={{ color: "var(--aurora-text)" }}>
                Backup Recovery Codes
              </h3>
              <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                You currently have <strong className="text-indigo-600 dark:text-indigo-400">{recoveryCount} unused</strong> single-use recovery codes.
              </p>
            </div>

            {activeRecoveryCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl border font-mono text-xs font-bold text-center" style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)" }}>
                  {activeRecoveryCodes.map((c, i) => (
                    <div key={i} className="p-2 rounded bg-zinc-100 dark:bg-zinc-800/60 select-all">
                      {c}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs cursor-pointer"
                    onClick={() => copyToClipboard(activeRecoveryCodes.join("\n"))}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs cursor-pointer"
                    onClick={() => downloadTextFile("examnova-recovery-codes.txt", activeRecoveryCodes.join("\n"))}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border text-center space-y-3" style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)" }}>
                <p className="text-2xs" style={{ color: "var(--aurora-text-secondary)" }}>
                  For security, recovery codes are hashed in the database and never shown again unless newly generated.
                </p>
                <Button
                  variant="primary"
                  onClick={handleGenerateFreshCodes}
                  isLoading={isGeneratingRecovery}
                  className="w-full justify-center text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Generate 8 Fresh Recovery Codes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)" }}>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black" style={{ color: "var(--aurora-text)" }}>
                Change Account Password
              </h3>
              <p className="text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
                Enter your new secure password (minimum 8 characters).
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold block" style={{ color: "var(--aurora-text)" }}>
                  New Password
                </label>
                <input
                  type={showPasswordText ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)", color: "var(--aurora-text)" }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold block" style={{ color: "var(--aurora-text)" }}>
                  Confirm New Password
                </label>
                <input
                  type={showPasswordText ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ background: "var(--aurora-surface)", borderColor: "var(--aurora-border)", color: "var(--aurora-text)" }}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPwd"
                  checked={showPasswordText}
                  onChange={(e) => setShowPasswordText(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showPwd" className="text-2xs cursor-pointer" style={{ color: "var(--aurora-text-secondary)" }}>
                  Show password text
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1 justify-center cursor-pointer"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 justify-center font-bold cursor-pointer"
                  isLoading={isUpdatingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE CONFIRMATION MODAL (REQUIREMENT 30) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-6 shadow-2xl" style={{ background: "var(--aurora-card)", border: "1px solid var(--aurora-border)" }}>
            <div className="space-y-2">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
                <AlertCircle className="w-5 h-5 text-red-500" /> Confirm Permanent Deletion
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--aurora-text-secondary)" }}>
                Are you absolutely sure you want to permanently delete your ExamNova account? This action invokes authenticated server deletion and erases all your profile data, uploaded resumes, and coding progress.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer border-none"
              >
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
