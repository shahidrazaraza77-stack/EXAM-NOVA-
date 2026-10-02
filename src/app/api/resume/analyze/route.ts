import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { downloadFileFromStorage, extractTextFromBuffer } from "@/lib/text-extraction";
import { analyzeResumeWithGemini, parseResumeWithGemini } from "@/lib/gemini";
import { getResumeText } from "@/lib/utils";
import { createHash } from "crypto";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  // 1. Authenticate session
  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit AI analysis
  const rateLimitResult = checkRateLimit(session.user.id, "ai");
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many analysis requests. Please wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(rateLimitResult.resetMs / 1000).toString() },
      }
    );
  }

  let resumeId = "";
  let userId = session.user.id;
  const authHeader = request.headers.get("Authorization");
  const supabase = getSupabaseServerClient(authHeader);

  try {
    const body = await request.json().catch(() => ({}));
    resumeId = body.resumeId;
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    // 3. Fetch resume record and verify ownership
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // IDOR Prevention: Ensure the requesting user owns this resume (or is platform admin)
    if (resume.user_id !== session.user.id && session.profile.role !== "admin") {
      await logSecurityEvent({
        event: "SUSPICIOUS_REQUEST",
        userId: session.user.id,
        email: session.user.email,
        severity: "error",
        ipAddress: ip,
        userAgent,
        details: { action: "IDOR_ATTEMPT", targetResumeId: resumeId, ownerId: resume.user_id },
      });
      return NextResponse.json({ error: "Access denied: You do not own this resume." }, { status: 403 });
    }

    userId = resume.user_id;

    let extractedText = getResumeText(resume);
    let fileHash = (resume as any).file_hash || "";

    // 2. Perform text extraction if text is empty
    if ((!extractedText || !extractedText.trim()) && resume.file_path && resume.file_name) {
      console.log(`Downloading and extracting text for resume: ${resumeId}, path: ${resume.file_path}`);
      
      const arrayBuffer = await downloadFileFromStorage(resume.file_path, supabase);
      
      // Calculate file hash
      fileHash = createHash("sha256").update(Buffer.from(arrayBuffer)).digest("hex");
      
      // Update file hash on resume record
      await supabase
        .from("resumes")
        .update({ file_hash: fileHash } as any)
        .eq("id", resumeId);

      extractedText = await extractTextFromBuffer(arrayBuffer, resume.file_name);
      
      // Update resumes table with extracted parsed text
      await supabase
        .from("resumes")
        .update({
          parsed_content: extractedText,
          updated_at: new Date().toISOString()
        })
        .eq("id", resumeId);
    }

    if (!extractedText || !extractedText.trim()) {
      throw new Error("No text content could be extracted from your resume. Please check if the file is valid and contains text.");
    }

    const textHash = createHash("sha256").update(extractedText).digest("hex");

    // 3. Structured parsing (Step 4 & Step 15: Caching)
    let parsedContent: any = resume.content;
    if (!parsedContent || Object.keys(parsedContent).length === 0) {
      console.log(`Parsing resume structure for resume: ${resumeId}`);
      
      // Check cache first
      let cachedParsed = null;
      try {
        const { data } = await supabase
          .from("analysis_cache" as any)
          .select("analysis_json")
          .eq("text_hash", textHash + "_parsed")
          .maybeSingle();
        cachedParsed = (data as any)?.analysis_json;
      } catch (err) {
        console.error("Error reading parsed cache:", err);
      }

      if (cachedParsed) {
        parsedContent = cachedParsed;
      } else {
        parsedContent = await parseResumeWithGemini(extractedText);
        // Save to cache
        try {
          await supabase.from("analysis_cache" as any).upsert({
            text_hash: textHash + "_parsed",
            analysis_json: parsedContent
          });
        } catch (err) {
          console.error("Error writing parsed cache:", err);
        }
      }

      // Update resumes table content
      await supabase
        .from("resumes")
        .update({
          content: parsedContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", resumeId);
    }

    // 4. Run ATS analysis (Step 5 & Step 15: Caching)
    let analysis = null;
    let cachedAnalysis = null;
    try {
      const { data } = await supabase
        .from("analysis_cache" as any)
        .select("analysis_json")
        .eq("text_hash", textHash + "_analysis")
        .maybeSingle();
      cachedAnalysis = (data as any)?.analysis_json;
    } catch (err) {
      console.error("Error reading analysis cache:", err);
    }

    if (cachedAnalysis) {
      analysis = cachedAnalysis;
    } else {
      analysis = await analyzeResumeWithGemini(extractedText);
      // Save to cache
      try {
        await supabase.from("analysis_cache" as any).upsert({
          text_hash: textHash + "_analysis",
          analysis_json: analysis
        });
      } catch (err) {
        console.error("Error writing analysis cache:", err);
      }
    }

    // 5. Update or insert public.resume_analysis table
    const { data: existingAnalysis } = await supabase
      .from("resume_analysis")
      .select("id")
      .eq("resume_id", resumeId)
      .maybeSingle();

    const analysisPayload = {
      resume_id: resumeId,
      ats_score: analysis.atsScore,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      missing_keywords: analysis.missingKeywords || [],
      suggestions: analysis.suggestions || [],
      overall_feedback: analysis.overallFeedback || "",
      section_scores: analysis.sectionScores || {},
      weak_sections: analysis.weakSections || [],
      strong_sections: analysis.strongSections || [],
      rewritten_bullet_points: analysis.rewrittenBulletPoints || [],
      rewritten_summary: analysis.rewrittenSummary || "",
      action_plan: analysis.actionPlan || []
    };

    let analysisResult;
    if (existingAnalysis) {
      const { data } = await supabase
        .from("resume_analysis")
        .update(analysisPayload as any)
        .eq("id", existingAnalysis.id)
        .select()
        .single();
      analysisResult = data;
    } else {
      const { data } = await supabase
        .from("resume_analysis")
        .insert(analysisPayload as any)
        .select()
        .single();
      analysisResult = data;
    }

    // 6. Update resume score, parsed content, and ats_score on resumes table
    await supabase
      .from("resumes")
      .update({
        score: analysis.atsScore,
        ats_score: analysis.atsScore,
        parsed_content: extractedText,
        updated_at: new Date().toISOString()
      })
      .eq("id", resumeId);

    // 7. Save keywords to resume_keywords table (Step 14)
    try {
      // Clear existing keywords
      await supabase.from("resume_keywords" as any).delete().eq("resume_id", resumeId);

      const keywordsToInsert: any[] = [];
      
      // Technical skills
      if (parsedContent?.skills?.technicalSkills) {
        parsedContent.skills.technicalSkills.forEach((k: string) => {
          keywordsToInsert.push({ resume_id: resumeId, user_id: userId, keyword: k, category: "Technical" });
        });
      }
      // Soft skills
      if (parsedContent?.skills?.softSkills) {
        parsedContent.skills.softSkills.forEach((k: string) => {
          keywordsToInsert.push({ resume_id: resumeId, user_id: userId, keyword: k, category: "Soft" });
        });
      }
      // Missing keywords
      if (analysis.missingKeywords) {
        analysis.missingKeywords.forEach((k: string) => {
          keywordsToInsert.push({ resume_id: resumeId, user_id: userId, keyword: k, category: "Missing" });
        });
      }

      if (keywordsToInsert.length > 0) {
        await supabase.from("resume_keywords" as any).insert(keywordsToInsert);
      }
    } catch (kErr) {
      console.error("Error storing keywords:", kErr);
    }

    // 8. Insert a history log on every analysis execution (Step 10 & 14)
    await supabase
      .from("resume_analysis_logs" as any)
      .insert({
        user_id: userId,
        resume_id: resumeId,
        score: analysis.atsScore,
        strengths: (analysis.strengths || []).join(", "),
        weaknesses: (analysis.weaknesses || []).join(", "),
        suggestions: (analysis.suggestions || []).join(", "),
        section_scores: analysis.sectionScores,
        weak_sections: analysis.weakSections,
        strong_sections: analysis.strongSections
      });

    await supabase
      .from("resume_history" as any)
      .insert({
        user_id: userId,
        resume_id: resumeId,
        action: "Analyze",
        description: `Successfully analyzed resume (Score: ${analysis.atsScore}%)`
      });

    // 9. Update user_analytics
    await supabase
      .from("user_analytics")
      .update({ resume_score: analysis.atsScore })
      .eq("user_id", userId);

    // 10. Log info success to resume_logs (Step 14)
    await supabase.from("resume_logs" as any).insert({
      user_id: userId,
      resume_id: resumeId,
      message: `Completed ATS analysis with score of ${analysis.atsScore}%`,
      log_type: "info",
      details: { score: analysis.atsScore, fileHash }
    });

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      content: parsedContent
    });
  } catch (error: any) {
    console.error("Resume analysis error:", error);

    // Write error log to database for debugging
    if (userId) {
      try {
        await supabase.from("resume_logs" as any).insert({
          user_id: userId,
          resume_id: resumeId || null,
          message: error.message || "Failed to analyze resume",
          log_type: "error",
          details: { stack: error.stack }
        });
      } catch (logErr) {
        console.error("Error logging failure:", logErr);
      }
    }

    // Return human-friendly error messages (Step 13: Never show raw API errors or stack traces)
    const friendlyMessage = error.message || "We encountered an error analyzing your resume. Please try uploading again.";
    return NextResponse.json(
      { error: friendlyMessage },
      { status: 500 }
    );
  }
}
