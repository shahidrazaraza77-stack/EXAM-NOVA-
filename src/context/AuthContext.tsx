"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { storageService } from "@/services/storage.service";

export interface User {
  id: string;
  name: string; // Alias for backward compatibility
  full_name: string;
  email: string;
  avatar_url?: string;
  role: "student" | "recruiter" | "admin" | "content_manager";
  target_role?: string;
  target_company?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, role?: string) => Promise<boolean>;
  loginWithGoogle: (redirectToPath?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  updateUserProfile: (updates: {
    full_name?: string;
    avatar_url?: string;
    target_role?: string;
    target_company?: string;
  }) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set/clear auth cookies dynamically
export const setAuthCookies = (session: any, role: string) => {
  if (!session || !session.access_token) return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const maxAge =
    session.expires_in ||
    (session.expires_at ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000)) : 604800) ||
    604800;
  const suffix = `; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  document.cookie = `examnova-session=${session.access_token}${suffix}`;
  document.cookie = `examnova-role=${role}${suffix}`;
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const suffix = `; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  document.cookie = `examnova-session=${suffix}`;
  document.cookie = `examnova-role=${suffix}`;
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = (eqPos > -1 ? cookie.substr(0, eqPos) : cookie).trim();
    if (name.startsWith("sb-") || name.includes("auth-token")) {
      document.cookie = `${name}=${suffix}`;
      document.cookie = `${name}=${suffix}; domain=${window.location.hostname}`;
    }
  });
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to retrieve profile and map state
  const handleUserSession = async (sbUser: any, sessionParam?: any) => {
    if (!sbUser) {
      console.log("[AUTH] No session user found. Clearing auth state.");
      setUser(null);
      clearAuthCookies();
      setLoading(false);
      return;
    }

    console.log(`[AUTH] Session Found: User ID ${sbUser.id} (${sbUser.email})`);

    // 1. Immediately create and set valid user state from metadata so UI doesn't hang
    const metaName =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      sbUser.email?.split("@")[0] ||
      "User";
    const initialRole = (sbUser.user_metadata?.role as any) || "student";

    const initialUser: User = {
      id: sbUser.id,
      name: metaName,
      full_name: metaName,
      email: sbUser.email || "",
      avatar_url: sbUser.user_metadata?.avatar_url || undefined,
      role: initialRole,
    };

    // Immediately unblock loading and set active user
    setUser(initialUser);
    setLoading(false);

    // Set auth cookies immediately for Next.js proxy
    const session = sessionParam || (await supabase.auth.getSession()).data.session;
    if (session) {
      setAuthCookies(session, initialRole);
    }

    // 2. Check if there was an active OAuth login initiated that requires redirection
    if (typeof window !== "undefined") {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
        return match ? decodeURIComponent(match[2]) : null;
      };

      const pendingNext =
        sessionStorage.getItem("examnova_auth_next") ||
        localStorage.getItem("examnova_auth_next") ||
        getCookie("examnova_auth_next");
      const isOAuthInProgress =
        sessionStorage.getItem("examnova_oauth_in_progress") ||
        localStorage.getItem("examnova_oauth_in_progress");

      if (pendingNext || isOAuthInProgress) {
        try {
          sessionStorage.removeItem("examnova_auth_next");
          sessionStorage.removeItem("examnova_oauth_in_progress");
          localStorage.removeItem("examnova_auth_next");
          localStorage.removeItem("examnova_oauth_in_progress");
          document.cookie = "examnova_auth_next=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } catch {}

        let destination = pendingNext || "/dashboard";
        if (!destination || destination === "/login" || destination === "/signup" || destination === "/") {
          destination = initialRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
        }
        console.log(`[AUTH] OAuth sign-in detected across navigation. Auto-navigating to: ${destination}`);
        window.location.replace(destination);
        return;
      }
    }

    // 3. Asynchronously load / enrich profile from database in background
    try {
      const profile = await profileService.getProfile(sbUser.id);
      if (profile) {
        const enrichedRole = (profile.role as any) || initialRole;
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: profile.full_name || prev.name,
            full_name: profile.full_name || prev.full_name,
            avatar_url: profile.avatar_url || prev.avatar_url,
            role: enrichedRole,
            target_role: profile.target_role || undefined,
            target_company: profile.target_company || undefined,
          };
        });
        if (session) {
          setAuthCookies(session, enrichedRole);
        }
      } else {
        // Ensure profile row exists
        profileService.ensureProfile(sbUser).catch(() => {});
      }
    } catch (e) {
      console.warn("[AUTH] Profile background sync warning:", e);
    }
  };

  useEffect(() => {
    console.log("[AUTH] Initializing AuthContext...");

    // Safety timeout: ensure loading state never hangs longer than 3 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading((curr) => {
        if (curr) {
          console.warn("[AUTH] Session check timed out, setting loading to false");
          return false;
        }
        return curr;
      });
    }, 3000);

    // Check initial active session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          handleUserSession(session.user, session);
        } else {
          console.log("[AUTH] No initial session found.");
          setLoading(false);
          clearAuthCookies();
        }
      })
      .catch((err) => {
        console.error("[AUTH] Error fetching initial session:", err);
        setLoading(false);
        clearAuthCookies();
      })
      .finally(() => {
        clearTimeout(safetyTimeout);
      });

    // Subscribe to auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH] Auth Event Triggered: ${event}`);

      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (session?.user) {
            await handleUserSession(session.user, session);
            // Note: Redirection to /dashboard is handled exclusively by the /auth/callback page.
            // AuthContext does NOT auto-redirect on SIGNED_IN — this allows users to visit
            // /login to switch Google accounts without being bounced away.
          } else {
            setUser(null);
            clearAuthCookies();
            setLoading(false);
          }
          break;

        case "SIGNED_OUT":
          console.log("[AUTH] User Signed Out");
          setUser(null);
          clearAuthCookies();
          setLoading(false);
          break;

        default:
          if (session?.user) {
            await handleUserSession(session.user, session);
          } else {
            setLoading(false);
          }
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const pwd = password || "DefaultPassword123!";
      const data = await authService.signIn(email, pwd);
      if (data?.user) {
        await handleUserSession(data.user);
      }
      router.push("/dashboard");
      return true;
    } catch (e) {
      setLoading(false);
      console.error("Login failed:", e);
      throw e;
    }
  };

  const register = async (name: string, email: string, password?: string, role: string = "student"): Promise<boolean> => {
    setLoading(true);
    try {
      const pwd = password || "DefaultPassword123!";
      const data = await authService.signUp(email, pwd, name, role);
      if (data.session) {
        if (data.user) {
          await handleUserSession(data.user);
        }
        router.push("/dashboard");
        return true;
      }
      setLoading(false);
      return false; // Email verification is required
    } catch (e) {
      setLoading(false);
      console.error("Registration failed:", e);
      throw e;
    }
  };

  const loginWithGoogle = async (redirectToPath: string = "/dashboard"): Promise<boolean> => {
    setLoading(true);
    try {
      await authService.signInWithGoogle(redirectToPath);
      return true;
    } catch (e) {
      setLoading(false);
      console.error("Google authentication failed:", e);
      throw e;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      clearAuthCookies();
      if (typeof window !== "undefined") {
        try {
          const keys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith("sb-") || k.includes("supabase") || k.startsWith("examnova-"))) {
              keys.push(k);
            }
          }
          keys.forEach((k) => localStorage.removeItem(k));
          sessionStorage.clear();
        } catch {}
      }
      await authService.signOut().catch(() => {});
      setUser(null);
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (e) {
      console.error("Forgot password failed:", e);
      throw e;
    }
  };

  const resetPassword = async (password: string): Promise<void> => {
    try {
      await authService.updatePassword(password);
    } catch (e) {
      console.error("Reset password failed:", e);
      throw e;
    }
  };

  const updateUserProfile = async (updates: {
    full_name?: string;
    avatar_url?: string;
    target_role?: string;
    target_company?: string;
  }): Promise<void> => {
    if (!user) throw new Error("No authenticated user session.");

    try {
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: updatedProfile.full_name || prev.name,
          full_name: updatedProfile.full_name || prev.full_name,
          avatar_url: updatedProfile.avatar_url || prev.avatar_url,
          target_role: updatedProfile.target_role || prev.target_role,
          target_company: updatedProfile.target_company || prev.target_company,
        };
      });
    } catch (e) {
      console.error("Failed to update profile attributes:", e);
      throw e;
    }
  };

  const deleteUserAccount = async (): Promise<void> => {
    if (!user) throw new Error("No active user session.");
    setLoading(true);
    try {
      // 1. Delete avatar from storage if exists
      if (user.avatar_url) {
        await storageService.deleteAvatar(user.avatar_url);
      }
      // 2. Call self-deletion RPC
      await authService.deleteAccount();
      
      setUser(null);
      router.push("/");
    } catch (e) {
      console.error("Account self-deletion failed:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        forgotPassword,
        resetPassword,
        updateUserProfile,
        deleteUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
