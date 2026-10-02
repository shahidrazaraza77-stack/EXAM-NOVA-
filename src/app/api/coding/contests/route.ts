import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// GET /api/coding/contests - List all contests
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Auto-update contest statuses based on time
    const now = new Date().toISOString();
    await supabase
      .from("coding_contests")
      .update({ status: "active", updated_at: now })
      .eq("status", "upcoming")
      .lte("start_time", now)
      .gt("end_time", now);

    await supabase
      .from("coding_contests")
      .update({ status: "ended", updated_at: now })
      .in("status", ["upcoming", "active"])
      .lte("end_time", now);

    const { data: contests, error } = await supabase
      .from("coding_contests")
      .select(`
        *,
        contest_problems(count),
        contest_participants(count)
      `)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching contests:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (contests || []).map((c: any) => ({
      ...c,
      problem_count: c.contest_problems?.[0]?.count ?? 0,
      participant_count: c.contest_participants?.[0]?.count ?? 0,
    }));

    return NextResponse.json({ contests: formatted });
  } catch (err: any) {
    console.error("Contests GET error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/coding/contests - Create a new contest (Admin only)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "content_manager") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, rules, start_time, end_time, is_rated, max_participants, problem_ids } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json({ error: "title, start_time, and end_time are required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    let status = "upcoming";
    if (startDate <= new Date() && endDate > new Date()) status = "active";
    if (endDate <= new Date()) status = "ended";

    const { data: contest, error: contestErr } = await supabase
      .from("coding_contests")
      .insert({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: description || "",
        rules: rules || "",
        start_time,
        end_time,
        status,
        is_rated: is_rated || false,
        max_participants: max_participants || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (contestErr) {
      console.error("Error creating contest:", contestErr);
      return NextResponse.json({ error: contestErr.message }, { status: 500 });
    }

    // Insert problems into contest
    if (problem_ids && Array.isArray(problem_ids) && problem_ids.length > 0) {
      const problemRows = problem_ids.map((pid: string, idx: number) => ({
        contest_id: contest.id,
        problem_id: pid,
        points: 100,
        order_index: idx,
      }));

      const { error: problemsErr } = await supabase
        .from("contest_problems")
        .insert(problemRows);

      if (problemsErr) {
        console.error("Error linking problems to contest:", problemsErr);
      }
    }

    return NextResponse.json({ contest }, { status: 201 });
  } catch (err: any) {
    console.error("Contests POST error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
