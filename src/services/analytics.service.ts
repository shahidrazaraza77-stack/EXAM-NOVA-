import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { resumeService } from "@/services/resume";
import { aptitudeService } from "@/services/aptitude";
import { codingService } from "@/services/coding";
import { interviewService } from "@/services/interview.service";
import { analyzeSkillGaps, generateRecommendations, analyzeReadiness } from "@/lib/gemini";

type UserAnalyticsRow = Database["public"]["Tables"]["user_analytics"]["Row"];
type SkillGapRow = Database["public"]["Tables"]["skill_gap_reports"]["Row"];
type RecommendationRow = Database["public"]["Tables"]["recommendations"]["Row"];

export interface AnalyticsResult {
  user_analytics: UserAnalyticsRow | null;
  skill_gaps: SkillGapRow | null;
  recommendations: RecommendationRow[];
}

const COMPANY_LIST = [
  "TCS", "Infosys", "Wipro", "Cognizant",
  "Accenture", "Capgemini", "Amazon", "Microsoft", "Google"
];

async function getResumeScore(userId: string): Promise<number> {
  try {
    const resumes = await resumeService.getResumes(userId);
    if (resumes.length > 0 && resumes[0].score != null) {
      return resumes[0].score;
    }
    const latest = resumes[0];
    if (latest) {
      const analysis = await resumeService.getAnalysis(latest.id);
      if (analysis) {
        return (analysis as any).ats_score || 0;
      }
    }
  } catch {
    // fall through
  }
  return 0;
}

async function getAptitudeScore(userId: string): Promise<number> {
  try {
    const analytics = await aptitudeService.getAnalytics(userId);
    return analytics.accuracy || 0;
  } catch {
    return 0;
  }
}

async function getCodingScore(userId: string): Promise<number> {
  try {
    const analytics = await codingService.getAnalytics(userId);
    return analytics.readinessIndex || analytics.accuracy || 0;
  } catch {
    return 0;
  }
}

async function getInterviewScore(userId: string): Promise<number> {
  try {
    const score = await interviewService.getLatestScore(userId);
    return score ?? 0;
  } catch {
    return 0;
  }
}

function calculateOverallReadiness(scores: {
  resumeScore: number;
  aptitudeScore: number;
  codingScore: number;
  interviewScore: number;
}): number {
  return Math.round(
    scores.resumeScore * 0.20 +
    scores.aptitudeScore * 0.25 +
    scores.codingScore * 0.30 +
    scores.interviewScore * 0.25
  );
}

function computeCompanyReadiness(scores: {
  resumeScore: number;
  aptitudeScore: number;
  codingScore: number;
  interviewScore: number;
}): Array<{ company: string; readiness: number }> {
  return COMPANY_LIST.map((company) => {
    let readiness = 0;
    const base = calculateOverallReadiness(scores);
    switch (company) {
      case "TCS":
        readiness = Math.round(base * 0.9 + scores.aptitudeScore * 0.1);
        break;
      case "Infosys":
        readiness = Math.round(base * 0.85 + scores.codingScore * 0.15);
        break;
      case "Wipro":
        readiness = Math.round(base * 0.8 + scores.aptitudeScore * 0.2);
        break;
      case "Cognizant":
        readiness = Math.round(base * 0.85 + scores.interviewScore * 0.15);
        break;
      case "Accenture":
        readiness = Math.round(base * 0.8 + scores.interviewScore * 0.2);
        break;
      case "Capgemini":
        readiness = Math.round(base * 0.9 + scores.aptitudeScore * 0.1);
        break;
      case "Amazon":
        readiness = Math.round(base * 0.6 + scores.codingScore * 0.4);
        break;
      case "Microsoft":
        readiness = Math.round(base * 0.5 + scores.codingScore * 0.5);
        break;
      case "Google":
        readiness = Math.round(base * 0.4 + scores.codingScore * 0.6);
        break;
      default:
        readiness = base;
    }
    return { company, readiness: Math.min(100, Math.max(0, readiness)) };
  });
}

async function getRecentActivity(userId: string): Promise<string> {
  const activities: string[] = [];
  try {
    const attempts = await aptitudeService.getAttempts(userId);
    if (attempts.length > 0) {
      activities.push(`${attempts.length} aptitude questions attempted`);
      const recent = attempts.slice(0, 3).map((a: any) =>
        `aptitude ${a.is_correct ? "correct" : "incorrect"}`
      );
      activities.push(...recent);
    }
  } catch { /* ignore */ }
  try {
    const subs = await codingService.getSubmissions(userId);
    if (subs.length > 0) {
      activities.push(`${subs.length} coding submissions`);
    }
  } catch { /* ignore */ }
  return activities.length > 0 ? activities.join(", ") : "No recent activity";
}

