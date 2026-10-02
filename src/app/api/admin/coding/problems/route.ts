import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { adminCodingProblemSchema } from "@/lib/validation";
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
    const parsed = adminCodingProblemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase.from("coding_questions") as any)
      .insert({
        topic_id: parsed.data.topic_id || null,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        difficulty: parsed.data.difficulty,
        constraints: parsed.data.constraints,
        sample_input: parsed.data.sample_input || null,
        sample_output: parsed.data.sample_output || null,
        explanation: parsed.data.explanation || null,
        companies: parsed.data.companies,
        starter_code: parsed.data.starter_code,
        optimal_solutions: parsed.data.optimal_solutions,
        complexity: parsed.data.complexity,
        examples: parsed.data.examples,
        acceptance_rate: parsed.data.acceptance_rate,
      })
      .select()
      .single();

    if (error) throw error;

    // Record audit log
    await auditLog({
      supabase,
      adminId: user.id,
      action: "CREATE_CODING_PROBLEM",
      entityType: "coding_questions",
      entityId: data.id,
      metadata: { title: parsed.data.title },
    });

    return NextResponse.json({ problem: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST admin coding problem API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coding problem" },
      { status: 500 }
    );
  }
}
