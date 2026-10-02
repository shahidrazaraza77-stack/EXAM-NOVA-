import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function validateAdmin(request: NextRequest): Promise<{ userId: string | null; errorResponse?: NextResponse }> {
  const authHeader = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!authHeader) return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader);
  if (error || !user) return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await (supabaseAdmin.from("profiles") as any).select("role").eq("id", user.id).single();
  if ((profile as any)?.role !== "admin" && (profile as any)?.role !== "content_manager") return { userId: null, errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const { data, error } = await (supabaseAdmin.from("platform_settings") as any)
    .select("*").order("setting_key");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Convert rows to key/value map
  const settingsMap: Record<string, any> = {};
  for (const row of (data || [])) {
    settingsMap[row.setting_key] = row.setting_value;
  }
  return NextResponse.json({ data: settingsMap, rows: data });
}

export async function PUT(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  const { data, error } = await (supabaseAdmin.from("platform_settings") as any)
    .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString(), updated_by: userId }, { onConflict: "setting_key" })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
