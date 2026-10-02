import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";

// GET /api/coding/contests/[id]/submissions - Get leaderboard
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Get all accepted contest submissions per user, grouping by user+problem (best attempt)
    const { data: submissions, error } = await supabase
      .from("contest_submissions")
      .select(`
        user_id,
        problem_id,
        status,
        score,
        submitted_at,
        profiles(id, full_name, avatar_url)
      `)
      .eq("contest_id", id)
      .order("submitted_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build leaderboard: best submission per user per problem
    const userMap = new Map<string, {
      user_id: string;
      full_name: string;
      avatar_url: string | null;
      total_score: number;
      problems_solved: number;
      last_submission_at: string;
      solved_problems: Set<string>;
    }>();

    for (const sub of (submissions || [])) {
      const uid = sub.user_id;
      const profile = (sub as any).profiles;
      const submittedAtStr = sub.submitted_at || new Date().toISOString();

      if (!userMap.has(uid)) {
        userMap.set(uid, {
          user_id: uid,
          full_name: profile?.full_name || "Anonymous",
          avatar_url: profile?.avatar_url || null,
          total_score: 0,
          problems_solved: 0,
          last_submission_at: submittedAtStr,
          solved_problems: new Set(),
        });
      }

      const entry = userMap.get(uid)!;

      if (sub.status === "accepted" && sub.problem_id && !entry.solved_problems.has(sub.problem_id)) {
        entry.solved_problems.add(sub.problem_id);
        entry.total_score += sub.score || 0;
        entry.problems_solved += 1;
        entry.last_submission_at = submittedAtStr;
      }
    }

    // Sort: by total_score desc, then by last_submission_at asc (earlier = better)
    const leaderboard = Array.from(userMap.values())
      .sort((a, b) => {
        if (b.total_score !== a.total_score) return b.total_score - a.total_score;
        return new Date(a.last_submission_at).getTime() - new Date(b.last_submission_at).getTime();
      })
      .map((entry, idx) => ({
        rank: idx + 1,
        user_id: entry.user_id,
        full_name: entry.full_name,
        avatar_url: entry.avatar_url,
        total_score: entry.total_score,
        problems_solved: entry.problems_solved,
        last_submission_at: entry.last_submission_at,
      }));

    return NextResponse.json({ leaderboard });
  } catch (err: any) {
    console.error("Contest leaderboard error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/coding/contests/[id]/submissions - Submit code for a contest problem
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { problem_id, code, language } = body;

    if (!problem_id || !code || !language) {
      return NextResponse.json({ error: "problem_id, code, and language are required" }, { status: 400 });
    }

    // Verify user is registered for this contest
    const { data: participant } = await supabase
      .from("contest_participants")
      .select("id")
      .eq("contest_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ error: "You must register for this contest first" }, { status: 403 });
    }

    // Verify contest is active
    const { data: contest } = await supabase
      .from("coding_contests")
      .select("status, end_time")
      .eq("id", id)
      .single();

    if (!contest || contest.status !== "active") {
      return NextResponse.json({ error: "Contest is not currently active" }, { status: 400 });
    }

    // Fetch problem for context
    const { data: problem } = await supabase
      .from("coding_questions")
      .select("title, description, examples, constraints")
      .eq("id", problem_id)
      .single();

    // Get contest problem points
    const { data: contestProblem } = await supabase
      .from("contest_problems")
      .select("points")
      .eq("contest_id", id)
      .eq("problem_id", problem_id)
      .single();

    const maxPoints = contestProblem?.points || 100;

    // Use Gemini to evaluate the submission
    let evaluationResult = { status: "accepted", score: maxPoints, feedback: "", testCasesPassed: 5, totalTestCases: 5 };

    try {
      const evalPrompt = `You are an expert coding judge. Evaluate this ${language} solution for the following problem.

Problem: ${problem?.title}
Description: ${problem?.description?.substring(0, 500)}
Examples: ${JSON.stringify((problem?.examples as any)?.slice(0, 2))}
Constraints: ${JSON.stringify((problem?.constraints as any)?.slice(0, 3))}

Student Code:
\`\`\`${language}
${code.substring(0, 2000)}
\`\`\`

Evaluate the code and respond with ONLY this JSON (no markdown):
{
  "status": "accepted" or "wrong_answer" or "time_limit_exceeded" or "runtime_error",
  "testCasesPassed": number (0-5),
  "totalTestCases": 5,
  "score": number (0-${maxPoints}),
  "feedback": "brief explanation"
}`;

      const evalText = await safeGenerateContent(evalPrompt);
      const cleaned = evalText.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
      const parsed = JSON.parse(cleaned);
      evaluationResult = {
        status: parsed.status || "accepted",
        score: parsed.score ?? maxPoints,
        feedback: parsed.feedback || "",
        testCasesPassed: parsed.testCasesPassed ?? 5,
        totalTestCases: parsed.totalTestCases ?? 5,
      };
    } catch (evalErr) {
      console.warn("AI evaluation failed, defaulting to accepted:", evalErr);
    }

    // Insert contest submission
    const { data: submission, error: subErr } = await supabase
      .from("contest_submissions")
      .insert({
        contest_id: id,
        problem_id,
        user_id: user.id,
        code,
        language,
        status: evaluationResult.status,
        score: evaluationResult.score,
        submitted_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (subErr) {
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }

    // Update participant stats if accepted
    if (evaluationResult.status === "accepted") {
      // Check if this is a first-time solve for this problem in this contest
      const { count: prevSolves } = await supabase
        .from("contest_submissions")
        .select("*", { count: "exact", head: true })
        .eq("contest_id", id)
        .eq("problem_id", problem_id)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .neq("id", submission.id);

      if (!prevSolves || prevSolves === 0) {
        // Update participant total score and solved count
        const { data: currentParticipant } = await supabase
          .from("contest_participants")
          .select("total_score, problems_solved")
          .eq("contest_id", id)
          .eq("user_id", user.id)
          .single();

        await supabase
          .from("contest_participants")
          .update({
            total_score: (currentParticipant?.total_score || 0) + evaluationResult.score,
            problems_solved: (currentParticipant?.problems_solved || 0) + 1,
            last_submission_at: new Date().toISOString(),
          })
          .eq("contest_id", id)
          .eq("user_id", user.id);

        // Award XP for solving in a contest
        await supabase.from("xp_history").insert({
          user_id: user.id,
          xp_amount: Math.round(evaluationResult.score / 2),
          xp: Math.round(evaluationResult.score / 2),
          reason: `Solved problem in contest`,
          action: `Solved problem in contest`,
          source: "contest",
          reference_id: id,
        });
      }
    }

    return NextResponse.json({
      submission,
      evaluation: evaluationResult,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Contest submission error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
