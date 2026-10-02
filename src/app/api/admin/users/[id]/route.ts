import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateAdminRequest } from "@/lib/auth-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: false });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, email, role, status, suspended } = body;

  const updates: Record<string, any> = {};
  if (name !== undefined && typeof name === "string") {
    updates.full_name = name.trim();
  }
  if (email !== undefined && typeof email === "string" && email.includes("@")) {
    updates.email = email.trim().toLowerCase();
  }
  if (role !== undefined) {
    const validRoles = ["student", "admin", "content_manager", "recruiter"];
    const mappedRole = role.toLowerCase() === "content manager" ? "content_manager" : role.toLowerCase();
    if (!validRoles.includes(mappedRole)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    // Role Hierarchy & Security:
    // 1. Only a Content Manager has the power to assign the Content Manager role
    if (mappedRole === "content_manager" && session.profile.role !== "content_manager") {
      return NextResponse.json({ 
        error: "Forbidden: Only Content Managers have master authority to assign the Content Manager role." 
      }, { status: 403 });
    }

    // 2. An admin cannot modify a Content Manager account (Content Manager has main power)
    const { data: targetProfile } = await (supabaseAdmin.from("profiles") as any)
      .select("role")
      .eq("id", id)
      .maybeSingle();

    if (targetProfile?.role === "content_manager" && session.profile.role !== "content_manager") {
      return NextResponse.json({ 
        error: "Forbidden: You cannot modify a Content Manager account. Content Manager holds master authority in this project." 
      }, { status: 403 });
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

  // Update auth metadata & email in Supabase Auth if applicable
  try {
    const authAdminUpdates: Record<string, any> = {};
    const metadataUpdates: Record<string, any> = {};

    if (updates.full_name) metadataUpdates.full_name = updates.full_name;
    if (updates.role) metadataUpdates.role = updates.role;
    if (Object.keys(metadataUpdates).length > 0) {
      authAdminUpdates.user_metadata = metadataUpdates;
    }
    if (updates.email) {
      authAdminUpdates.email = updates.email;
    }

    if (Object.keys(authAdminUpdates).length > 0) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(id, authAdminUpdates);
      if (authErr) {
        console.warn("[ADMIN_UPDATE_USER] Auth updateUserById warning:", authErr.message);
      }
    }
  } catch (err: any) {
    console.warn("[ADMIN_UPDATE_USER] Auth update error:", err);
  }

  const { data, error } = await (supabaseAdmin.from("profiles") as any)
    .update(updates).eq("id", id).select().maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ 
      error: "User profile not found or update not permitted."
    }, { status: 400 });
  }
  return NextResponse.json({ data, success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await validateAdminRequest(request, { requireMfa: false });
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Protect Content Manager from being deleted by non-content_manager
  const { data: targetProfile } = await (supabaseAdmin.from("profiles") as any)
    .select("role")
    .eq("id", id)
    .maybeSingle();

  if (targetProfile?.role === "content_manager" && session.profile.role !== "content_manager") {
    return NextResponse.json({ 
      error: "Forbidden: Content Manager accounts cannot be deleted by administrators." 
    }, { status: 403 });
  }

  // Delete user from auth (which cascades to profiles)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    // Also try direct profile delete if auth delete fails
    await (supabaseAdmin.from("profiles") as any).delete().eq("id", id);
  }

  return NextResponse.json({ success: true });
}


