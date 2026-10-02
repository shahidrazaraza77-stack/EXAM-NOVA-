import { supabase } from "@/lib/supabase";
import { dashboardService } from "@/services/dashboard.service";

const db = supabase as any;

export interface GamificationProfile {
  xp: number;
  level: number;
  streak_days: number;
  coding_streak: number;
  aptitude_streak: number;
  interview_streak: number;
  last_active_date: string | null;
  last_coding_date: string | null;
  last_aptitude_date: string | null;
  last_interview_date: string | null;
  rank_position: number | null;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
  unlocked_at: string | null;
  progress: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: "aptitude" | "coding" | "interview" | "login";
  target: number;
  progress: number;
  completed: boolean;
}

export interface LeaderboardUser {
  rank: number;
  full_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  badges_count: number;
  streak: number;
}

export const gamificationService = {
  /**
   * Fetches the complete gamification profile, badges list, active challenges, and activity logs for a user.
   */
  async getGamificationData(userId: string): Promise<{
    profile: GamificationProfile;
    badges: Badge[];
    challenges: Challenge[];
    recentActivity: any[];
  }> {
    // 1. Fetch gamification profile
    let { data: profile, error: profileError } = await db
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching user_gamification profile:", profileError);
    }

    // Fallback: insert default if not exists
    if (!profile && userId) {
      try {
        const { data: newProfile, error: insertError } = await db
          .from("user_gamification")
          .insert({ 
            user_id: userId, 
            xp: 0, 
            level: 1, 
            streak_days: 0, 
            last_active_date: new Date().toISOString().split("T")[0] 
          })
          .select()
          .single();
        if (!insertError) {
          profile = newProfile;
        } else {
          console.error("Error inserting default user_gamification:", insertError);
        }
      } catch (e) {
        console.error("Failed to auto-create user_gamification:", e);
      }
    }

    const defaultProfile: GamificationProfile = {
      xp: 0,
      level: 1,
      streak_days: 0,
      coding_streak: 0,
      aptitude_streak: 0,
      interview_streak: 0,
      last_active_date: null,
      last_coding_date: null,
      last_aptitude_date: null,
      last_interview_date: null,
      rank_position: null,
      ...profile
    };

    // 2. Fetch all badges
    const { data: allBadges } = await db.from("badges").select("*");

    // 3. Fetch unlocked badges for user
    const { data: userBadges } = await db
      .from("user_badges")
      .select("*")
      .eq("user_id", userId);

    const unlockedBadgeIds = new Set((userBadges || []).map((ub: any) => ub.badge_id));
    const badgeUnlockMap = new Map((userBadges || []).map((ub: any) => [ub.badge_id, ub.unlocked_at]));

    // Fetch user counters dynamically to compute badge progress
    const [codingCount, aptitudeCount, interviewCount, placementCount] = await Promise.all([
      db.from("coding_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "Accepted"),
      db.from("aptitude_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_correct", true),
      db.from("interview_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      db.from("mock_placements").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed")
    ]);

    const stats = {
      coding: codingCount.count || 0,
      aptitude: aptitudeCount.count || 0,
      interview: interviewCount.count || 0,
      placement: placementCount.count || 0,
      streak: defaultProfile.streak_days || 0,
      level: defaultProfile.level || 1
    };

    const mappedBadges: Badge[] = (allBadges || []).map((b: any) => {
      const isUnlocked = unlockedBadgeIds.has(b.id);
      let progress = 0;
      if (isUnlocked) {
        progress = 100;
      } else {
        switch (b.code) {
          case "first_login":
            progress = 0;
            break;
          case "first_aptitude":
            progress = stats.aptitude >= 1 ? 100 : 0;
            break;
          case "first_coding":
            progress = stats.coding >= 1 ? 100 : 0;
            break;
          case "streak_7":
            progress = Math.min(105, Math.round((stats.streak / 7) * 100));
            break;
          case "streak_30":
            progress = Math.min(100, Math.round((stats.streak / 30) * 100));
            break;
          case "coding_100":
            progress = Math.min(100, Math.round((stats.coding / 100) * 100));
            break;
          case "interview_expert":
            progress = Math.min(100, Math.round((stats.interview / 10) * 100));
            break;
          case "placement_champion":
            progress = stats.placement >= 1 ? 100 : 0;
            break;
          default:
            progress = 0;
        }
      }

      return {
        id: b.id,
        code: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon,
        xp_required: b.xp_required,
        unlocked_at: badgeUnlockMap.get(b.id) || null,
        progress: Math.min(100, progress)
      };
    });

    // 4. Ensure daily challenges exist and load user progress
    const challenges = await this.generateDailyChallenges(userId);

    // 5. Fetch recent user activities (table may not exist yet)
    let activities: any[] | null = null;
    try {
      const res = await db
        .from("user_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!res.error) activities = res.data;
    } catch {
      // table not created yet
    }

    return {
      profile: defaultProfile,
      badges: mappedBadges,
      challenges,
      recentActivity: activities || []
    };
  },

  /**
   * Awards XP to the user, recalculates level, triggers badge audits, and logs the action.
   */
  async addXP(userId: string, amount: number, action: string): Promise<{ xp: number; level: number; leveledUp: boolean }> {
    let { data: profile } = await db
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile } = await db
        .from("user_gamification")
        .insert({ user_id: userId, xp: 0, level: 1, streak_days: 0 })
        .select()
        .single();
      profile = newProfile;
    }

    const oldXp = profile?.xp || 0;
    const oldLevel = profile?.level || 1;
    const newXp = oldXp + amount;
    const newLevel = Math.floor(newXp / 100) + 1; // Formula: Level = floor(xp/100) + 1
    const leveledUp = newLevel > oldLevel;

    await db
      .from("user_gamification")
      .upsert({
        user_id: userId,
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (leveledUp) {
      try {
        const { notificationService } = await import("./notification.service");
        await notificationService.createNotification({
          userId,
          title: "🎉 Level Up!",
          message: `Congratulations! You reached Level ${newLevel}. Keep climbing the leaderboard!`,
          category: "gamification",
          priority: "high"
        });
      } catch (e) {
        console.error("Failed to trigger level up notification:", e);
      }
    }

    // Log the activity to user_activity
    try {
      await dashboardService.logActivity(userId, `${action} (+${amount} XP)`, "gamification");
    } catch (e) {
      console.error("Failed to log activity:", e);
    }

    // Check for badge unlocks
    try {
      await this.checkAndUnlockBadges(userId);
    } catch (e) {
      console.error("Failed to check badge unlocks:", e);
    }

    return { xp: newXp, level: newLevel, leveledUp };
  },

  /**
   * Updates streaks based on consecutive activity.
   */
  async updateStreak(userId: string, type: "login" | "coding" | "aptitude" | "interview"): Promise<number> {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: profile } = await db
      .from("user_gamification")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) return 0;

    let fieldDate = "last_active_date";
    let fieldStreak = "streak_days";

    if (type === "coding") {
      fieldDate = "last_coding_date";
      fieldStreak = "coding_streak";
    } else if (type === "aptitude") {
      fieldDate = "last_aptitude_date";
      fieldStreak = "aptitude_streak";
    } else if (type === "interview") {
      fieldDate = "last_interview_date";
      fieldStreak = "interview_streak";
    }

    const lastDateVal = profile[fieldDate];
    let newStreak = profile[fieldStreak] || 0;

    if (!lastDateVal) {
      newStreak = 1;
    } else {
      const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastDateVal).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    await db
      .from("user_gamification")
      .update({
        [fieldDate]: todayStr,
        [fieldStreak]: newStreak,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    return newStreak;
  },

  /**
   * Evaluates achievement criteria and unlocks qualifying badges.
   */
  async checkAndUnlockBadges(userId: string): Promise<string[]> {
    const { data: profile } = await db.from("user_gamification").select("*").eq("user_id", userId).maybeSingle();
    const { data: allBadges } = await db.from("badges").select("*");
    const { data: userBadges } = await db.from("user_badges").select("badge_id").eq("user_id", userId);

    if (!profile || !allBadges) return [];

    const unlockedBadgeIds = new Set((userBadges || []).map((ub: any) => ub.badge_id));
    const newlyUnlockedCodes: string[] = [];

    // Fetch stats
    const [codingCount, aptitudeCount, interviewCount, placementCount] = await Promise.all([
      db.from("coding_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "Accepted"),
      db.from("aptitude_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_correct", true),
      db.from("interview_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      db.from("mock_placements").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed")
    ]);

    const stats = {
      coding: codingCount.count || 0,
      aptitude: aptitudeCount.count || 0,
      interview: interviewCount.count || 0,
      placement: placementCount.count || 0,
      streak: profile.streak_days || 0,
      level: profile.level || 1
    };

    for (const badge of allBadges) {
      if (unlockedBadgeIds.has(badge.id)) continue;

      let meetsCondition = false;
      switch (badge.code) {
        case "first_login":
          meetsCondition = true;
          break;
        case "first_aptitude":
          meetsCondition = stats.aptitude >= 1;
          break;
        case "first_coding":
          meetsCondition = stats.coding >= 1;
          break;
        case "streak_7":
          meetsCondition = stats.streak >= 7;
          break;
        case "streak_30":
          meetsCondition = stats.streak >= 30;
          break;
        case "coding_100":
          meetsCondition = stats.coding >= 100;
          break;
        case "interview_expert":
          meetsCondition = stats.interview >= 10;
          break;
        case "placement_champion":
          meetsCondition = stats.placement >= 1;
          break;
        default:
          meetsCondition = false;
      }

      if (meetsCondition) {
        const { error } = await db.from("user_badges").insert({
          user_id: userId,
          badge_id: badge.id
        });
        if (!error) {
          newlyUnlockedCodes.push(badge.name);
          try {
            const { notificationService } = await import("./notification.service");
            await notificationService.createNotification({
              userId,
              title: "🏆 Badge Unlocked!",
              message: `You unlocked the "${badge.name}" badge — ${badge.description}`,
              category: "gamification",
              priority: "high"
            });
          } catch (err) {
            console.error("Failed to trigger badge notification:", err);
          }
        }
      }
    }

    return newlyUnlockedCodes;
  },

  /**
   * Seeding helper for daily challenges.
   */
  async generateDailyChallenges(userId: string): Promise<Challenge[]> {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    let { data: dailies } = await db
      .from("daily_challenges")
      .select("*")
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    if (!dailies || dailies.length === 0) {
      try {
        const defaultTemplates = [
          { title: "Solve 5 Aptitude Questions", description: "Practice quantitative and logical reasoning", xp_reward: 50, type: "aptitude", target: 5 },
          { title: "Complete 2 Coding Problems", description: "Sharpen your DSA skills", xp_reward: 40, type: "coding", target: 2 },
          { title: "Complete 1 Interview Session", description: "Practice your interview responses", xp_reward: 30, type: "interview", target: 1 }
        ];
        const { data: newDailies, error } = await db
          .from("daily_challenges")
          .insert(defaultTemplates)
          .select();
        if (!error && newDailies) {
          dailies = newDailies;
        }
      } catch (e) {
        console.error("Failed to seed daily_challenges for today:", e);
      }
    }

    if (!dailies || dailies.length === 0) {
      const { data: fallbackDailies } = await db.from("daily_challenges").select("*").limit(3);
      dailies = fallbackDailies || [];
    }

    const challengesList: Challenge[] = [];

    for (const challenge of dailies) {
      let { data: userChallenge } = await db
        .from("user_challenges")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_id", challenge.id)
        .maybeSingle();

      if (!userChallenge) {
        try {
          const { data: newUC } = await db
            .from("user_challenges")
            .insert({
              user_id: userId,
              challenge_id: challenge.id,
              progress: 0,
              completed: false
            })
            .select()
            .single();
          userChallenge = newUC;
        } catch (e) {
          console.error("Failed to insert user challenge record:", e);
        }
      }

      challengesList.push({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        xp_reward: challenge.xp_reward,
        type: challenge.type,
        target: challenge.target,
        progress: userChallenge?.progress || 0,
        completed: userChallenge?.completed || false
      });
    }

    return challengesList;
  },

  /**
   * Increments the daily challenge progress and awards XP if completed.
   */
  async updateChallengeProgress(userId: string, type: "aptitude" | "coding" | "interview" | "login", increment = 1): Promise<void> {
    const activeChallenges = await this.generateDailyChallenges(userId);
    const targetChallenge = activeChallenges.find((c) => c.type === type && !c.completed);

    if (!targetChallenge) return;

    const newProgress = Math.min(targetChallenge.target, targetChallenge.progress + increment);
    const completed = newProgress >= targetChallenge.target;

    const { error } = await db
      .from("user_challenges")
      .update({
        progress: newProgress,
        completed,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("challenge_id", targetChallenge.id);

    if (!error && completed) {
      await this.addXP(userId, targetChallenge.xp_reward, `Completed Challenge: ${targetChallenge.title}`);
    }
  },

  /**
   * Retrieves user rank lists filtered by different categories.
   */
  async getLeaderboard(category: "global" | "coding" | "aptitude" | "interview" | "placement"): Promise<LeaderboardUser[]> {
    let query = db
      .from("user_gamification")
      .select("xp, level, streak_days, coding_streak, aptitude_streak, interview_streak, user_id, profiles(full_name, avatar_url)");

    if (category === "coding") {
      query = query.order("coding_streak", { ascending: false });
    } else if (category === "aptitude") {
      query = query.order("aptitude_streak", { ascending: false });
    } else if (category === "interview") {
      query = query.order("interview_streak", { ascending: false });
    } else if (category === "placement") {
      query = query.order("xp", { ascending: false });
    } else {
      query = query.order("xp", { ascending: false });
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return (data || []).map((row: any, idx: number) => {
      const profile = row.profiles || {};
      let streak = row.streak_days || 0;
      if (category === "coding") streak = row.coding_streak || 0;
      else if (category === "aptitude") streak = row.aptitude_streak || 0;
      else if (category === "interview") streak = row.interview_streak || 0;

      return {
        rank: idx + 1,
        full_name: profile.full_name || "Anonymous Student",
        avatar_url: profile.avatar_url || null,
        xp: row.xp || 0,
        level: row.level || 1,
        badges_count: 0,
        streak
      };
    });
  }
};
