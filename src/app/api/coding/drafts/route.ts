import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { codingDraftSchema } from "@/lib/validation";

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
    const language = searchParams.get("language");

    if (!questionId || !language) {
      return NextResponse.json(
        { error: "questionId and language search parameters are required" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any).from("coding_drafts")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .eq("language", language)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ draft: data || null });
  } catch (error: any) {
    console.error("GET coding draft API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coding draft" },
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
    const parsed = codingDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { questionId, language, code } = parsed.data;

    const { data, error } = await (supabase as any).from("coding_drafts")
      .upsert(
        {
          user_id: user.id,
          question_id: questionId,
          language,
          code,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,question_id,language",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ draft: data });
  } catch (error: any) {
    console.error("POST coding draft API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save coding draft" },
      { status: 500 }
    );
  }
}
