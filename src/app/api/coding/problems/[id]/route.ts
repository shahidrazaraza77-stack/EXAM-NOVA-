import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: problemId } = await params;

    const { data, error } = await supabase
      .from("coding_questions")
      .select("*, coding_topics(name)")
      .eq("id", problemId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const q = data as any;

    // Determine user status
    let userStatus: "Solved" | "Attempted" | "Todo" = "Todo";
    const { data: submissions } = await supabase
      .from("coding_submissions")
      .select("status")
      .eq("user_id", user.id)
      .eq("question_id", problemId);

    if (submissions && submissions.length > 0) {
      const hasAccepted = submissions.some((sub: any) => sub.status === "Accepted");
      userStatus = hasAccepted ? "Solved" : "Attempted";
    }

    const problem = {
      id: q.id,
      title: q.title,
      topic: q.coding_topics?.name || "Arrays",
      topic_id: q.topic_id || "",
      slug: q.slug || q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      difficulty: q.difficulty,
      acceptanceRate: q.acceptance_rate || "50.0%",
      status: userStatus,
      tags: q.coding_topics?.name ? [q.coding_topics.name] : ["Arrays"],
      description: q.description,
      constraints: q.constraints || [],
      examples: q.examples || [],
      explanation: q.explanation || "",
      complexity: q.complexity || { time: "O(N)", space: "O(1)" },
      boilerplates: q.starter_code || {},
      optimalSolutions: q.optimal_solutions || {},
      companies: q.companies || [],
    };

    return NextResponse.json({ problem });
  } catch (error: any) {
    console.error("GET coding problem details API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coding problem details" },
      { status: 500 }
    );
  }
}