export const analyticsService = {
  async getAnalytics(userId: string): Promise<AnalyticsResult> {
    const [ua, gaps, recs] = await Promise.all([
      (supabase.from("user_analytics") as any)
        .select("*").eq("user_id", userId).maybeSingle(),
      (supabase.from("skill_gap_reports") as any)
        .select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      (supabase.from("recommendations") as any)
        .select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    if (ua.error && ua.error.code !== "PGRST116") throw ua.error;
    if (gaps.error && gaps.error.code !== "PGRST116") throw gaps.error;
    if (recs.error) throw recs.error;

    return {
      user_analytics: (ua.data as UserAnalyticsRow) || null,
      skill_gaps: (gaps.data as SkillGapRow) || null,
      recommendations: (recs.data as RecommendationRow[]) || [],
    };
  },

  async calculateReadiness(userId: string): Promise<AnalyticsResult> {
    const { data: oldAnalytics } = await (supabase.from("user_analytics") as any)
      .select("overall_readiness")
      .eq("user_id", userId)
      .maybeSingle();
    const oldScore = oldAnalytics?.overall_readiness ?? 0;

    const [resumeScore, aptitudeScore, codingScore, interviewScore] = await Promise.all([
      getResumeScore(userId),
      getAptitudeScore(userId),
      getCodingScore(userId),
      getInterviewScore(userId),
    ]);

    const overallReadiness = calculateOverallReadiness({
      resumeScore, aptitudeScore, codingScore, interviewScore,
    });

    const { data: ua, error: uaError } = await (supabase.from("user_analytics") as any)
      .upsert({
        user_id: userId,
        resume_score: resumeScore,
        aptitude_score: aptitudeScore,
        coding_score: codingScore,
        interview_score: interviewScore,
        overall_readiness: overallReadiness,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (uaError) throw uaError;

    if (overallReadiness !== oldScore) {
      try {
        const { notificationService } = await import("./notification.service");
        await notificationService.createNotification({
          userId,
          title: "📈 Placement Readiness Updated",
          message: `Your placement readiness score updated from ${oldScore}% to ${overallReadiness}%.`,
          category: "system",
          priority: "medium"
        });
      } catch (err) {
        console.error("Failed to trigger readiness notification:", err);
      }
    }

    // Compute company readiness
    const companyReadiness = computeCompanyReadiness({
      resumeScore, aptitudeScore, codingScore, interviewScore,
    });

    const scores = { resumeScore, aptitudeScore, codingScore, interviewScore, overallReadiness };

    // AI skill gap analysis
    let skillGapId: string | null = null;
    try {
      const skillGapResult = await analyzeSkillGaps(scores);
      const { data: gap, error: gapError } = await (supabase.from("skill_gap_reports") as any)
        .insert({
          user_id: userId,
          weakest_skill: skillGapResult.weakestSkill,
          strongest_skill: skillGapResult.strongestSkill,
          report: skillGapResult,
        } as any)
        .select()
        .single();
      if (!gapError) skillGapId = gap.id;
    } catch (e) {
      console.error("Skill gap analysis failed:", e);
    }

    // AI recommendations
    const recentActivity = await getRecentActivity(userId);
    let aiRecs: string[] = [];
    try {
      const recResult = await generateRecommendations(scores, "Placement", recentActivity);
      const recInserts = recResult.recommendations.map((r) => ({
        user_id: userId,
        title: r.title,
        description: r.description,
        priority: r.priority,
      }));
      aiRecs = recResult.dailyPlan || [];
      const { error: recError } = await (supabase.from("recommendations") as any)
        .insert(recInserts as any);
      if (recError) console.error("Failed to save recommendations:", recError);
    } catch (e) {
      console.error("Recommendation generation failed:", e);
    }

    // AI readiness analysis (fire-and-forget to enhance skill_gap report)
    try {
      const readinessResult = await analyzeReadiness(scores, companyReadiness);
      if (skillGapId) {
        await (supabase.from("skill_gap_reports") as any)
          .update({ report: { ...readinessResult, ...(skillGapId ? { dailyPlan: aiRecs } : {}) } })
          .eq("id", skillGapId);
      }
    } catch (e) {
      console.error("Readiness analysis failed:", e);
    }

    return this.getAnalytics(userId);
  },

  async getCompanyReadiness(userId: string): Promise<Array<{ company: string; readiness: number }>> {
    // Try to get scores from stored analytics first, then fall back to computing
    const { data } = await (supabase.from("user_analytics") as any)
      .select("*").eq("user_id", userId).maybeSingle();

    if (data) {
      return computeCompanyReadiness({
        resumeScore: data.resume_score,
        aptitudeScore: data.aptitude_score,
        codingScore: data.coding_score,
        interviewScore: data.interview_score,
      });
    }

    const [resumeScore, aptitudeScore, codingScore, interviewScore] = await Promise.all([
      getResumeScore(userId),
      getAptitudeScore(userId),
      getCodingScore(userId),
      getInterviewScore(userId),
    ]);

    return computeCompanyReadiness({ resumeScore, aptitudeScore, codingScore, interviewScore });
  },

  async generateRecommendationsForUser(userId: string): Promise<RecommendationRow[]> {
    const scores = await this.getAnalytics(userId);
    const ua = scores.user_analytics;
    if (!ua) return [];

    const recentActivity = await getRecentActivity(userId);
    try {
      const result = await generateRecommendations(
        {
          resumeScore: ua.resume_score,
          aptitudeScore: ua.aptitude_score,
          codingScore: ua.coding_score,
          interviewScore: ua.interview_score,
          overallReadiness: ua.overall_readiness,
        },
        "Placement",
        recentActivity
      );

      const inserts = result.recommendations.map((r) => ({
        user_id: userId,
        title: r.title,
        description: r.description,
        priority: r.priority,
      }));

      // Delete old recs and insert new
      await (supabase.from("recommendations") as any).delete().eq("user_id", userId);
      const { data: newRecs, error } = await (supabase.from("recommendations") as any)
        .insert(inserts as any)
        .select();

      if (error) throw error;
      return (newRecs as RecommendationRow[]) || [];
    } catch (e) {
      console.error("Failed to generate recommendations:", e);
      return scores.recommendations;
    }
  },
};
