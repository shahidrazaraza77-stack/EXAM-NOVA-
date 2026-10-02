import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const profileService = {
  /**
   * Fetch a user profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await (supabase.from("profiles") as any)
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error reading profile:", error);
      return null;
    }
    return data as ProfileRow | null;
  },

  /**
   * Update profile fields
   */
  async updateProfile(userId: string, updates: Omit<ProfileUpdate, "id">): Promise<ProfileRow> {
    const { data, error } = await (supabase.from("profiles") as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as ProfileRow;
  },

  /**
   * Ensure profile row exists in database for user
   */
  async ensureProfile(sbUser: any): Promise<ProfileRow | null> {
    const existing = await this.getProfile(sbUser.id);
    if (existing) return existing;

    console.log("[AUTH] Profile missing from database. Creating new profile row for:", sbUser.id);
    const full_name =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      sbUser.email?.split("@")[0] ||
      "User";
    const requestedRole = sbUser.user_metadata?.role;
    const role = requestedRole === "recruiter" ? "recruiter" : "student";
    const avatar_url = sbUser.user_metadata?.avatar_url || null;

    try {
      const { data, error } = await (supabase.from("profiles") as any)
        .upsert(
          {
            id: sbUser.id,
            full_name,
            email: sbUser.email,
            avatar_url,
            role,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        console.error("[AUTH] Failed to insert profile row:", error);
        return null;
      }
      return data as ProfileRow;
    } catch (err) {
      console.error("[AUTH] Unexpected error ensuring profile:", err);
      return null;
    }
  },
};

