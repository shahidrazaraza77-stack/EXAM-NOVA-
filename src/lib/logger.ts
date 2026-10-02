import { SupabaseClient } from "@supabase/supabase-js";

interface AuditLogParams {
  supabase: SupabaseClient;
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Audit log helper that writes server action records into the `admin_logs` table.
 */
export async function auditLog({
  supabase,
  adminId,
  action,
  entityType,
  entityId,
  metadata = {},
}: AuditLogParams): Promise<void> {
  try {
    const { error } = await supabase.from("admin_logs").insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata,
    });

    if (error) {
      console.error("[AUDIT LOG ERROR] Failed to write DB log:", error);
    }
  } catch (err) {
    console.error("[AUDIT LOG CRITICAL ERROR] Exception inside logger:", err);
  }
}

/**
 * Formatted server console logging helper.
 */
export const serverLogger = {
  info(msg: string, context: Record<string, any> = {}) {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, JSON.stringify(context));
  },
  warn(msg: string, context: Record<string, any> = {}) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, JSON.stringify(context));
  },
  error(msg: string, error?: any, context: Record<string, any> = {}) {
    console.error(
      `[ERROR] [${new Date().toISOString()}] ${msg}`,
      error?.message || error,
      JSON.stringify(context)
    );
  },
};
