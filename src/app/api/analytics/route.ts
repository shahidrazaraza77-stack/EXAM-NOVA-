import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { analyticsService } from "@/services/analytics.service";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || user.id;
    const scope = url.searchParams.get("scope") || "all";

    // Only allow users to view their own analytics (admin override possible)
    if (userId !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin" && profile?.role !== "content_manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (scope === "company-readiness") {
      const companyReadiness = await analyticsService.getCompanyReadiness(userId);
      return NextResponse.json({ companyReadiness });
    }

    const result = await analyticsService.getAnalytics(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
