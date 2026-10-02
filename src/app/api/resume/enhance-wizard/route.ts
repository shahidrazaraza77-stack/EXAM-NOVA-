import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { resumeId, userData } = await request.json();

    if (!userData) {
      return NextResponse.json({ error: "userData is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // If resumeId is provided, verify ownership first
    if (resumeId) {
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("id, user_id")
        .eq("id", resumeId)
        .single();

      if (resumeError || !resume) {
        return NextResponse.json({ error: "Resume not found or access denied" }, { status: 404 });
      }
    }

    const prompt = `
You are an expert AI Resume Writer, Editor, and ATS (Applicant Tracking System) Optimizer.
Optimize and rewrite the following structured resume JSON. Make it highly professional, metric-driven, and filled with relevant keywords.

Tasks:
1. **Summary**: Improve the professional summary / career objective. Make it punchy (2-3 sentences), highlighting key strengths, years of experience, and target roles.
2. **Skills**: Add highly relevant ATS keywords and technical/tools keywords matching their domain to technical skills and tools lists. Ensure they are clean individual string items.
3. **Projects**: Rewrite project descriptions to use strong action verbs, emphasize technical problem-solving, and list metrics/impact where possible.
4. **Experience**: Rewrite responsibilities to start with strong action verbs (e.g. "Led", "Engineered", "Orchestrated"), remove passive language, improve grammar, and quantify achievements (e.g. "improving performance by 15%").
5. **Grammar & Formatting**: Repair all grammatical errors, typos, and formatting inconsistencies across all fields.

Strict constraints:
- Keep the exact same JSON keys and structure.
- Retain all original names, contacts, university names, degrees, and dates exactly.
- Return ONLY the clean JSON block. Do not include markdown code block characters (\`\`\`json or \`\`\`).

Input JSON:
${JSON.stringify(userData, null, 2)}
`;

    const textResponse = await safeGenerateContent(prompt);
    
    // Clean response to extract raw JSON
    const cleanedJson = textResponse
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/gm, "")
      .trim();

    const parsedData = JSON.parse(cleanedJson);

    // Validate key structure to ensure no corruption
    const requiredKeys = ["personalInfo", "skills", "projects", "experience", "education"];
    for (const key of requiredKeys) {
      if (!(key in parsedData)) {
        throw new Error(`Invalid JSON format: missing required key '${key}'`);
      }
    }

    // Save to database if resumeId is provided
    if (resumeId) {
      const { error: updateError } = await supabase
        .from("resumes")
        .update({
          content: parsedData,
          updated_at: new Date().toISOString()
        })
        .eq("id", resumeId);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({ enhancedData: parsedData });
  } catch (error: any) {
    console.error("Error enhancing resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance resume" },
      { status: 500 }
    );
  }
}

