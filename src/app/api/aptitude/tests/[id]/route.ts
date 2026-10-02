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

    const { id: testId } = await params;

    const { data, error } = await (supabase as any)
      .from("test_questions")
      .select("*, aptitude_questions(*, aptitude_topics(name, category))")
      .eq("test_id", testId);

    if (error) throw error;

    const questions = ((data as any[]) || [])
      .filter((t) => t.aptitude_questions !== null)
      .map((t) => t.aptitude_questions);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("GET test questions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch test questions" },
      { status: 500 }
    );
  }
}
