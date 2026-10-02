import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, userId, resumeId } = await request.json();

    if (!resumeText || !resumeText.trim() || !userId) {
      return NextResponse.json({ error: "resumeText and userId are required, and resumeText must not be empty" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);



    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and professional resume reviewer.
Analyze the following resume text. Evaluate it on these 8 parameters:
- Formatting: Structure, visual layout, section organization, and readability.
- Keywords: Relevance, industry terms, buzzwords, and keyword optimization.
- Projects: Quality, depth, tech stack, and clarity of descriptions.
- Skills: Core competencies, technical and soft skills representation.
- Education: Relevance, clarity, and presentation of degrees and credentials.
- Experience: Work history, chronological flow, impact statements, and use of action verbs.
- Achievements: Quantified metrics, awards, and notable milestones.
- Grammar: Spelling, grammar, syntax, tone, and professional language.

Compute an overall ATS score out of 100 based on these criteria.

Return ONLY a JSON block matching this structure:
{
  "ats_score": number (0-100),
  "section_scores": {
    "formatting": number (0-100),
    "keywords": number (0-100),
    "projects": number (0-100),
    "skills": number (0-100),
    "education": number (0-100),
    "experience": number (0-100),
    "achievements": number (0-100),
    "grammar": number (0-100)
  },
  "strengths": string[],
  "weaknesses": string[],
  "missing_keywords": string[],
  "weak_sections": string[],
  "strong_sections": string[],
  "improvements": string[],
  "improved_resume": "A fully polished, professionally rewritten version of the input resume in clean markdown text format, optimizing project metrics, action verbs, and keyword density. Ensure you retain the personal info.",
  "overall_feedback": string
}

Resume Text:
"""
${resumeText}
"""
`;

    const textResponse = await safeGenerateContent(prompt);
    
    // Clean JSON response
    const cleanedJson = textResponse.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
    const parsedData = JSON.parse(cleanedJson);

    // Save/update resumes in database
    let finalResumeId = resumeId;
    if (finalResumeId) {
      // Fetch current version to increment it
      const { data: currentResume } = await supabase
        .from("resumes")
        .select("version, content")
        .eq("id", finalResumeId)
        .single();
      
      const newVersion = (currentResume?.version || 1) + 1;

      // Update resume with analysis
      await supabase
        .from("resumes")
        .update({
          ats_score: parsedData.ats_score,
          score: parsedData.ats_score, // backward compatible
          improved_content: parsedData.improved_resume,
          feedback: JSON.stringify({
            strengths: parsedData.strengths,
            weaknesses: parsedData.weaknesses,
            improvements: parsedData.improvements,
            missing_keywords: parsedData.missing_keywords,
            overall_feedback: parsedData.overall_feedback,
            section_scores: parsedData.section_scores,
            weak_sections: parsedData.weak_sections,
            strong_sections: parsedData.strong_sections
          }),
          version: newVersion,
          updated_at: new Date().toISOString()
        })
        .eq("id", finalResumeId);
    } else {
      // Create new resume version with structured content
      const { data: newResume, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: userId,
          content: { text: resumeText },
          ats_score: parsedData.ats_score,
          score: parsedData.ats_score,
          improved_content: parsedData.improved_resume,
          feedback: JSON.stringify({
            strengths: parsedData.strengths,
            weaknesses: parsedData.weaknesses,
            improvements: parsedData.improvements,
            missing_keywords: parsedData.missing_keywords,
            overall_feedback: parsedData.overall_feedback,
            section_scores: parsedData.section_scores,
            weak_sections: parsedData.weak_sections,
            strong_sections: parsedData.strong_sections
          }),
          version: 1
        })
        .select()
        .single();

      if (insertError) throw insertError;
      finalResumeId = newResume.id;
    }

    // Save to resume_analysis table for consistency
    const { data: existingAnalysis } = await supabase
      .from("resume_analysis")
      .select("id")
      .eq("resume_id", finalResumeId)
      .single();

    if (existingAnalysis) {
      await supabase
        .from("resume_analysis")
        .update({
          ats_score: parsedData.ats_score,
          strengths: parsedData.strengths,
          weaknesses: parsedData.weaknesses,
          missing_keywords: parsedData.missing_keywords,
          suggestions: parsedData.improvements,
          overall_feedback: parsedData.overall_feedback,
          section_scores: parsedData.section_scores,
          weak_sections: parsedData.weak_sections,
          strong_sections: parsedData.strong_sections,
        })
        .eq("id", existingAnalysis.id);
    } else {
      await supabase
        .from("resume_analysis")
        .insert({
          resume_id: finalResumeId,
          ats_score: parsedData.ats_score,
          strengths: parsedData.strengths,
          weaknesses: parsedData.weaknesses,
          missing_keywords: parsedData.missing_keywords,
          suggestions: parsedData.improvements,
          overall_feedback: parsedData.overall_feedback,
          section_scores: parsedData.section_scores,
          weak_sections: parsedData.weak_sections,
          strong_sections: parsedData.strong_sections,
        });
    }

    // Insert into resume_analysis_logs
    await supabase
      .from("resume_analysis_logs")
      .insert({
        user_id: userId,
        resume_id: finalResumeId,
        score: parsedData.ats_score,
        strengths: (parsedData.strengths || []).join(", "),
        weaknesses: (parsedData.weaknesses || []).join(", "),
        suggestions: (parsedData.improvements || []).join(", "),
        section_scores: parsedData.section_scores,
        weak_sections: parsedData.weak_sections,
        strong_sections: parsedData.strong_sections
      });

    // Also update the overall resume_score in user_analytics table!
    await supabase
      .from("user_analytics")
      .update({ resume_score: parsedData.ats_score })
      .eq("user_id", userId);

    return NextResponse.json({
      resumeId: finalResumeId,
      ...parsedData
    });
  } catch (error: any) {
    console.error("Error analyzing text resume:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}
