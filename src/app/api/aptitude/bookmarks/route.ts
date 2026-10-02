import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { bookmarkSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await (supabase as any)
      .from("aptitude_bookmarks")
      .select("*, aptitude_questions(*, aptitude_topics(name, category))")
      .eq("user_id", user.id);

    if (error) throw error;

    const bookmarks = ((data as any[]) || [])
      .filter((b) => b.aptitude_questions !== null)
      .map((b) => b.aptitude_questions);

    return NextResponse.json({ bookmarks });
  } catch (error: any) {
    console.error("GET bookmarks API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookmarks" },
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
    const parsed = bookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { questionId } = parsed.data;

    const { data, error } = await (supabase as any)
      .from("aptitude_bookmarks")
      .insert({
        user_id: user.id,
        question_id: questionId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ bookmark: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST bookmark API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add bookmark" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }

    const { error } = await (supabase as any)
      .from("aptitude_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId);

    if (error) throw error;
    return NextResponse.json({ message: "Bookmark removed successfully" });
  } catch (error: any) {
    console.error("DELETE bookmark API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
