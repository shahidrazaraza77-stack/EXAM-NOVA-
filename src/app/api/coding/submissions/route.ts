import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { codingSubmissionSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    let query = supabase
      .from("coding_submissions")
      .select("*, coding_questions(title, difficulty)")
      .eq("user_id", user.id);

    if (questionId) {
      query = query.eq("question_id", questionId);
    }

    const { data, error } = await query.order("submitted_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ submissions: data || [] });
  } catch (error: any) {
    console.error("GET coding submissions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submissions" },
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

    // Defensive parsing for numeric values that might be stringified (e.g. from AI outputs)
    if (body.executionTime !== undefined && body.executionTime !== null) {
      if (typeof body.executionTime === "string") {
        body.executionTime = parseInt(body.executionTime.replace(/[^0-9]/g, ""), 10) || 0;
      }
    }
    if (body.memoryUsed !== undefined && body.memoryUsed !== null) {
      if (typeof body.memoryUsed === "string") {
        body.memoryUsed = parseInt(body.memoryUsed.replace(/[^0-9]/g, ""), 10) || 0;
      }
    }
    if (body.testCasesPassed !== undefined && body.testCasesPassed !== null) {
      if (typeof body.testCasesPassed === "string") {
        body.testCasesPassed = parseInt(body.testCasesPassed.replace(/[^0-9]/g, ""), 10) || 0;
      }
    }
    if (body.totalTestCases !== undefined && body.totalTestCases !== null) {
      if (typeof body.totalTestCases === "string") {
        body.totalTestCases = parseInt(body.totalTestCases.replace(/[^0-9]/g, ""), 10) || 0;
      }
    }

    const parsed = codingSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      console.error("POST coding submission validation failed:", parsed.error.format(), "Body sent:", body);
      return NextResponse.json(
        { error: `Validation failed: ${JSON.stringify(parsed.error.format())}`, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      questionId,
      code,
      language,
      status,
      executionTime,
      memoryUsed,
      testCasesPassed,
      totalTestCases,
      errorMessage,
    } = parsed.data;

    const { data, error } = await supabase
      .from("coding_submissions")
      .insert({
        user_id: user.id,
        question_id: questionId,
        code,
        language,
        status,
        execution_time: executionTime || 0,
        memory_used: memoryUsed || 0,
        test_cases_passed: testCasesPassed || 0,
        total_test_cases: totalTestCases || 0,
        error_message: errorMessage || null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ submission: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST coding submission API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save submission" },
      { status: 500 }
    );
  }
}
