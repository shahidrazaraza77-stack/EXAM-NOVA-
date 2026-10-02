import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// POST /api/coding/contests/[id]/register - Register for a contest
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check contest exists and is registerable
    const { data: contest, error: contestErr } = await supabase
      .from("coding_contests")
      .select("*")
      .eq("id", id)
      .single();

    if (contestErr || !contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest.status === "ended") {
      return NextResponse.json({ error: "Contest has already ended" }, { status: 400 });
    }

    // Check if max participants exceeded
    if (contest.max_participants) {
      const { count } = await supabase
        .from("contest_participants")
        .select("*", { count: "exact", head: true })
        .eq("contest_id", id);
      if ((count || 0) >= contest.max_participants) {
        return NextResponse.json({ error: "Contest is full" }, { status: 400 });
      }
    }

    const { data: participant, error: participantErr } = await supabase
      .from("contest_participants")
      .upsert({
        contest_id: id,
        user_id: user.id,
        registered_at: new Date().toISOString(),
      }, { onConflict: "contest_id,user_id" })
      .select()
      .single();

    if (participantErr) {
      return NextResponse.json({ error: participantErr.message }, { status: 500 });
    }

    return NextResponse.json({ participant }, { status: 201 });
  } catch (err: any) {
    console.error("Contest register error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
