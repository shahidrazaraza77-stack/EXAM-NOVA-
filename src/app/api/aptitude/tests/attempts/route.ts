import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { aptitudeTestAttemptSchema } from "@/lib/validation";

const indexToLetter = ["A", "B", "C", "D"];

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
    const parsed = aptitudeTestAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { testId, score, correctAnswers, totalQuestions, answers } = parsed.data;

    const mappedAnswers = answers.map((a) => ({
      question_id: a.questionId,
      selected_answer: indexToLetter[a.selectedOption] || "A",
      is_correct: a.isCorrect,
    }));

    const { data, error } = await (supabase as any)
      .from("test_attempts")
      .insert({
        user_id: user.id,
        test_id: testId,
        score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        answers: mappedAnswers,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ attempt: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST test attempt API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save test attempt" },
      { status: 500 }
    );
  }
}
