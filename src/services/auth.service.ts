import { supabase } from "@/lib/supabase";

function getSiteOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export const authService = {
  /**
   * Register a new user with Email and Password
   */
  async signUp(email: string, password: string, fullName: string, rawRole: string = "student") {
    // Sanitize role: clients may only register as student or recruiter (never admin or content_manager)
    const role = rawRole === "recruiter" ? "recruiter" : "student";
    const origin = getSiteOrigin();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log in an existing user with Email and Password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log in / Sign up with Google OAuth
   */
  async signInWithGoogle(redirectToPath: string = "/dashboard") {
    const origin = getSiteOrigin();

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("examnova_auth_next", redirectToPath);
        sessionStorage.setItem("examnova_oauth_in_progress", "true");
        localStorage.setItem("examnova_auth_next", redirectToPath);
        localStorage.setItem("examnova_oauth_in_progress", "true");
        // Also set a temporary 10-minute cookie backup in case storage is isolated
        document.cookie = `examnova_auth_next=${encodeURIComponent(redirectToPath)}; path=/; max-age=600; SameSite=Lax`;
      } catch (e) {
        console.warn("[AUTH] Failed to write destination to storage:", e);
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.location.assign(data.url);
    }
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Fetch current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Trigger password reset email
   */
  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteOrigin()}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update the user's password (e.g. after password reset redirect)
   */
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
  },

  /**
   * Securely delete the currently authenticated user's account
   */
  async deleteAccount() {
    const { error } = await (supabase as any).rpc("delete_own_user");
    if (error) throw error;
  },
};
