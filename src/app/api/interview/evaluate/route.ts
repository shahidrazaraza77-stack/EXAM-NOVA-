import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { evaluateInterviewAnswer } from "@/lib/gemini";

import { getAuthenticatedUser, sanitizeUserPromptContent } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  // 1. Authenticate Request
  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Rate limit
  const rateLimit = checkRateLimit(session.user.id || ip, "ai");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  try {
    const { sessionId, answerId, question, answer } = await request.json().catch(() => ({}));

    if (!sessionId || !answerId || !question || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanQuestion = sanitizeUserPromptContent(question, 1000);
    const cleanAnswer = sanitizeUserPromptContent(answer, 3000);

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    if (!cleanAnswer.trim()) {
      return NextResponse.json({ error: "Answer cannot be empty" }, { status: 400 });
    }

    // 1. Evaluate user answer using Gemini API
    const evaluation = await evaluateInterviewAnswer(question, answer);

    // 2. Update the interview_answers record with AI feedback and score
    const { data, error } = await supabase
      .from("interview_answers")
      .update({
        ai_feedback: JSON.stringify(evaluation),
        score: evaluation.score,
      })
      .eq("id", answerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating interview answer with evaluation:", error);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({ feedback: { ...evaluation, id: data.id } });
  } catch (error: any) {
    console.error("Answer evaluation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
