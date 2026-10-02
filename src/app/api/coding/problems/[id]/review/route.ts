import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader) as any;

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: problemId } = await params;
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
    }

    // Fetch problem details
    const { data: question, error: questionError } = await supabase
      .from("coding_questions")
      .select("*")
      .eq("id", problemId)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Construct Gemini review prompt
    const prompt = `You are a senior algorithms engineer and competitive programming reviewer.
Review the following user code submitted for a coding challenge.

Problem:
Title: ${question.title}
Description: ${question.description}
Constraints: ${question.constraints?.join(", ") || "None"}

User Code in ${language}:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Analyze the code and provide detailed, professional feedback.
Specifically:
1. Rate Code Quality & Readability (on a scale of 1 to 10).
2. Analyze Time Complexity (e.g. O(N), O(N^2)).
3. Analyze Space Complexity (e.g. O(1), O(N)).
4. Suggest edge cases they should test (e.g. empty lists, single elements, integer overflow bounds).
5. Provide actionable refactoring and optimization recommendations (e.g. early exits, loop count reductions, syntax style improvements).

You MUST return ONLY a valid JSON object matching the following structure (do not wrap in markdown or any text):
{
  "qualityScore": 8,
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "reviewSummary": "A concise summary of their code approach, correctness, and style.",
  "edgeCases": [
    "Describe edge case 1",
    "Describe edge case 2"
  ],
  "suggestions": [
    "Refactoring tip 1",
    "Optimization tip 2"
  ]
}`;

    const responseText = await safeGenerateContent(prompt, "gemini-2.5-flash");
    
    // Clean response
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/```\s*$/g, "");
    cleaned = cleaned.trim();

    const result = JSON.parse(cleaned);

    return NextResponse.json({ success: true, review: result });
  } catch (error: any) {
    console.error("POST coding review API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate code review" },
      { status: 500 }
    );
  }
}
