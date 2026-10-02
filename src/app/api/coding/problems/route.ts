import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

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
    const difficulty = searchParams.get("difficulty");
    const topicId = searchParams.get("topicId");
    const topicName = searchParams.get("topicName");
    const search = searchParams.get("search");
    const companyName = searchParams.get("companyName");
    const solvedStatus = searchParams.get("solvedStatus") || "all";

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    // Resolve topicName to topicId if provided
    let resolvedTopicId = topicId;
    if (topicName && !topicId) {
      const { data: top } = await supabase
        .from("coding_topics")
        .select("id")
        .ilike("name", topicName.trim())
        .maybeSingle();
      if (top) resolvedTopicId = top.id;
    }

    // Build base query selecting only needed metadata columns (not full starter code/solutions)
    const selectCols = "id, title, slug, difficulty, acceptance_rate, topic_id, companies, coding_topics(name)";

    if (solvedStatus === "all") {
      let query: any = supabase
        .from("coding_questions")
        .select(selectCols, { count: "exact" });

      if (difficulty && difficulty !== "All" && difficulty !== "") {
        const formattedDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
        query = query.eq("difficulty", formattedDiff);
      }
      if (resolvedTopicId) {
        query = query.eq("topic_id", resolvedTopicId);
      }
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }
      if (companyName) {
        query = query.contains("companies", [companyName.toLowerCase()]);
      }

      const { data: pageRows, count, error } = await query
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const pageIds = (pageRows || []).map((r: any) => r.id);
      const solvedStatuses: Record<string, "Solved" | "Attempted" | "Todo"> = {};

      if (pageIds.length > 0) {
        const { data: submissions } = await supabase
          .from("coding_submissions")
          .select("question_id, status")
          .eq("user_id", user.id)
          .in("question_id", pageIds);

        (submissions || []).forEach((sub: any) => {
          if (solvedStatuses[sub.question_id] === "Solved") return;
          if (sub.status === "Accepted") {
            solvedStatuses[sub.question_id] = "Solved";
          } else {
            solvedStatuses[sub.question_id] = "Attempted";
          }
        });
      }

      const mappedProblems = (pageRows || []).map((q: any) => ({
        id: q.id,
        title: q.title,
        topic: q.coding_topics?.name || "Arrays",
        topic_id: q.topic_id || "",
        slug: q.slug || q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        difficulty: q.difficulty,
        acceptanceRate: q.acceptance_rate || "50.0%",
        status: solvedStatuses[q.id] || "Todo",
        tags: q.coding_topics?.name ? [q.coding_topics.name] : ["Arrays"],
        companies: q.companies || [],
      }));

      return NextResponse.json({
        problems: mappedProblems,
        totalCount: count || 0,
        page,
        limit,
      });
    }

    // Handled when user filters specifically by Solved / Attempted / Todo
    const { data: submissions } = await supabase
      .from("coding_submissions")
      .select("question_id, status")
      .eq("user_id", user.id);

    const solvedSet = new Set<string>();
    const attemptedSet = new Set<string>();

    (submissions || []).forEach((sub: any) => {
      if (sub.status === "Accepted") {
        solvedSet.add(sub.question_id);
      } else {
        attemptedSet.add(sub.question_id);
      }
    });

    let query: any = supabase
      .from("coding_questions")
      .select(selectCols, { count: "exact" });

    if (difficulty && difficulty !== "All" && difficulty !== "") {
      const formattedDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      query = query.eq("difficulty", formattedDiff);
    }
    if (resolvedTopicId) {
      query = query.eq("topic_id", resolvedTopicId);
    }
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (companyName) {
      query = query.contains("companies", [companyName.toLowerCase()]);
    }

    if (solvedStatus === "solved") {
      const ids = Array.from(solvedSet);
      if (ids.length === 0) {
        return NextResponse.json({ problems: [], totalCount: 0, page, limit });
      }
      query = query.in("id", ids);
    } else if (solvedStatus === "attempted") {
      const attemptedOnly = Array.from(attemptedSet).filter((id) => !solvedSet.has(id));
      if (attemptedOnly.length === 0) {
        return NextResponse.json({ problems: [], totalCount: 0, page, limit });
      }
      query = query.in("id", attemptedOnly);
    }

    const { data: pageRows, count, error } = await query
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const mappedProblems = (pageRows || []).map((q: any) => {
      let status: "Solved" | "Attempted" | "Todo" = "Todo";
      if (solvedSet.has(q.id)) status = "Solved";
      else if (attemptedSet.has(q.id)) status = "Attempted";

      return {
        id: q.id,
        title: q.title,
        topic: q.coding_topics?.name || "Arrays",
        topic_id: q.topic_id || "",
        slug: q.slug || q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        difficulty: q.difficulty,
        acceptanceRate: q.acceptance_rate || "50.0%",
        status,
        tags: q.coding_topics?.name ? [q.coding_topics.name] : ["Arrays"],
        companies: q.companies || [],
      };
    });

    return NextResponse.json({
      problems: mappedProblems,
      totalCount: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("GET coding problems API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coding problems" },
      { status: 500 }
    );
  }
}
