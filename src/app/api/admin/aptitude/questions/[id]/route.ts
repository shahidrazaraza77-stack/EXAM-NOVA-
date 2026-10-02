import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { adminAptitudeQuestionSchema } from "@/lib/validation";
import { auditLog } from "@/lib/logger";

export async function PUT(
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

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "content_manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: questionId } = await params;
    const body = await request.json();
    
    // Validate updates (partial updates supported by using partial schema or validation mapping)
    // For a PUT we validate the entire schema, but can support partial properties if they pass
    const parsed = adminAptitudeQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("aptitude_questions") as any)
      .update({
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
      .eq("id", questionId)
      .select()
      .single();

    if (error) throw error;

    // Record audit log
    await auditLog({
      supabase,
      adminId: user.id,
      action: "UPDATE_APTITUDE_QUESTION",
      entityType: "aptitude_questions",
      entityId: questionId,
      metadata: { question: parsed.data.question },
    });

    return NextResponse.json({ question: data });
  } catch (error: any) {
    console.error("PUT admin questions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "content_manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: questionId } = await params;

    const { error } = await (supabase.from("aptitude_questions") as any)
      .delete()
      .eq("id", questionId);

    if (error) throw error;

    // Record audit log
    await auditLog({
      supabase,
      adminId: user.id,
      action: "DELETE_APTITUDE_QUESTION",
      entityType: "aptitude_questions",
      entityId: questionId,
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error: any) {
    console.error("DELETE admin questions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
