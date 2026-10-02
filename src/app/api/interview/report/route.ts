import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generateFinalInterviewReport } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, duration } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // 1. Fetch session metadata
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Session lookup error:", sessionError);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Fetch all answers and questions for this session
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select(`
        id,
        user_answer,
        ai_feedback,
        score,
        question_id,
        interview_questions (
          question,
          mode,
          topic
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (answersError || !answers) {
      console.error("Answers lookup error:", answersError);
      return NextResponse.json({ error: "Failed to load session answers" }, { status: 500 });
    }

    // 3. Compile transcript
    let transcriptText = "";
    answers.forEach((ans: any, idx: number) => {
      const qText = ans.interview_questions?.question || "Unknown Question";
      const qTopic = ans.interview_questions?.topic || "General";
      const qMode = ans.interview_questions?.mode || "hr";
      
      let individualFeedback = "";
      if (ans.ai_feedback) {
        try {
          const fb = JSON.parse(ans.ai_feedback);
          individualFeedback = `Score: ${fb.score || ans.score}, Feedback: ${fb.feedback || ""}, Improvements: ${fb.improvements ? fb.improvements.join("; ") : ""}`;
        } catch {
          individualFeedback = ans.ai_feedback;
        }
      }

      transcriptText += `\nQ${idx + 1}: ${qText} [Topic: ${qTopic}, Mode: ${qMode}]`;
      transcriptText += `\nUser Answer: ${ans.user_answer}`;
      transcriptText += `\nAI Feedback: ${individualFeedback}\n---`;
    });

    // 4. Generate final report via Gemini
    const report = await generateFinalInterviewReport(
      session.role || "Software Engineer",
      session.difficulty || "medium",
      session.mode,
      session.company,
      transcriptText
    );

    // 5. Update session in the database with scores and duration
    const { data: updatedSession, error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        score: report.score,
        communication_score: report.communicationScore,
        technical_score: report.technicalScore,
        confidence_score: report.confidenceScore,
        duration: duration || 0,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      console.error("Session update error:", updateError);
      return NextResponse.json({ error: "Failed to update session scores" }, { status: 500 });
    }

    // 6. Update user's interview progress aggregate
    const { data: allSessions } = await supabase
      .from("interview_sessions")
      .select("score")
      .eq("user_id", session.user_id);

    const scoresList = (allSessions || [])
      .map(s => s.score)
      .filter((s): s is number => s != null && s > 0);
    const avgScore = scoresList.length > 0 
      ? Math.round(scoresList.reduce((a: number, b: number) => a + b, 0) / scoresList.length)
      : report.score;

    // Upsert into user_interview_progress
    const { error: progressError } = await supabase
      .from("user_interview_progress")
      .upsert({
        user_id: session.user_id,
        avg_score: avgScore,
        weak_areas: report.weakAreas || [],
        improvement_notes: report.improvementRoadmap ? report.improvementRoadmap.join("\n") : "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (progressError) {
      console.error("Progress upsert error:", progressError);
    }

    return NextResponse.json({ report, session: updatedSession });
  } catch (error: any) {
    console.error("Generate final report API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
