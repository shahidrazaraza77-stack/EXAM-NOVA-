import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";
import { COMPANY_OPTIMIZATION_PROMPT } from "@/lib/prompts/company-optimization";
import { getResumeText } from "@/lib/utils";
import { downloadFileFromStorage, extractTextFromBuffer } from "@/lib/text-extraction";

export async function POST(request: NextRequest) {
  try {
    const { resumeId, companyName } = await request.json();

    if (!resumeId || !companyName) {
      return NextResponse.json({ error: "resumeId and companyName are required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // 1. Fetch original resume
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let extractedText = getResumeText(resume);

    if ((!extractedText || !extractedText.trim()) && resume.file_path && resume.file_name) {
      try {
        const arrayBuffer = await downloadFileFromStorage(resume.file_path, supabase);
        extractedText = await extractTextFromBuffer(arrayBuffer, resume.file_name);
      } catch (error) {
        console.error("Error downloading or extracting from file:", error);
      }
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json({ error: "No text content found in the resume. Please ensure your resume has content or you have uploaded a valid document." }, { status: 400 });
    }

    // 2. Call Gemini
    const prompt = COMPANY_OPTIMIZATION_PROMPT
      .replace("{companyName}", companyName)
      .replace(/{companyName}/g, companyName)
      .replace("{resumeText}", extractedText);

    const textResponse = await safeGenerateContent(prompt);

    // Clean JSON response
    const cleanedJson = textResponse.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
    const parsedData = JSON.parse(cleanedJson);

    // 3. Find highest version for this user's resumes
    const { data: userResumes } = await supabase
      .from("resumes")
      .select("version")
      .eq("user_id", resume.user_id);
    const maxVersion = userResumes ? Math.max(...userResumes.map(r => r.version || 1), 0) : 0;
    const newVersion = maxVersion + 1;

    // 4. Create new optimized version row
    const { data: newResume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: resume.user_id,
        name: `${(resume.name || resume.file_name || "Resume").replace(/ \(Optimized for.*\)/g, "")} (Optimized for ${companyName})`,
        file_name: `${(resume.file_name || "Resume").replace(/ \(Optimized for.*\)/g, "")} (Optimized for ${companyName})`,
        file_path: resume.file_path,
        file_size: resume.file_size,
        score: parsedData.companyAtsScore,
        ats_score: parsedData.companyAtsScore,
        parsed_content: parsedData.optimizedResume,
        improved_content: parsedData.optimizedResume,
        content: resume.content,
        version: newVersion,
        target_company: companyName,
        is_ai_generated: true,
        feedback: JSON.stringify({
          company_name: companyName,
          match_percentage: parsedData.matchPercentage,
          missing_skills: parsedData.missingSkills,
          interview_tips: parsedData.interviewTips,
          section_scores: {
            formatting: Math.round(parsedData.companyAtsScore * 1.02),
            keywords: Math.round(parsedData.companyAtsScore * 0.95),
            projects: Math.round(parsedData.companyAtsScore * 1.01),
            skills: Math.round(parsedData.companyAtsScore * 0.98),
            education: Math.round(parsedData.companyAtsScore * 1.0),
            experience: Math.round(parsedData.companyAtsScore * 0.92),
            achievements: Math.round(parsedData.companyAtsScore * 0.90),
            grammar: Math.round(parsedData.companyAtsScore * 1.04)
          }
        })
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 5. Insert row into resume_analysis
    await supabase
      .from("resume_analysis")
      .insert({
        resume_id: newResume.id,
        ats_score: parsedData.companyAtsScore,
        strengths: ["Company-specific keywords optimized", "Aligned objective statement"],
        weaknesses: parsedData.missingSkills.length > 0 ? [`Missing skills: ${parsedData.missingSkills.slice(0, 3).join(", ")}`] : [],
        missing_keywords: parsedData.missingSkills,
        suggestions: parsedData.interviewTips,
        overall_feedback: `Optimized specifically for ${companyName} with a match percentage of ${parsedData.matchPercentage}%.`,
        section_scores: {
          formatting: Math.round(parsedData.companyAtsScore * 1.02),
          keywords: Math.round(parsedData.companyAtsScore * 0.95),
          projects: Math.round(parsedData.companyAtsScore * 1.01),
          skills: Math.round(parsedData.companyAtsScore * 0.98),
          education: Math.round(parsedData.companyAtsScore * 1.0),
          experience: Math.round(parsedData.companyAtsScore * 0.92),
          achievements: Math.round(parsedData.companyAtsScore * 0.90),
          grammar: Math.round(parsedData.companyAtsScore * 1.04)
        },
        weak_sections: parsedData.missingSkills.length > 0 ? ["Skills"] : [],
        strong_sections: ["Formatting", "Experience"]
      });

    // 6. Insert history log
    await supabase
      .from("resume_analysis_logs" as any)
      .insert({
        user_id: resume.user_id,
        resume_id: newResume.id,
        score: parsedData.companyAtsScore,
        strengths: "Optimized for " + companyName,
        weaknesses: "Missing: " + (parsedData.missingSkills || []).join(", "),
        suggestions: "Tips: " + (parsedData.interviewTips || []).join(", "),
        section_scores: {
          formatting: Math.round(parsedData.companyAtsScore * 1.02),
          keywords: Math.round(parsedData.companyAtsScore * 0.95),
          projects: Math.round(parsedData.companyAtsScore * 1.01),
          skills: Math.round(parsedData.companyAtsScore * 0.98),
          education: Math.round(parsedData.companyAtsScore * 1.0),
          experience: Math.round(parsedData.companyAtsScore * 0.92),
          achievements: Math.round(parsedData.companyAtsScore * 0.90),
          grammar: Math.round(parsedData.companyAtsScore * 1.04)
        },
        weak_sections: parsedData.missingSkills.length > 0 ? ["Skills"] : [],
        strong_sections: ["Formatting", "Experience"]
      });

    // 7. Update user_analytics
    await supabase
      .from("user_analytics")
      .update({ resume_score: parsedData.companyAtsScore })
      .eq("user_id", resume.user_id);

    // 8. Save to company_matches table
    const { error: companyMatchErr } = await supabase
      .from("company_matches" as any)
      .insert({
        user_id: resume.user_id,
        resume_id: newResume.id,
        company_name: companyName,
        match_score: parsedData.companyAtsScore,
        missing_skills: parsedData.missingSkills || [],
        company_keywords: parsedData.companyKeywords || [],
        recommended_projects: parsedData.recommendedProjects || [],
        preparation_roadmap: parsedData.preparationRoadmap || [],
        interview_pattern: parsedData.interviewPattern || [],
        expected_questions: parsedData.expectedQuestions || []
      });

    if (companyMatchErr) {
      console.error("Failed to save company_matches record:", companyMatchErr.message);
    }

    // 9. Save to resume_history table
    await supabase
      .from("resume_history" as any)
      .insert({
        user_id: resume.user_id,
        resume_id: newResume.id,
        action: "Company Match",
        description: `Optimized & matched resume for target company: ${companyName} (ATS Score: ${parsedData.companyAtsScore}%)`
      });

    return NextResponse.json({
      newResumeId: newResume.id,
      optimizedResume: parsedData.optimizedResume,
      companyAtsScore: parsedData.companyAtsScore,
      matchPercentage: parsedData.matchPercentage,
      missingSkills: parsedData.missingSkills,
      interviewTips: parsedData.interviewTips,
      companyKeywords: parsedData.companyKeywords || [],
      recommendedProjects: parsedData.recommendedProjects || [],
      preparationRoadmap: parsedData.preparationRoadmap || [],
      interviewPattern: parsedData.interviewPattern || [],
      expectedQuestions: parsedData.expectedQuestions || []
    });
  } catch (error: any) {
    console.error("Error optimizing resume for company:", error);
    return NextResponse.json({ error: error.message || "Failed to optimize resume" }, { status: 500 });
  }
}
