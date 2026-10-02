import { supabase } from "@/lib/supabaseClient";
import { safeGenerateContent } from "@/lib/gemini";
import { notificationService } from "./notification.service";

export interface AIRecommendationResponse {
  studyRecommendations: string[];
  companyRecommendations: string[];
  streakAlerts: string[];
  weaknessAlerts: string[];
  dailyPlan: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  achievementAlerts: string[];
}

export const recommendationService = {
  /**
   * Main function to analyze performance and generate suggestions using Gemini AI.
   */
  async generateAIRecommendations(userId: string): Promise<AIRecommendationResponse> {
    let streakDays = 15;
    try {
      // 1. Fetch user analytics
      const { data: analytics } = await (supabase.from("user_analytics") as any)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const resumeScore = analytics?.resume_score ?? 0;
      const aptitudeScore = analytics?.aptitude_score ?? 0;
      const codingScore = analytics?.coding_score ?? 0;
      const interviewScore = analytics?.interview_score ?? 0;
      const overallReadiness = analytics?.overall_readiness ?? 0;

      // 2. Fetch user gamification details
      const { data: gamification } = await (supabase.from("user_gamification") as any)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      streakDays = gamification?.streak_days ?? 0;
      const level = gamification?.level ?? 1;
      const lastActiveDate = gamification?.last_active_date ?? "";

      // 3. Fetch company readiness scores
      const { data: readinessData } = await (supabase.from("company_readiness") as any)
        .select("readiness_score, companies(name)")
        .eq("user_id", userId);

      let companyReadinessStr = "None";
      if (readinessData && readinessData.length > 0) {
        companyReadinessStr = readinessData
          .map((r: any) => `- ${r.companies?.name || "Company"}: ${r.readiness_score}%`)
          .join("\n");
      }

      // 4. Fetch target company from profile
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("target_company")
        .eq("id", userId)
        .maybeSingle();
      const targetCompany = profile?.target_company || "Placement Prep";

      // 5. Fetch recent user activities
      const { data: activities } = await (supabase.from("user_activity") as any)
        .select("action, module")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      let recentActivityStr = "No recent activity";
      if (activities && activities.length > 0) {
        recentActivityStr = activities
          .map((a: any) => `${a.action} (${a.module})`)
          .join(", ");
      }

      // 5a. Fetch latest resume details
      const { data: latestResume } = await (supabase.from("resumes") as any)
        .select("file_name, score, feedback, parsed_content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let resumeInfoStr = "No resume uploaded yet.";
      if (latestResume) {
        resumeInfoStr = `Resume File: ${latestResume.file_name || "Unnamed"}
Score: ${latestResume.score || "N/A"}/100
Feedback Summary: ${JSON.stringify(latestResume.feedback || "")}`;
      }

      // 5b. Fetch recent interview history
      const { data: interviewHistory } = await (supabase.from("interview_sessions") as any)
        .select("title, status, feedback, completed_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(3);

      let interviewHistoryStr = "No completed mock interviews yet.";
      if (interviewHistory && interviewHistory.length > 0) {
        interviewHistoryStr = interviewHistory
          .map((i: any) => `- ${i.title} (Completed: ${i.completed_at ? i.completed_at.split("T")[0] : "Recently"}): Feedback: ${JSON.stringify(i.feedback || "")}`)
          .join("\n");
      }

      // 5c. Fetch coding progress
      const { data: codingSubmissions } = await (supabase.from("coding_submissions") as any)
        .select("status, coding_questions(title, difficulty, topic_id, coding_topics(name))")
        .eq("user_id", userId);

      let codingProgressStr = "No coding problem attempts yet.";
      if (codingSubmissions && codingSubmissions.length > 0) {
        const totalSub = codingSubmissions.length;
        const acceptedSub = codingSubmissions.filter((c: any) => c.status === "Accepted");
        const acceptedCount = acceptedSub.length;
        const difficultyMap: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
        const topicMap: Record<string, number> = {};

        acceptedSub.forEach((c: any) => {
          const q = c.coding_questions;
          if (q) {
            difficultyMap[q.difficulty] = (difficultyMap[q.difficulty] || 0) + 1;
            const tName = q.coding_topics?.name || "Other";
            topicMap[tName] = (topicMap[tName] || 0) + 1;
          }
        });

        codingProgressStr = `Total Submissions: ${totalSub}
Accepted Problems: ${acceptedCount}/${totalSub}
Difficulty Breakdown: Easy: ${difficultyMap.Easy}, Medium: ${difficultyMap.Medium}, Hard: ${difficultyMap.Hard}
Topics Mastered: ${Object.entries(topicMap).map(([t, count]) => `${t} (${count})`).join(", ") || "None"}`;
      }

      // 5d. Fetch aptitude practice results
      const { data: aptitudeAttempts } = await (supabase.from("aptitude_attempts") as any)
        .select("is_correct, aptitude_questions(topic_id, aptitude_topics(name))")
        .eq("user_id", userId);

      let aptitudeResultsStr = "No aptitude practice attempts yet.";
      if (aptitudeAttempts && aptitudeAttempts.length > 0) {
        const totalAttempts = aptitudeAttempts.length;
        const correctCount = aptitudeAttempts.filter((a: any) => a.is_correct).length;
        const accuracy = Math.round((correctCount / totalAttempts) * 100);
        const topicAccuracyMap: Record<string, { total: number; correct: number }> = {};

        aptitudeAttempts.forEach((a: any) => {
          const q = a.aptitude_questions;
          if (q) {
            const tName = q.aptitude_topics?.name || "Other";
            if (!topicAccuracyMap[tName]) {
              topicAccuracyMap[tName] = { total: 0, correct: 0 };
            }
            topicAccuracyMap[tName].total++;
            if (a.is_correct) topicAccuracyMap[tName].correct++;
          }
        });

        const topicPerformance = Object.entries(topicAccuracyMap)
          .map(([t, stats]) => `${t}: ${Math.round((stats.correct / stats.total) * 100)}% accuracy (${stats.total} attempts)`)
          .join(", ");

        aptitudeResultsStr = `Total Practice Questions: ${totalAttempts}
Overall Accuracy: ${accuracy}%
Topic Performance: ${topicPerformance || "None"}`;
      }

      // 6. Invoke Gemini API
      if (!process.env.GEMINI_API_KEY) {
        console.warn("Gemini API key is not configured. Falling back to default mock recommendation values.");
        return this.getFallbackRecommendations(userId, streakDays);
      }

      const prompt = `You are a premium AI Placement Mentor. Analyze the following student performance metrics and generate personalized study suggestions, company readiness advice, streak protection alerts, daily study task schedules, and weakness warnings.

STUDENT PROFILE & METRICS:
- Resume ATS Score: ${resumeScore}/100
- Quantitative Aptitude Score: ${aptitudeScore}/100
- Coding (DSA) Score: ${codingScore}/100
- Mock Interview Score: ${interviewScore}/100
- Overall Placement Readiness: ${overallReadiness}/100
- Target Company: ${targetCompany}
- Current Practice Streak: ${streakDays} days
- Last Active: ${lastActiveDate || "Recently"}
- Company Readiness Scores:
${companyReadinessStr}

RESUME ANALYSIS DETAILS:
${resumeInfoStr}

MOCK INTERVIEW RECENT HISTORY:
${interviewHistoryStr}

CODING PROGRESS & DSA PERFORMANCE:
${codingProgressStr}

APTITUDE RESULTS & TOPIC ACCURACY:
${aptitudeResultsStr}

Recent Activity Summary: ${recentActivityStr}

Based on this data, provide tailored recommendations.
Return ONLY valid JSON (no markdown, no code fences, no extra text) with the following structure:
{
  "studyRecommendations": [
    "Practice Dynamic Programming today.",
    "Complete 2 mock interviews this week."
  ],
  "companyRecommendations": [
    "You are 82% ready for TCS.",
    "You need more Graph problems before Amazon preparation."
  ],
  "streakAlerts": [
    "Your ${streakDays}-day streak will end in 4 hours. Complete one coding problem to continue."
  ],
  "weaknessAlerts": [
    "Your DBMS accuracy dropped to 58%"
  ],
  "dailyPlan": {
    "morning": "Solve 5 Aptitude Questions",
    "afternoon": "Solve 2 Coding Problems",
    "evening": "Attempt 1 Interview Session"
  },
  "achievementAlerts": [
    "Congratulations! You unlocked Coding Beginner."
  ]
}`;

      const responseText = await safeGenerateContent(prompt);
      const cleanedJson = responseText.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
      const recs = JSON.parse(cleanedJson) as AIRecommendationResponse;

      // Save logs, legacy lists, and trigger notifications
      await this.saveRecommendationLogs(userId, recs);
      await this.saveLegacyRecommendations(userId, recs.studyRecommendations);
      await this.generateNotificationsForRecommendations(userId, recs);

      return recs;
    } catch (error) {
      console.error("Error generating recommendations with Gemini:", error);
      return this.getFallbackRecommendations(userId, streakDays);
    }
  },

  /**
   * Fallback values in case the AI call fails or key is missing.
   */
  async getFallbackRecommendations(userId: string, streak: number): Promise<AIRecommendationResponse> {
    const fallback: AIRecommendationResponse = {
      studyRecommendations: [
        "Practice Dynamic Programming today.",
        "Complete 2 mock interviews this week.",
        "Improve your ATS score before applying.",
        "Focus on Probability and Permutations."
      ],
      companyRecommendations: [
        "You are 82% ready for TCS.",
        "You need more Graph problems before Amazon preparation.",
        "Your profile matches Infosys hiring patterns."
      ],
      streakAlerts: [
        `Your ${streak}-day streak will end in 4 hours.`,
        "Complete one coding problem to continue your streak."
      ],
      weaknessAlerts: [
        "Your DBMS accuracy dropped to 58%.",
        "You have not practiced Dynamic Programming in 7 days."
      ],
      dailyPlan: {
        morning: "Solve 5 Aptitude Questions",
        afternoon: "Solve 2 Coding Problems",
        evening: "Attempt 1 Interview Session"
      },
      achievementAlerts: [
        "Congratulations! You unlocked Coding Beginner.",
        "You reached Level 20.",
        "You entered the Top 100 leaderboard."
      ]
    };

    // Save fallback logs to database
    await this.saveRecommendationLogs(userId, fallback);
    await this.saveLegacyRecommendations(userId, fallback.studyRecommendations);
    await this.generateNotificationsForRecommendations(userId, fallback);
    return fallback;
  },

  /**
   * Stores the breakdown in recommendation_logs.
   */
  async saveRecommendationLogs(userId: string, recs: AIRecommendationResponse) {
    try {
      const inserts: any[] = [];
      
      recs.studyRecommendations?.forEach((text: string) => {
        inserts.push({ user_id: userId, recommendation_type: "study", recommendation_text: text });
      });

      recs.companyRecommendations?.forEach((text: string) => {
        inserts.push({ user_id: userId, recommendation_type: "company", recommendation_text: text });
      });

      recs.streakAlerts?.forEach((text: string) => {
        inserts.push({ user_id: userId, recommendation_type: "streak", recommendation_text: text });
      });

      recs.weaknessAlerts?.forEach((text: string) => {
        inserts.push({ user_id: userId, recommendation_type: "weakness", recommendation_text: text });
      });

      if (recs.dailyPlan) {
        const planText = `Morning: ${recs.dailyPlan.morning} | Afternoon: ${recs.dailyPlan.afternoon} | Evening: ${recs.dailyPlan.evening}`;
        inserts.push({ user_id: userId, recommendation_type: "daily_plan", recommendation_text: planText });
      }

      recs.achievementAlerts?.forEach((text: string) => {
        inserts.push({ user_id: userId, recommendation_type: "achievement", recommendation_text: text });
      });

      // Delete old logs first
      await (supabase.from("recommendation_logs") as any).delete().eq("user_id", userId);

      // Insert new logs
      if (inserts.length > 0) {
        await (supabase.from("recommendation_logs") as any).insert(inserts);
      }
    } catch (e) {
      console.error("Failed to save recommendation logs:", e);
    }
  },

  /**
   * Stores the study list in legacy recommendations table.
   */
  async saveLegacyRecommendations(userId: string, studyRecs: string[]) {
    try {
      const inserts = (studyRecs || []).map((text: string, index: number) => ({
        user_id: userId,
        title: text.length > 45 ? text.substring(0, 45) + "..." : text,
        description: text,
        priority: index === 0 ? "high" : index < 3 ? "medium" : "low"
      }));

      await (supabase.from("recommendations") as any).delete().eq("user_id", userId);

      if (inserts.length > 0) {
        await (supabase.from("recommendations") as any).insert(inserts);
      }
    } catch (e) {
      console.error("Failed to save legacy recommendations:", e);
    }
  },

  /**
   * Wrapper to fetch just the daily plan structure.
   */
  async generateDailyPlan(userId: string): Promise<AIRecommendationResponse["dailyPlan"]> {
    const recs = await this.generateAIRecommendations(userId);
    return recs.dailyPlan;
  },

  /**
   * Automatically raises notifications based on generated alerts.
   */
  async generateNotificationsForRecommendations(userId: string, recs: AIRecommendationResponse) {
    try {
      // 1. Streak Alerts
      if (recs.streakAlerts && recs.streakAlerts.length > 0) {
        await notificationService.createNotification({
          userId,
          title: "🔥 Streak Alert!",
          message: recs.streakAlerts[0],
          category: "gamification",
          priority: "high"
        });
      }

      // 2. Weakness Alerts
      if (recs.weaknessAlerts && recs.weaknessAlerts.length > 0) {
        await notificationService.createNotification({
          userId,
          title: "📈 Weakness Warning",
          message: recs.weaknessAlerts[0],
          category: "study",
          priority: "medium"
        });
      }

      // 3. Achievement Alerts
      if (recs.achievementAlerts && recs.achievementAlerts.length > 0) {
        await notificationService.createNotification({
          userId,
          title: "🏆 New Achievement Unlocked!",
          message: recs.achievementAlerts[0],
          category: "gamification",
          priority: "high"
        });
      }

      // 4. System notice
      await notificationService.createNotification({
        userId,
        title: "🤖 AI Mentor Suggestions Ready",
        message: "Your AI Placement Mentor has refreshed your personalized recommendations.",
        category: "ai",
        priority: "low"
      });
    } catch (e) {
      console.error("Failed to create notifications for recommendations:", e);
    }
  }
};
