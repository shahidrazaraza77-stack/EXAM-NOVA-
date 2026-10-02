import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateInterviewQuestion } from "@/lib/gemini";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  // 1. Authenticate Request
  const { session: authSession, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !authSession) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Rate limit
  const rateLimit = checkRateLimit(authSession.user.id, "ai");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many interview requests. Please slow down." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  try {
    const { sessionId, previousQuestions } = await request.json().catch(() => ({}));

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // 1. Fetch session details and verify user ownership (IDOR defense)
    const { data: sessionData, error: sessionError } = await (supabase as any)
      .from("interview_sessions")
      .select("user_id, mode, role, difficulty, company, resume_id")
      .eq("id", sessionId)
      .single();

    const session = sessionData as any;

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.user_id !== authSession.user.id && authSession.profile.role !== "admin") {
      await logSecurityEvent({
        event: "SUSPICIOUS_REQUEST",
        userId: authSession.user.id,
        email: authSession.user.email,
        severity: "error",
        ipAddress: ip,
        userAgent,
        details: { action: "IDOR_INTERVIEW_SESSION", targetSessionId: sessionId },
      });
      return NextResponse.json({ error: "Forbidden: You do not own this interview session." }, { status: 403 });
    }

    // 2. Fetch user interview progress for weak areas
    const { data: progress } = await supabase
      .from("user_interview_progress")
      .select("weak_areas")
      .eq("user_id", session.user_id)
      .maybeSingle();

    const weakAreas = progress?.weak_areas || [];

    // Fetch resume content if mode is resume and resume_id is available
    let resumeText: string | null = null;
    if (session.mode === "resume" && session.resume_id) {
      const { data: resumeData } = await supabase
        .from("resumes")
        .select("parsed_content, improved_content")
        .eq("id", session.resume_id)
        .maybeSingle();
      if (resumeData) {
        resumeText = resumeData.improved_content || resumeData.parsed_content || null;
      }
    }

    // 3. Generate question via Gemini
    const questionData = await generateInterviewQuestion(
      session.mode,
      session.role || "Software Engineer",
      session.difficulty || "medium",
      previousQuestions || [],
      session.company,
      weakAreas,
      resumeText
    );

    // Map difficulty and mode to match SQL CHECK constraints ('easy'/'medium'/'hard' and 'hr'/'technical'/'mixed')
    let diffConstraint = (session.difficulty || "medium").toLowerCase();
    if (diffConstraint !== "easy" && diffConstraint !== "medium" && diffConstraint !== "hard") {
      diffConstraint = "medium";
    }

    let modeConstraint = questionData.type.toLowerCase();
    if (modeConstraint !== "hr" && modeConstraint !== "technical") {
      modeConstraint = "hr";
    }

    // 4. Save to interview_questions table
    const { data: question, error: questionError } = await supabaseAdmin
      .from("interview_questions")
      .insert({
        mode: modeConstraint,
        question: questionData.question,
        expected_answer: "Generated dynamically via AI",
        difficulty: diffConstraint,
        topic: questionData.type === "Technical" ? "Technical Prep" : "Behavioral Prep",
      })
      .select()
      .single();

    if (questionError) {
      console.error("Save question error:", questionError);
      return NextResponse.json({ error: "Failed to save generated question" }, { status: 500 });
    }

    return NextResponse.json({ question });
  } catch (error: any) {
    console.error("Question generation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate question" },
      { status: 500 }
    );
  }
}
