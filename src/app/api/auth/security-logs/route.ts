import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: logs, error } = await (supabaseAdmin as any)
      .from("security_logs")
      .select("id, event_type, severity, ip_address, created_at, details")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.warn("[SECURITY_LOGS_API] Error querying security logs:", error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err: any) {
    return NextResponse.json({ logs: [] });
  }
}
