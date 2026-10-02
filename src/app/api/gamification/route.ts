import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { gamificationService } from "@/services/gamification.service";
import { recommendationService } from "@/services/recommendation.service";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || user.id;

    // Direct check (regular users can read their own, admin can read any)
    if (userId !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin" && profile?.role !== "content_manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const result = await gamificationService.getGamificationData(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Gamification GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch gamification data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const userId = body.userId || user.id;
    const action = body.action; // 'solve_aptitude', 'complete_aptitude_test', 'solve_coding', 'complete_mock_interview', 'complete_mock_placement', 'daily_login', 'resume_analysis'

    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let xpAmount = 0;
    let actionDesc = "";
    let challengeType: "aptitude" | "coding" | "interview" | "login" | null = null;

    switch (action) {
      case "solve_aptitude":
        xpAmount = 10;
        actionDesc = "Solved Aptitude Question";
        challengeType = "aptitude";
        break;
      case "complete_aptitude_test":
        xpAmount = 25;
        actionDesc = "Completed Aptitude Test";
        challengeType = "aptitude";
        break;
      case "solve_coding":
        xpAmount = 20;
        actionDesc = "Solved Coding Problem";
        challengeType = "coding";
        break;
      case "complete_mock_interview":
        xpAmount = 50;
        actionDesc = "Completed Mock Interview";
        challengeType = "interview";
        break;
      case "complete_mock_placement":
        xpAmount = 100;
        actionDesc = "Completed Mock Placement";
        break;
      case "daily_login":
        xpAmount = 5;
        actionDesc = "Daily Login";
        challengeType = "login";
        break;
      case "resume_analysis":
        xpAmount = 15;
        actionDesc = "Resume ATS Scan";
        break;
      default:
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // 1. Award XP
    const xpResult = await gamificationService.addXP(userId, xpAmount, actionDesc);

    // 2. Update Streak
    if (challengeType === "login") {
      await gamificationService.updateStreak(userId, "login");
    } else if (challengeType === "coding") {
      await gamificationService.updateStreak(userId, "coding");
    } else if (challengeType === "aptitude") {
      await gamificationService.updateStreak(userId, "aptitude");
    } else if (challengeType === "interview") {
      await gamificationService.updateStreak(userId, "interview");
    }

    // 3. Update Challenge progress
    if (challengeType) {
      await gamificationService.updateChallengeProgress(userId, challengeType, 1);
    }

    // Fetch updated data to return to client
    const updatedData = await gamificationService.getGamificationData(userId);

    // 4. Update recommendations dynamically in background only for major milestones
    if (action === "complete_mock_interview" || action === "complete_mock_placement") {
      recommendationService.generateAIRecommendations(userId).catch((err) => {
        console.error("Background recommendations update failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      leveledUp: xpResult.leveledUp,
      level: xpResult.level,
      xpEarned: xpAmount,
      ...updatedData
    });
  } catch (error: any) {
    console.error("Gamification POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to record gamification action" }, { status: 500 });
  }
}
