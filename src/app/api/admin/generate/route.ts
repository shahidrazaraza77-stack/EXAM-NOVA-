import { NextRequest, NextResponse } from "next/server";
import { AIContentEngine } from "@/lib/ai-content-engine";
import { validateAdminRequest } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  // Rate limiting for admin generation
  const rateLimit = checkRateLimit(ip, "admin");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many admin generation requests. Please slow down." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  // Validate admin authentication, role, and MFA
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: true });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const { module, ...params } = body;

    if (!module) {
      return NextResponse.json({ error: "Missing required parameter: 'module'" }, { status: 400 });
    }

    let result: any = null;

    switch (module) {
      case "aptitude": {
        const { topic, subtopic, difficulty, count } = params;
        if (!topic || !difficulty || !count) {
          return NextResponse.json({ error: "Missing parameters for aptitude generator: topic, difficulty, count" }, { status: 400 });
        }
        result = await AIContentEngine.generateAptitudeQuestions({
          topic,
          subtopic,
          difficulty,
          count: Number(count)
        });
        break;
      }

      case "coding": {
        const { topic, topics, companies, difficulty, count, mode, distribution } = params;
        if (topics || companies || mode || difficulty === "Mixed") {
          if (!count) {
            return NextResponse.json({ error: "Missing parameter for coding generator: count" }, { status: 400 });
          }
          result = await AIContentEngine.generateAdvancedCodingProblems({
            topics: Array.isArray(topics) ? topics : topic ? [topic] : ["Arrays"],
            companies: Array.isArray(companies) ? companies : ["General"],
            difficulty: difficulty || "Medium",
            count: Number(count),
            mode: mode || "single",
            distribution
          });
        } else {
          if (!topic || !difficulty || !count) {
            return NextResponse.json({ error: "Missing parameters for coding generator: topic, difficulty, count" }, { status: 400 });
          }
          result = await AIContentEngine.generateCodingProblems({
            topic,
            difficulty,
            count: Number(count)
          });
        }
        break;
      }

      case "interview": {
        const { category, difficulty, count, company } = params;
        if (!category || !difficulty || !count) {
          return NextResponse.json({ error: "Missing parameters for interview generator: category, difficulty, count" }, { status: 400 });
        }
        result = await AIContentEngine.generateInterviewQuestions({
          category,
          difficulty,
          count: Number(count),
          company
        });
        break;
      }

      case "roadmap": {
        const { companyName, companyId } = params;
        if (!companyName || !companyId) {
          return NextResponse.json({ error: "Missing parameters for roadmap generator: companyName, companyId" }, { status: 400 });
        }
        result = await AIContentEngine.generateCompanyRoadmap({
          companyName,
          companyId
        });
        break;
      }

      case "mock-test": {
        const { testType, difficulty, title, durationMinutes } = params;
        if (!testType || !difficulty || !title || !durationMinutes) {
          return NextResponse.json({ error: "Missing parameters for mock test generator: testType, difficulty, title, durationMinutes" }, { status: 400 });
        }
        result = await AIContentEngine.generateMockTest({
          testType,
          difficulty,
          title,
          durationMinutes: Number(durationMinutes)
        });
        break;
      }

      case "study-plan": {
        const { userId, targetCompany, weakAreas } = params;
        if (!userId || !targetCompany || !weakAreas) {
          return NextResponse.json({ error: "Missing parameters for study plan generator: userId, targetCompany, weakAreas" }, { status: 400 });
        }
        result = await AIContentEngine.generateStudyPlan({
          userId,
          targetCompany,
          weakAreas
        });
        break;
      }

      case "recommendation": {
        const { userId, targetCompany, weakAreas, scores } = params;
        if (!userId || !targetCompany || !weakAreas || !scores) {
          return NextResponse.json({ error: "Missing parameters for recommendations generator: userId, targetCompany, weakAreas, scores" }, { status: 400 });
        }
        result = await AIContentEngine.generateAIRecommendations({
          userId,
          targetCompany,
          weakAreas,
          scores
        });
        break;
      }

      case "notification": {
        const { userId, triggerType, details } = params;
        if (!userId || !triggerType || !details) {
          return NextResponse.json({ error: "Missing parameters for notification generator: userId, triggerType, details" }, { status: 400 });
        }
        result = await AIContentEngine.generateAINotifications({
          userId,
          triggerType,
          details
        });
        break;
      }

      default:
        return NextResponse.json({ error: `Unsupported generator module: '${module}'` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("AI Content Engine route error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during content generation." },
      { status: 500 }
    );
  }
}
