import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// GET /api/coding/contests/[id] - Get single contest with problems
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: contest, error } = await supabase
      .from("coding_contests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    // Fetch contest problems (always visible so participants can browse)
    const { data: contestProblems } = await supabase
      .from("contest_problems")
      .select(`
        *,
        coding_questions(
          id, title, slug, difficulty, description, constraints, examples,
          explanation, complexity, starter_code, optimal_solutions, companies,
          acceptance_rate,
          coding_topics(id, name)
        )
      `)
      .eq("contest_id", id)
      .order("order_index", { ascending: true });

    // Fetch participant count
    const { count: participantCount } = await supabase
      .from("contest_participants")
      .select("*", { count: "exact", head: true })
      .eq("contest_id", id);

    // Check if current user is registered
    let isRegistered = false;
    let userParticipant = null;
    if (user) {
      const { data: participant } = await supabase
        .from("contest_participants")
        .select("*")
        .eq("contest_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      isRegistered = !!participant;
      userParticipant = participant;
    }

    return NextResponse.json({
      contest: {
        ...contest,
        participant_count: participantCount || 0,
        is_registered: isRegistered,
        user_participant: userParticipant,
      },
      problems: (contestProblems || []).map((cp: any) => ({
        contest_problem_id: cp.id,
        points: cp.points,
        order_index: cp.order_index,
        ...cp.coding_questions,
        topic: cp.coding_questions?.coding_topics?.name || "General",
      })),
    });
  } catch (err: any) {
    console.error("Contest GET [id] error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/coding/contests/[id] - Update contest (Admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { problem_ids, ...contestUpdates } = body;

    const { data: contest, error } = await supabase
      .from("coding_contests")
      .update({ ...contestUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync problem list if provided
    if (problem_ids && Array.isArray(problem_ids)) {
      await supabase.from("contest_problems").delete().eq("contest_id", id);

      if (problem_ids.length > 0) {
        const problemRows = problem_ids.map((pid: string, idx: number) => ({
          contest_id: id,
          problem_id: pid,
          points: 100,
          order_index: idx,
        }));
        await supabase.from("contest_problems").insert(problemRows);
      }
    }

    return NextResponse.json({ contest });
  } catch (err: any) {
    console.error("Contest PUT error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/coding/contests/[id] - Delete contest (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { error } = await supabase.from("coding_contests").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contest DELETE error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
