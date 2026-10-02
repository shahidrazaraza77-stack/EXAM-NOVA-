import { supabase } from "@/lib/supabaseClient";

const db = supabase as any;

export interface DashboardData {
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
  analytics: {
    id: string;
    user_id: string;
    resume_score: number;
    aptitude_score: number;
    coding_score: number;
    interview_score: number;
    xp: number;
    streak: number;
    overall_readiness: number;
    updated_at: string;
  } | null;
  activities: Array<{
    id: string;
    user_id: string;
    action: string;
    module: string;
    created_at: string;
  }>;
}

export const dashboardService = {
  /**
   * Retrieves profile, user analytics, and the latest 10 activities for a given user
   */
  async getDashboardData(userId: string): Promise<DashboardData> {
    // 1. Fetch profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile in dashboardService:", profileError?.message || profileError);
    }

    // 2. Fetch user_analytics
    let { data: analytics, error: analyticsError } = await db
      .from("user_analytics")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Fallback: If it doesn't exist yet, insert a default row dynamically
    if (!analytics && userId) {
      try {
        let { data: newAnalytics, error: insertError } = await db
          .from("user_analytics")
          .insert({ user_id: userId })
          .select()
          .single();
        
        // If it fails due to the "category" column not-null constraint (old schema), try inserting with old schema fields
        if (insertError && (insertError.message?.includes("category") || insertError.message?.includes("violates not-null constraint"))) {
          const fallbackRes = await db
            .from("user_analytics")
            .insert({
              user_id: userId,
              category: "overall",
              metric_name: "score",
              metric_value: 0
            })
            .select()
            .single();
          
          if (!fallbackRes.error) {
            newAnalytics = fallbackRes.data;
            insertError = null;
          } else {
            insertError = fallbackRes.error;
          }
        }

        // Handle duplicate key/unique constraint violations gracefully
        if (insertError && (insertError.code === "23505" || insertError.message?.includes("duplicate key") || insertError.message?.includes("unique constraint"))) {
          const reFetch = await db
            .from("user_analytics")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
          
          if (reFetch.data) {
            newAnalytics = reFetch.data;
            insertError = null;
          }
        }
        
        if (!insertError) {
          analytics = newAnalytics;
        } else {
          console.error("Error inserting fallback user_analytics:", insertError?.message || insertError);
        }
      } catch (err) {
        console.error("Failed to auto-create analytics row on fallback:", err);
      }
    }

    // 3. Fetch user_activity (latest 10 entries) — table may not exist yet
    let activities: any[] = [];
    try {
      const res = await db
        .from("user_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!res.error) activities = res.data || [];
    } catch {
      // table not created yet — return empty
    }

    return {
      profile: profile || null,
      analytics: analytics || null,
      activities: activities || []
    };
  },

  /**
   * Logs a user action into the user_activity database table
   */
  async logActivity(userId: string, action: string, module: string): Promise<void> {
    const { error } = await db
      .from("user_activity")
      .insert({
        user_id: userId,
        action,
        module
      });

    if (error && !error.message?.includes("does not exist")) {
      console.error("Error logging user activity in dashboardService:", error.message);
    }
  }
};
