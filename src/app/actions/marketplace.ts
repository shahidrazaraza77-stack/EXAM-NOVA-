"use server";

import { safeGenerateContent } from "@/lib/gemini";
import { supabase } from "@/lib/supabaseClient";
import { notificationService } from "@/services/notification.service";
import { marketplaceService } from "@/services/marketplace.service";
import { getResumeText } from "@/lib/utils";

const db = supabase as any;

export interface JobMatchResult {
  matchScore: number;
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  careerAdvice: string;
}

/**
 * AI Server Action to match a candidate against a job or internship listing
 */
export async function matchCandidateWithListing(
  userId: string,
  listingId: string,
  listingType: "job" | "internship",
  resumeId?: string
): Promise<JobMatchResult> {
  let skillsRequired: string[] = [];
  try {
    // 1. Fetch user analytics
    const { data: analytics } = await db
      .from("user_analytics")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const resumeScore = analytics?.resume_score ?? 0;
    const aptitudeScore = analytics?.aptitude_score ?? 0;
    const codingScore = analytics?.coding_score ?? 0;
    const interviewScore = analytics?.interview_score ?? 0;
    const overallReadiness = analytics?.overall_readiness ?? 0;

    // 2. Fetch resume text if provided
    let resumeText = "No resume uploaded";
    if (resumeId) {
      const { data: resume } = await db
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .maybeSingle();
      if (resume) {
        const text = getResumeText(resume);
        if (text) {
          resumeText = text.substring(0, 4000); // Limit context size
        }
      }
    }

    // 3. Fetch listing details
    let listingTitle = "";
    let listingDesc = "";
    let listingCompany = "";

    if (listingType === "job") {
      const job = await marketplaceService.getJobListingById(listingId);
      if (job) {
        listingTitle = job.title;
        listingDesc = job.description;
        listingCompany = job.company_name;
        skillsRequired = job.skills_required;
      }
    } else {
      const internship = await marketplaceService.getInternshipListingById(listingId);
      if (internship) {
        listingTitle = internship.title;
        listingDesc = internship.description;
        listingCompany = internship.company_name;
        skillsRequired = internship.skills_required;
      }
    }

    if (!listingTitle) {
      throw new Error("Listing not found.");
    }

    // 4. Fallback if Gemini key is missing
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Gemini API key missing. Returning mocked match data.");
      return getMockMatchResult(skillsRequired);
    }

    // 5. Invoke Gemini API
    const prompt = `You are an expert AI Career and Placement Mentor. Evaluate this candidate against the opportunity requirements below:

OPPORTUNITY DETAILS:
- Title: ${listingTitle} (${listingType})
- Company: ${listingCompany}
- Description: ${listingDesc}
- Required Skills: ${skillsRequired.join(", ")}

CANDIDATE PROFILE:
- ATS Resume Score: ${resumeScore}/100
- Quantitative Aptitude Score: ${aptitudeScore}/100
- Coding/Algorithm Score: ${codingScore}/100
- Mock Interview Score: ${interviewScore}/100
- Overall Placement Readiness: ${overallReadiness}/100
- Resume Text Snippet:
${resumeText}

Analyze the match. Return ONLY a valid JSON object (no markdown, no code blocks, no backticks) with this structure:
{
  "matchScore": 85, // integer 0-100
  "strengths": ["list 3 key matching skills or performance strengths"],
  "missingSkills": ["list key skills requested but missing in resume/profile"],
  "suggestions": ["list 2 specific actions they should take to improve their chances"],
  "careerAdvice": "Improve your React and SQL skills to increase your match score by 15%."
}`;

    const text = await safeGenerateContent(prompt);
    const cleanedJson = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
    return JSON.parse(cleanedJson) as JobMatchResult;
  } catch (error) {
    console.error("AI Matching failed:", error);
    return getMockMatchResult(skillsRequired);
  }
}

/**
 * Updates application status and triggers notifications
 */
export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: "applied" | "under review" | "shortlisted" | "interview scheduled" | "rejected" | "selected"
): Promise<boolean> {
  try {
    // 1. Fetch current application to find the user_id and listing_id
    const { data: app, error: appError } = await db
      .from("applications")
      .select("user_id, listing_id, listing_type, status")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      console.error("Failed to fetch application:", appError);
      return false;
    }

    if (app.status === newStatus) return true;

    // 2. Perform database update
    const success = await marketplaceService.updateApplicationStatus(applicationId, newStatus);
    if (!success) return false;

    // 3. Get listing title
    let title = "Opportunity Update";
    if (app.listing_type === "job") {
      const job = await marketplaceService.getJobListingById(app.listing_id);
      if (job) title = `${job.title} at ${job.company_name}`;
    } else {
      const intern = await marketplaceService.getInternshipListingById(app.listing_id);
      if (intern) title = `${intern.title} at ${intern.company_name}`;
    }

    // 4. Create Notification
    let notifTitle = "";
    let notifMsg = "";
    let priority: "high" | "medium" | "low" = "medium";

    switch (newStatus) {
      case "shortlisted":
        notifTitle = "🎉 Application Shortlisted!";
        notifMsg = `Congratulations! Your application for "${title}" has been shortlisted.`;
        priority = "high";
        break;
      case "interview scheduled":
        notifTitle = "📅 Interview Scheduled!";
        notifMsg = `Great news! An interview has been scheduled for your application: "${title}".`;
        priority = "high";
        break;
      case "selected":
        notifTitle = "🏆 Offer Received!";
        notifMsg = `Fantastic! You have been Selected for "${title}". Check your portal for details!`;
        priority = "high";
        break;
      case "rejected":
        notifTitle = "Application Updated";
        notifMsg = `Your application status for "${title}" has been updated.`;
        priority = "low";
        break;
      case "under review":
        notifTitle = "🔍 Application Under Review";
        notifMsg = `Recruiters are currently reviewing your profile for "${title}".`;
        priority = "medium";
        break;
    }

    if (notifTitle) {
      await notificationService.createNotification({
        userId: app.user_id,
        title: notifTitle,
        message: notifMsg,
        category: "system",
        priority
      });
    }

    return true;
  } catch (e) {
    console.error("Error in updateApplicationStatusAction:", e);
    return false;
  }
}

function getMockMatchResult(requiredSkills: string[]): JobMatchResult {
  return {
    matchScore: 78,
    strengths: [
      "Good scoring aptitude profiles",
      "Strong coding foundation",
      "Completed mock interviews"
    ],
    missingSkills: requiredSkills.length > 0 ? [requiredSkills[0]] : ["System Design"],
    suggestions: [
      "Practice more related problems in the coding workspace",
      "Tailor your resume keyword description before submitting"
    ],
    careerAdvice: "Your general metrics are robust. Brush up on data structure implementation to boost your selection index by 10%."
  };
}
