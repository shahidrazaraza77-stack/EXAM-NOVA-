import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    const { data: sessions, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }

    const sessionsWithAnswers = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: answers } = await supabase
          .from("interview_answers")
          .select("*")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });

        return { ...session, answers: answers || [] };
      })
    );

    return NextResponse.json({ sessions: sessionsWithAnswers });
  } catch (error: any) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch history" },
      { status: 500 }
    );
  }
}
