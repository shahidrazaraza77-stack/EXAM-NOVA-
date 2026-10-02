import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: tests, error } = await (supabase as any)
      .from("aptitude_tests")
      .select("*, test_questions(question_id)");

    if (error) throw error;

    const mappedTests = (tests || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      durationMinutes: t.duration_minutes,
      duration_minutes: t.duration_minutes,
      difficulty: t.difficulty,
      questionsCount: (t.test_questions || []).length,
      questions_count: (t.test_questions || []).length,
      category: t.category,
    }));

    return NextResponse.json({ tests: mappedTests });
  } catch (error: any) {
    console.error("GET mock tests API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch mock tests" },
      { status: 500 }
    );
  }
}
