import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { matchResumeWithJob } from "@/lib/gemini";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  // 1. Authenticate Request
  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Rate limit
  const rateLimit = checkRateLimit(session.user.id, "ai");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  try {
    const { resumeId, companyId } = await request.json().catch(() => ({}));

    if (!resumeId || !companyId) {
      return NextResponse.json({ error: "Missing resumeId or companyId" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // 1. Fetch resume contents and verify ownership (IDOR defense)
    const { data: resumeData, error: resumeError } = await (supabase as any)
      .from("resumes")
      .select("user_id, parsed_content, improved_content")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resumeData) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resumeData.user_id !== session.user.id && session.profile.role !== "admin") {
      await logSecurityEvent({
        event: "SUSPICIOUS_REQUEST",
        userId: session.user.id,
        email: session.user.email,
        severity: "error",
        ipAddress: ip,
        userAgent,
        details: { action: "IDOR_SCREEN_RESUME", targetResumeId: resumeId },
      });
      return NextResponse.json({ error: "Access denied: You do not own this resume." }, { status: 403 });
    }

    const resumeText = resumeData.improved_content || resumeData.parsed_content;
    if (!resumeText) {
      return NextResponse.json({ error: "Selected resume does not contain text content. Parse or build it first." }, { status: 400 });
    }

    // 2. Fetch company details
    const { data: companyData, error: companyError } = await (supabase as any)
      .from("companies")
      .select("name, description, prep_materials")
      .eq("id", companyId)
      .single();

    if (companyError || !companyData) {
      console.error("Company lookup failed:", companyError);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Parse required skills or details from prep_materials
    let prepMaterials: any = null;
    if (companyData.prep_materials) {
      try {
        prepMaterials = typeof companyData.prep_materials === "string"
          ? JSON.parse(companyData.prep_materials)
          : companyData.prep_materials;
      } catch (e) {
        console.error("Failed to parse prep materials:", e);
      }
    }

    const requiredSkills = prepMaterials?.required_skills || [];
    const eligibility = prepMaterials?.eligibility || "";
    
    // Construct target job/role description context
    const jobDescription = `
Company: ${companyData.name}
Description: ${companyData.description || "A leading global organization."}
Required Skills: ${requiredSkills.join(", ")}
Eligibility: ${eligibility}
`;

    // 3. Screen resume via Gemini
    const matchResult = await matchResumeWithJob(resumeText, jobDescription);

    return NextResponse.json({ matchResult });
  } catch (error: any) {
    console.error("Resume screening API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to screen resume" },
      { status: 500 }
    );
  }
}
