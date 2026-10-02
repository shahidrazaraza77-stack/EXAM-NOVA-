import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { adminAptitudeQuestionSchema } from "@/lib/validation";
import { auditLog } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "content_manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = adminAptitudeQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("aptitude_questions") as any)
      .insert({
        topic_id: parsed.data.topic_id,
        question: parsed.data.question,
        option_a: parsed.data.option_a,
        option_b: parsed.data.option_b,
        option_c: parsed.data.option_c,
        option_d: parsed.data.option_d,
        correct_answer: parsed.data.correct_answer,
        explanation: parsed.data.explanation || null,
        difficulty: parsed.data.difficulty,
        companies: parsed.data.companies,
      })
      .select()
      .single();

    if (error) throw error;

    // Record audit log
    await auditLog({
      supabase,
      adminId: user.id,
      action: "CREATE_APTITUDE_QUESTION",
      entityType: "aptitude_questions",
      entityId: data.id,
      metadata: { question: parsed.data.question },
    });

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST admin questions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}
