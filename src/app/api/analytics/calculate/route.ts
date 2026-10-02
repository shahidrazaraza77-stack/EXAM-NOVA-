import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { analyticsService } from "@/services/analytics.service";

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const userId = body.userId || user.id;

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

    const result = await analyticsService.calculateReadiness(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analytics calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate analytics" },
      { status: 500 }
    );
  }
}
