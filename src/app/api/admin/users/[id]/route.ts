import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateAdminRequest } from "@/lib/auth-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: true });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, role, status, suspended } = body;

  const updates: Record<string, any> = {};
  if (name !== undefined) {
    updates.full_name = name;
  }
  if (role !== undefined) {
    const validRoles = ["student", "admin", "content_manager", "recruiter"];
    const mappedRole = role.toLowerCase() === "content manager" ? "content_manager" : role.toLowerCase();
    if (!validRoles.includes(mappedRole)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }
    updates.role = mappedRole;
  }
  if (suspended !== undefined) {
    updates.suspended = suspended;
  } else if (status !== undefined) {
    updates.suspended = status === "Disabled";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Update auth metadata if name or role updated
  if (updates.full_name || updates.role) {
    const authUpdates: Record<string, any> = {};
    if (updates.full_name) authUpdates.full_name = updates.full_name;
    if (updates.role) authUpdates.role = updates.role;
    
    await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: authUpdates
    });
  }

  const { data, error } = await (supabaseAdmin.from("profiles") as any)
    .update(updates).eq("id", id).select().maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) {
    return NextResponse.json({ 
      error: "User profile not found or update not allowed. Please verify that your SUPABASE_SERVICE_ROLE_KEY is configured in your environment."
    }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: true });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Delete user from auth (which will cascade delete profiles if set up, or we can manually delete profile too)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

