import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: problemId } = await params;

    const { data, error } = await supabase
      .from("coding_questions")
      .select("*, coding_topics(name)")
      .eq("id", problemId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const q = data as any;

    // Determine user status
    let userStatus: "Solved" | "Attempted" | "Todo" = "Todo";
    const { data: submissions } = await supabase
      .from("coding_submissions")
      .select("status")
      .eq("user_id", user.id)
      .eq("question_id", problemId);

    if (submissions && submissions.length > 0) {
      const hasAccepted = submissions.some((sub: any) => sub.status === "Accepted");
      userStatus = hasAccepted ? "Solved" : "Attempted";
    }

    // Normalize starter code for all languages
    const rawBoilerplates = (q.starter_code as Record<string, string>) || {};
    const normalizedBoilerplates: Record<string, string> = {};
    for (const [key, codeVal] of Object.entries(rawBoilerplates)) {
      if (!codeVal || typeof codeVal !== "string" || !codeVal.trim()) continue;
      const k = key.toLowerCase().trim();
      normalizedBoilerplates[key] = codeVal;
      if (k === "cpp" || k === "c++" || k === "cplusplus" || k === "c") {
        normalizedBoilerplates["C++"] = codeVal;
        normalizedBoilerplates["cpp"] = codeVal;
      } else if (k === "python" || k === "py" || k === "python3") {
        normalizedBoilerplates["Python"] = codeVal;
        normalizedBoilerplates["python"] = codeVal;
      } else if (k === "java") {
        normalizedBoilerplates["Java"] = codeVal;
        normalizedBoilerplates["java"] = codeVal;
      } else if (k === "javascript" || k === "js" || k === "node" || k === "typescript" || k === "ts") {
        normalizedBoilerplates["JavaScript"] = codeVal;
        normalizedBoilerplates["javascript"] = codeVal;
      }
    }

    if (!normalizedBoilerplates["Python"]) {
      normalizedBoilerplates["Python"] = "# Write your Python solution here\nclass Solution:\n    def solve(self):\n        pass\n";
    }
    if (!normalizedBoilerplates["C++"]) {
      normalizedBoilerplates["C++"] = "// Write your C++ solution here\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n";
    }
    if (!normalizedBoilerplates["Java"]) {
      normalizedBoilerplates["Java"] = "// Write your Java solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}\n";
    }
    if (!normalizedBoilerplates["JavaScript"]) {
      normalizedBoilerplates["JavaScript"] = "// Write your JavaScript solution here\nfunction solve() {\n  \n}\n";
    }

    const problem = {
      id: q.id,
      title: q.title,
      topic: q.coding_topics?.name || "Arrays",
      topic_id: q.topic_id || "",
      slug: q.slug || q.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      difficulty: q.difficulty,
      acceptanceRate: q.acceptance_rate || "50.0%",
      status: userStatus,
      tags: q.coding_topics?.name ? [q.coding_topics.name] : ["Arrays"],
      description: q.description,
      constraints: q.constraints || [],
      examples: q.examples || [],
      explanation: q.explanation || "",
      complexity: q.complexity || { time: "O(N)", space: "O(1)" },
      boilerplates: normalizedBoilerplates,
      optimalSolutions: q.optimal_solutions || {},
      companies: q.companies || [],
    };

    return NextResponse.json({ problem });
  } catch (error: any) {
    console.error("GET coding problem details API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coding problem details" },
      { status: 500 }
    );
  }
}
