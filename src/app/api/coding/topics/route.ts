import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader);

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("coding_topics")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ topics: data || [] });
  } catch (error: any) {
    console.error("GET coding topics API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coding topics" },
      { status: 500 }
    );
  }
}
