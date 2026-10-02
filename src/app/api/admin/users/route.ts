import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateAdminRequest } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: false });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const role = url.searchParams.get("role");
  const search = url.searchParams.get("search");
  const offset = (page - 1) * limit;

  let query = (supabaseAdmin.from("profiles") as any)
    .select("id, full_name, email, role, avatar_url, created_at, updated_at, suspended, target_company, target_role", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (role && role !== "All") query = query.eq("role", role.toLowerCase() === "content manager" ? "content_manager" : role.toLowerCase());
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count, page, limit });
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: false });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { name, email, role, status } = body;

  if (!email || !name) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const mappedRole = (role || "Student").toLowerCase() === "content manager" ? "content_manager" : (role || "Student").toLowerCase();
  const isSuspended = status === "Disabled";

  // Security: Only Content Manager can create another Content Manager account
  if (mappedRole === "content_manager" && session.profile.role !== "content_manager") {
    return NextResponse.json({ error: "Forbidden: Only Content Managers have master authority to create Content Manager accounts." }, { status: 403 });
  }

  // Create user in auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: "DefaultPassword123!",
    email_confirm: true,
    user_metadata: {
      full_name: name,
      role: mappedRole,
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update profiles row to ensure suspended status & role are correct
  const { data: profileData, error: updateError } = await (supabaseAdmin.from("profiles") as any)
    .update({
      full_name: name,
      role: mappedRole,
      suspended: isSuspended,
    })
    .eq("id", data.user.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data: profileData }, { status: 201 });
}

