import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function validateAdmin(request: NextRequest): Promise<{ userId: string | null; errorResponse?: NextResponse }> {
  const authHeader = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!authHeader) {
    return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader);
  if (error || !user) {
    return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: profile } = await (supabaseAdmin.from("profiles") as any)
    .select("role").eq("id", user.id).single();
  if ((profile as any)?.role !== "admin" && (profile as any)?.role !== "content_manager") {
    return { userId: null, errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const entity_type = url.searchParams.get("entity_type");
  const action = url.searchParams.get("action");
  const offset = (page - 1) * limit;

  let query = (supabaseAdmin.from("admin_logs") as any)
    .select("*, profiles!admin_logs_admin_id_fkey(full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (entity_type) query = query.eq("entity_type", entity_type);
  if (action) query = query.ilike("action", `%${action}%`);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, total: count, page, limit });
}

export async function POST(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const { action, entity_type, entity_id, metadata } = body;

  if (!action || !entity_type) {
    return NextResponse.json({ error: "action and entity_type are required" }, { status: 400 });
  }

  const { data, error } = await (supabaseAdmin.from("admin_logs") as any)
    .insert({ admin_id: userId, action, entity_type, entity_id, metadata: metadata || {} })
    .select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
