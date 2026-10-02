import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { codingBookmarkSchema } from "@/lib/validation";

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
      .from("coding_bookmarks")
      .select("*, coding_questions(*, coding_topics(name))")
      .eq("user_id", user.id);

    if (error) throw error;

    const bookmarks = ((data as any[]) || [])
      .filter((b) => b.coding_questions !== null)
      .map((b) => b.coding_questions);

    return NextResponse.json({ bookmarks });
  } catch (error: any) {
    console.error("GET coding bookmarks API error:", error);
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
    const parsed = codingBookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { problemId } = parsed.data;

    const { data, error } = await (supabase as any)
      .from("coding_bookmarks")
      .insert({
        user_id: user.id,
        question_id: problemId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ bookmark: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST coding bookmark API error:", error);
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
    const problemId = searchParams.get("problemId");

    if (!problemId) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }

    const { error } = await (supabase as any)
      .from("coding_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", problemId);

    if (error) throw error;
    return NextResponse.json({ message: "Bookmark removed successfully" });
  } catch (error: any) {
    console.error("DELETE coding bookmark API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
