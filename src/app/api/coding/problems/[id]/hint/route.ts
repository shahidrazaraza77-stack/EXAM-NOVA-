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

    // Construct Gemini hint prompt
    const prompt = `You are an expert competitive programming algorithms coach.
A student is stuck and needs a hint for the following problem.

Problem:
Title: ${question.title}
Description: ${question.description}
Constraints: ${question.constraints?.join(", ") || "None"}

Current Editor Code in ${language}:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Give a helpful, encouraging hint to guide the student in the right direction.
Rules:
- DO NOT provide any code or the direct solution.
- Focus on the logic, algorithm selection (e.g. "Try using a sliding window approach", "Consider storing values in a hash map to look them up in O(1)"), time complexity bounds, or edge cases they might have missed.
- Keep the hint concise (1-3 sentences).

Return ONLY a valid JSON object matching the following structure (do not wrap in markdown or any text):
{
  "hint": "Your helpful hint text here."
}`;

    const responseText = await safeGenerateContent(prompt, "gemini-2.5-flash");
    
    // Clean response
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/```\s*$/g, "");
    cleaned = cleaned.trim();

    const result = JSON.parse(cleaned);

    return NextResponse.json({ success: true, hint: result.hint });
  } catch (error: any) {
    console.error("POST coding hint API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate hint" },
      { status: 500 }
    );
  }
}
