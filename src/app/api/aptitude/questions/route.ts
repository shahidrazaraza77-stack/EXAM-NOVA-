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
    const topicId = searchParams.get("topicId");
    const topicName = searchParams.get("topicName");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const companyName = searchParams.get("companyName");
    const solvedStatus = searchParams.get("solvedStatus") || "all";
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    let query: any = (supabase as any)
      .from("aptitude_questions")
      .select("*, aptitude_topics(name, category)", { count: "exact" });

    if (topicId) {
      query = query.eq("topic_id", topicId);
    }

    if (difficulty && difficulty !== "All" && difficulty !== "") {
      query = query.eq("difficulty", difficulty);
    }

    if (search) {
      query = query.ilike("question", `%${search}%`);
    }

    if (companyName) {
      query = query.contains("companies", [companyName.toLowerCase()]);
    }

    const { data: questions, count, error } = await query;
    if (error) throw error;

    let result = questions || [];

    // Filter by topic name if topic name is provided instead of ID
    if (topicName && topicName !== "Practice") {
      result = result.filter(
        (q: any) => q.aptitude_topics?.name.toLowerCase() === topicName.toLowerCase()
      );
    }

    // Apply Solved / Unsolved filter
    if (solvedStatus !== "all") {
      const { data: attempts } = await (supabase as any)
        .from("aptitude_attempts")
        .select("question_id")
        .eq("user_id", user.id);

      const solvedIds = new Set((attempts || []).map((a: any) => a.question_id));

      if (solvedStatus === "solved") {
        result = result.filter((q: any) => solvedIds.has(q.id));
      } else if (solvedStatus === "unsolved") {
        result = result.filter((q: any) => !solvedIds.has(q.id));
      }
    }

    // Paginate in memory after filter mappings
    const totalCount = result.length;
    const paginatedResult = result.slice(offset, offset + limit);

    return NextResponse.json({
      questions: paginatedResult,
      totalCount,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("GET questions API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
