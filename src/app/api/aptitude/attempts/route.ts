import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { aptitudeAttemptSchema } from "@/lib/validation";

const indexToLetter = ["A", "B", "C", "D"];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await (supabase.from("aptitude_attempts") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ attempts: data || [] });
  } catch (error: any) {
    console.error("GET attempts API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = aptitudeAttemptSchema.safeParse(body);
    if (!parsed.success) {
      console.error("POST attempts API validation error:", parsed.error.format());
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { questionId, selectedOption, isCorrect, timeTaken } = parsed.data;
    const selectedLetter = indexToLetter[selectedOption] || "A";

    const { data, error } = await (supabase.from("aptitude_attempts") as any)
      .insert({
        user_id: user.id,
        question_id: questionId,
        selected_answer: selectedLetter,
        is_correct: isCorrect,
        time_taken: timeTaken,
      })
      .select()
      .single();

    if (error) {
      console.error("POST attempts DB insertion error:", error);
      throw error;
    }

    return NextResponse.json({ attempt: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST attempts API error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to save attempt",
        details: error.details || error.message || null
      },
      { status: 500 }
    );
  }
}
