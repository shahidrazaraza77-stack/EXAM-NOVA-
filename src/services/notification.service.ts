import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/supabase";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
type UserPreferencesRow = Database["public"]["Tables"]["user_preferences"]["Row"];
type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"];

export const notificationService = {
  /**
   * Creates and stores a notification if user preferences allow it.
   */
  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    category: "system" | "ai" | "gamification" | "study";
    priority: "high" | "medium" | "low";
  }): Promise<NotificationRow | null> {
    const { userId, title, message, category, priority } = params;

    try {
      // Check user preferences first
      const prefs = await this.getUserPreferences(userId);
      if (prefs && !prefs.notifications_enabled) {
        return null;
      }

      const { data, error } = await (supabase.from("notifications") as any)
        .insert({
          user_id: userId,
          title,
          message,
          category,
          priority,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting notification:", error);
        return null;
      }
      return data as NotificationRow;
    } catch (e) {
      console.error("Error in createNotification:", e);
      return null;
    }
  },

  /**
   * Retrieves notifications for a specific user
   */
  async getNotifications(userId: string): Promise<NotificationRow[]> {
    try {
      const { data, error } = await (supabase.from("notifications") as any)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error getting notifications:", error);
        return [];
      }
      return (data || []) as NotificationRow[];
    } catch (e) {
      console.error("Error in getNotifications:", e);
      return [];
    }
  },

  /**
   * Marks a specific notification as read.
   */
  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const { error } = await (supabase.from("notifications") as any)
        .update({ is_read: true })
        .eq("id", id);

      if (error) {
        console.error("Error marking notification read:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error in markNotificationRead:", e);
      return false;
    }
  },

  /**
   * Marks all notifications as read for a user.
   */
  async markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await (supabase.from("notifications") as any)
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking all notifications read:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error in markAllNotificationsRead:", e);
      return false;
    }
  },

  /**
   * Returns unread notifications count.
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await (supabase.from("notifications") as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }
      return count || 0;
    } catch (e) {
      console.error("Error in getUnreadCount:", e);
      return 0;
    }
  },

  /**
   * Fetches or initializes user notification preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferencesRow | null> {
    try {
      const { data, error } = await (supabase.from("user_preferences") as any)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error getting user preferences:", error);
        return null;
      }

      if (!data) {
        // Lazy initialization if trigger hasn't fired yet
        const { data: newPrefs, error: createError } = await (supabase.from("user_preferences") as any)
          .insert({ user_id: userId })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating default user preferences:", createError);
          return null;
        }
        return newPrefs as UserPreferencesRow;
      }

      return data as UserPreferencesRow;
    } catch (e) {
      console.error("Error in getUserPreferences:", e);
      return null;
    }
  },

  /**
   * Updates user notification preferences
   */
  async updateUserPreferences(userId: string, updates: UserPreferencesUpdate): Promise<UserPreferencesRow | null> {
    try {
      const { data, error } = await (supabase.from("user_preferences") as any)
        .upsert({
          user_id: userId,
          ...updates
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        console.error("Error updating user preferences:", error);
        return null;
      }
      return data as UserPreferencesRow;
    } catch (e) {
      console.error("Error in updateUserPreferences:", e);
      return null;
    }
  },

  /**
   * Clears all notifications for a user.
   */
  async clearAllNotifications(userId: string): Promise<boolean> {
    try {
      const { error } = await (supabase.from("notifications") as any)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Error clearing notifications:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error in clearAllNotifications:", e);
      return false;
    }
  }
};
