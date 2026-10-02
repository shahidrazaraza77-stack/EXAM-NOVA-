import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { downloadFileFromStorage, extractTextFromBuffer } from "@/lib/text-extraction";
import { matchResumeWithJob } from "@/lib/gemini";
import { getResumeText } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { resumeId, jobDescription } = await request.json();
    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: "resumeId and jobDescription are required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Fetch user details from session token to set user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let resumeText = getResumeText(resume);

    if ((!resumeText || !resumeText.trim()) && resume.file_path && resume.file_name) {
      try {
        const arrayBuffer = await downloadFileFromStorage(resume.file_path, supabase);
        resumeText = await extractTextFromBuffer(arrayBuffer, resume.file_name);
      } catch (error) {
        console.error("Error downloading or extracting from file:", error);
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json(
        { error: "No resume content was found or could be extracted. Please ensure your resume has content." },
        { status: 400 }
      );
    }

    const match = await matchResumeWithJob(resumeText, jobDescription);

    // Validate match result
    const score = Math.max(0, Math.min(100, Number(match.matchScore || 0)));
    const matchingSkills = Array.isArray(match.matchingSkills) ? match.matchingSkills : [];
    const missingSkills = Array.isArray(match.missingSkills) ? match.missingSkills : [];
    const missingKeywords = Array.isArray(match.missingKeywords) ? match.missingKeywords : [];
    const suggestedImprovements = Array.isArray(match.suggestedImprovements) ? match.suggestedImprovements : [];
    const recommendedCourses = Array.isArray(match.recommendedCourses) ? match.recommendedCourses : [];
    const interviewQuestions = Array.isArray(match.interviewQuestions) ? match.interviewQuestions : [];

    // Save to job_matches table
    const { error: dbError } = await supabase
      .from("job_matches" as any)
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description: jobDescription,
        match_score: score,
        missing_skills: missingSkills,
        missing_keywords: missingKeywords,
        suggested_improvements: suggestedImprovements,
        recommended_courses: recommendedCourses,
        interview_questions: interviewQuestions,
        expected_salary: match.expectedSalary || "",
        company_difficulty: match.companyDifficulty || "",
        hiring_probability: match.hiringProbability || ""
      });

    if (dbError) {
      console.error("Failed to save job match record:", dbError.message);
    }

    // Also add to resume_history
    await supabase.from("resume_history" as any).insert({
      user_id: user.id,
      resume_id: resumeId,
      action: "Job Match",
      description: `Matched resume with job description (Score: ${score}%)`
    });

    return NextResponse.json({ match });
  } catch (error: any) {
    console.error("Job match error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to match resume with job" },
      { status: 500 }
    );
  }
}

